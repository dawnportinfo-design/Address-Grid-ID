import { mkdirSync,readdirSync,readFileSync,statSync,writeFileSync } from 'node:fs';
import { dirname,join,relative } from 'node:path';

import {
classifyAddressCoveragePolicy,
summarizeAddressCoveragePolicies,
type AddressCoverageFormatLike,
} from '../src/lib/addressCoveragePolicy';

type AddressCoverageReportEntry = {
  countryCode: string;
  name: string;
  file: string;
  policyId: string;
  label: string;
  validationMode: string;
  autofillMode: string;
  reason: string;
};

const ADDRESS_FORMAT_ROOT = join(process.cwd(), 'src', 'data', 'address_formats');
const REPORT_PATH = join(process.cwd(), 'test-results', 'address-coverage-policy.json');

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

function loadFormats() {
  return walkJsonFiles(ADDRESS_FORMAT_ROOT).map(file => ({
    file,
    relativePath: relative(ADDRESS_FORMAT_ROOT, file),
    format: JSON.parse(readFileSync(file, 'utf8')) as AddressCoverageFormatLike,
  }));
}

function main() {
  const records = loadFormats();
  const entries: AddressCoverageReportEntry[] = records
    .map(({ format, relativePath }) => {
      const policy = classifyAddressCoveragePolicy(format);
      return {
        countryCode: format.countryCode || '',
        name: format.name || format.countryCode || '',
        file: relativePath,
        policyId: policy.id,
        label: policy.label,
        validationMode: policy.validationMode,
        autofillMode: policy.autofillMode,
        reason: policy.reason,
      };
    })
    .sort((left, right) => left.policyId.localeCompare(right.policyId) || left.countryCode.localeCompare(right.countryCode));

  const report = {
    generatedAt: new Date().toISOString(),
    summary: summarizeAddressCoveragePolicies(records.map(record => record.format)),
    entries,
  };

  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    reportPath: REPORT_PATH,
    summary: report.summary,
  }, null, 2));
}

main();
