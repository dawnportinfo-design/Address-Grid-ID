import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID,
  buildAllAgidPostalCountryPacks,
  buildAgidPostalCountryPack,
  listAgidPostalCountryPackTargetCountries,
  validateAgidPostalCountryPack,
} from './agidPostalCountryPack';
import {
  OFFICIAL_MUNICIPALITY_DATASET_SCHEMA_VERSION,
  type OfficialMunicipalityDataset,
} from './officialMunicipalityDataset';

function postalFormatField(
  pack: ReturnType<typeof buildAgidPostalCountryPack>,
  field: string,
): unknown {
  const format = pack.postalSourceReadiness?.postalFormat as Record<string, unknown> | undefined;
  return format?.[field];
}

function officialMunicipalityDatasetFixture(): OfficialMunicipalityDataset {
  return {
    schemaVersion: OFFICIAL_MUNICIPALITY_DATASET_SCHEMA_VERSION,
    countryCode: 'FJ',
    generatedAt: '2026-06-20T00:00:00.000Z',
    sourceCatalog: [{
      sourceId: 'fj-official-admin-fixture',
      sourceName: 'Fiji official administrative unit fixture',
      sourceUrl: 'source-fixture:official-admin',
      provider: 'official-source-fixture',
      licenseOrTerms: 'fixture-only',
      retrievedAt: '2026-06-20',
      redistributionStatus: 'allowed',
      notes: ['test fixture shaped like an official normalized dataset'],
    }],
    records: [
      {
        countryCode: 'FJ',
        officialId: 'ba',
        name: 'Ba',
        kind: 'municipality',
        codePart: 'BA',
        sourceId: 'fj-official-admin-fixture',
      },
      {
        countryCode: 'FJ',
        officialId: 'rewa',
        name: 'Rewa',
        kind: 'municipality',
        codePart: 'RE',
        sourceId: 'fj-official-admin-fixture',
      },
      {
        countryCode: 'FJ',
        officialId: 'ba-town',
        name: 'Ba Town',
        kind: 'town',
        parentOfficialId: 'ba',
        codePart: '01',
        sourceId: 'fj-official-admin-fixture',
      },
    ],
  };
}

function readOfficialMunicipalityDataset(countryCode: string): OfficialMunicipalityDataset {
  return JSON.parse(
    readFileSync(`data/official_municipalities/${countryCode.toLowerCase()}.json`, 'utf8'),
  ) as OfficialMunicipalityDataset;
}

test('builds a Fiji AGID Postal Country Pack with required country-specific layers', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'FJ' });

  assert.equal(pack.manifest.schemaId, AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID);
  assert.equal(pack.manifest.countryCode, 'FJ');
  assert.equal(pack.manifest.repositoryName, 'agid-postal-pack-fj');
  assert.equal(pack.manifest.packageName, '@agid/agid-postal-pack-fj');
  assert.equal(pack.manifest.officialStatus, 'draft');
  assert.equal(pack.manifest.containsPersonalData, false);
  assert.equal(pack.manifest.containsRawThirdPartyData, false);
  assert.ok(pack.manifest.requiredLayers.includes('locality-index'));
  assert.ok(pack.manifest.requiredLayers.includes('ports-airports-and-terminals'));
  assert.ok(pack.manifest.requiredLayers.includes('vpl-seed-regions'));
  assert.ok(pack.manifest.requiredLayers.includes('planning-cell-index'));
  assert.ok(pack.manifest.requiredLayers.includes('route-evidence-index'));
  assert.ok(pack.manifest.requiredLayers.includes('quality-evidence-index'));
  assert.equal(pack.countryProfile.terrain, 'archipelago');
});

test('country pack contains stable locality IDs, aliases, landforms, clusters, and VPL seeds', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'FJ' });

  assert.ok(pack.localityIndex.length >= 3);
  assert.ok(pack.localityIndex.every(locality => locality.stableId.startsWith('fj-')));
  assert.ok(pack.localityIndex.some(locality => locality.aliases.some(alias => alias.status === 'synthetic')));
  assert.ok(pack.landformIndex.some(landform => landform.kind === 'island'));
  assert.ok(pack.settlementClusterIndex.every(cluster => cluster.agidCellSeed.startsWith('FJ:')));
  assert.ok(pack.vplSeedRegions.length >= 1);
  assert.ok(pack.vplSeedRegions.every(seed => seed.nonAdministrative));
  assert.ok(pack.planningCellIndex.length >= 144);
  assert.ok(pack.planningCellIndex.every(cell => cell.noRawAddress));
  assert.ok(pack.routeEvidenceIndex.length >= 24);
  assert.ok(pack.qualityEvidenceIndex.length >= 24);
});

test('country pack keeps external source data as metadata-only or license-review slots', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'FJ' });

  assert.ok(pack.sourceCatalog.some(source => source.sourceId === 'official-boundary-required'));
  assert.ok(pack.sourceCatalog.some(source => source.redistributionStatus === 'license-review-required'));
  assert.ok(pack.licenseLedger.some(entry => entry.redistribution === 'metadata-only'));
  assert.ok(pack.privacyThreatModel.some(rule => rule.includes('Do not store personal addresses')));
  assert.ok(pack.governanceNotes.some(note => note.includes('not an official postal authority dataset')));
});

test('builds a Guatemala draft pack without importing postal or address records', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'GT' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));

  assert.equal(pack.manifest.countryCode, 'GT');
  assert.equal(pack.manifest.repositoryName, 'agid-postal-pack-gt');
  assert.equal(pack.recommendation.recommendedUse, 'supplemental-agid-postal-draft');
  assert.equal(pack.manifest.officialStatus, 'draft');
  assert.equal(pack.manifest.containsPersonalData, false);
  assert.equal(pack.manifest.containsRawThirdPartyData, false);
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('gt-ine-censo-2018-lugares-poblados'));
  assert.ok(sourceIds.has('upu-universal-postcode-database'));
  assert.ok(sourceIds.has('gt-postal-code-mapping-required'));
  assert.ok(pack.sourceCatalog.some(source => (
    source.sourceId === 'gt-ine-censo-2018-lugares-poblados'
    && source.redistributionStatus === 'source-metadata-only'
    && source.transformedFields.length === 0
  )));
  assert.ok(pack.licenseLedger.some(entry => (
    entry.subject.includes('Guatemala INE Censo 2018')
    && entry.redistribution === 'metadata-only'
  )));
  assert.ok(pack.licenseLedger.some(entry => (
    entry.subject.includes('Guatemala real postal-code')
    && entry.redistribution === 'not-bundled'
  )));
  assert.ok(pack.localityIndex.every(locality => locality.stableId.startsWith('gt-')));
  assert.ok(pack.testVectors.every(vector => vector.input.countryCode === 'GT'));
  assert.ok(pack.testVectors.every(vector => vector.expected.containsPersonalData === false));
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('country pack test vectors are country-prefixed and raw-address free', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'FJ' });

  assert.ok(pack.testVectors.length >= 1);
  assert.ok(pack.testVectors.every(vector => vector.input.countryCode === 'FJ'));
  assert.ok(pack.testVectors.every(vector => vector.expected.candidateCodePrefix === 'FJ-'));
  assert.ok(pack.testVectors.every(vector => vector.expected.sameMunicipalityOnly));
  assert.ok(pack.testVectors.every(vector => vector.expected.containsPersonalData === false));
});

test('validates the default country pack without errors', () => {
  const validation = validateAgidPostalCountryPack(buildAgidPostalCountryPack({ countryCode: 'FJ' }));

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('uses normalized official municipality data when provided', () => {
  const pack = buildAgidPostalCountryPack({
    countryCode: 'FJ',
    officialMunicipalityDataset: officialMunicipalityDatasetFixture(),
  });
  const localityNames = new Set(pack.localityIndex.map(locality => locality.name));

  assert.equal(pack.officialMunicipalitySummary.mode, 'official-dataset');
  assert.equal(pack.manifest.counts.officialMunicipalityRecords, 3);
  assert.ok(pack.sourceCatalog.some(source => source.sourceId === 'fj-official-admin-fixture'));
  assert.ok(localityNames.has('Ba'));
  assert.ok(localityNames.has('Rewa'));
  assert.ok(localityNames.has('Ba Town'));
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('lists every Postal Zone Designer target country for country-pack export', () => {
  const targets = listAgidPostalCountryPackTargetCountries();
  const codes = targets.map(target => target.countryCode);

  assert.ok(targets.length >= 78);
  assert.equal(new Set(codes).size, targets.length);
  assert.ok(codes.includes('JP'));
  assert.ok(codes.includes('US'));
  assert.ok(codes.includes('GH'));
  assert.ok(codes.includes('GT'));
  assert.ok(codes.includes('FJ'));
  assert.ok(codes.includes('AE'));
  assert.ok(codes.includes('ZW'));
  assert.ok(targets.some(target => target.recommendationSource === 'postal-zone-designer-fallback'));
});

test('Guatemala pack records a metadata-only source and blocks real postcode claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'GT' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'GT');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('gt-ine-censo-2018-lugares-poblados'));
  assert.ok(sourceIds.has('gt-postal-code-mapping-required'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Honduras pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'HN' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.ok(sourceIds.has('honducor-transparency-portal'));
  assert.ok(sourceIds.has('hn-ine-dee-2024'));
  assert.ok(sourceIds.has('hn-sen-geoportal'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Nicaragua pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'NI' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.ok(sourceIds.has('correos-de-nicaragua-postcode-query'));
  assert.ok(sourceIds.has('correos-de-nicaragua-legal-framework'));
  assert.ok(sourceIds.has('ineter-ide-boundaries'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('El Salvador pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'SV' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.ok(sourceIds.has('el-salvador-postal-operator'));
  assert.ok(sourceIds.has('sv-correos-institutional-framework'));
  assert.ok(sourceIds.has('sv-cnr-geographic-location-codes'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Panama pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'PA' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.ok(sourceIds.has('panama-national-postcode-system'));
  assert.ok(sourceIds.has('correos-panama-postal-services'));
  assert.ok(sourceIds.has('panama-miambiente-admin-boundaries'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Lesotho pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'LS' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('lesotho-postal-services-government-reference'));
  assert.ok(sourceIds.has('lesotho-communications-authority-postal-report'));
  assert.ok(sourceIds.has('un-salb-lesotho-admin-boundaries'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Eswatini pack records official source metadata while blocking postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'SZ' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('eswatini-postcode-table'));
  assert.ok(sourceIds.has('eswatini-post-designated-operator'));
  assert.ok(sourceIds.has('eswatini-government-postal-policy'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Guinea-Bissau pack records an authority format while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'GW' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('upu-guinea-bissau-addressing-unit'));
  assert.ok(sourceIds.has('itu-upu-guinea-bissau-post-office-list'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{4}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'passed');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Peru pack records official format and open-data terms while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'PE' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('mtc-peru-national-postcode-guidance'));
  assert.ok(sourceIds.has('mtc-peru-postcode-open-data'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{5}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('open-data-reuse-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-code-mapping-and-coverage-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Paraguay pack records official format and licensed source schema while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'PY' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('dinacopa-postcode-format-guidance'));
  assert.ok(sourceIds.has('dinacopa-postcode-open-data-catalog'));
  assert.ok(sourceIds.has('dinacopa-postcode-data-dictionary'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{6}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('source-schema-inspection-isolated')?.status, 'passed');
  assert.equal(gates.get('postal-code-mapping-and-coverage-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Uruguay pack rejects a stale official catalog resource while preserving format and license evidence', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'UY' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('correo-uruguayo-postcode-search-status'));
  assert.ok(sourceIds.has('correo-uruguayo-postcode-open-data-catalog'));
  assert.ok(sourceIds.has('ursec-postal-services-reference'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{5}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('stale-source-ingestion-fails-closed')?.status, 'passed');
  assert.equal(gates.get('catalog-currentness-conflict')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Venezuela pack records UPU authority metadata while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'VE' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('upu-venezuela-addressing-unit-2019'));
  assert.ok(sourceIds.has('upu-venezuela-designated-operator'));
  assert.ok(sourceIds.has('salb-venezuela-authority-and-availability'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{4}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('source-acquisition-plan-fails-closed')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Mongolia pack records five-digit format evidence while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'MN' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('mongol-post-zip-code-faq'));
  assert.ok(sourceIds.has('upu-mongolia-addressing-unit-2019'));
  assert.ok(sourceIds.has('nsdi-mongolia-geospatial-distribution-rules'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{5}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('source-acquisition-plan-fails-closed')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Kyrgyzstan pack records authority surfaces without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'KG' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('kyrgyz-post-postal-code-search'));
  assert.ok(sourceIds.has('upu-kyrgyzstan-designated-operators'));
  assert.ok(sourceIds.has('kg-open-data-admin-classifier'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-operator-surfaces-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Tajikistan pack records official format and administrative license while blocking postcode lookup claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'TJ' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('tajik-post-postcode-list'));
  assert.ok(sourceIds.has('upu-tajikistan-designated-operator'));
  assert.ok(sourceIds.has('tajstat-regions-2024-open-license'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{6}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('administrative-structure-license-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Turkmenistan pack records postal-law privacy boundaries without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'TM' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('turkmenistan-postal-communication-law-2021'));
  assert.ok(sourceIds.has('turkmenpost-official-service-surface'));
  assert.ok(sourceIds.has('turkmenistan-2024-administrative-division-resolution'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-law-and-privacy-boundary-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Jordan pack records open-data terms while rejecting address-bearing office records', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'JO' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('jordan-open-government-data-license-v1'));
  assert.ok(sourceIds.has('jordan-post-offices-open-data-catalog-2025'));
  assert.ok(sourceIds.has('upu-jordan-designated-operator'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('government-open-data-license-recorded')?.status, 'passed');
  assert.equal(gates.get('safe-postcode-only-source')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Moldova pack records operator and reuse governance without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'MD' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('posta-moldovei-office-map'));
  assert.ok(sourceIds.has('moldova-state-property-agency-posta-moldovei'));
  assert.ok(sourceIds.has('moldova-administrative-classifier-catalog'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('public-sector-reuse-framework-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('North Macedonia pack records regulator and attributed statistics without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'MK' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('north-macedonia-postal-agency-universal-service-provider'));
  assert.ok(sourceIds.has('north-macedonia-post-office-location-search'));
  assert.ok(sourceIds.has('north-macedonia-makstat-territorial-units'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('attributed-statistical-territorial-summary-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Romania pack records the six-digit format while rejecting a stale street-level mapping', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'RO' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('ancom-cnpr-universal-service-2025-2029'));
  assert.ok(sourceIds.has('data-gov-ro-romania-postal-codes-ogl-2016'));
  assert.ok(sourceIds.has('ancpi-administrative-boundaries-open-information-license'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{6}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('national-postcode-format-authority-recorded')?.status, 'passed');
  assert.equal(gates.get('current-postcode-mapping-freshness')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Bulgaria pack records postal-system authority without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'BG' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('bulgaria-crc-postal-code-formation-system'));
  assert.ok(sourceIds.has('bulgaria-crc-national-postcode-index-catalog'));
  assert.ok(sourceIds.has('bulgaria-crc-universal-service-operator-2026'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-code-system-and-index-catalog-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Albania pack records authority and restrictive geospatial terms without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'AL' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('albania-akep-universal-postal-service-authorization-2025'));
  assert.ok(sourceIds.has('albania-asig-geoportal-terms'));
  assert.ok(sourceIds.has('albania-instat-administrative-divisions-classification'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('administrative-sources-and-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Bosnia and Herzegovina pack records multi-operator boundaries without inferring a postcode format', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'BA' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('bosnia-public-postal-operators-universal-service-coordination'));
  assert.ok(sourceIds.has('bh-posta-postal-network-search'));
  assert.ok(sourceIds.has('poste-srpske-addressing-and-routing-tool'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('public-postal-operator-coordination-recorded')?.status, 'passed');
  assert.equal(gates.get('countrywide-multi-operator-coverage-and-correction')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Montenegro pack records five-digit format evidence while rejecting stale mapping and administrative rights claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'ME' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('montenegro-ekip-universal-postal-operator'));
  assert.ok(sourceIds.has('montenegro-posta-crne-gore-addressing-rules-2020'));
  assert.ok(sourceIds.has('montenegro-data-gov-municipalities-catalog'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), '^[0-9]{5}$');
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('national-postcode-format-authority-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-format-currentness')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Serbia pack records authority surfaces while excluding PAK and address-register data', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'RS' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('serbia-ratel-universal-postal-service'));
  assert.ok(sourceIds.has('serbia-posta-proper-addressing-and-pak-locator'));
  assert.ok(sourceIds.has('serbia-rgz-administrative-units-register'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(gates.get('addressing-and-pak-service-bounded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Georgia pack records authority surfaces while excluding interactive postcode and address data', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'GE' }); const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId)); const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('georgia-post-addressing-rule')); assert.ok(sourceIds.has('georgia-post-postcode-lookup-boundary')); assert.ok(sourceIds.has('georgia-napr-public-registry-and-nsdi')); assert.equal(postalFormatField(pack, 'nationalPattern'), null); assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false); assert.equal(gates.get('postal-authority-surfaces-recorded')?.status, 'passed'); assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked'); assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Azerbaijan pack records authority surfaces while excluding interactive postcode and cadastral data', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'AZ' }); const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId)); const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));
  assert.ok(sourceIds.has('azerbaijan-azerpost-index-search-boundary')); assert.ok(sourceIds.has('azerbaijan-azerpost-addressing-rule')); assert.ok(sourceIds.has('azerbaijan-idda-open-data-portal')); assert.equal(postalFormatField(pack, 'nationalPattern'), null); assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false); assert.equal(gates.get('postal-authority-surfaces-recorded')?.status, 'passed'); assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked'); assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Kenya pack records its postal-operator locator as metadata and blocks real postcode claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'KE' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'KE');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('posta-kenya'));
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(gates.get('redistribution-rights')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Cambodia pack rejects an unverified fixed postal format and blocks real postcode claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'KH' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'KH');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('cambodia-post-location'));
  assert.ok(sourceIds.has('mptc-cambodia-post-autonomous-unit'));
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Laos pack records legal governance metadata and blocks real postcode claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'LA' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'LA');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('laos-postal-service-postcode-page'));
  assert.ok(sourceIds.has('lao-postal-law-post-code-definition'));
  assert.ok(pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat);
  if (pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat) {
    assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  }
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Myanmar pack keeps its postcode-search surface metadata-only and blocks real claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'MM' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'MM');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('myanmar-post-postcode-search'));
  assert.ok(sourceIds.has('motc-myanmar-post-government-site-list'));
  assert.ok(pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat);
  if (pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat) {
    assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  }
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Nepal pack records postal-code publication metadata and blocks real claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'NP' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'NP');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('nepal-post-national-postal-codes'));
  assert.ok(sourceIds.has('pokhara-postal-directorate-postal-code-2025'));
  assert.ok(sourceIds.has('parbat-district-post-new-postal-code-notice'));
  assert.ok(pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat);
  if (pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat) {
    assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  }
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Pakistan pack records its post-code directory as metadata only and blocks real claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'PK' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'PK');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('pakistan-post-postcode-directory'));
  assert.ok(pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat);
  if (pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat) {
    assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  }
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Tanzania pack records its verified format only and blocks mapping claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'TZ' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'TZ');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('tcra-tanzania-postcode'));
  assert.ok(sourceIds.has('tcra-tanzania-postcode-list-publication'));
  assert.ok(pack.postalSourceReadiness && 'pattern' in pack.postalSourceReadiness.postalFormat);
  if (pack.postalSourceReadiness && 'pattern' in pack.postalSourceReadiness.postalFormat) {
    assert.equal(pack.postalSourceReadiness.postalFormat.pattern, '^\\d{5}$');
    assert.equal(pack.postalSourceReadiness.postalFormat.verifiedFormatOnly, true);
  }
  assert.equal(pack.postalSourceReadiness?.realPostalLookupEnabled, false);
  assert.equal(pack.postalSourceReadiness?.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'passed');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('Uganda pack records postal-address metadata while rejecting a legacy postal regex', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'UG' });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const gates = new Map(pack.postalSourceReadiness?.gates.map(gate => [gate.id, gate]));

  assert.equal(pack.manifest.countryCode, 'UG');
  assert.equal(pack.countryProfile.classHint, 'B');
  assert.ok(sourceIds.has('posta-uganda-postal-address'));
  assert.ok(pack.postalSourceReadiness && 'nationalPattern' in pack.postalSourceReadiness.postalFormat);
  assert.equal(postalFormatField(pack, 'nationalPattern'), null);
  assert.equal(postalFormatField(pack, 'fixedLegacyPatternRejected'), true);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(gates.get('postal-code-mapping-evidence')?.status, 'blocked');
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('builds mature postal countries as reference packs instead of replacement drafts', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'JP' });

  assert.equal(pack.manifest.countryCode, 'JP');
  assert.equal(pack.recommendation.tier, 'mature-reliable-postal-code');
  assert.equal(pack.recommendation.recommendedUse, 'official-postal-reference-pack');
  assert.ok(pack.countryProfile.sourceNote.includes('Mature postal code system'));
  assert.ok(pack.recommendation.preseededRecords.some(record => record.includes('without replacing official codes')));
  assert.ok(pack.postalSystemPriors.every(prior => prior.recommendedUse === 'official-postal-reference-pack'));
  assert.ok(pack.testVectors.length >= 1);
  assert.ok(pack.testVectors.every(vector => vector.expected.candidateCodePrefix === null));
  assert.ok(pack.testVectors.every(vector => vector.expected.replacementBlocked === true));
  assert.ok(pack.testVectors.every(vector => vector.expected.blockedReason === 'mature-postal-country-new-code-replacement-blocked'));
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('builds the United States pack from state-level official geography metadata', () => {
  const pack = buildAgidPostalCountryPack({
    countryCode: 'US',
    officialMunicipalityDataset: readOfficialMunicipalityDataset('US'),
  });
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));
  const localityNames = new Set(pack.localityIndex.map(locality => locality.name));

  assert.equal(pack.manifest.countryCode, 'US');
  assert.equal(pack.recommendation.tier, 'mature-reliable-postal-code');
  assert.equal(pack.recommendation.recommendedUse, 'official-postal-reference-pack');
  assert.equal(pack.officialMunicipalitySummary.mode, 'official-dataset');
  assert.equal(pack.officialMunicipalitySummary.municipalityCount, 51);
  assert.ok(sourceIds.has('usps-web-tools'));
  assert.ok(sourceIds.has('us-census-tiger-line'));
  assert.ok(sourceIds.has('us-census-geocoder'));
  assert.ok(sourceIds.has('hud-usps-zip-crosswalk'));
  assert.ok(localityNames.has('California'));
  assert.ok(localityNames.has('District of Columbia'));
  assert.ok(pack.testVectors.length >= 3);
  assert.ok(pack.testVectors.every(vector => vector.expected.replacementBlocked === true));
  assert.ok(pack.testVectors.every(vector => vector.expected.officialPostalPattern === '^\\d{5}(-\\d{4})?$'));
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});

test('builds all target country packs with no raw address or personal data flags', () => {
  const packs = buildAllAgidPostalCountryPacks();
  const codes = packs.map(pack => pack.manifest.countryCode);

  assert.equal(packs.length, listAgidPostalCountryPackTargetCountries().length);
  assert.equal(new Set(codes).size, packs.length);
  assert.ok(packs.every(pack => pack.manifest.containsPersonalData === false));
  assert.ok(packs.every(pack => pack.manifest.containsRawThirdPartyData === false));
  assert.ok(packs.every(pack => pack.manifest.officialStatus === 'draft'));
  assert.ok(packs.every(pack => pack.manifest.counts.planningCells >= 144));
  assert.ok(packs.every(pack => pack.manifest.counts.routeEvidence >= 24));
  assert.ok(packs.every(pack => pack.manifest.counts.qualityEvidence >= 24));
  assert.ok(packs.every(pack => validateAgidPostalCountryPack(pack).valid));
});

test('checked-in country-pack index stays synchronized with serialized pack source counts', () => {
  const index = JSON.parse(readFileSync('data/postal_country_packs/index.json', 'utf8')) as {
    exportedCountryCount: number;
    countries: Array<{
      countryCode: string;
      counts: { sources: number };
      relativePath: string;
    }>;
  };

  assert.equal(index.exportedCountryCount, listAgidPostalCountryPackTargetCountries().length);
  assert.equal(index.countries.length, index.exportedCountryCount);
  for (const country of index.countries) {
    const pack = JSON.parse(readFileSync(join('data', 'postal_country_packs', country.relativePath), 'utf8')) as {
      manifest: { countryCode: string; counts: { sources: number } };
    };
    assert.equal(pack.manifest.countryCode, country.countryCode);
    assert.equal(country.counts.sources, pack.manifest.counts.sources, `${country.countryCode} source count is stale in index.json`);
  }
});

test('rejects unsupported country codes instead of creating ambiguous packs', () => {
  assert.throws(
    () => buildAgidPostalCountryPack({ countryCode: 'ZZ' }),
    /not supported for unknown country code/,
  );
});

test('supports country-repository bootstrap candidates without enabling postal claims', () => {
  const pack = buildAgidPostalCountryPack({ countryCode: 'PA' });

  assert.equal(pack.manifest.countryCode, 'PA');
  assert.equal(pack.manifest.containsPersonalData, false);
  assert.equal(pack.manifest.containsRawThirdPartyData, false);
  assert.equal(validateAgidPostalCountryPack(pack).valid, true);
});
