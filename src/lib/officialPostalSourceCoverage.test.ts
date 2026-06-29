import assert from 'node:assert/strict';
import { readdirSync,readFileSync,statSync } from 'node:fs';
import { join,relative } from 'node:path';
import { test } from 'node:test';

import {
  collectOfficialPostalSourceCoverage,
  getPostalSourceContinent,
  POSTAL_SOURCE_CONTINENT_ORDER,
  summarizeOfficialPostalSourceCoverage,
} from './officialPostalSourceCoverage';

const root = join(process.cwd(), 'src', 'data', 'address_formats');

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

function loadAddressFormats() {
  return walkJsonFiles(root).map(file => ({
    relativePath: relative(root, file),
    format: JSON.parse(readFileSync(file, 'utf8')),
  }));
}

test('maps address formats into continent ordered postal source coverage', () => {
  const files = loadAddressFormats();
  const entries = collectOfficialPostalSourceCoverage(files);
  const summary = summarizeOfficialPostalSourceCoverage(entries);

  assert.equal(entries.length, files.length);
  assert.equal(summary.total, files.length);

  const seenContinents = new Set(entries.map(entry => entry.continent));
  for (const continent of POSTAL_SOURCE_CONTINENT_ORDER) {
    assert.ok(seenContinents.has(continent), `${continent} should be represented`);
  }

  const continentIndexes = entries.map(entry => POSTAL_SOURCE_CONTINENT_ORDER.indexOf(entry.continent));
  assert.deepEqual(continentIndexes, [...continentIndexes].sort((left, right) => left - right));
});

test('classifies representative official and postal-operator sources strongly', () => {
  const entries = collectOfficialPostalSourceCoverage(loadAddressFormats());
  const byCode = new Map(entries.map(entry => [entry.countryCode, entry]));

  assert.equal(byCode.get('JP')?.status, 'authoritative');
  assert.equal(byCode.get('FR')?.status, 'authoritative');
  assert.equal(byCode.get('DK')?.status, 'authoritative');
  assert.equal(byCode.get('SG')?.status, 'authoritative');
  assert.equal(byCode.get('BR')?.status, 'authoritative');
  assert.equal(byCode.get('NZ')?.status, 'authoritative');
  assert.equal(byCode.get('HK')?.status, 'no-normal-postcode');

  assert.ok(byCode.get('JP')?.evidence.some(source => source.id === 'zipcloud-jp'));
  assert.ok(byCode.get('FR')?.evidence.some(source => /data\.gouv|La Poste/i.test(source.name)));
  assert.ok(byCode.get('BR')?.evidence.some(source => /Correios|ViaCEP|BrasilAPI/i.test(source.name)));
  assert.ok(byCode.get('HK')?.evidence.some(source => source.trustTier === 'authoritative'));
});

test('separates global official fallback from country-specific official source gaps', () => {
  const entries = collectOfficialPostalSourceCoverage(loadAddressFormats());
  const summary = summarizeOfficialPostalSourceCoverage(entries);
  const byCode = new Map(entries.map(entry => [entry.countryCode, entry]));

  assert.equal(summary.byStatus['needs-official-source'], 0);
  assert.equal(summary.missingOfficialSourceCountryCodes.length, 0);
  assert.ok(summary.globalOfficialFallbackCountryCodes.length > 0);
  assert.ok(summary.countrySpecificOfficialMissingCountryCodes.length > 0);
  assert.ok(summary.countrySpecificOfficialMissingCountryCodesByContinent.africa.length > 0);
  assert.ok(summary.countrySpecificOfficialMissingCountryCodesByContinent.europe.includes('DE'));

  assert.equal(byCode.get('DE')?.status, 'official');
  assert.equal(byCode.get('DE')?.usesGlobalOfficialFallback, true);
  assert.equal(byCode.get('DE')?.countrySpecificOfficialSourceMissing, true);
  assert.ok(byCode.get('DE')?.evidence.some(source => source.id === 'catalog:upu-universal-postcode-database'));

  for (const countryCode of ['AT', 'KE', 'LY', 'MA', 'MR', 'SD', 'TN']) {
    assert.equal(byCode.get(countryCode)?.countrySpecificOfficialEvidence, true, `${countryCode} should have country-specific official evidence`);
    assert.equal(byCode.get(countryCode)?.countrySpecificOfficialSourceMissing, false, `${countryCode} should not remain country-specific missing`);
    assert.equal(byCode.get(countryCode)?.usesGlobalOfficialFallback, false, `${countryCode} should not depend on the global fallback`);
  }

  assert.ok(
    entries
      .filter(entry => entry.countrySpecificOfficialSourceMissing)
      .every(entry => entry.recommendation.includes('global official postal fallback')),
  );
});

test('derives continents from relative address-format paths', () => {
  assert.equal(getPostalSourceContinent('africa/western_africa/NG.json'), 'africa');
  assert.equal(getPostalSourceContinent('americas/north_america/US.json'), 'americas');
  assert.equal(getPostalSourceContinent('asia/east_asia/JP.json'), 'asia');
  assert.equal(getPostalSourceContinent('europe/western_europe/FR.json'), 'europe');
  assert.equal(getPostalSourceContinent('oceania/australia_and_new_zealand/AU.json'), 'oceania');
  assert.equal(getPostalSourceContinent('antarctica/antarctica/AQ.json'), 'antarctica');
  assert.equal(getPostalSourceContinent('special/disputed/BT_T.json'), 'special');
});
