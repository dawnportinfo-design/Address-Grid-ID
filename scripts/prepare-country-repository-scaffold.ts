import { resolve } from 'node:path';

import {
  buildCountryRepositoryScaffold,
  writeCountryRepositoryScaffold,
} from '../src/lib/countryRepositoryScaffold';
import { buildCountryRepositoryProgram } from '../src/lib/countryRepositoryProgram';

function optionValue(name: string) {
  const index = process.argv.findIndex(argument => argument === name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const positionalCountry = process.argv.slice(2).find(argument => !argument.startsWith('--'));
const prepareAll = process.argv.includes('--all');
if (prepareAll && (optionValue('--country') || positionalCountry)) {
  throw new Error('Use either --all or one country code, not both.');
}

const countryCodes = prepareAll
  ? buildCountryRepositoryProgram().cohorts.flatMap(cohort => cohort.countries.map(country => country.countryCode))
  : [(optionValue('--country') || positionalCountry || 'GT').trim().toUpperCase()];
const generatedAt = process.env.AGID_COUNTRY_REPOSITORY_SCAFFOLD_GENERATED_AT || '2026-07-23T00:00:00.000Z';
const requestedOutputRoot = optionValue('--output-root');
const outputRoot = requestedOutputRoot ? resolve(requestedOutputRoot) : resolve('reports', 'country-repository-scaffolds');

const prepared = countryCodes.map(countryCode => {
  const scaffold = buildCountryRepositoryScaffold({ countryCode, generatedAt });
  const outputPath = writeCountryRepositoryScaffold(scaffold, outputRoot);
  return { repository: scaffold.repository, countryCode: scaffold.countryCode, outputPath };
});

console.log(JSON.stringify(prepareAll ? { countryCount: prepared.length, repositories: prepared } : prepared[0], null, 2));
