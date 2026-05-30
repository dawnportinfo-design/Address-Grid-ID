import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'GridDetailPanel.tsx'), 'utf8');

test('grid detail address language tabs use native-script labels', () => {
  assert.match(source, /getAddressLanguageTabLabel\(langCode/);
  assert.match(source, /getEnglishAddressCircle\(countryCode\)/);
  assert.doesNotMatch(source, /font-black uppercase tracking-widest/);
});

test('English address tab renders from canonical data and compacts normal display text', () => {
  assert.match(source, /clickedAddressTab === 'en'[\s\S]*?AddressRenderer\.render\('en', canonical\)/);
  assert.match(source, /formatAddressDisplayText\(getAddressDisplay\(\), \{ tab: clickedAddressTab \}\)/);
  assert.match(source, /shouldPreserveAddressDisplayLines\(clickedAddressTab\)/);
});
