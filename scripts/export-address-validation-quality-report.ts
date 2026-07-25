import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { serializeAddressValidationQualityReportExport } from '../src/lib/addressValidationQualityReportExport';
import type { AddressValidationQualityReport } from '../src/lib/addressValidationQualityReport';

const reportPath = process.argv[process.argv.indexOf('--report') + 1];
if (!reportPath || reportPath.startsWith('--')) {
  throw new Error('Usage: npm run export:address-validation-quality-report -- --report <report.json>');
}

const report = JSON.parse(await readFile(resolve(reportPath), 'utf8')) as AddressValidationQualityReport;
process.stdout.write(serializeAddressValidationQualityReportExport(report));
