export const COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID = 'agid-country-repository-program-v0.1';

export type CountryRepositoryProgramStage = 'bootstrap-ready' | 'planned';

export type CountryRepositoryProgramCountry = {
  countryCode: string;
  countryName: string;
  repository: string;
  stage: CountryRepositoryProgramStage;
};

export type CountryRepositoryProgramCohort = {
  id: string;
  label: string;
  sharedMaintenanceFocus: string[];
  countries: CountryRepositoryProgramCountry[];
};

export type CountryRepositoryProgram = {
  schemaId: typeof COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID;
  generatedAt: string;
  parentRepository: 'AGID';
  countryRepositoryNaming: 'agid-country-{iso2}';
  publicationBoundary: {
    containsPersonalData: false;
    containsRawThirdPartyData: false;
    realPostalLookupEnabled: false;
    deliveryClaimEnabled: false;
  };
  cohorts: CountryRepositoryProgramCohort[];
  nonClaims: string[];
};

export type CountryRepositoryProgramValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_GENERATED_AT = '2026-07-23T00:00:00.000Z';

const COHORTS: CountryRepositoryProgramCohort[] = [
  {
    id: 'central-america-spanish-postal-candidate',
    label: 'Central America Spanish-language postal candidate cohort',
    sharedMaintenanceFocus: [
      'Reuse Spanish UI labels, address rendering order, and administrative-hierarchy terminology where country rules permit.',
      'Treat five-digit postal compatibility as a candidate only; enable format validation only after country-specific authority evidence is recorded.',
      'Keep border, rural-delivery, and source-license differences country-specific.',
    ],
    countries: [
      { countryCode: 'GT', countryName: 'Guatemala', repository: 'agid-country-gt', stage: 'bootstrap-ready' },
      { countryCode: 'HN', countryName: 'Honduras', repository: 'agid-country-hn', stage: 'planned' },
      { countryCode: 'NI', countryName: 'Nicaragua', repository: 'agid-country-ni', stage: 'planned' },
      { countryCode: 'SV', countryName: 'El Salvador', repository: 'agid-country-sv', stage: 'planned' },
      { countryCode: 'PA', countryName: 'Panama', repository: 'agid-country-pa', stage: 'planned' },
    ],
  },
  {
    id: 'small-africa-thin-pack',
    label: 'Small Africa thin-pack cohort',
    sharedMaintenanceFocus: [
      'Use thin synthetic packs, source ledgers, and explicit coverage non-claims.',
      'Do not infer delivery capability from a postal-operator page alone.',
    ],
    countries: [
      { countryCode: 'LS', countryName: 'Lesotho', repository: 'agid-country-ls', stage: 'planned' },
      { countryCode: 'SZ', countryName: 'Eswatini', repository: 'agid-country-sz', stage: 'planned' },
      { countryCode: 'GW', countryName: 'Guinea-Bissau', repository: 'agid-country-gw', stage: 'planned' },
    ],
  },
  {
    id: 'south-america-regional-validation',
    label: 'South America regional validation cohort',
    sharedMaintenanceFocus: [
      'Reuse the country-repository contract proven in Central America while keeping source rights and postal rules country-specific.',
      'Review Spanish and Portuguese rendering choices per country rather than sharing address records.',
    ],
    countries: [
      { countryCode: 'PE', countryName: 'Peru', repository: 'agid-country-pe', stage: 'planned' },
      { countryCode: 'PY', countryName: 'Paraguay', repository: 'agid-country-py', stage: 'planned' },
      { countryCode: 'UY', countryName: 'Uruguay', repository: 'agid-country-uy', stage: 'planned' },
      { countryCode: 'VE', countryName: 'Venezuela', repository: 'agid-country-ve', stage: 'planned' },
    ],
  },
  {
    id: 'eurasia-and-southeast-europe',
    label: 'Eurasia and Southeast Europe country cohort',
    sharedMaintenanceFocus: [
      'Keep script, transliteration, historical-name, and regional-classification rules explicit by country.',
      'Use the common AGID breadcrumb contract without flattening country-specific administrative hierarchies.',
    ],
    countries: [
      { countryCode: 'MN', countryName: 'Mongolia', repository: 'agid-country-mn', stage: 'planned' },
      { countryCode: 'KG', countryName: 'Kyrgyzstan', repository: 'agid-country-kg', stage: 'planned' },
      { countryCode: 'TJ', countryName: 'Tajikistan', repository: 'agid-country-tj', stage: 'planned' },
      { countryCode: 'TM', countryName: 'Turkmenistan', repository: 'agid-country-tm', stage: 'planned' },
      { countryCode: 'JO', countryName: 'Jordan', repository: 'agid-country-jo', stage: 'planned' },
      { countryCode: 'MD', countryName: 'Moldova', repository: 'agid-country-md', stage: 'planned' },
      { countryCode: 'MK', countryName: 'North Macedonia', repository: 'agid-country-mk', stage: 'planned' },
      { countryCode: 'RO', countryName: 'Romania', repository: 'agid-country-ro', stage: 'planned' },
      { countryCode: 'BG', countryName: 'Bulgaria', repository: 'agid-country-bg', stage: 'planned' },
      { countryCode: 'AL', countryName: 'Albania', repository: 'agid-country-al', stage: 'planned' },
      { countryCode: 'BA', countryName: 'Bosnia and Herzegovina', repository: 'agid-country-ba', stage: 'planned' },
      { countryCode: 'ME', countryName: 'Montenegro', repository: 'agid-country-me', stage: 'planned' },
      { countryCode: 'RS', countryName: 'Serbia', repository: 'agid-country-rs', stage: 'planned' },
      { countryCode: 'GE', countryName: 'Georgia', repository: 'agid-country-ge', stage: 'planned' },
      { countryCode: 'AZ', countryName: 'Azerbaijan', repository: 'agid-country-az', stage: 'planned' },
    ],
  },
];

export function buildCountryRepositoryProgram(input: { generatedAt?: string } = {}): CountryRepositoryProgram {
  return {
    schemaId: COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID,
    generatedAt: input.generatedAt || DEFAULT_GENERATED_AT,
    parentRepository: 'AGID',
    countryRepositoryNaming: 'agid-country-{iso2}',
    publicationBoundary: {
      containsPersonalData: false,
      containsRawThirdPartyData: false,
      realPostalLookupEnabled: false,
      deliveryClaimEnabled: false,
    },
    cohorts: COHORTS.map(cohort => ({
      ...cohort,
      sharedMaintenanceFocus: [...cohort.sharedMaintenanceFocus],
      countries: cohort.countries.map(country => ({ ...country })),
    })),
    nonClaims: [
      'A country repository does not authorize real postcode lookup, address autofill, or delivery claims.',
      'Country repositories contain metadata and synthetic fixtures until source rights, versioning, coverage, and correction evidence are accepted.',
      'Country cohorts share maintenance patterns, not raw address records or postal mappings.',
    ],
  };
}

export function validateCountryRepositoryProgram(program: CountryRepositoryProgram): CountryRepositoryProgramValidation {
  const errors: string[] = [];
  const countries = program.cohorts.flatMap(cohort => cohort.countries);
  const seenCodes = new Set<string>();
  if (program.schemaId !== COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (program.parentRepository !== 'AGID') errors.push('parent-repository-mismatch');
  if (program.countryRepositoryNaming !== 'agid-country-{iso2}') errors.push('repository-naming-mismatch');
  if (program.publicationBoundary.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (program.publicationBoundary.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (program.publicationBoundary.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (program.publicationBoundary.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (countries[0]?.countryCode !== 'GT' || countries[0]?.stage !== 'bootstrap-ready') errors.push('guatemala-not-first-bootstrap');
  for (const country of countries) {
    if (!/^[A-Z]{2}$/.test(country.countryCode)) errors.push(`invalid-country-code:${country.countryCode}`);
    if (seenCodes.has(country.countryCode)) errors.push(`duplicate-country:${country.countryCode}`);
    seenCodes.add(country.countryCode);
    if (country.repository !== `agid-country-${country.countryCode.toLowerCase()}`) errors.push(`repository-name-mismatch:${country.countryCode}`);
  }
  if (countries.length !== 27) errors.push(`country-count-mismatch:${countries.length}`);
  return { valid: errors.length === 0, errors };
}
