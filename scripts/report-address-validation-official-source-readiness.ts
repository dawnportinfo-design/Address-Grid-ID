import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { buildAddressValidationOfficialSourceEvidenceImport } from '../src/lib/addressValidationOfficialSourceEvidenceImport';
import { buildOfficialPostalSourceReuseLedger } from '../src/lib/officialPostalSourceReuseLedger';

const reportPath = join(process.cwd(), 'test-results', 'address-validation-official-source-readiness.json');
const checkedAtArgument = process.argv.find(argument => argument.startsWith('--checked-at='));
const checkedAt = checkedAtArgument ? checkedAtArgument.slice('--checked-at='.length) : new Date().toISOString();
if (!Number.isFinite(Date.parse(checkedAt))) {
  throw new Error('Use an ISO 8601 timestamp for --checked-at.');
}

const reuseLedger = buildOfficialPostalSourceReuseLedger(checkedAt);
const readiness = buildAddressValidationOfficialSourceEvidenceImport(reuseLedger, checkedAt);

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(readiness, null, 2)}\n`);
console.log(JSON.stringify({
  reportPath,
  countryCount: readiness.countryReadiness.length,
  metadataOnlySourceReadyCountryCount: readiness.countryReadiness.filter(country => country.status === 'metadata-only-source-ready').length,
  sourceApprovalPendingCountryCount: readiness.countryReadiness.filter(country => country.status === 'source-approval-pending').length,
}, null, 2));
