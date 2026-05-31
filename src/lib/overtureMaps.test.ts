import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildOvertureBuildingNameDuckDbSql,
  buildingNameCandidateFromOvertureFeature,
} from './overtureMaps';

test('extracts building names from Overture Maps schema names', () => {
  const candidate = buildingNameCandidateFromOvertureFeature({
    id: 'overture:building:123',
    names: {
      primary: 'Tokyo Midtown',
      common: [
        { value: '東京ミッドタウン', language: 'ja' },
        { value: 'Tokyo Midtown', language: 'en' },
      ],
    },
    theme: 'buildings',
    type: 'building',
    confidence: 0.91,
    distanceMeters: 22,
  }, 'ja');

  assert.equal(candidate?.name, '東京ミッドタウン');
  assert.equal(candidate?.nameEn, 'Tokyo Midtown');
  assert.equal(candidate?.source, 'overture:buildings');
  assert.equal(candidate?.category, 'building');
});

test('builds DuckDB SQL for Overture Buildings and Places GeoParquet', () => {
  const sql = buildOvertureBuildingNameDuckDbSql(35.681236, 139.767125, 90, '2026-04-15.0');

  assert.match(sql, /theme=buildings\/type=building/);
  assert.match(sql, /theme=places\/type=place/);
  assert.match(sql, /names\.primary/);
  assert.match(sql, /bbox\.xmin/);
  assert.match(sql, /overturemaps-us-west-2\/release\/2026-04-15\.0/);
});
