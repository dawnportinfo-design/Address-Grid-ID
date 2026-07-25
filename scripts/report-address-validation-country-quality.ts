import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { buildCountryAddressValidationQualityPortfolio } from '../src/lib/countryAddressValidationQuality';
import { buildAddressValidationOfficialSourceEvidenceImport } from '../src/lib/addressValidationOfficialSourceEvidenceImport';
import { buildOfficialPostalSourceReuseLedger } from '../src/lib/officialPostalSourceReuseLedger';
import {
  assessCountryLocalMetadataEvidence,
  type CountryLocalMetadataReadiness,
} from '../src/lib/countryLocalMetadataEvidence';
import type { AddressCoverageFormatLike } from '../src/lib/addressCoveragePolicy';

const ADDRESS_FORMAT_ROOT = join(process.cwd(), 'src', 'data', 'address_formats');
const POSTAL_PACK_ROOT = join(process.cwd(), 'data', 'postal_country_packs');
const REPORT_PATH = join(process.cwd(), 'test-results', 'address-validation-country-quality.json');
const checkedAtArgument = process.argv.find(argument => argument.startsWith('--checked-at='));
const checkedAt = checkedAtArgument ? checkedAtArgument.slice('--checked-at='.length) : new Date().toISOString();
if (!Number.isFinite(Date.parse(checkedAt))) {
  throw new Error('Use an ISO 8601 timestamp for --checked-at.');
}

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

function localMetadataSourceCountryCodes() {
  const recorded: string[] = [];
  const reuseVerified: string[] = [];
  for (const countryCode of readdirSync(POSTAL_PACK_ROOT)) {
    const readinessPath = join(POSTAL_PACK_ROOT, countryCode, 'postal-source-readiness.json');
    try {
      const readiness = JSON.parse(readFileSync(readinessPath, 'utf8')) as CountryLocalMetadataReadiness;
      const status = assessCountryLocalMetadataEvidence(readiness, checkedAt);
      if (status === 'not-safe-or-not-recorded' || !readiness.countryCode) continue;
      recorded.push(readiness.countryCode);
      if (status === 'metadata-reuse-verified') reuseVerified.push(readiness.countryCode);
    } catch {
      continue;
    }
  }
  return { recorded, reuseVerified };
}

const importedEvidence = buildAddressValidationOfficialSourceEvidenceImport(
  buildOfficialPostalSourceReuseLedger(checkedAt),
  checkedAt,
);
const localMetadataEvidence = localMetadataSourceCountryCodes();
const portfolio = buildCountryAddressValidationQualityPortfolio(
  walkJsonFiles(ADDRESS_FORMAT_ROOT).flatMap(file => {
    try {
      return [{
        file: relative(ADDRESS_FORMAT_ROOT, file).replace(/\\/g, '/'),
        format: JSON.parse(readFileSync(file, 'utf8')) as AddressCoverageFormatLike,
      }];
    } catch {
      return [];
    }
  }), {
    officialSourceLedgers: importedEvidence.ledgers,
    metadataOnlySourceCountryCodes: importedEvidence.countryReadiness
      .filter(country => country.status === 'metadata-only-source-ready')
      .map(country => country.countryCode),
    localMetadataSourceCountryCodes: localMetadataEvidence.recorded,
    localMetadataReuseVerifiedCountryCodes: localMetadataEvidence.reuseVerified,
    checkedAt,
  },
);

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(portfolio, null, 2)}\n`);
console.log(JSON.stringify({ reportPath: REPORT_PATH, summary: portfolio.summary }, null, 2));
