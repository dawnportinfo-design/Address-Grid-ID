import {
  buildTopographicExportPlan,
  type TopographicBounds,
  type TopographicExportPlan,
  type TopographicSourceRecord,
} from './topographicExport';
import {
  MAX_ELEVATION_GRID_CELLS,
  type NormalizedElevationGrid,
} from './topographicElevationVectorizer';

export const TOPOGRAPHIC_COASTAL_SEAM_VERSION =
  'agid-topographic-coastal-seam-v0.1';
export const COASTAL_SURFACE_OCEAN = 0;
export const COASTAL_SURFACE_BREAKLINE = 1;
export const COASTAL_SURFACE_LAND = 2;
export const MAX_COASTLINE_ADJUSTMENT_METERS = 100;

export type CoastalElevationInput = {
  grid: NormalizedElevationGrid;
  sourceSnapshotSha256: `sha256:${string}`;
};

export type CoastlineClassificationInput = {
  maskId: string;
  width: number;
  height: number;
  bounds: TopographicBounds;
  rowOrder: NormalizedElevationGrid['rowOrder'];
  horizontalCrs: 'EPSG:4326';
  classes: Uint8Array;
  sourceRecord: TopographicSourceRecord;
  sourceSnapshotSha256: `sha256:${string}`;
  expectedClassificationSha256: `sha256:${string}`;
  adapterVersion: string;
  shorelineEpoch: string;
};

export type CoastalSeamRequest = {
  land: CoastalElevationInput;
  bathymetry: CoastalElevationInput;
  coastline: CoastlineClassificationInput;
  targetVerticalDatum: string;
  generatedAt: string;
  coastlineElevationMeters?: number;
  maximumAdjustmentMeters?: number;
};

export type ReconciledCoastalElevationGrid = Omit<
  NormalizedElevationGrid,
  'sourceRecord'
> & {
  sourceIds: {
    land: string;
    bathymetry: string;
    coastline: string;
  };
};

export type CoastalSeamMetrics = {
  gridCellCount: number;
  landCellCount: number;
  oceanCellCount: number;
  breaklineCellCount: number;
  maximumLandBreaklineAdjustmentMeters: number;
  maximumBathymetryBreaklineAdjustmentMeters: number;
};

export type CoastalSeamResult = {
  seamVersion: string;
  grid: ReconciledCoastalElevationGrid;
  sourceGates: {
    land: TopographicExportPlan;
    bathymetry: TopographicExportPlan;
    coastline: TopographicExportPlan;
  };
  provenance: {
    landSourceId: string;
    landSourceVersion: string;
    landSnapshotSha256: `sha256:${string}`;
    bathymetrySourceId: string;
    bathymetrySourceVersion: string;
    bathymetrySnapshotSha256: `sha256:${string}`;
    coastlineSourceId: string;
    coastlineSourceVersion: string;
    coastlineSnapshotSha256: `sha256:${string}`;
    classificationSha256: `sha256:${string}`;
    coastlineAdapterVersion: string;
    shorelineEpoch: string;
    targetVerticalDatum: string;
    sourceTermsUrls: string[];
    sourceCorrectionUrls: string[];
  };
  metrics: CoastalSeamMetrics;
  warnings: string[];
};

function requireIsoTimestamp(field: string, value: string) {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`${field} must be an ISO timestamp.`);
  }
}

function sourceRecordContainsDigest(
  sourceRecord: TopographicSourceRecord,
  digest: string,
) {
  return (
    sourceRecord.notes?.some(note =>
      note.toLowerCase().includes(digest.toLowerCase()),
    ) ?? false
  );
}

function equalBounds(left: TopographicBounds, right: TopographicBounds) {
  return (
    left.south === right.south &&
    left.west === right.west &&
    left.north === right.north &&
    left.east === right.east
  );
}

function validateGridStructure(
  role: 'land' | 'bathymetry',
  grid: NormalizedElevationGrid,
) {
  if (!Number.isInteger(grid.width) || !Number.isInteger(grid.height)) {
    throw new Error(`${role} grid dimensions must be integers.`);
  }
  if (grid.width < 2 || grid.height < 2) {
    throw new Error(`${role} grid must be at least 2x2.`);
  }
  const cellCount = grid.width * grid.height;
  if (cellCount > MAX_ELEVATION_GRID_CELLS) {
    throw new Error(`${role} grid exceeds ${MAX_ELEVATION_GRID_CELLS} cells.`);
  }
  if (grid.elevationsMeters.length !== cellCount) {
    throw new Error(`${role} grid must contain ${cellCount} elevation values.`);
  }
  for (let index = 0; index < cellCount; index += 1) {
    if (!Number.isFinite(grid.elevationsMeters[index])) {
      throw new Error(`${role} grid contains a non-finite value at ${index}.`);
    }
  }
}

function validateSourceDigest(
  role: string,
  sourceRecord: TopographicSourceRecord,
  digest: string,
) {
  if (!/^sha256:[a-f0-9]{64}$/i.test(digest)) {
    throw new Error(`${role} source snapshot requires a SHA-256 digest.`);
  }
  if (!sourceRecordContainsDigest(sourceRecord, digest)) {
    throw new Error(
      `${role} source snapshot digest is not bound to the promoted source record.`,
    );
  }
}

function buildSourceGate(
  sourceRecord: TopographicSourceRecord,
  bounds: TopographicBounds,
  countryCode: string | undefined,
  layerId: 'terrain-mesh' | 'waterways',
  generatedAt: string,
) {
  const gate = buildTopographicExportPlan({
    bounds,
    countryCode,
    crs: 'EPSG:4326',
    format: layerId === 'waterways' ? 'geojson' : 'txt',
    layerIds: [layerId],
    sourceRecords: [sourceRecord],
    dataMode: sourceRecord.syntheticOnly ? 'synthetic' : 'source-backed',
    now: generatedAt,
  });
  if (gate.status !== 'ready') {
    throw new Error(
      `${sourceRecord.sourceId} source gate blocked: ${gate.issues
        .map(issue => `${issue.code}: ${issue.message}`)
        .join('; ')}`,
    );
  }
  return gate;
}

async function sha256Bytes(bytes: Uint8Array) {
  const copiedBytes = Uint8Array.from(bytes);
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    copiedBytes.buffer,
  );
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

function neighbors(
  index: number,
  width: number,
  height: number,
  includeDiagonals: boolean,
) {
  const row = Math.floor(index / width);
  const column = index % width;
  const result: number[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      if (!includeDiagonals && rowOffset !== 0 && columnOffset !== 0) continue;
      const neighborRow = row + rowOffset;
      const neighborColumn = column + columnOffset;
      if (
        neighborRow >= 0 &&
        neighborRow < height &&
        neighborColumn >= 0 &&
        neighborColumn < width
      ) {
        result.push(neighborRow * width + neighborColumn);
      }
    }
  }
  return result;
}

export async function reconcileCoastalElevationGrids(
  request: CoastalSeamRequest,
): Promise<CoastalSeamResult> {
  const { land, bathymetry, coastline } = request;
  validateGridStructure('land', land.grid);
  validateGridStructure('bathymetry', bathymetry.grid);
  requireIsoTimestamp('generatedAt', request.generatedAt);
  requireIsoTimestamp('shorelineEpoch', coastline.shorelineEpoch);

  if (!request.targetVerticalDatum.trim()) {
    throw new Error('targetVerticalDatum is required.');
  }
  if (
    land.grid.verticalDatum !== request.targetVerticalDatum ||
    bathymetry.grid.verticalDatum !== request.targetVerticalDatum
  ) {
    throw new Error(
      'Land and bathymetry grids must already use the declared target vertical datum.',
    );
  }
  if (
    land.grid.width !== bathymetry.grid.width ||
    land.grid.height !== bathymetry.grid.height ||
    !equalBounds(land.grid.bounds, bathymetry.grid.bounds) ||
    land.grid.rowOrder !== bathymetry.grid.rowOrder ||
    land.grid.horizontalCrs !== bathymetry.grid.horizontalCrs
  ) {
    throw new Error(
      'Land and bathymetry grids must share dimensions, bounds, row order, and CRS.',
    );
  }
  if (land.grid.sourceRecord.sourceId === bathymetry.grid.sourceRecord.sourceId) {
    throw new Error('Coastal reconciliation requires distinct land and bathymetry sources.');
  }
  if (
    coastline.width !== land.grid.width ||
    coastline.height !== land.grid.height ||
    !equalBounds(coastline.bounds, land.grid.bounds) ||
    coastline.rowOrder !== land.grid.rowOrder ||
    coastline.horizontalCrs !== land.grid.horizontalCrs
  ) {
    throw new Error(
      'Coastline classification must share the normalized elevation grid lattice.',
    );
  }
  if (coastline.classes.length !== coastline.width * coastline.height) {
    throw new Error('Coastline classification length does not match its grid.');
  }
  if (!coastline.adapterVersion.trim()) {
    throw new Error('Coastline adapter version is required.');
  }

  validateSourceDigest(
    'land',
    land.grid.sourceRecord,
    land.sourceSnapshotSha256,
  );
  validateSourceDigest(
    'bathymetry',
    bathymetry.grid.sourceRecord,
    bathymetry.sourceSnapshotSha256,
  );
  validateSourceDigest(
    'coastline',
    coastline.sourceRecord,
    coastline.sourceSnapshotSha256,
  );
  const classificationSha256 = await sha256Bytes(coastline.classes);
  if (
    classificationSha256.toLowerCase() !==
    coastline.expectedClassificationSha256.toLowerCase()
  ) {
    throw new Error('Coastline classification SHA-256 does not match its bytes.');
  }

  const countryCode =
    land.grid.countryCode === bathymetry.grid.countryCode
      ? land.grid.countryCode
      : undefined;
  const sourceGates = {
    land: buildSourceGate(
      land.grid.sourceRecord,
      land.grid.bounds,
      countryCode,
      'terrain-mesh',
      request.generatedAt,
    ),
    bathymetry: buildSourceGate(
      bathymetry.grid.sourceRecord,
      land.grid.bounds,
      countryCode,
      'terrain-mesh',
      request.generatedAt,
    ),
    coastline: buildSourceGate(
      coastline.sourceRecord,
      land.grid.bounds,
      countryCode,
      'waterways',
      request.generatedAt,
    ),
  };

  const coastlineElevationMeters = request.coastlineElevationMeters ?? 0;
  const maximumAdjustmentMeters = request.maximumAdjustmentMeters ?? 10;
  if (!Number.isFinite(coastlineElevationMeters)) {
    throw new Error('coastlineElevationMeters must be finite.');
  }
  if (
    !Number.isFinite(maximumAdjustmentMeters) ||
    maximumAdjustmentMeters < 0 ||
    maximumAdjustmentMeters > MAX_COASTLINE_ADJUSTMENT_METERS
  ) {
    throw new Error(
      `maximumAdjustmentMeters must be between 0 and ${MAX_COASTLINE_ADJUSTMENT_METERS}.`,
    );
  }

  let landCellCount = 0;
  let oceanCellCount = 0;
  let breaklineCellCount = 0;
  let maximumLandBreaklineAdjustmentMeters = 0;
  let maximumBathymetryBreaklineAdjustmentMeters = 0;
  const elevationsMeters = new Float64Array(coastline.classes.length);

  for (let index = 0; index < coastline.classes.length; index += 1) {
    const surfaceClass = coastline.classes[index];
    if (
      surfaceClass !== COASTAL_SURFACE_OCEAN &&
      surfaceClass !== COASTAL_SURFACE_BREAKLINE &&
      surfaceClass !== COASTAL_SURFACE_LAND
    ) {
      throw new Error(`Unknown coastline surface class ${surfaceClass} at ${index}.`);
    }
    if (surfaceClass === COASTAL_SURFACE_LAND) {
      landCellCount += 1;
      const elevation = land.grid.elevationsMeters[index];
      if (elevation < coastlineElevationMeters - maximumAdjustmentMeters) {
        throw new Error(`Land elevation is inverted beyond tolerance at ${index}.`);
      }
      elevationsMeters[index] = elevation;
      continue;
    }
    if (surfaceClass === COASTAL_SURFACE_OCEAN) {
      oceanCellCount += 1;
      const elevation = bathymetry.grid.elevationsMeters[index];
      if (elevation > coastlineElevationMeters + maximumAdjustmentMeters) {
        throw new Error(`Bathymetry elevation is inverted beyond tolerance at ${index}.`);
      }
      elevationsMeters[index] = elevation;
      continue;
    }

    breaklineCellCount += 1;
    const landAdjustment = Math.abs(
      land.grid.elevationsMeters[index] - coastlineElevationMeters,
    );
    const bathymetryAdjustment = Math.abs(
      bathymetry.grid.elevationsMeters[index] - coastlineElevationMeters,
    );
    if (
      landAdjustment > maximumAdjustmentMeters ||
      bathymetryAdjustment > maximumAdjustmentMeters
    ) {
      throw new Error(
        `Coastline breakline adjustment exceeds tolerance at ${index}.`,
      );
    }
    maximumLandBreaklineAdjustmentMeters = Math.max(
      maximumLandBreaklineAdjustmentMeters,
      landAdjustment,
    );
    maximumBathymetryBreaklineAdjustmentMeters = Math.max(
      maximumBathymetryBreaklineAdjustmentMeters,
      bathymetryAdjustment,
    );
    elevationsMeters[index] = coastlineElevationMeters;
  }

  if (landCellCount === 0 || oceanCellCount === 0 || breaklineCellCount === 0) {
    throw new Error(
      'A coastal grid must contain land, ocean, and coastline breakline cells.',
    );
  }

  for (let index = 0; index < coastline.classes.length; index += 1) {
    const surfaceClass = coastline.classes[index];
    const adjacentClasses = neighbors(
      index,
      coastline.width,
      coastline.height,
      false,
    ).map(neighbor => coastline.classes[neighbor]);
    if (
      (surfaceClass === COASTAL_SURFACE_LAND &&
        adjacentClasses.includes(COASTAL_SURFACE_OCEAN)) ||
      (surfaceClass === COASTAL_SURFACE_OCEAN &&
        adjacentClasses.includes(COASTAL_SURFACE_LAND))
    ) {
      throw new Error(`Land and ocean touch without a breakline at ${index}.`);
    }
    if (surfaceClass === COASTAL_SURFACE_BREAKLINE) {
      const nearbyClasses = neighbors(
        index,
        coastline.width,
        coastline.height,
        true,
      ).map(neighbor => coastline.classes[neighbor]);
      if (
        !nearbyClasses.includes(COASTAL_SURFACE_LAND) ||
        !nearbyClasses.includes(COASTAL_SURFACE_OCEAN)
      ) {
        throw new Error(
          `Coastline breakline cell ${index} must separate land and ocean.`,
        );
      }
    }
  }

  return {
    seamVersion: TOPOGRAPHIC_COASTAL_SEAM_VERSION,
    grid: {
      gridId: `${land.grid.gridId}-${bathymetry.grid.gridId}-coastal`,
      title: `${land.grid.title} and ${bathymetry.grid.title} coastal seam`,
      bounds: { ...land.grid.bounds },
      width: land.grid.width,
      height: land.grid.height,
      elevationsMeters,
      rowOrder: land.grid.rowOrder,
      horizontalCrs: land.grid.horizontalCrs,
      verticalDatum: request.targetVerticalDatum,
      generatedAt: request.generatedAt,
      countryCode,
      sourceIds: {
        land: land.grid.sourceRecord.sourceId,
        bathymetry: bathymetry.grid.sourceRecord.sourceId,
        coastline: coastline.sourceRecord.sourceId,
      },
    },
    sourceGates,
    provenance: {
      landSourceId: land.grid.sourceRecord.sourceId,
      landSourceVersion: land.grid.sourceRecord.version,
      landSnapshotSha256: land.sourceSnapshotSha256,
      bathymetrySourceId: bathymetry.grid.sourceRecord.sourceId,
      bathymetrySourceVersion: bathymetry.grid.sourceRecord.version,
      bathymetrySnapshotSha256: bathymetry.sourceSnapshotSha256,
      coastlineSourceId: coastline.sourceRecord.sourceId,
      coastlineSourceVersion: coastline.sourceRecord.version,
      coastlineSnapshotSha256: coastline.sourceSnapshotSha256,
      classificationSha256,
      coastlineAdapterVersion: coastline.adapterVersion,
      shorelineEpoch: coastline.shorelineEpoch,
      targetVerticalDatum: request.targetVerticalDatum,
      sourceTermsUrls: [
        land.grid.sourceRecord.termsUrl,
        bathymetry.grid.sourceRecord.termsUrl,
        coastline.sourceRecord.termsUrl,
      ],
      sourceCorrectionUrls: [
        land.grid.sourceRecord.correctionUrl,
        bathymetry.grid.sourceRecord.correctionUrl,
        coastline.sourceRecord.correctionUrl,
      ],
    },
    metrics: {
      gridCellCount: coastline.classes.length,
      landCellCount,
      oceanCellCount,
      breaklineCellCount,
      maximumLandBreaklineAdjustmentMeters,
      maximumBathymetryBreaklineAdjustmentMeters,
    },
    warnings: [
      'The reconciled grid is non-navigational and does not replace a hydrographic chart.',
      'The result preserves three-source provenance and is not yet a directly exportable TopographicDataset.',
      'Terrain context does not prove an address, entrance, recipient, or delivery point.',
    ],
  };
}
