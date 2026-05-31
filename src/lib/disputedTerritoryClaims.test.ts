import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatTerritoryClaimSummary,
  getTerritoryClaimOptions,
  resolveTerritoryClaimKey,
} from './disputedTerritoryClaims';

test('Japanese territorial claim areas expose only the Japanese display view', () => {
  for (const code of ['JP_TK', 'JP_SK', 'JP_NT']) {
    const options = getTerritoryClaimOptions(code);
    assert.equal(options.length, 1, `${code} should not expose other country display views`);
    assert.equal(options[0].id, 'jp');
    assert.equal(options[0].label, '日本の主張');
  }
});

test('Bir Tawil displays as unclaimed first with Egypt-side and Sudan-side logistics views', () => {
  const options = getTerritoryClaimOptions('BT_T');
  assert.deepEqual(options.map(option => option.id), ['neutral', 'eg-route', 'sd-route']);
  assert.equal(options[0].label, '中立 / 未請求地');
  assert.match(formatTerritoryClaimSummary(options[0]), /No national postal system/);
  assert.match(formatTerritoryClaimSummary(options[1]), /logistics route/);
  assert.match(formatTerritoryClaimSummary(options[2]), /logistics route/);
});

test('territory claim key can be resolved from AGID region names and codes', () => {
  assert.equal(resolveTerritoryClaimKey({ regionCode: 'BT_T' }), 'BT_T');
  assert.equal(resolveTerritoryClaimKey({ regionName: 'Bir Tawil (Terra Nullius)' }), 'BT_T');
  assert.equal(resolveTerritoryClaimKey({ regionCode: 'JP_TK', regionName: 'Takeshima (Disputed - JP Claim)' }), 'JP_TK');
  assert.equal(resolveTerritoryClaimKey({ countryCode: 'jp_sk' }), 'JP_SK');
});

test('registered disputed territories expose at least one claim-aware display option', () => {
  const codes = ['BT_T', 'EH', 'CRIM', 'DONB', 'KASH', 'SCSD', 'EEBD', 'TRNC', 'SLND', 'PMR', 'CYGL', 'JP_NT', 'JP_TK', 'JP_SK'];
  for (const code of codes) {
    assert.ok(getTerritoryClaimOptions(code).length > 0, `${code} should have claim-aware display options`);
  }
});
