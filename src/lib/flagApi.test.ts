import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath,pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const helperPath = join(here, 'flagApi.ts');

test('builds FlagCDN image URLs from country and regional territory codes', async () => {
  assert.ok(existsSync(helperPath), 'flag API helper is missing');

  const helper = await import(pathToFileURL(helperPath).href);

  assert.equal(helper.normalizeFlagCountryCode('JP'), 'jp');
  assert.equal(helper.normalizeFlagCountryCode('DE-BW'), 'de');
  assert.equal(helper.normalizeFlagCountryCode('CA_QC'), 'ca');
  assert.equal(helper.normalizeFlagCountryCode('SBA'), 'cy');
  assert.equal(helper.getFlagApiUrl('JP'), 'https://flagcdn.com/jp.svg');
  assert.equal(helper.getFlagApiUrl('ES_CAN'), 'https://flagcdn.com/es.svg');
  assert.equal(helper.getFlagPngSrcSet('US'), 'https://flagcdn.com/40x30/us.png 1x, https://flagcdn.com/80x60/us.png 2x');
});
