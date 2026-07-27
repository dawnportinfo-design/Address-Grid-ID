import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AGID_SYNTHETIC_TOPO_SOURCE,
  type TopographicSourceRecord,
} from './topographicExport';
import {
  COASTAL_SURFACE_BREAKLINE,
  COASTAL_SURFACE_LAND,
  COASTAL_SURFACE_OCEAN,
  reconcileCoastalElevationGrids,
} from './topographicCoastalSeam';
import {
  serializeCoastalSeamManifest,
  serializeCoastalTerrainGltfBundle,
} from './topographicCoastalExport';
import type { NormalizedElevationGrid } from './topographicElevationVectorizer';

const bounds = {
  south: 0,
  west: 0,
  north: 0.01,
  east: 0.01,
};
const landDigest = `sha256:${'a'.repeat(64)}` as const;
const bathymetryDigest = `sha256:${'b'.repeat(64)}` as const;
const coastlineDigest = `sha256:${'c'.repeat(64)}` as const;

function source(
  sourceId: string,
  digest: string,
  layerIds: TopographicSourceRecord['layerIds'],
): TopographicSourceRecord {
  return {
    ...AGID_SYNTHETIC_TOPO_SOURCE,
    sourceId,
    layerIds,
    notes: [...(AGID_SYNTHETIC_TOPO_SOURCE.notes ?? []), `Snapshot digest: ${digest}.`],
  };
}

const landSource = source('synthetic-land-dem', landDigest, ['terrain-mesh']);
const bathymetrySource = source(
  'synthetic-bathymetry',
  bathymetryDigest,
  ['terrain-mesh'],
);
const coastlineSource = source(
  'synthetic-coastline',
  coastlineDigest,
  ['waterways'],
);

function grid(
  gridId: string,
  elevationsMeters: number[],
  sourceRecord: TopographicSourceRecord,
): NormalizedElevationGrid {
  return {
    gridId,
    title: gridId,
    bounds,
    width: 3,
    height: 3,
    elevationsMeters,
    rowOrder: 'north-to-south',
    horizontalCrs: 'EPSG:4326',
    verticalDatum: 'synthetic-mean-sea-level',
    sourceRecord,
    generatedAt: '2026-07-27T08:00:00.000Z',
  };
}

async function sha256(bytes: Uint8Array) {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    Uint8Array.from(bytes).buffer,
  );
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

const classes = Uint8Array.from([
  COASTAL_SURFACE_LAND,
  COASTAL_SURFACE_BREAKLINE,
  COASTAL_SURFACE_OCEAN,
  COASTAL_SURFACE_LAND,
  COASTAL_SURFACE_BREAKLINE,
  COASTAL_SURFACE_OCEAN,
  COASTAL_SURFACE_LAND,
  COASTAL_SURFACE_BREAKLINE,
  COASTAL_SURFACE_OCEAN,
]);

async function request(overrides: Record<string, unknown> = {}) {
  return {
    land: {
      grid: grid(
        'land',
        [5, 1, 0, 6, 0.5, 0, 7, 1.5, 0],
        landSource,
      ),
      sourceSnapshotSha256: landDigest,
    },
    bathymetry: {
      grid: grid(
        'bathymetry',
        [0, -1, -5, 0, -0.5, -6, 0, -1.5, -7],
        bathymetrySource,
      ),
      sourceSnapshotSha256: bathymetryDigest,
    },
    coastline: {
      maskId: 'synthetic-coastline-mask',
      width: 3,
      height: 3,
      bounds,
      rowOrder: 'north-to-south' as const,
      horizontalCrs: 'EPSG:4326' as const,
      classes,
      sourceRecord: coastlineSource,
      sourceSnapshotSha256: coastlineDigest,
      expectedClassificationSha256: await sha256(classes),
      adapterVersion: 'synthetic-coastline-adapter-v1',
      shorelineEpoch: '2026-01-01T00:00:00.000Z',
    },
    targetVerticalDatum: 'synthetic-mean-sea-level',
    generatedAt: '2026-07-27T08:10:00.000Z',
    maximumAdjustmentMeters: 2,
    ...overrides,
  };
}

test('coastal seam reconciles land and bathymetry through an evidenced breakline', async () => {
  const result = await reconcileCoastalElevationGrids(await request());

  assert.equal(result.sourceGates.land.status, 'ready');
  assert.equal(result.sourceGates.bathymetry.status, 'ready');
  assert.equal(result.sourceGates.coastline.status, 'ready');
  assert.deepEqual(Array.from(result.grid.elevationsMeters), [
    5, 0, -5,
    6, 0, -6,
    7, 0, -7,
  ]);
  assert.equal(result.metrics.landCellCount, 3);
  assert.equal(result.metrics.breaklineCellCount, 3);
  assert.equal(result.metrics.oceanCellCount, 3);
  assert.equal(result.metrics.maximumLandBreaklineAdjustmentMeters, 1.5);
  assert.equal(result.metrics.maximumBathymetryBreaklineAdjustmentMeters, 1.5);
  assert.equal(result.provenance.landSnapshotSha256, landDigest);
  assert.equal(result.provenance.coastlineAdapterVersion, 'synthetic-coastline-adapter-v1');
  assert.equal(result.grid.sourceIds.coastline, coastlineSource.sourceId);
  assert.doesNotMatch(
    JSON.stringify({
      grid: result.grid,
      provenance: result.provenance,
      metrics: result.metrics,
    }),
    /recipient|room_number|delivery_instruction|private_key|proof_secret/i,
  );
});

test('coastal seam rejects datum mismatch and unbound snapshot evidence', async () => {
  const mismatched = await request();
  mismatched.bathymetry.grid.verticalDatum = 'different-datum';
  await assert.rejects(
    () => reconcileCoastalElevationGrids(mismatched),
    /target vertical datum/,
  );

  const unbound = await request();
  unbound.land.sourceSnapshotSha256 = `sha256:${'d'.repeat(64)}`;
  await assert.rejects(
    () => reconcileCoastalElevationGrids(unbound),
    /not bound to the promoted source record/,
  );
});

test('coastal seam rejects altered classifications and missing breakline separation', async () => {
  const altered = await request();
  altered.coastline.classes = Uint8Array.from(altered.coastline.classes);
  altered.coastline.classes[0] = COASTAL_SURFACE_OCEAN;
  await assert.rejects(
    () => reconcileCoastalElevationGrids(altered),
    /SHA-256 does not match/,
  );

  const directContact = await request();
  directContact.coastline.classes = Uint8Array.from([
    COASTAL_SURFACE_LAND,
    COASTAL_SURFACE_LAND,
    COASTAL_SURFACE_OCEAN,
    COASTAL_SURFACE_LAND,
    COASTAL_SURFACE_BREAKLINE,
    COASTAL_SURFACE_OCEAN,
    COASTAL_SURFACE_LAND,
    COASTAL_SURFACE_BREAKLINE,
    COASTAL_SURFACE_OCEAN,
  ]);
  directContact.coastline.expectedClassificationSha256 = await sha256(
    directContact.coastline.classes,
  );
  await assert.rejects(
    () => reconcileCoastalElevationGrids(directContact),
    /touch without a breakline/,
  );
});

test('coastal manifest preserves all source evidence without exporting elevations', async () => {
  const seam = await reconcileCoastalElevationGrids(await request());
  const first = await serializeCoastalSeamManifest(seam);
  const second = await serializeCoastalSeamManifest(seam);
  const manifest = JSON.parse(first.data);

  assert.equal(first.data, second.data);
  assert.equal(first.contentSha256, second.contentSha256);
  assert.equal(first.byteLength, new TextEncoder().encode(first.data).byteLength);
  assert.deepEqual(
    manifest.sources.map((item: { role: string }) => item.role),
    ['land', 'bathymetry', 'coastline'],
  );
  assert.deepEqual(
    manifest.sources.map(
      (item: { snapshotSha256: string }) => item.snapshotSha256,
    ),
    [landDigest, bathymetryDigest, coastlineDigest],
  );
  assert.equal(manifest.grid.horizontalCrs, 'EPSG:4326');
  assert.equal(manifest.grid.verticalDatum, 'synthetic-mean-sea-level');
  assert.equal(manifest.coastlineEvidence.adapterVersion, 'synthetic-coastline-adapter-v1');
  assert.equal(manifest.metrics.gridCellCount, 9);
  assert.equal('elevationsMeters' in manifest.grid, false);
  assert.doesNotMatch(
    first.data,
    /room_number|delivery_instruction|private_key|proof_secret/i,
  );

  const inconsistent = structuredClone(seam);
  inconsistent.metrics.landCellCount = 4;
  await assert.rejects(
    () => serializeCoastalSeamManifest(inconsistent),
    /inconsistent cell counts/,
  );

  const blocked = structuredClone(seam);
  blocked.sourceGates.coastline.status = 'blocked';
  await assert.rejects(
    () => serializeCoastalSeamManifest(blocked),
    /source gate must be ready/,
  );
});

test('coastal glTF binds deterministic TIN geometry to the three-source manifest', async () => {
  const seam = await reconcileCoastalElevationGrids(await request());
  const first = await serializeCoastalTerrainGltfBundle(seam);
  const second = await serializeCoastalTerrainGltfBundle(seam);
  const gltf = JSON.parse(first.model.data);
  const evidence = gltf.asset.extras.agidCoastalEvidence;

  assert.equal(first.model.data, second.model.data);
  assert.equal(first.model.contentSha256, second.model.contentSha256);
  assert.equal(first.manifest.contentSha256, second.manifest.contentSha256);
  assert.equal(gltf.asset.version, '2.0');
  assert.equal(gltf.accessors[0].count, 9);
  assert.equal(gltf.accessors[1].count, 24);
  assert.equal(evidence.manifestSha256, first.manifest.contentSha256);
  assert.deepEqual(evidence.sourceIds, {
    land: landSource.sourceId,
    bathymetry: bathymetrySource.sourceId,
    coastline: coastlineSource.sourceId,
  });
  assert.equal(evidence.horizontalCrs, 'EPSG:4326');
  assert.equal(evidence.verticalDatum, 'synthetic-mean-sea-level');
  assert.doesNotMatch(
    `${first.model.data}${first.manifest.data}`,
    /room_number|delivery_instruction|private_key|proof_secret/i,
  );
});
