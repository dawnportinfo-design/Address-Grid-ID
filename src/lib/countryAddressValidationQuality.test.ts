import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCountryAddressValidationQualityPortfolio } from './countryAddressValidationQuality';
import { buildAddressValidationOfficialSourceEvidenceImport } from './addressValidationOfficialSourceEvidenceImport';
import { buildOfficialPostalSourceReuseLedger } from './officialPostalSourceReuseLedger';

test('classifies country rule readiness conservatively and emits concrete improvement gates', () => {
  const portfolio = buildCountryAddressValidationQualityPortfolio([
    {
      file: 'us.json',
      format: { countryCode: 'US', name: 'United States', postalCode: { regex: '^\\d{5}$', source: 'USPS' } },
    },
    {
      file: 'gt.json',
      format: { countryCode: 'GT', name: 'Guatemala', postalCode: { regex: '^\\d{5}$', source: 'GeoNames postal' } },
    },
    {
      file: 'aq.json',
      format: { countryCode: 'AQ', name: 'Antarctica', postalCode: { source: 'No postal code' } },
    },
    {
      file: 'pt-main.json',
      format: { countryCode: 'PT', name: 'Portugal', postalCode: { regex: '^\\d{4}$', source: 'official postal service' } },
    },
    {
      file: 'pt-variant.json',
      format: { countryCode: 'PT', name: 'Portugal variant', postalCode: { regex: '^\\d{4}$', source: 'official postal service' } },
    },
  ]);

  assert.equal(portfolio.summary.countryCount, 4);
  assert.deepEqual(portfolio.countries.map(country => [country.countryCode, country.qualityTier]), [
    ['AQ', 'manual-review-required'],
    ['GT', 'candidate-limited'],
    ['PT', 'structured-rules'],
    ['US', 'strong-open-rules'],
  ]);
  const guatemala = portfolio.countries.find(country => country.countryCode === 'GT')!;
  assert.ok(guatemala.blockers.includes('postal-source-is-candidate-only'));
  assert.ok(guatemala.improvementActions.some(action => action.includes('authoritative-reuse-reviewed-postal-source')));
  const portugal = portfolio.countries.find(country => country.countryCode === 'PT')!;
  assert.ok(portugal.blockers.includes('multiple-country-format-variants-require-scope-review'));
  assert.equal(portfolio.summary.needsRulesImprovementCount, 2);
  assert.match(portfolio.nonClaim, /no address, recipient, precise location/i);
});

test('labels imported metadata-only official sources without treating them as lookup approval', () => {
  const imported = buildAddressValidationOfficialSourceEvidenceImport(
    buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z'),
    '2026-07-24T00:00:00.000Z',
  );
  const portfolio = buildCountryAddressValidationQualityPortfolio([{
    file: 'pt.json',
    format: { countryCode: 'PT', name: 'Portugal', postalCode: { regex: '^\\d{4}$', source: 'official postal service' } },
  }], {
    officialSourceLedgers: imported.ledgers,
    metadataOnlySourceCountryCodes: ['PT'],
    checkedAt: '2026-07-24T00:00:00.000Z',
  });
  const portugal = portfolio.countries[0]!;

  assert.equal(portugal.officialSourceEvidence, 'metadata-only-current');
  assert.ok(portugal.blockers.includes('official-source-evidence-metadata-only'));
  assert.ok(portugal.improvementActions.some(action => action.includes('before-enabling-postal-lookup-or-delivery-validation')));
  assert.equal(portfolio.summary.needsOfficialSourceEvidenceCount, 1);
});

test('shows local metadata readiness separately from a reviewed official-source ledger', () => {
  const portfolio = buildCountryAddressValidationQualityPortfolio([{
    file: 'gt.json',
    format: { countryCode: 'GT', name: 'Guatemala', postalCode: { regex: '^\\d{5}$', source: 'format-only' } },
  }], {
    localMetadataSourceCountryCodes: ['GT'],
    checkedAt: '2026-07-24T00:00:00.000Z',
  });
  const guatemala = portfolio.countries[0]!;

  assert.equal(guatemala.officialSourceEvidence, 'local-metadata-recorded');
  assert.ok(guatemala.blockers.includes('official-source-evidence-local-metadata-only'));
  assert.ok(guatemala.improvementActions.includes('convert-country-source-readiness-metadata-into-a-reviewed-official-source-evidence-ledger'));
  assert.equal(portfolio.summary.needsOfficialSourceEvidenceCount, 1);
});

test('distinguishes reuse-verified local metadata from an unreviewed local record', () => {
  const portfolio = buildCountryAddressValidationQualityPortfolio([{
    file: 'gt.json',
    format: { countryCode: 'GT', name: 'Guatemala', postalCode: { regex: '^\\d{5}$', source: 'format-only' } },
  }], {
    localMetadataSourceCountryCodes: ['GT'],
    localMetadataReuseVerifiedCountryCodes: ['GT'],
    checkedAt: '2026-07-24T00:00:00.000Z',
  });
  const guatemala = portfolio.countries[0]!;

  assert.equal(guatemala.officialSourceEvidence, 'local-metadata-reuse-verified');
  assert.ok(guatemala.blockers.includes('official-source-evidence-local-metadata-only'));
  assert.ok(guatemala.improvementActions.some(action => action.includes('postal-mapping-coverage-and-correction-evidence')));
});
