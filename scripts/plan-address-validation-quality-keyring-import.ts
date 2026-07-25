import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { planAddressValidationQualityKeyringImport } from '../src/lib/addressValidationQualityKeyringImportPlan';
import type { AddressValidationQualityKeyringImportApproval } from '../src/lib/addressValidationQualityKeyringApproval';
import type { AddressValidationQualityKeyringGovernanceLedger } from '../src/lib/addressValidationQualityKeyringGovernance';
import type { AddressValidationQualityPublicKeyCandidate } from '../src/lib/addressValidationQualityKeyringImportPlan';

function argument(name: string) {
  const value = process.argv[process.argv.indexOf(name) + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing ${name} path.`);
  return resolve(value);
}

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

const ledger = await readJson<AddressValidationQualityKeyringGovernanceLedger>(argument('--ledger'));
const approvals = await readJson<AddressValidationQualityKeyringImportApproval[]>(argument('--approvals'));
const candidates = await readJson<AddressValidationQualityPublicKeyCandidate[]>(argument('--public-keys'));
const checkedAt = process.argv.includes('--checked-at')
  ? process.argv[process.argv.indexOf('--checked-at') + 1]
  : new Date().toISOString();

console.log(JSON.stringify(planAddressValidationQualityKeyringImport(ledger, approvals, candidates, checkedAt), null, 2));
