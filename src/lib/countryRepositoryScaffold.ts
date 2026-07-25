import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  AGID_POSTAL_COUNTRY_PACK_VERSION,
  buildAgidPostalCountryPack,
  validateAgidPostalCountryPack,
} from './agidPostalCountryPack';
import {
  buildCountryRepositoryContract,
  evaluateRepositoryRoleCoverage,
} from '../address/addressRepositoryArchitecture';

export const COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID = 'agid-country-repository-scaffold-v0.1';

export type CountryRepositoryScaffoldFile = {
  relativePath: string;
  content: string;
};

export type CountryRepositoryScaffold = {
  schemaId: typeof COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID;
  repository: string;
  countryCode: string;
  countryName: string;
  generatedAt: string;
  files: CountryRepositoryScaffoldFile[];
};

export type CountryRepositoryScaffoldValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_GENERATED_AT = '2026-07-23T00:00:00.000Z';

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function text(lines: string[]) {
  return `${lines.join('\n')}\n`;
}

function licenseText() {
  return text([
    'MIT License',
    '',
    'Copyright (c) 2026 AGID contributors',
    '',
    'Permission is hereby granted, free of charge, to any person obtaining a copy',
    'of this software and associated documentation files (the "Software"), to deal',
    'in the Software without restriction, including without limitation the rights',
    'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
    'copies of the Software, and to permit persons to whom the Software is',
    'furnished to do so, subject to the following conditions:',
    '',
    'The above copyright notice and this permission notice shall be included in all',
    'copies or substantial portions of the Software.',
    '',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
    'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
    'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
    'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
    'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
    'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE',
    'SOFTWARE.',
  ]);
}

function readme(input: {
  repository: string;
  countryCode: string;
  countryName: string;
  generatedAt: string;
}) {
  return text([
    `# ${input.repository}`,
    '',
    `AGID country repository for ${input.countryName} (${input.countryCode}).`,
    '',
    '## Status',
    '',
    '- Generated from parent repository: `AGID`',
    `- Country pack contract: \`${AGID_POSTAL_COUNTRY_PACK_VERSION}\``,
    `- Generated at: \`${input.generatedAt}\``,
    '- Publication status: `draft`',
    '- Postal lookup and delivery claims: disabled',
    '',
    '## Scope',
    '',
    'This repository owns reviewable country-specific address structure, source metadata,',
    'postal and AGID status, normalization and rendering policy, quality gates, and',
    'synthetic conformance fixtures. AGID core owns the common graph, identifier',
    'semantics, privacy gates, and cross-country conformance contract.',
    '',
    'The link and synchronization rules are recorded in `agid-core-compatibility.json`.',
    '',
    '## Data Boundary',
    '',
    'The repository may contain generated metadata and synthetic fixtures. It must not',
    'contain raw personal addresses, recipient records, private coordinates, private keys,',
    'witness material, proof secrets, bulk postcode mappings, carrier route data, or heavy',
    'GIS extracts. Reference external material by source, license, version, and content hash.',
    '',
    '## Layout',
    '',
    '- `manifest.json`: country ownership, release boundary, and required roles.',
    '- `agid-core-compatibility.json`: parent AGID contract and synchronization rules.',
    '- `sources.json` and `DATA_LICENSES.md`: source and reuse boundary.',
    '- `quality-gates.json`: publishability and privacy gates.',
    '- `data/agid-postal-country-pack.json`: safe generated country pack.',
    '- `fixtures/conformance.json`: synthetic vectors only.',
    '- `scripts/verify.mjs`: dependency-free local validation.',
    '',
    '## Maintenance',
    '',
    '1. Update country-specific rules or source metadata in AGID.',
    '2. Regenerate this scaffold through the parent AGID repository.',
    '3. Review the country-repository diff independently.',
    '4. Run `npm test` before release.',
    '',
    'This repository does not authorize a real postcode lookup, address autofill, or',
    'delivery decision until source rights, versioning, coverage, and correction gates',
    'are explicitly accepted.',
  ]);
}

function verifierScript() {
  return text([
    "import { readFileSync } from 'node:fs';",
    "import { dirname, join } from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    '',
    "const readJson = path => JSON.parse(readFileSync(path, 'utf8'));",
    "const root = join(dirname(fileURLToPath(import.meta.url)), '..');",
    "const manifest = readJson(join(root, 'manifest.json'));",
    "const compatibility = readJson(join(root, 'agid-core-compatibility.json'));",
    "const qualityGates = readJson(join(root, 'quality-gates.json'));",
    "const pack = readJson(join(root, 'data', 'agid-postal-country-pack.json'));",
    "const fixtures = readJson(join(root, 'fixtures', 'conformance.json'));",
    '',
    "if (!manifest.countryCode || manifest.repository !== `agid-country-${manifest.countryCode.toLowerCase()}`) throw new Error('country repository identity is invalid');",
    "if (manifest.privacy.containsPersonalData || manifest.privacy.containsRawThirdPartyData) throw new Error('publication boundary permits prohibited data');",
    "if (manifest.privacy.realPostalLookupEnabled || manifest.privacy.deliveryClaimEnabled) throw new Error('publication boundary enables a postal lookup or delivery claim');",
    "if (compatibility.parentRepository !== 'AGID' || compatibility.countryPackSchemaId !== pack.manifest.schemaId) throw new Error('AGID compatibility contract is invalid');",
    "if (!qualityGates.gates.every(gate => gate.required)) throw new Error('a required quality gate is missing');",
    "if (!fixtures.vectors.every(vector => vector.expected.containsPersonalData === false)) throw new Error('conformance fixtures are not synthetic-safe');",
    'console.log(JSON.stringify({ repository: manifest.repository, countryCode: manifest.countryCode, valid: true }));',
  ]);
}

function workflowYaml() {
  return text([
    'name: validate',
    '',
    'on:',
    '  pull_request:',
    '  push:',
    '    branches:',
    '      - main',
    '',
    'jobs:',
    '  validate:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '      - uses: actions/setup-node@v4',
    '        with:',
    "          node-version: '22'",
    '      - run: node scripts/verify.mjs',
  ]);
}

export function buildCountryRepositoryScaffold(input: {
  countryCode: string;
  generatedAt?: string;
}): CountryRepositoryScaffold {
  const generatedAt = input.generatedAt || DEFAULT_GENERATED_AT;
  const pack = buildAgidPostalCountryPack({ countryCode: input.countryCode, generatedAt });
  const packValidation = validateAgidPostalCountryPack(pack);
  if (!packValidation.valid) throw new Error(`Country pack is invalid: ${packValidation.errors.join(', ')}`);

  const contract = buildCountryRepositoryContract(pack.manifest.countryCode);
  const repository = contract.repository;
  const manifest = {
    schemaId: COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID,
    repository,
    countryCode: pack.manifest.countryCode,
    countryName: pack.manifest.countryName,
    generatedAt,
    publicationStatus: pack.manifest.officialStatus,
    parentRepository: 'AGID',
    requiredRoles: contract.requiredRoles,
    roleCoverage: evaluateRepositoryRoleCoverage(contract.requiredRoles),
    privacy: {
      containsPersonalData: false,
      containsRawThirdPartyData: false,
      realPostalLookupEnabled: false,
      deliveryClaimEnabled: false,
    },
  };
  const compatibility = {
    schemaId: 'agid-country-repository-compatibility-v0.1',
    repository,
    countryCode: pack.manifest.countryCode,
    parentRepository: 'AGID',
    countryPackSchemaId: pack.manifest.schemaId,
    countryPackVersion: pack.manifest.version,
    agidContractBoundary: contract.commonModelBoundary,
    synchronization: {
      mode: 'parent-generated-country-review',
      parentResponsibilities: [
        'Own the common address graph, identifiers, privacy gates, and cross-country conformance semantics.',
        'Regenerate the country scaffold after accepted country-rule changes.',
      ],
      countryRepositoryResponsibilities: [
        'Review country-specific rules, source metadata, synthetic fixtures, and quality-gate changes independently.',
        'Keep postal, source, and coverage claims explicit and conservative.',
      ],
      breakingChangePolicy: 'Update the country-pack schema/version contract and conformance fixtures together in a reviewed parent AGID change.',
    },
  };
  const qualityGates = {
    schemaId: 'agid-country-repository-quality-gates-v0.1',
    repository,
    gates: [
      ...contract.qualityGates.map(id => ({ id, required: true })),
      ...contract.privacyGates.map(id => ({ id, required: true })),
      { id: 'source-license-ledger-present', required: true },
      { id: 'large-geo-data-externalized', required: true },
      { id: 'real-postal-lookup-disabled', required: true },
      { id: 'delivery-claim-disabled', required: true },
      ...(pack.postalSourceReadiness ? [{ id: 'postal-source-readiness-recorded', required: true }] : []),
    ],
    postalSourceReadiness: pack.postalSourceReadiness
      ? {
        schemaId: pack.postalSourceReadiness.schemaId,
        publicationStatus: pack.postalSourceReadiness.publicationStatus,
        realPostalLookupEnabled: pack.postalSourceReadiness.realPostalLookupEnabled,
        deliveryClaimEnabled: pack.postalSourceReadiness.deliveryClaimEnabled,
        blockedGateIds: pack.postalSourceReadiness.gates.filter(gate => gate.status === 'blocked').map(gate => gate.id),
      }
      : null,
  };
  const files: CountryRepositoryScaffoldFile[] = [
    { relativePath: 'README.md', content: readme({ repository, countryCode: pack.manifest.countryCode, countryName: pack.manifest.countryName, generatedAt }) },
    { relativePath: 'LICENSE', content: licenseText() },
    { relativePath: 'CONTRIBUTING.md', content: text(['# Contributing', '', 'Submit country rules, source metadata, quality gates, and synthetic fixtures only.', '', 'Do not submit raw personal addresses, recipient records, private coordinates, carrier records, private keys, witness material, proof secrets, or unlicensed bulk postal data.']) },
    { relativePath: 'SECURITY.md', content: text(['# Security Policy', '', 'Report suspected exposure of personal address data, recipient data, precise private coordinates, witness material, proof secrets, or private keys before opening a public issue.']) },
    { relativePath: 'DATA_LICENSES.md', content: text(['# Data Licenses', '', 'This repository redistributes AGID-generated metadata and synthetic fixtures only. External material remains metadata-only until reuse, attribution, redistribution, version, coverage, and correction terms are accepted.']) },
    { relativePath: 'manifest.json', content: json(manifest) },
    { relativePath: 'agid-core-compatibility.json', content: json(compatibility) },
    { relativePath: 'sources.json', content: json({ schemaId: 'agid-country-repository-sources-v0.1', repository, countryCode: pack.manifest.countryCode, sources: pack.sourceCatalog }) },
    { relativePath: 'quality-gates.json', content: json(qualityGates) },
    { relativePath: 'fixtures/conformance.json', content: json({ schemaId: 'agid-country-repository-conformance-fixtures-v0.1', repository, vectors: pack.testVectors }) },
    { relativePath: 'data/agid-postal-country-pack.json', content: json(pack) },
    { relativePath: 'package.json', content: json({ name: repository, version: '0.1.0', private: false, type: 'module', scripts: { test: 'node scripts/verify.mjs' } }) },
    { relativePath: 'scripts/verify.mjs', content: verifierScript() },
    { relativePath: '.github/workflows/validate.yml', content: workflowYaml() },
  ];

  return {
    schemaId: COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID,
    repository,
    countryCode: pack.manifest.countryCode,
    countryName: pack.manifest.countryName,
    generatedAt,
    files,
  };
}

export function validateCountryRepositoryScaffold(scaffold: CountryRepositoryScaffold): CountryRepositoryScaffoldValidation {
  const errors: string[] = [];
  const files = new Map(scaffold.files.map(file => [file.relativePath, file]));
  const requiredPaths = ['README.md', 'manifest.json', 'agid-core-compatibility.json', 'sources.json', 'quality-gates.json', 'fixtures/conformance.json', 'data/agid-postal-country-pack.json', 'package.json', 'scripts/verify.mjs', '.github/workflows/validate.yml'];
  if (scaffold.schemaId !== COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (scaffold.repository !== `agid-country-${scaffold.countryCode.toLowerCase()}`) errors.push('repository-name-mismatch');
  for (const filePath of requiredPaths) if (!files.has(filePath)) errors.push(`required-file-missing:${filePath}`);

  const manifestFile = files.get('manifest.json');
  const packFile = files.get('data/agid-postal-country-pack.json');
  if (manifestFile && packFile) {
    const manifest = JSON.parse(manifestFile.content) as { repository: string; countryCode: string; parentRepository: string; privacy: { containsPersonalData: boolean; containsRawThirdPartyData: boolean; realPostalLookupEnabled: boolean; deliveryClaimEnabled: boolean } };
    const pack = JSON.parse(packFile.content) as { manifest: { countryCode: string; containsPersonalData: boolean; containsRawThirdPartyData: boolean } };
    if (manifest.repository !== scaffold.repository || manifest.countryCode !== scaffold.countryCode || pack.manifest.countryCode !== scaffold.countryCode) errors.push('country-identity-mismatch');
    if (manifest.parentRepository !== 'AGID') errors.push('parent-repository-mismatch');
    if (manifest.privacy.containsPersonalData || manifest.privacy.containsRawThirdPartyData || pack.manifest.containsPersonalData || pack.manifest.containsRawThirdPartyData) errors.push('privacy-boundary-invalid');
    if (manifest.privacy.realPostalLookupEnabled || manifest.privacy.deliveryClaimEnabled) errors.push('operational-claim-boundary-invalid');
  }
  return { valid: errors.length === 0, errors };
}

export function writeCountryRepositoryScaffold(scaffold: CountryRepositoryScaffold, outputRoot = resolve('reports', 'country-repository-scaffolds')) {
  const validation = validateCountryRepositoryScaffold(scaffold);
  if (!validation.valid) throw new Error(`Country repository scaffold is invalid: ${validation.errors.join(', ')}`);
  const repositoryRoot = join(outputRoot, scaffold.repository);
  for (const file of scaffold.files) {
    const outputPath = join(repositoryRoot, file.relativePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, file.content, 'utf8');
  }
  return repositoryRoot;
}
