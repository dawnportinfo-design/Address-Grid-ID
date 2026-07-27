import { featureCollection, isolines, point } from '@turf/turf';

import {
  buildTopographicExportPlan,
  longitudeSpanDegrees,
  type TopographicBounds,
  type TopographicDataset,
  type TopographicExportPlan,
  type TopographicFeature,
  type TopographicLayerId,
  type TopographicMesh,
  type TopographicSourceRecord,
} from './topographicExport';

export const TOPOGRAPHIC_ELEVATION_VECTORIZER_VERSION =
  'agid-topographic-elevation-vectorizer-v0.2';
export const MAX_ELEVATION_GRID_CELLS = 1_000_000;
export const MAX_CONTOUR_LEVELS = 512;
export const MAX_MESH_LOD_LEVELS = 8;
export const MAX_MESH_LOD_STRIDE = 64;

export type NormalizedElevationGrid = {
  gridId: string;
  title: string;
  bounds: TopographicBounds;
  width: number;
  height: number;
  elevationsMeters: readonly number[] | Float32Array | Float64Array;
  rowOrder: 'north-to-south' | 'south-to-north';
  horizontalCrs: 'EPSG:4326';
  verticalDatum: string;
  sourceRecord: TopographicSourceRecord;
  generatedAt: string;
  countryCode?: string;
};

export type ElevationVectorizationOptions = {
  contourIntervalMeters: number;
  includeTerrainMesh?: boolean;
  includeContours?: boolean;
  meshLodStrides?: readonly number[];
};

export type ElevationVectorizationMetrics = {
  gridCellCount: number;
  vertexCount: number;
  triangleCount: number;
  meshLodCount: number;
  contourLevelCount: number;
  contourFeatureCount: number;
  minimumElevationMeters: number;
  maximumElevationMeters: number;
};

export type ElevationMeshLod = {
  level: number;
  stride: number;
  mesh: TopographicMesh;
  vertexCount: number;
  triangleCount: number;
};

export type ElevationVectorizationResult = {
  vectorizerVersion: string;
  dataset: TopographicDataset;
  meshLods: ElevationMeshLod[];
  sourceGate: TopographicExportPlan;
  metrics: ElevationVectorizationMetrics;
  warnings: string[];
};

function requireIsoTimestamp(field: string, value: string) {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`${field} must be an ISO timestamp.`);
  }
}

function validateGrid(
  grid: NormalizedElevationGrid,
  options: ElevationVectorizationOptions,
) {
  if (!grid.gridId.trim()) throw new Error('gridId is required.');
  if (!grid.title.trim()) throw new Error('title is required.');
  if (!grid.verticalDatum.trim()) throw new Error('verticalDatum is required.');
  if (!Number.isInteger(grid.width) || !Number.isInteger(grid.height)) {
    throw new Error('Elevation grid width and height must be integers.');
  }
  if (grid.width < 2 || grid.height < 2) {
    throw new Error('Elevation grid must be at least 2x2.');
  }
  const gridCellCount = grid.width * grid.height;
  if (gridCellCount > MAX_ELEVATION_GRID_CELLS) {
    throw new Error(`Elevation grid exceeds ${MAX_ELEVATION_GRID_CELLS} cells.`);
  }
  if (grid.elevationsMeters.length !== gridCellCount) {
    throw new Error(
      `Elevation grid requires ${gridCellCount} values; received ${grid.elevationsMeters.length}.`,
    );
  }
  for (let index = 0; index < grid.elevationsMeters.length; index += 1) {
    if (!Number.isFinite(grid.elevationsMeters[index])) {
      throw new Error(
        `Normalized elevation grid contains a non-finite value at index ${index}.`,
      );
    }
  }
  if (longitudeSpanDegrees(grid.bounds) <= 0 || longitudeSpanDegrees(grid.bounds) > 180) {
    throw new Error('Elevation grid bounds must span between 0 and 180 longitude degrees.');
  }
  if (grid.bounds.east < grid.bounds.west) {
    throw new Error(
      'Antimeridian elevation vectorization requires the projected-grid adapter planned for the next loop.',
    );
  }
  if (grid.horizontalCrs !== 'EPSG:4326') {
    throw new Error('The v0.1 elevation vectorizer requires EPSG:4326 input.');
  }
  requireIsoTimestamp('generatedAt', grid.generatedAt);

  const includeTerrainMesh = options.includeTerrainMesh ?? true;
  const includeContours = options.includeContours ?? true;
  if (!includeTerrainMesh && !includeContours) {
    throw new Error('At least one of terrain mesh or contours must be requested.');
  }
  if (!includeTerrainMesh && options.meshLodStrides !== undefined) {
    throw new Error('meshLodStrides requires terrain mesh output.');
  }
  if (includeTerrainMesh && options.meshLodStrides !== undefined) {
    if (
      options.meshLodStrides.length === 0 ||
      options.meshLodStrides.length > MAX_MESH_LOD_LEVELS
    ) {
      throw new Error(
        `meshLodStrides must contain between 1 and ${MAX_MESH_LOD_LEVELS} levels.`,
      );
    }
    if (options.meshLodStrides[0] !== 1) {
      throw new Error('meshLodStrides must start with stride 1 for LOD0.');
    }
    for (let index = 0; index < options.meshLodStrides.length; index += 1) {
      const stride = options.meshLodStrides[index];
      if (
        !Number.isInteger(stride) ||
        stride < 1 ||
        stride > MAX_MESH_LOD_STRIDE
      ) {
        throw new Error(
          `Each mesh LOD stride must be an integer between 1 and ${MAX_MESH_LOD_STRIDE}.`,
        );
      }
      if (index > 0 && stride <= options.meshLodStrides[index - 1]) {
        throw new Error('meshLodStrides must be strictly increasing.');
      }
    }
  }
  if (
    includeContours &&
    (!Number.isFinite(options.contourIntervalMeters) ||
      options.contourIntervalMeters < 0.25 ||
      options.contourIntervalMeters > 100)
  ) {
    throw new Error('Contour interval must be between 0.25 and 100 metres.');
  }
}

function longitudeAt(bounds: TopographicBounds, column: number, width: number) {
  return bounds.west + (bounds.east - bounds.west) * (column / (width - 1));
}

function latitudeAt(
  bounds: TopographicBounds,
  row: number,
  height: number,
  rowOrder: NormalizedElevationGrid['rowOrder'],
) {
  const ratio = row / (height - 1);
  return rowOrder === 'north-to-south'
    ? bounds.north - (bounds.north - bounds.south) * ratio
    : bounds.south + (bounds.north - bounds.south) * ratio;
}

function sampleIndices(length: number, stride: number) {
  const indices: number[] = [];
  for (let index = 0; index < length; index += stride) {
    indices.push(index);
  }
  if (indices.at(-1) !== length - 1) {
    indices.push(length - 1);
  }
  return indices;
}

function createTerrainMesh(
  grid: NormalizedElevationGrid,
  stride: number,
  level: number,
): TopographicMesh {
  const rowIndices = sampleIndices(grid.height, stride);
  const columnIndices = sampleIndices(grid.width, stride);
  const vertices: Array<[number, number, number]> = [];
  for (const row of rowIndices) {
    for (const column of columnIndices) {
      const index = row * grid.width + column;
      vertices.push([
        longitudeAt(grid.bounds, column, grid.width),
        latitudeAt(grid.bounds, row, grid.height, grid.rowOrder),
        grid.elevationsMeters[index],
      ]);
    }
  }

  const triangles: Array<[number, number, number]> = [];
  for (let row = 0; row < rowIndices.length - 1; row += 1) {
    for (let column = 0; column < columnIndices.length - 1; column += 1) {
      const topLeft = row * columnIndices.length + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columnIndices.length;
      const bottomRight = bottomLeft + 1;
      if ((row + column) % 2 === 0) {
        triangles.push(
          [topLeft, bottomLeft, topRight],
          [topRight, bottomLeft, bottomRight],
        );
      } else {
        triangles.push(
          [topLeft, bottomLeft, bottomRight],
          [topLeft, bottomRight, topRight],
        );
      }
    }
  }

  return {
    id:
      level === 0
        ? `${grid.gridId}-terrain-mesh`
        : `${grid.gridId}-terrain-mesh-lod${level}-s${stride}`,
    layerId: 'terrain-mesh',
    vertices,
    triangles,
    sourceId: grid.sourceRecord.sourceId,
  };
}

function createTerrainMeshLods(
  grid: NormalizedElevationGrid,
  strides: readonly number[],
): ElevationMeshLod[] {
  return strides.map((stride, level) => {
    const mesh = createTerrainMesh(grid, stride, level);
    return {
      level,
      stride,
      mesh,
      vertexCount: mesh.vertices.length,
      triangleCount: mesh.triangles.length,
    };
  });
}

function buildContourLevels(minimum: number, maximum: number, interval: number) {
  if (minimum === maximum) return [];
  const levels: number[] = [];
  const firstLevel = (Math.floor(minimum / interval) + 1) * interval;
  for (let elevation = firstLevel; elevation < maximum; elevation += interval) {
    levels.push(Number(elevation.toFixed(9)));
    if (levels.length > MAX_CONTOUR_LEVELS) {
      throw new Error(
        `Contour request exceeds ${MAX_CONTOUR_LEVELS} levels; increase the interval.`,
      );
    }
  }
  return levels;
}

function createContourFeatures(
  grid: NormalizedElevationGrid,
  levels: number[],
): TopographicFeature[] {
  if (levels.length === 0) return [];
  const points = [];
  for (let row = 0; row < grid.height; row += 1) {
    for (let column = 0; column < grid.width; column += 1) {
      const index = row * grid.width + column;
      points.push(
        point(
          [
            longitudeAt(grid.bounds, column, grid.width),
            latitudeAt(grid.bounds, row, grid.height, grid.rowOrder),
          ],
          { elevation_m: grid.elevationsMeters[index] },
        ),
      );
    }
  }

  const contours = isolines(featureCollection(points), levels, {
    zProperty: 'elevation_m',
  });
  const features: TopographicFeature[] = [];
  for (const contour of contours.features) {
    const elevation = Number(contour.properties?.elevation_m);
    for (let lineIndex = 0; lineIndex < contour.geometry.coordinates.length; lineIndex += 1) {
      const coordinates = contour.geometry.coordinates[lineIndex]
        .filter(coordinate => coordinate.length >= 2)
        .map(
          coordinate =>
            [coordinate[0], coordinate[1], elevation] as [number, number, number],
        );
      if (coordinates.length < 2) continue;
      features.push({
        id: `${grid.gridId}-contour-${elevation}-${lineIndex + 1}`,
        layerId: 'contour-lines',
        geometry: { type: 'LineString', coordinates },
        properties: {
          elevation_m: elevation,
          vertical_datum: grid.verticalDatum,
          derived: true,
          vectorizer_version: TOPOGRAPHIC_ELEVATION_VECTORIZER_VERSION,
        },
        sourceId: grid.sourceRecord.sourceId,
      });
    }
  }
  return features;
}

function sourceGateFor(
  grid: NormalizedElevationGrid,
  layerIds: TopographicLayerId[],
  contourIntervalMeters: number,
) {
  return buildTopographicExportPlan({
    bounds: grid.bounds,
    countryCode: grid.countryCode,
    crs: grid.horizontalCrs,
    format: 'txt',
    layerIds,
    sourceRecords: [grid.sourceRecord],
    dataMode: grid.sourceRecord.syntheticOnly ? 'synthetic' : 'source-backed',
    contourIntervalMeters: layerIds.includes('contour-lines')
      ? contourIntervalMeters
      : undefined,
    now: grid.generatedAt,
  });
}

export function vectorizeNormalizedElevationGrid(
  grid: NormalizedElevationGrid,
  options: ElevationVectorizationOptions,
): ElevationVectorizationResult {
  validateGrid(grid, options);
  const includeTerrainMesh = options.includeTerrainMesh ?? true;
  const includeContours = options.includeContours ?? true;
  const layerIds: TopographicLayerId[] = [
    ...(includeTerrainMesh ? (['terrain-mesh'] as const) : []),
    ...(includeContours ? (['contour-lines'] as const) : []),
  ];
  const sourceGate = sourceGateFor(grid, layerIds, options.contourIntervalMeters);
  if (sourceGate.status !== 'ready') {
    throw new Error(
      `Elevation source gate blocked: ${sourceGate.issues
        .map(issue => `${issue.code}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  let minimumElevationMeters = Number.POSITIVE_INFINITY;
  let maximumElevationMeters = Number.NEGATIVE_INFINITY;
  for (const elevation of grid.elevationsMeters) {
    minimumElevationMeters = Math.min(minimumElevationMeters, elevation);
    maximumElevationMeters = Math.max(maximumElevationMeters, elevation);
  }
  const contourLevels = includeContours
    ? buildContourLevels(
        minimumElevationMeters,
        maximumElevationMeters,
        options.contourIntervalMeters,
      )
    : [];
  const meshLods = includeTerrainMesh
    ? createTerrainMeshLods(grid, options.meshLodStrides ?? [1])
    : [];
  const terrainMesh = meshLods[0]?.mesh;
  const contourFeatures = includeContours
    ? createContourFeatures(grid, contourLevels)
    : [];
  const dataset: TopographicDataset = {
    datasetId: `${grid.gridId}-vectorized`,
    title: grid.title,
    bounds: { ...grid.bounds },
    crs: grid.horizontalCrs,
    generatedAt: grid.generatedAt,
    synthetic: grid.sourceRecord.syntheticOnly === true,
    features: contourFeatures,
    meshes: terrainMesh ? [terrainMesh] : [],
    rasters: [],
  };

  return {
    vectorizerVersion: TOPOGRAPHIC_ELEVATION_VECTORIZER_VERSION,
    dataset,
    meshLods,
    sourceGate,
    metrics: {
      gridCellCount: grid.width * grid.height,
      vertexCount: terrainMesh?.vertices.length ?? 0,
      triangleCount: terrainMesh?.triangles.length ?? 0,
      meshLodCount: meshLods.length,
      contourLevelCount: contourLevels.length,
      contourFeatureCount: contourFeatures.length,
      minimumElevationMeters,
      maximumElevationMeters,
    },
    warnings: [
      'The v0.2 mesh retains EPSG:4326 horizontal coordinates; projected local-metre output is a later adapter stage.',
      'The primary dataset contains LOD0 only; additional deterministic meshes are returned in meshLods for explicit downstream selection.',
      'The input must already have no-data cells and source quality masks resolved.',
      'Derived geometry does not prove an address, entrance, recipient, or delivery point.',
    ],
  };
}
