import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AGID_SYNTHETIC_TOPO_SOURCE,
  buildTopographicExportPlan,
  type TopographicSourceRecord,
} from './topographicExport';
import {
  MAX_ELEVATION_GRID_CELLS,
  MAX_MESH_LOD_LEVELS,
  vectorizeNormalizedElevationGrid,
  type NormalizedElevationGrid,
} from './topographicElevationVectorizer';
import { serializeTopographicExport } from './topographicExportSerializers';

const bounds = {
  south: 35,
  west: 139,
  north: 35.01,
  east: 139.01,
};

const grid: NormalizedElevationGrid = {
  gridId: 'synthetic-hill',
  title: 'Synthetic normalized hill',
  bounds,
  width: 4,
  height: 4,
  elevationsMeters: [
    0, 5, 5, 0,
    5, 20, 20, 5,
    5, 20, 20, 5,
    0, 5, 5, 0,
  ],
  rowOrder: 'north-to-south',
  horizontalCrs: 'EPSG:4326',
  verticalDatum: 'synthetic-local-datum',
  sourceRecord: AGID_SYNTHETIC_TOPO_SOURCE,
  generatedAt: '2026-07-27T03:00:00.000Z',
  countryCode: 'JP',
};

test('normalized elevation grid produces deterministic TIN and contour vectors', () => {
  const first = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
  });
  const second = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
  });

  assert.equal(first.sourceGate.status, 'ready');
  assert.equal(first.metrics.gridCellCount, 16);
  assert.equal(first.metrics.vertexCount, 16);
  assert.equal(first.metrics.triangleCount, 18);
  assert.equal(first.metrics.meshLodCount, 1);
  assert.equal(first.metrics.minimumElevationMeters, 0);
  assert.equal(first.metrics.maximumElevationMeters, 20);
  assert.equal(first.metrics.contourLevelCount, 3);
  assert.ok(first.metrics.contourFeatureCount > 0);
  assert.deepEqual(first.dataset, second.dataset);
  assert.equal(first.meshLods.length, 1);
  assert.ok(
    first.dataset.features.every(
      feature =>
        feature.layerId === 'contour-lines' &&
        feature.properties.vertical_datum === 'synthetic-local-datum' &&
        feature.sourceId === AGID_SYNTHETIC_TOPO_SOURCE.sourceId,
    ),
  );
});

test('terrain mesh LODs are deterministic, bounded, and preserve grid edges', () => {
  const first = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
    includeContours: false,
    meshLodStrides: [1, 2],
  });
  const second = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
    includeContours: false,
    meshLodStrides: [1, 2],
  });

  assert.equal(first.metrics.meshLodCount, 2);
  assert.equal(first.dataset.meshes.length, 1);
  assert.equal(first.meshLods[0].vertexCount, 16);
  assert.equal(first.meshLods[0].triangleCount, 18);
  assert.equal(first.meshLods[1].vertexCount, 9);
  assert.equal(first.meshLods[1].triangleCount, 8);
  assert.equal(first.meshLods[1].mesh.id, 'synthetic-hill-terrain-mesh-lod1-s2');
  assert.deepEqual(first.meshLods, second.meshLods);

  const coarseVertices = first.meshLods[1].mesh.vertices;
  assert.deepEqual(coarseVertices[0].slice(0, 2), [bounds.west, bounds.north]);
  assert.deepEqual(coarseVertices.at(-1)?.slice(0, 2), [
    bounds.east,
    bounds.south,
  ]);
  assert.ok(
    first.meshLods.every(
      lod => lod.mesh.sourceId === AGID_SYNTHETIC_TOPO_SOURCE.sourceId,
    ),
  );
});

test('generated dataset passes existing glTF and GeoJSON serializers', () => {
  const result = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
  });
  const gltfPlan = buildTopographicExportPlan({
    bounds,
    countryCode: 'JP',
    crs: 'EPSG:4326',
    format: 'gltf',
    layerIds: ['terrain-mesh', 'contour-lines'],
    sourceRecords: [AGID_SYNTHETIC_TOPO_SOURCE],
    dataMode: 'synthetic',
    contourIntervalMeters: 5,
    now: grid.generatedAt,
  });
  const geoJsonPlan = buildTopographicExportPlan({
    bounds,
    countryCode: 'JP',
    crs: 'EPSG:4326',
    format: 'geojson',
    layerIds: ['contour-lines'],
    sourceRecords: [AGID_SYNTHETIC_TOPO_SOURCE],
    dataMode: 'synthetic',
    contourIntervalMeters: 5,
    now: grid.generatedAt,
  });

  assert.equal(gltfPlan.status, 'ready');
  assert.equal(geoJsonPlan.status, 'ready');
  const gltf = JSON.parse(
    String(serializeTopographicExport(result.dataset, gltfPlan).data),
  );
  const geoJson = JSON.parse(
    String(serializeTopographicExport(result.dataset, geoJsonPlan).data),
  );
  assert.equal(gltf.asset.version, '2.0');
  assert.ok(gltf.meshes.length > 0);
  assert.equal(geoJson.type, 'FeatureCollection');
  assert.ok(geoJson.features.length > 0);
});

test('source rights, freshness, coverage, and requested layer gates remain enforced', () => {
  const pendingSource: TopographicSourceRecord = {
    ...AGID_SYNTHETIC_TOPO_SOURCE,
    sourceId: 'pending-elevation-source',
    reuseStatus: 'pending',
    syntheticOnly: false,
  };

  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        { ...grid, sourceRecord: pendingSource },
        { contourIntervalMeters: 5 },
      ),
    /source-reuse-pending/,
  );
});

test('malformed, excessive, and non-normalized grids fail closed', () => {
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        { ...grid, elevationsMeters: [0, 1] },
        { contourIntervalMeters: 5 },
      ),
    /requires 16 values/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        {
          ...grid,
          elevationsMeters: [
            0, 5, 5, 0,
            5, Number.NaN, 20, 5,
            5, 20, 20, 5,
            0, 5, 5, 0,
          ],
        },
        { contourIntervalMeters: 5 },
      ),
    /non-finite value/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        {
          ...grid,
          width: MAX_ELEVATION_GRID_CELLS + 1,
          height: 2,
          elevationsMeters: [],
        },
        { contourIntervalMeters: 5 },
      ),
    /exceeds 1000000 cells/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        {
          ...grid,
          bounds: { south: -1, west: 179.9, north: 1, east: -179.9 },
        },
        { contourIntervalMeters: 5 },
      ),
    /Antimeridian elevation vectorization/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(grid, {
        contourIntervalMeters: 5,
        meshLodStrides: [2],
      }),
    /must start with stride 1/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(grid, {
        contourIntervalMeters: 5,
        meshLodStrides: [1, 2, 2],
      }),
    /strictly increasing/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(grid, {
        contourIntervalMeters: 5,
        includeTerrainMesh: false,
        meshLodStrides: [1],
      }),
    /requires terrain mesh output/,
  );
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(grid, {
        contourIntervalMeters: 5,
        meshLodStrides: Array.from(
          { length: MAX_MESH_LOD_LEVELS + 1 },
          (_, index) => index + 1,
        ),
      }),
    /must contain between 1 and 8 levels/,
  );
});

test('contour explosion is bounded and private address material is absent', () => {
  assert.throws(
    () =>
      vectorizeNormalizedElevationGrid(
        {
          ...grid,
          width: 2,
          height: 2,
          elevationsMeters: [0, 1000, 1000, 0],
        },
        { contourIntervalMeters: 0.25, includeTerrainMesh: false },
      ),
    /exceeds 512 levels/,
  );

  const result = vectorizeNormalizedElevationGrid(grid, {
    contourIntervalMeters: 5,
  });
  assert.doesNotMatch(
    JSON.stringify(result.dataset),
    /recipient|room_number|delivery_instruction|private_key|proof_secret/i,
  );
});
