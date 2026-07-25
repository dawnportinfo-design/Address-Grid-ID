import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  buildCountryRepositoryProgram,
  validateCountryRepositoryProgram,
} from '../src/lib/countryRepositoryProgram';

const generatedAt = process.env.AGID_COUNTRY_REPOSITORY_PROGRAM_GENERATED_AT || '2026-07-23T00:00:00.000Z';
const outputRoot = join(process.cwd(), 'data', 'country_repositories');

async function main() {
  const program = buildCountryRepositoryProgram({ generatedAt });
  const validation = validateCountryRepositoryProgram(program);
  if (!validation.valid) throw new Error(`Country repository program is invalid: ${validation.errors.join(', ')}`);
  await mkdir(outputRoot, { recursive: true });
  await writeFile(join(outputRoot, 'program.json'), `${JSON.stringify(program, null, 2)}\n`, 'utf8');
  console.log(`Country repository program exported: countries=${program.cohorts.flatMap(cohort => cohort.countries).length}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
