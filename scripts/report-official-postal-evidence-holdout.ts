import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { runOfficialPostalEvidenceSyntheticHoldout } from '../src/lib/officialPostalEvidenceHoldout';

const reportPath = join(process.cwd(), 'test-results', 'official-postal-evidence-holdout.json');
const report = runOfficialPostalEvidenceSyntheticHoldout();

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ reportPath, summary: report.summary }, null, 2));
