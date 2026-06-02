import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'GridDetailPanel.tsx'), 'utf8');
const addressLanguageTabsSource = readFileSync(join(here, 'AddressLanguageTabs.tsx'), 'utf8');
const addressQualitySummarySource = readFileSync(join(here, 'AddressQualitySummary.tsx'), 'utf8');

test('grid detail address language tabs use native-script labels', () => {
  assert.match(source, /<AddressLanguageTabs/);
  assert.match(addressLanguageTabsSource, /getAddressLanguageTabLabel\(langCode/);
  assert.match(addressLanguageTabsSource, /getEnglishAddressCircle\(countryCode\)/);
  assert.doesNotMatch(source, /font-black uppercase tracking-widest/);
});

test('English address tab renders international shipping English from canonical data', () => {
  assert.match(source, /clickedAddressTab === 'en' \|\| isInternationalShippingEnglishTab\(clickedAddressTab\)[\s\S]*?AddressRenderer\.renderInternationalShippingEnglish\(canonical\)/);
  assert.match(source, /collectOpenSourceAddressEvidenceSources\(clickedAddressDetails\)/);
  assert.match(source, /assessAddressDisplayQuality\(rawAddressDisplay/);
  assert.match(source, /AddressRenderer\.renderPartialAddress\(clickedAddressTab, createCanonicalAddress\(clickedAddressDetails\)\)/);
  assert.match(source, /formatAddressDisplayText\(resolvedAddressDisplay, \{ tab: clickedAddressTab \}\)/);
  assert.match(source, /shouldPreserveAddressDisplayLines\(clickedAddressTab\)/);
});

test('grid detail panel guards address metadata and rendering errors', () => {
  assert.match(source, /getAddressFormat\(countryCode\)[\s\S]*?\.catch\(\(\) => \{/);
  assert.match(source, /generateInternationalShippingLabel\(clickedAddressDetails\)[\s\S]*?\.catch\(\(\) => \{/);
  assert.match(source, /const safeAddressDisplay = \(\) => \{/);
  assert.match(source, /catch \(error\) \{[\s\S]*?console\.warn\('Address display fallback:'/);
});

test('disputed territory address display exposes selectable claim views', () => {
  assert.match(source, /getTerritoryClaimOptions/);
  assert.match(source, /selectedTerritoryClaimId/);
  assert.match(source, /territoryClaimOptions\.map/);
  assert.match(source, /formatTerritoryClaimSummary\(selectedTerritoryClaim\)/);
});

test('grid detail panel shows postal and geodata verification quality policy', () => {
  assert.match(source, /executeVerifiedAddressTranslationSync/);
  assert.match(source, /const addressValidation = verifiedAddressTranslation\?\.validation \|\| null/);
  assert.match(source, /<AddressQualitySummary validation=\{addressValidation\} \/>/);
  assert.match(addressQualitySummarySource, /getAddressQualitySummary\(validation\)/);
  assert.match(addressQualitySummarySource, /summary\.confidenceLabel/);
  assert.match(addressQualitySummarySource, /summary\.explanation/);
});
