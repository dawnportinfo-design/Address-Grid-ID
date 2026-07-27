import { fromArrayBuffer } from 'geotiff';

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

export const TOPOGRAPHIC_GEOTIFF_ADAPTER_VERSION =
  'agid-topographic-geotiff-adapter-v0.2';
export const TOPOGRAPHIC_NODATA_RESOLUTION_METHOD =
  'isolated-cardinal-mean-v1';
export const MAX_GEOTIFF_BYTE_LENGTH = 256 * 1024 * 1024;
export const MAX_GEOTIFF_RESOLVED_NODATA_CELLS = 4_096;
export const MAX_GEOTIFF_RESOLVED_NODATA_FRACTION = 0.05;

export type GeoTiffNoDataResolutionPolicy = {
  method: typeof TOPOGRAPHIC_NODATA_RESOLUTION_METHOD;
  qualityMask: Uint8Array;
  expectedMaskSha256: `sha256:${string}`;
  maxResolvedCells: number;
  maxResolvedFraction: number;
};

export type GeoTiffElevationDecodeRequest = {
  arrayBuffer: ArrayBuffer;
  expectedSha256: `sha256:${string}`;
  gridId: string;
  title: string;
  verticalDatum: string;
  sourceRecord: TopographicSourceRecord;
  generatedAt: string;
  countryCode?: string;
  bandIndex?: number;
  noDataResolution?: GeoTiffNoDataResolutionPolicy;
  signal?: AbortSignal;
};

export type GeoTiffNoDataResolutionMetadata = {
  method: 'reject' | typeof TOPOGRAPHIC_NODATA_RESOLUTION_METHOD;
  qualityMaskSha256: `sha256:${string}` | null;
  resolvedCellCount: number;
  resolvedCellFraction: number;
};

export type GeoTiffElevationMetadata = {
  adapterVersion: string;
  contentSha256: `sha256:${string}`;
  sourceId: string;
  sourceVersion: string;
  sourceLicenseId: string;
  sourceTermsUrl: string;
  sourceCorrectionUrl: string;
  width: number;
  height: number;
  samplesPerPixel: number;
  selectedBandIndex: number;
  pixelInterpretation: 'area' | 'point';
  sourceBoundingBox: TopographicBounds;
  normalizedBoundingBox: TopographicBounds;
  resolution: [number, number];
  noDataValue: number | null;
  noDataResolution: GeoTiffNoDataResolutionMetadata;
  horizontalCrs: 'EPSG:4326';
  verticalDatum: string;
};

export type GeoTiffElevationDecodeResult = {
  grid: NormalizedElevationGrid;
  sourceGate: TopographicExportPlan;
  metadata: GeoTiffElevationMetadata;
  warnings: string[];
};

function requireIsoTimestamp(field: string, value: string) {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`${field} must be an ISO timestamp.`);
  }
}

async function sha256ArrayBuffer(arrayBuffer: ArrayBuffer) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', arrayBuffer);
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

async function sha256Bytes(bytes: Uint8Array) {
  const digestBytes = Uint8Array.from(bytes);
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    digestBytes.buffer,
  );
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

function sourceRecordContainsDigest(
  sourceRecord: TopographicSourceRecord,
  digest: string,
) {
  return sourceRecord.notes?.some(note =>
    note.toLowerCase().includes(digest.toLowerCase())) ?? false;
}

function asBounds(values: number[], field: string): TopographicBounds {
  if (values.length < 4 || values.slice(0, 4).some(value => !Number.isFinite(value))) {
    throw new Error(`${field} must contain four finite coordinates.`);
  }
  const [west, south, east, north] = values;
  if (
    west < -180 ||
    east > 180 ||
    south < -90 ||
    north > 90 ||
    west >= east ||
    south >= north
  ) {
    throw new Error(`${field} must be a non-antimeridian EPSG:4326 extent.`);
  }
  return { west, south, east, north };
}

function adjustAreaPixelsToCenters(
  sourceBounds: TopographicBounds,
  resolutionX: number,
  resolutionY: number,
  width: number,
  height: number,
) {
  if (width < 2 || height < 2) {
    throw new Error('GeoTIFF elevation grids must be at least 2x2.');
  }
  const halfX = Math.abs(resolutionX) / 2;
  const halfY = Math.abs(resolutionY) / 2;
  return asBounds(
    [
      sourceBounds.west + halfX,
      sourceBounds.south + halfY,
      sourceBounds.east - halfX,
      sourceBounds.north - halfY,
    ],
    'Pixel-centre bounds',
  );
}

function verifyRequest(request: GeoTiffElevationDecodeRequest) {
  if (!request.gridId.trim()) throw new Error('gridId is required.');
  if (!request.title.trim()) throw new Error('title is required.');
  if (!request.verticalDatum.trim()) throw new Error('verticalDatum is required.');
  if (
    request.arrayBuffer.byteLength < 8 ||
    request.arrayBuffer.byteLength > MAX_GEOTIFF_BYTE_LENGTH
  ) {
    throw new Error(
      `GeoTIFF byte length must be between 8 and ${MAX_GEOTIFF_BYTE_LENGTH}.`,
    );
  }
  if (!/^sha256:[a-f0-9]{64}$/i.test(request.expectedSha256)) {
    throw new Error('expectedSha256 must be a sha256 content digest.');
  }
  if (request.sourceRecord.reuseStatus !== 'approved') {
    throw new Error('GeoTIFF source reuse must be approved.');
  }
  if (!request.sourceRecord.layerIds.includes('terrain-mesh')) {
    throw new Error('GeoTIFF source must be approved for terrain-mesh.');
  }
  if (
    !sourceRecordContainsDigest(request.sourceRecord, request.expectedSha256)
  ) {
    throw new Error('GeoTIFF digest is not bound to the source promotion record.');
  }
  requireIsoTimestamp('generatedAt', request.generatedAt);
}

function cardinalNeighborIndexes(
  index: number,
  width: number,
  height: number,
) {
  const row = Math.floor(index / width);
  const column = index % width;
  return {
    left: column > 0 ? index - 1 : null,
    right: column + 1 < width ? index + 1 : null,
    up: row > 0 ? index - width : null,
    down: row + 1 < height ? index + width : null,
  };
}

async function resolveNoDataCells(input: {
  elevationsMeters: Float64Array;
  noDataIndexes: number[];
  width: number;
  height: number;
  policy: GeoTiffNoDataResolutionPolicy | undefined;
  sourceRecord: TopographicSourceRecord;
}): Promise<GeoTiffNoDataResolutionMetadata> {
  if (!input.noDataIndexes.length) {
    return {
      method: 'reject',
      qualityMaskSha256: null,
      resolvedCellCount: 0,
      resolvedCellFraction: 0,
    };
  }
  const policy = input.policy;
  if (!policy) {
    throw new Error(
      `GeoTIFF contains unresolved NoData at index ${input.noDataIndexes[0]}; apply a quality-mask adapter first.`,
    );
  }
  if (policy.method !== TOPOGRAPHIC_NODATA_RESOLUTION_METHOD) {
    throw new Error('GeoTIFF NoData resolution method is unsupported.');
  }
  if (policy.qualityMask.length !== input.elevationsMeters.length) {
    throw new Error('GeoTIFF quality mask length must match the elevation grid.');
  }
  if (!/^sha256:[a-f0-9]{64}$/i.test(policy.expectedMaskSha256)) {
    throw new Error('expectedMaskSha256 must be a sha256 content digest.');
  }
  const qualityMaskSha256 = await sha256Bytes(policy.qualityMask);
  if (qualityMaskSha256.toLowerCase() !== policy.expectedMaskSha256.toLowerCase()) {
    throw new Error(
      `GeoTIFF quality mask digest mismatch: expected ${policy.expectedMaskSha256}, received ${qualityMaskSha256}.`,
    );
  }
  if (!sourceRecordContainsDigest(input.sourceRecord, qualityMaskSha256)) {
    throw new Error(
      'GeoTIFF quality mask digest is not bound to the source promotion record.',
    );
  }
  if (
    !Number.isSafeInteger(policy.maxResolvedCells)
    || policy.maxResolvedCells < 1
    || policy.maxResolvedCells > MAX_GEOTIFF_RESOLVED_NODATA_CELLS
  ) {
    throw new Error(
      `maxResolvedCells must be between 1 and ${MAX_GEOTIFF_RESOLVED_NODATA_CELLS}.`,
    );
  }
  if (
    !Number.isFinite(policy.maxResolvedFraction)
    || policy.maxResolvedFraction <= 0
    || policy.maxResolvedFraction > MAX_GEOTIFF_RESOLVED_NODATA_FRACTION
  ) {
    throw new Error(
      `maxResolvedFraction must be greater than 0 and at most ${MAX_GEOTIFF_RESOLVED_NODATA_FRACTION}.`,
    );
  }

  const noDataSet = new Set(input.noDataIndexes);
  for (let index = 0; index < policy.qualityMask.length; index += 1) {
    const maskValue = policy.qualityMask[index];
    if (maskValue !== 0 && maskValue !== 1) {
      throw new Error(`GeoTIFF quality mask must contain only 0 or 1 at index ${index}.`);
    }
    if ((maskValue === 1) !== noDataSet.has(index)) {
      throw new Error(
        `GeoTIFF quality mask and NoData cells disagree at index ${index}.`,
      );
    }
  }

  const resolvedCellFraction =
    input.noDataIndexes.length / input.elevationsMeters.length;
  if (
    input.noDataIndexes.length > policy.maxResolvedCells
    || resolvedCellFraction > policy.maxResolvedFraction
  ) {
    throw new Error(
      `GeoTIFF NoData exceeds the approved resolution budget (${input.noDataIndexes.length} cells, ${resolvedCellFraction}).`,
    );
  }

  const original = input.elevationsMeters.slice();
  for (const index of input.noDataIndexes) {
    const neighbors = cardinalNeighborIndexes(
      index,
      input.width,
      input.height,
    );
    const horizontalPair =
      neighbors.left !== null
      && neighbors.right !== null
      && Number.isFinite(original[neighbors.left])
      && Number.isFinite(original[neighbors.right]);
    const verticalPair =
      neighbors.up !== null
      && neighbors.down !== null
      && Number.isFinite(original[neighbors.up])
      && Number.isFinite(original[neighbors.down]);
    if (!horizontalPair && !verticalPair) {
      throw new Error(
        `GeoTIFF NoData at index ${index} is not an isolated cell with an observed opposing neighbor pair.`,
      );
    }
    const observed = [
      neighbors.left,
      neighbors.right,
      neighbors.up,
      neighbors.down,
    ]
      .filter((neighbor): neighbor is number =>
        neighbor !== null && Number.isFinite(original[neighbor]))
      .map(neighbor => original[neighbor]);
    input.elevationsMeters[index] =
      observed.reduce((sum, value) => sum + value, 0) / observed.length;
  }

  return {
    method: policy.method,
    qualityMaskSha256,
    resolvedCellCount: input.noDataIndexes.length,
    resolvedCellFraction,
  };
}

export async function decodeGeoTiffElevationGrid(
  request: GeoTiffElevationDecodeRequest,
): Promise<GeoTiffElevationDecodeResult> {
  verifyRequest(request);
  const contentSha256 = await sha256ArrayBuffer(request.arrayBuffer);
  if (contentSha256.toLowerCase() !== request.expectedSha256.toLowerCase()) {
    throw new Error(
      `GeoTIFF digest mismatch: expected ${request.expectedSha256}, received ${contentSha256}.`,
    );
  }

  let geotiff;
  try {
    geotiff = await fromArrayBuffer(request.arrayBuffer, request.signal);
  } catch (error) {
    throw new Error(
      `GeoTIFF parse failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const image = await geotiff.getImage(0);
  const width = image.getWidth();
  const height = image.getHeight();
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2) {
    throw new Error('GeoTIFF elevation image must be at least 2x2.');
  }
  if (width * height > MAX_ELEVATION_GRID_CELLS) {
    throw new Error(
      `GeoTIFF elevation image exceeds ${MAX_ELEVATION_GRID_CELLS} cells.`,
    );
  }
  if (image.getFileDirectory().hasTag('ModelTransformation')) {
    throw new Error('Rotated or transformed GeoTIFF grids require a reprojection adapter.');
  }

  const geoKeys = image.getGeoKeys();
  if (
    Number(geoKeys?.GTModelTypeGeoKey) !== 2 ||
    Number(geoKeys?.GeographicTypeGeoKey) !== 4326
  ) {
    throw new Error('GeoTIFF v0.1 input must declare geographic EPSG:4326.');
  }
  const samplesPerPixel = image.getSamplesPerPixel();
  const selectedBandIndex = request.bandIndex ?? 0;
  if (
    !Number.isInteger(selectedBandIndex) ||
    selectedBandIndex < 0 ||
    selectedBandIndex >= samplesPerPixel
  ) {
    throw new Error(
      `GeoTIFF bandIndex must be between 0 and ${samplesPerPixel - 1}.`,
    );
  }

  const resolution = image.getResolution();
  const resolutionX = Number(resolution[0]);
  const resolutionY = Number(resolution[1]);
  if (
    !Number.isFinite(resolutionX) ||
    !Number.isFinite(resolutionY) ||
    resolutionX <= 0 ||
    resolutionY >= 0
  ) {
    throw new Error('GeoTIFF v0.1 input must be an unrotated north-up grid.');
  }
  const sourceBoundingBox = asBounds(image.getBoundingBox(), 'GeoTIFF bounding box');
  const pixelInterpretation = image.pixelIsArea() ? 'area' : 'point';
  const normalizedBoundingBox =
    pixelInterpretation === 'area'
      ? adjustAreaPixelsToCenters(
          sourceBoundingBox,
          resolutionX,
          resolutionY,
          width,
          height,
        )
      : sourceBoundingBox;
  const noDataValue = image.getGDALNoData();
  const rasters = await image.readRasters({
    samples: [selectedBandIndex],
    interleave: true,
    signal: request.signal,
  });
  const elevationsMeters = new Float64Array(width * height);
  const noDataIndexes: number[] = [];
  for (let index = 0; index < elevationsMeters.length; index += 1) {
    const elevation = Number(rasters[index]);
    if (noDataValue !== null && elevation === noDataValue) {
      elevationsMeters[index] = Number.NaN;
      noDataIndexes.push(index);
      continue;
    }
    if (!Number.isFinite(elevation)) {
      throw new Error(`GeoTIFF contains a non-finite elevation at index ${index}.`);
    }
    elevationsMeters[index] = elevation;
  }
  const noDataResolution = await resolveNoDataCells({
    elevationsMeters,
    noDataIndexes,
    width,
    height,
    policy: request.noDataResolution,
    sourceRecord: request.sourceRecord,
  });

  const sourceGate = buildTopographicExportPlan({
    bounds: normalizedBoundingBox,
    countryCode: request.countryCode,
    crs: 'EPSG:4326',
    format: 'tiff',
    layerIds: ['terrain-mesh'],
    sourceRecords: [request.sourceRecord],
    dataMode: request.sourceRecord.syntheticOnly ? 'synthetic' : 'source-backed',
    now: request.generatedAt,
  });
  if (sourceGate.status !== 'ready') {
    throw new Error(
      `GeoTIFF source gate blocked: ${sourceGate.issues
        .map(issue => `${issue.code}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  const grid: NormalizedElevationGrid = {
    gridId: request.gridId,
    title: request.title,
    bounds: normalizedBoundingBox,
    width,
    height,
    elevationsMeters,
    rowOrder: 'north-to-south',
    horizontalCrs: 'EPSG:4326',
    verticalDatum: request.verticalDatum,
    sourceRecord: request.sourceRecord,
    generatedAt: request.generatedAt,
    countryCode: request.countryCode,
  };

  return {
    grid,
    sourceGate,
    metadata: {
      adapterVersion: TOPOGRAPHIC_GEOTIFF_ADAPTER_VERSION,
      contentSha256,
      sourceId: request.sourceRecord.sourceId,
      sourceVersion: request.sourceRecord.version,
      sourceLicenseId: request.sourceRecord.licenseId,
      sourceTermsUrl: request.sourceRecord.termsUrl,
      sourceCorrectionUrl: request.sourceRecord.correctionUrl,
      width,
      height,
      samplesPerPixel,
      selectedBandIndex,
      pixelInterpretation,
      sourceBoundingBox,
      normalizedBoundingBox,
      resolution: [resolutionX, resolutionY],
      noDataValue,
      noDataResolution,
      horizontalCrs: 'EPSG:4326',
      verticalDatum: request.verticalDatum,
    },
    warnings: [
      'The adapter reads caller-provided bytes only and performs no network request.',
      noDataResolution.resolvedCellCount
        ? `${noDataResolution.resolvedCellCount} isolated NoData cells were resolved with a source-bound quality mask; the output contains derived elevations.`
        : 'NoData interpolation was not required.',
      'Decoded elevation does not prove an address, entrance, recipient, or delivery point.',
    ],
  };
}
