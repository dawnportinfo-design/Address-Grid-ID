import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { buildOfficialPostalSourceReuseLedger } from '../src/lib/officialPostalSourceReuseLedger';

const reportPath = join(process.cwd(), 'test-results', 'official-postal-source-reuse-ledger.json');
const checkedAtArgument = process.argv.find(argument => argument.startsWith('--checked-at='));
const checkedAt = checkedAtArgument ? checkedAtArgument.slice('--checked-at='.length) : new Date().toISOString();
if (!Number.isFinite(Date.parse(checkedAt))) {
  throw new Error('Use an ISO 8601 timestamp for --checked-at.');
}
const ledger = buildOfficialPostalSourceReuseLedger(checkedAt);

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(JSON.stringify({ reportPath, summary: ledger.summary }, null, 2));
