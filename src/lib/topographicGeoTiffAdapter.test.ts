import assert from 'node:assert/strict';
import test from 'node:test';

import { writeArrayBuffer } from 'geotiff';

import {
  AGID_SYNTHETIC_TOPO_SOURCE,
  type TopographicSourceRecord,
} from './topographicExport';
import { vectorizeNormalizedElevationGrid } from './topographicElevationVectorizer';
import {
  decodeGeoTiffElevationGrid,
  TOPOGRAPHIC_NODATA_RESOLUTION_METHOD,
  type GeoTiffElevationDecodeRequest,
} from './topographicGeoTiffAdapter';

async function sha256(arrayBuffer: ArrayBuffer) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', arrayBuffer);
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

function writeElevationGeoTiff(
  values: Float32Array,
  options: {
    width?: number;
    height?: number;
    noData?: string;
    projected?: boolean;
  } = {},
) {
  return writeArrayBuffer(values, {
    width: options.width ?? 2,
    height: options.height ?? 2,
    ModelPixelScale: [0.01, 0.01, 0],
    ModelTiepoint: [0, 0, 0, 139, 35.02, 0],
    GTModelTypeGeoKey: options.projected ? 1 : 2,
    ...(options.projected
      ? { ProjectedCSTypeGeoKey: 3857 }
      : { GeographicTypeGeoKey: 4326 }),
    GTRasterTypeGeoKey: 1,
    GDAL_NODATA: options.noData ?? '-9999',
    SampleFormat: [3],
    BitsPerSample: [32],
  });
}

function sourceBoundTo(
  digest: `sha256:${string}`,
  overrides: Partial<TopographicSourceRecord> = {},
  additionalDigests: `sha256:${string}`[] = [],
): TopographicSourceRecord {
  return {
    ...AGID_SYNTHETIC_TOPO_SOURCE,
    ...overrides,
    notes: [
      ...(AGID_SYNTHETIC_TOPO_SOURCE.notes ?? []),
      `Snapshot digest: ${digest}.`,
      ...additionalDigests.map(value => `Quality artifact digest: ${value}.`),
    ],
  };
}

async function requestFor(
  arrayBuffer: ArrayBuffer,
  overrides: Partial<GeoTiffElevationDecodeRequest> = {},
) {
  const digest = await sha256(arrayBuffer);
  return {
    arrayBuffer,
    expectedSha256: digest,
    gridId: 'geotiff-test-grid',
    title: 'GeoTIFF test grid',
    verticalDatum: 'synthetic-test-datum',
    sourceRecord: sourceBoundTo(digest),
    generatedAt: '2026-07-27T07:00:00.000Z',
    countryCode: 'JP',
    ...overrides,
  } satisfies GeoTiffElevationDecodeRequest;
}

test('GeoTIFF bytes decode to a pixel-centred normalized elevation grid', async () => {
  const arrayBuffer = writeElevationGeoTiff(new Float32Array([1, 2, 3, 4]));
  const result = await decodeGeoTiffElevationGrid(await requestFor(arrayBuffer));

  assert.equal(result.sourceGate.status, 'ready');
  assert.equal(result.grid.width, 2);
  assert.equal(result.grid.height, 2);
  assert.deepEqual(Array.from(result.grid.elevationsMeters), [1, 2, 3, 4]);
  assert.equal(result.grid.rowOrder, 'north-to-south');
  assert.equal(result.metadata.pixelInterpretation, 'area');
  assert.equal(result.metadata.noDataValue, -9999);
  assert.ok(Math.abs(result.grid.bounds.west - 139.005) < 1e-10);
  assert.ok(Math.abs(result.grid.bounds.east - 139.015) < 1e-10);
  assert.ok(Math.abs(result.grid.bounds.south - 35.005) < 1e-10);
  assert.ok(Math.abs(result.grid.bounds.north - 35.015) < 1e-10);
  assert.match(result.warnings.join(' '), /no network request/i);

  const vectorized = vectorizeNormalizedElevationGrid(result.grid, {
    contourIntervalMeters: 1,
  });
  assert.equal(vectorized.metrics.vertexCount, 4);
  assert.equal(vectorized.metrics.triangleCount, 2);
  assert.ok(vectorized.metrics.contourFeatureCount > 0);
});

test('content digest must match bytes and the source promotion record', async () => {
  const arrayBuffer = writeElevationGeoTiff(new Float32Array([1, 2, 3, 4]));
  const request = await requestFor(arrayBuffer);
  const wrongDigest = `sha256:${'a'.repeat(64)}` as const;

  await assert.rejects(
    () =>
      decodeGeoTiffElevationGrid({
        ...request,
        expectedSha256: wrongDigest,
        sourceRecord: sourceBoundTo(wrongDigest),
      }),
    /digest mismatch/,
  );
  await assert.rejects(
    () =>
      decodeGeoTiffElevationGrid({
        ...request,
        sourceRecord: {
          ...request.sourceRecord,
          notes: ['No snapshot digest is recorded.'],
        },
      }),
    /not bound to the source promotion record/,
  );
});

test('unresolved NoData fails before vectorization', async () => {
  const arrayBuffer = writeElevationGeoTiff(
    new Float32Array([1, -9999, 3, 4]),
  );
  const request = await requestFor(arrayBuffer);

  await assert.rejects(
    () => decodeGeoTiffElevationGrid(request),
    /quality-mask adapter first/,
  );
});

test('source-bound quality mask resolves one bounded isolated NoData cell', async () => {
  const values = new Float32Array(
    Array.from({ length: 25 }, (_, index) => index),
  );
  values[12] = -9999;
  const arrayBuffer = writeElevationGeoTiff(values, {
    width: 5,
    height: 5,
  });
  const qualityMask = new Uint8Array(25);
  qualityMask[12] = 1;
  const maskDigest = await sha256(qualityMask.buffer);
  const request = await requestFor(arrayBuffer);
  const result = await decodeGeoTiffElevationGrid({
    ...request,
    sourceRecord: sourceBoundTo(
      request.expectedSha256,
      {},
      [maskDigest],
    ),
    noDataResolution: {
      method: TOPOGRAPHIC_NODATA_RESOLUTION_METHOD,
      qualityMask,
      expectedMaskSha256: maskDigest,
      maxResolvedCells: 1,
      maxResolvedFraction: 0.04,
    },
  });

  assert.equal(result.grid.elevationsMeters[12], 12);
  assert.deepEqual(result.metadata.noDataResolution, {
    method: TOPOGRAPHIC_NODATA_RESOLUTION_METHOD,
    qualityMaskSha256: maskDigest,
    resolvedCellCount: 1,
    resolvedCellFraction: 0.04,
  });
  assert.match(result.warnings.join(' '), /derived elevations/i);
  assert.equal(
    vectorizeNormalizedElevationGrid(result.grid, {
      contourIntervalMeters: 2,
    }).metrics.vertexCount,
    25,
  );
});

test('NoData resolution rejects unbound masks and non-isolated edge gaps', async () => {
  const values = new Float32Array(
    Array.from({ length: 25 }, (_, index) => index),
  );
  values[12] = -9999;
  const arrayBuffer = writeElevationGeoTiff(values, {
    width: 5,
    height: 5,
  });
  const qualityMask = new Uint8Array(25);
  qualityMask[12] = 1;
  const maskDigest = await sha256(qualityMask.buffer);
  const request = await requestFor(arrayBuffer);
  const policy = {
    method: TOPOGRAPHIC_NODATA_RESOLUTION_METHOD,
    qualityMask,
    expectedMaskSha256: maskDigest,
    maxResolvedCells: 1,
    maxResolvedFraction: 0.04,
  } as const;

  await assert.rejects(
    () => decodeGeoTiffElevationGrid({
      ...request,
      noDataResolution: policy,
    }),
    /quality mask digest is not bound/,
  );

  const edgeValues = new Float32Array(
    Array.from({ length: 25 }, (_, index) => index),
  );
  edgeValues[0] = -9999;
  const edgeArrayBuffer = writeElevationGeoTiff(edgeValues, {
    width: 5,
    height: 5,
  });
  const edgeMask = new Uint8Array(25);
  edgeMask[0] = 1;
  const edgeMaskDigest = await sha256(edgeMask.buffer);
  const edgeRequest = await requestFor(edgeArrayBuffer);
  await assert.rejects(
    () => decodeGeoTiffElevationGrid({
      ...edgeRequest,
      sourceRecord: sourceBoundTo(
        edgeRequest.expectedSha256,
        {},
        [edgeMaskDigest],
      ),
      noDataResolution: {
        ...policy,
        qualityMask: edgeMask,
        expectedMaskSha256: edgeMaskDigest,
      },
    }),
    /observed opposing neighbor pair/,
  );
});

test('projected, invalid-band, and unapproved sources fail closed', async () => {
  const projected = writeElevationGeoTiff(
    new Float32Array([1, 2, 3, 4]),
    { projected: true },
  );
  const projectedRequest = await requestFor(projected);
  await assert.rejects(
    () => decodeGeoTiffElevationGrid(projectedRequest),
    /must declare geographic EPSG:4326/,
  );

  const geographic = writeElevationGeoTiff(new Float32Array([1, 2, 3, 4]));
  const request = await requestFor(geographic);
  await assert.rejects(
    () => decodeGeoTiffElevationGrid({ ...request, bandIndex: 1 }),
    /bandIndex must be between 0 and 0/,
  );
  await assert.rejects(
    () =>
      decodeGeoTiffElevationGrid({
        ...request,
        sourceRecord: sourceBoundTo(request.expectedSha256, {
          reuseStatus: 'pending',
        }),
      }),
    /source reuse must be approved/,
  );
});
