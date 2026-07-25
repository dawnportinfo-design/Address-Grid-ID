import { encodeAGID } from './agid';
import {
  buildPostalZoneMunicipalityOptionsFromOfficialDataset,
  summarizeOfficialMunicipalityDataset,
  validateOfficialMunicipalityDataset,
  type OfficialMunicipalityDataset,
  type OfficialMunicipalityDatasetSummary,
} from './officialMunicipalityDataset';
import {
  buildPostalZoneDesignerWorkspace,
  listPostalZoneDesignerCountries,
  type PostalZoneDesignerCountryPreset,
  type PostalZoneDesignerMunicipalityOption,
  type PostalZoneDesignerWorkspace,
} from './postalZoneDesigner';
import {
  AGID_POSTAL_COUNTRY_PACK_STRATEGY_VERSION,
  recommendAgidPostalCountryPack,
  type AgidPostalCountryPackDataLayer,
  type AgidPostalCountryPackRecommendation,
} from './agidPostalCountryPackStrategy';
import { AGID_POSTAL_CODE_ENGINE_VERSION } from './agidPostalCodeEngine';
import {
  buildGuatemalaPostalSourceReadiness,
  validateGuatemalaPostalSourceReadiness,
  type GuatemalaPostalSourceReadiness,
} from './guatemalaPostalSourceReadiness';
import {
  buildHondurasPostalSourceReadiness,
  validateHondurasPostalSourceReadiness,
  type HondurasPostalSourceReadiness,
} from './hondurasPostalSourceReadiness';
import {
  buildNicaraguaPostalSourceReadiness,
  validateNicaraguaPostalSourceReadiness,
  type NicaraguaPostalSourceReadiness,
} from './nicaraguaPostalSourceReadiness';
import {
  buildElSalvadorPostalSourceReadiness,
  validateElSalvadorPostalSourceReadiness,
  type ElSalvadorPostalSourceReadiness,
} from './elSalvadorPostalSourceReadiness';
import {
  buildPanamaPostalSourceReadiness,
  validatePanamaPostalSourceReadiness,
  type PanamaPostalSourceReadiness,
} from './panamaPostalSourceReadiness';
import {
  buildLesothoPostalSourceReadiness,
  validateLesothoPostalSourceReadiness,
  type LesothoPostalSourceReadiness,
} from './lesothoPostalSourceReadiness';
import {
  buildEswatiniPostalSourceReadiness,
  validateEswatiniPostalSourceReadiness,
  type EswatiniPostalSourceReadiness,
} from './eswatiniPostalSourceReadiness';
import {
  buildGuineaBissauPostalSourceReadiness,
  validateGuineaBissauPostalSourceReadiness,
  type GuineaBissauPostalSourceReadiness,
} from './guineaBissauPostalSourceReadiness';
import {
  buildPeruPostalSourceReadiness,
  validatePeruPostalSourceReadiness,
  type PeruPostalSourceReadiness,
} from './peruPostalSourceReadiness';
import {
  buildParaguayPostalSourceReadiness,
  validateParaguayPostalSourceReadiness,
  type ParaguayPostalSourceReadiness,
} from './paraguayPostalSourceReadiness';
import {
  buildUruguayPostalSourceReadiness,
  validateUruguayPostalSourceReadiness,
  type UruguayPostalSourceReadiness,
} from './uruguayPostalSourceReadiness';
import {
  buildVenezuelaPostalSourceReadiness,
  validateVenezuelaPostalSourceReadiness,
  type VenezuelaPostalSourceReadiness,
} from './venezuelaPostalSourceReadiness';
import {
  buildMongoliaPostalSourceReadiness,
  validateMongoliaPostalSourceReadiness,
  type MongoliaPostalSourceReadiness,
} from './mongoliaPostalSourceReadiness';
import {
  buildKyrgyzstanPostalSourceReadiness,
  validateKyrgyzstanPostalSourceReadiness,
  type KyrgyzstanPostalSourceReadiness,
} from './kyrgyzstanPostalSourceReadiness';
import {
  buildTajikistanPostalSourceReadiness,
  validateTajikistanPostalSourceReadiness,
  type TajikistanPostalSourceReadiness,
} from './tajikistanPostalSourceReadiness';
import {
  buildTurkmenistanPostalSourceReadiness,
  validateTurkmenistanPostalSourceReadiness,
  type TurkmenistanPostalSourceReadiness,
} from './turkmenistanPostalSourceReadiness';
import {
  buildJordanPostalSourceReadiness,
  validateJordanPostalSourceReadiness,
  type JordanPostalSourceReadiness,
} from './jordanPostalSourceReadiness';
import {
  buildMoldovaPostalSourceReadiness,
  validateMoldovaPostalSourceReadiness,
  type MoldovaPostalSourceReadiness,
} from './moldovaPostalSourceReadiness';
import {
  buildNorthMacedoniaPostalSourceReadiness,
  validateNorthMacedoniaPostalSourceReadiness,
  type NorthMacedoniaPostalSourceReadiness,
} from './northMacedoniaPostalSourceReadiness';
import {
  buildRomaniaPostalSourceReadiness,
  validateRomaniaPostalSourceReadiness,
  type RomaniaPostalSourceReadiness,
} from './romaniaPostalSourceReadiness';
import {
  buildBulgariaPostalSourceReadiness,
  validateBulgariaPostalSourceReadiness,
  type BulgariaPostalSourceReadiness,
} from './bulgariaPostalSourceReadiness';
import {
  buildAlbaniaPostalSourceReadiness,
  validateAlbaniaPostalSourceReadiness,
  type AlbaniaPostalSourceReadiness,
} from './albaniaPostalSourceReadiness';
import {
  buildBosniaHerzegovinaPostalSourceReadiness,
  validateBosniaHerzegovinaPostalSourceReadiness,
  type BosniaHerzegovinaPostalSourceReadiness,
} from './bosniaHerzegovinaPostalSourceReadiness';
import {
  buildMontenegroPostalSourceReadiness,
  validateMontenegroPostalSourceReadiness,
  type MontenegroPostalSourceReadiness,
} from './montenegroPostalSourceReadiness';
import {
  buildSerbiaPostalSourceReadiness,
  validateSerbiaPostalSourceReadiness,
  type SerbiaPostalSourceReadiness,
} from './serbiaPostalSourceReadiness';
import {
  buildGeorgiaPostalSourceReadiness,
  validateGeorgiaPostalSourceReadiness,
  type GeorgiaPostalSourceReadiness,
} from './georgiaPostalSourceReadiness';
import {
  buildAzerbaijanPostalSourceReadiness,
  validateAzerbaijanPostalSourceReadiness,
  type AzerbaijanPostalSourceReadiness,
} from './azerbaijanPostalSourceReadiness';
import {
  buildCambodiaPostalSourceReadiness,
  validateCambodiaPostalSourceReadiness,
  type CambodiaPostalSourceReadiness,
} from './cambodiaPostalSourceReadiness';
import {
  buildKenyaPostalSourceReadiness,
  validateKenyaPostalSourceReadiness,
  type KenyaPostalSourceReadiness,
} from './kenyaPostalSourceReadiness';
import {
  buildLaosPostalSourceReadiness,
  validateLaosPostalSourceReadiness,
  type LaosPostalSourceReadiness,
} from './laosPostalSourceReadiness';
import {
  buildMyanmarPostalSourceReadiness,
  validateMyanmarPostalSourceReadiness,
  type MyanmarPostalSourceReadiness,
} from './myanmarPostalSourceReadiness';
import {
  buildNepalPostalSourceReadiness,
  validateNepalPostalSourceReadiness,
  type NepalPostalSourceReadiness,
} from './nepalPostalSourceReadiness';
import {
  buildPakistanPostalSourceReadiness,
  validatePakistanPostalSourceReadiness,
  type PakistanPostalSourceReadiness,
} from './pakistanPostalSourceReadiness';
import {
  buildTanzaniaPostalSourceReadiness,
  validateTanzaniaPostalSourceReadiness,
  type TanzaniaPostalSourceReadiness,
} from './tanzaniaPostalSourceReadiness';
import {
  buildUgandaPostalSourceReadiness,
  validateUgandaPostalSourceReadiness,
  type UgandaPostalSourceReadiness,
} from './ugandaPostalSourceReadiness';

export const AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID = 'agid-postal-country-pack-v0.1';
export const AGID_POSTAL_COUNTRY_PACK_VERSION = 'agid-postal-country-pack-v0.1';

export type AgidPostalCountryPackSource = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  provider: string;
  licenseOrTerms: string;
  redistributionStatus:
    | 'agid-metadata-redistributable'
    | 'source-metadata-only'
    | 'license-review-required'
    | 'not-bundled';
  role: string;
  transformedFields: string[];
  confidenceNotes: string[];
};

export type AgidPostalCountryPackLicenseEntry = {
  subject: string;
  licenseOrTerms: string;
  redistribution: 'allowed' | 'metadata-only' | 'review-required' | 'not-bundled';
  notes: string;
};

export type AgidPostalCountryPackLocality = {
  localityId: string;
  stableId: string;
  name: string;
  kind: 'municipality' | 'town' | 'block';
  parentId: string | null;
  codePart: string;
  aliases: Array<{
    label: string;
    language: string;
    status: 'preferred' | 'english' | 'romanized' | 'synthetic' | 'historic';
  }>;
};

export type AgidPostalCountryPackAdminBoundary = {
  boundaryId: string;
  localityId: string;
  label: string;
  boundaryClass: 'country' | 'municipality' | 'town' | 'block';
  geometryRef: string;
  sourceId: string;
  precision: 'coarse' | 'planning' | 'official-required';
};

export type AgidPostalCountryPackLandform = {
  landformId: string;
  label: string;
  kind:
    | 'island'
    | 'coastal-corridor'
    | 'harbor'
    | 'market-area'
    | 'mountain'
    | 'desert-corridor'
    | 'delta'
    | 'valley'
    | 'mixed';
  relatedLocalityIds: string[];
  sourceId: string;
};

export type AgidPostalCountryPackSettlementCluster = {
  clusterId: string;
  label: string;
  localityId: string;
  agidCellSeed: string;
  deliveryHints: string[];
  publicPrecision: 'coarse' | 'municipality' | 'town' | 'block';
};

export type AgidPostalCountryPackVplSeed = {
  vplId: string;
  label: string;
  nonAdministrative: true;
  localityId: string;
  codeSeed: string;
  reasons: string[];
  status: 'draft' | 'pilot' | 'active' | 'retired';
};

export type AgidPostalCountryPackPostalPrior = {
  templateId: string;
  visibleFormat: string;
  recommendedUse: AgidPostalCountryPackRecommendation['recommendedUse'];
  rationale: string[];
};

export type AgidPostalCountryPackPlanningCell = {
  cellId: string;
  agid: string;
  localityId: string;
  vplId: string | null;
  centroid: {
    lat: number;
    lng: number;
  };
  codeSeed: string;
  routeBucket: string;
  areaClass: 'urban-core' | 'peri-urban' | 'rural' | 'remote' | 'island' | 'corridor';
  publicPrecision: 'coarse' | 'municipality' | 'town' | 'block';
  sourceId: string;
  noRawAddress: true;
};

export type AgidPostalCountryPackRouteEvidence = {
  routeId: string;
  label: string;
  fromLocalityId: string;
  toLocalityId: string;
  mode: 'road' | 'ferry' | 'port' | 'air' | 'corridor' | 'mixed';
  evidenceRef: string;
  sourceId: string;
  status: 'source-required';
  riskFlags: string[];
};

export type AgidPostalCountryPackQualityEvidence = {
  evidenceId: string;
  subjectId: string;
  subjectType: 'country' | 'municipality' | 'town' | 'planning-cell';
  addressQuality: number;
  boundaryQuality: number;
  routeQuality: number;
  populationQuality: number;
  confidenceBand: 'low' | 'medium' | 'high';
  verificationRequired: true;
  notes: string[];
};

export type AgidPostalCountryPackTestVector = {
  id: string;
  input: {
    countryCode: string;
    municipalityId: string;
    townId: string;
    chomeId: string | null;
  };
  expected: {
    candidateCodePrefix: string | null;
    sameMunicipalityOnly: true;
    containsPersonalData: false;
    replacementBlocked?: boolean;
    blockedReason?: 'mature-postal-country-new-code-replacement-blocked';
    officialPostalPattern?: string;
  };
};

export type AgidPostalCountryPackManifest = {
  schemaId: typeof AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID;
  version: typeof AGID_POSTAL_COUNTRY_PACK_VERSION;
  strategyVersion: typeof AGID_POSTAL_COUNTRY_PACK_STRATEGY_VERSION;
  engineVersion: typeof AGID_POSTAL_CODE_ENGINE_VERSION;
  generatedAt: string;
  countryCode: string;
  countryName: string;
  repositoryName: string;
  packageName: string;
  requiredLayers: AgidPostalCountryPackDataLayer[];
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  officialStatus: 'simulation' | 'draft' | 'pilot' | 'supplementary' | 'official';
  counts: {
    sources: number;
    localities: number;
    boundaries: number;
    landforms: number;
    settlementClusters: number;
    vplSeeds: number;
    planningCells: number;
    routeEvidence: number;
    qualityEvidence: number;
    officialMunicipalityRecords: number;
    testVectors: number;
  };
};

export type AgidPostalCountryPack = {
  manifest: AgidPostalCountryPackManifest;
  recommendation: AgidPostalCountryPackRecommendation;
  countryProfile: {
    countryCode: string;
    countryName: string;
    region: string;
    terrain: string;
    classHint: string;
    planningCentroid: {
      lat: number;
      lng: number;
    };
    sourceNote: string;
  };
  sourceCatalog: AgidPostalCountryPackSource[];
  postalSourceReadiness?: AlbaniaPostalSourceReadiness | AzerbaijanPostalSourceReadiness | BosniaHerzegovinaPostalSourceReadiness | BulgariaPostalSourceReadiness | CambodiaPostalSourceReadiness | ElSalvadorPostalSourceReadiness | EswatiniPostalSourceReadiness | GeorgiaPostalSourceReadiness | GuatemalaPostalSourceReadiness | GuineaBissauPostalSourceReadiness | HondurasPostalSourceReadiness | JordanPostalSourceReadiness | KenyaPostalSourceReadiness | KyrgyzstanPostalSourceReadiness | LaosPostalSourceReadiness | LesothoPostalSourceReadiness | MoldovaPostalSourceReadiness | MongoliaPostalSourceReadiness | MontenegroPostalSourceReadiness | MyanmarPostalSourceReadiness | NepalPostalSourceReadiness | NicaraguaPostalSourceReadiness | NorthMacedoniaPostalSourceReadiness | PakistanPostalSourceReadiness | PanamaPostalSourceReadiness | ParaguayPostalSourceReadiness | PeruPostalSourceReadiness | RomaniaPostalSourceReadiness | SerbiaPostalSourceReadiness | TajikistanPostalSourceReadiness | TanzaniaPostalSourceReadiness | TurkmenistanPostalSourceReadiness | UgandaPostalSourceReadiness | UruguayPostalSourceReadiness | VenezuelaPostalSourceReadiness;
  licenseLedger: AgidPostalCountryPackLicenseEntry[];
  officialMunicipalitySummary: OfficialMunicipalityDatasetSummary;
  adminBoundaryIndex: AgidPostalCountryPackAdminBoundary[];
  localityIndex: AgidPostalCountryPackLocality[];
  landformIndex: AgidPostalCountryPackLandform[];
  settlementClusterIndex: AgidPostalCountryPackSettlementCluster[];
  vplSeedRegions: AgidPostalCountryPackVplSeed[];
  planningCellIndex: AgidPostalCountryPackPlanningCell[];
  routeEvidenceIndex: AgidPostalCountryPackRouteEvidence[];
  qualityEvidenceIndex: AgidPostalCountryPackQualityEvidence[];
  postalSystemPriors: AgidPostalCountryPackPostalPrior[];
  governanceNotes: string[];
  privacyThreatModel: string[];
  testVectors: AgidPostalCountryPackTestVector[];
};

export type AgidPostalCountryPackValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type AgidPostalCountryPackTargetCountry = {
  countryCode: string;
  countryName: string;
  region: string;
  terrain: string;
  classHint: string;
  repositoryName: string;
  packageName: string;
  recommendationSource: 'strategy' | 'postal-zone-designer-fallback';
};

const DEFAULT_REQUIRED_LAYERS: AgidPostalCountryPackDataLayer[] = [
  'manifest',
  'source-catalog',
  'country-profile',
  'admin-boundary-index',
  'locality-index',
  'locality-alias-history',
  'landform-index',
  'settlement-cluster-index',
  'planning-cell-index',
  'route-evidence-index',
  'quality-evidence-index',
  'postal-system-priors',
  'governance-notes',
  'license-ledger',
  'privacy-threat-model',
  'test-vectors',
];

function stablePackId(...parts: string[]) {
  return parts
    .join(':')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function countryPackRepositoryName(countryCode: string) {
  return `agid-postal-pack-${countryCode.toLowerCase()}`;
}

function isHighRiskCountryPreset(country: PostalZoneDesignerCountryPreset) {
  return /conflict|high-risk|humanitarian|constrained/i.test(country.sourceNote);
}

function fallbackRequiredLayersFor(country: PostalZoneDesignerCountryPreset): AgidPostalCountryPackDataLayer[] {
  const layers = [...DEFAULT_REQUIRED_LAYERS];
  if (country.terrain === 'archipelago') layers.splice(layers.indexOf('postal-system-priors'), 0, 'ports-airports-and-terminals');
  if (country.terrain === 'desert') layers.splice(layers.indexOf('postal-system-priors'), 0, 'road-and-route-corridors');
  if (country.classHint !== 'A' && !layers.includes('vpl-seed-regions')) {
    layers.splice(layers.indexOf('postal-system-priors'), 0, 'vpl-seed-regions');
  }
  return layers;
}

function countryPackRequiredLayers(
  recommendation: AgidPostalCountryPackRecommendation,
): AgidPostalCountryPackDataLayer[] {
  return Array.from(new Set([
    ...recommendation.requiredLayers,
    'planning-cell-index',
    'route-evidence-index',
    'quality-evidence-index',
  ]));
}

function createFallbackRecommendation(
  country: PostalZoneDesignerCountryPreset,
): AgidPostalCountryPackRecommendation {
  const repositoryName = countryPackRepositoryName(country.code);
  const highRisk = isHighRiskCountryPreset(country);
  const maturePostal = country.classHint === 'A';
  const weakPostal = country.classHint === 'B';
  return {
    version: AGID_POSTAL_COUNTRY_PACK_STRATEGY_VERSION,
    countryCode: country.code,
    countryName: country.name,
    tier: maturePostal
      ? 'mature-reliable-postal-code'
      : weakPostal
        ? 'weak-coarse-postal-code'
        : highRisk
          ? 'fragile-address-infrastructure'
          : 'no-or-not-required-postal-code',
    repositoryMode: 'country-pack-recommended',
    repositoryName,
    packageName: `@agid/${repositoryName}`,
    packWeight: highRisk ? 'thin-pack' : country.terrain === 'archipelago' ? 'light-pack' : 'standard-pack',
    recommendedUse: maturePostal
      ? 'official-postal-reference-pack'
      : weakPostal
        ? 'supplemental-agid-postal-draft'
        : highRisk
          ? 'high-risk-coarse-draft'
          : 'primary-agid-postal-draft',
    requiredLayers: fallbackRequiredLayersFor(country),
    preseededRecords: [
      'country profile: population band, land area band, terrain class, postal maturity class',
      maturePostal
        ? 'official postal format, API/source metadata, and AGID compatibility fixtures without replacing official codes'
        : 'stable locality IDs independent of mutable city-name strings',
      'administrative boundary references and source freshness metadata',
      'landform and route evidence slots appropriate to the country terrain',
      'settlement clusters and VPL seed regions for draft postal-zone design',
      'license ledger for every imported source; third-party raw datasets are not bundled by default',
    ],
    maintenanceRules: [
      'Keep the AGID Postal Forge engine, UI, and core tests in the central repository.',
      'Keep country-specific locality aliases, landforms, source metadata, and VPL seeds in the country pack.',
      'Version every source by provider, license, retrieval date, and transformation script.',
      'Use stable locality IDs; visible names can change without forcing postal code churn.',
      'Run schema, no-raw-address, municipality-separation, and sample code conformance tests before publishing.',
      'Publish generated codes as simulation or draft unless official authority, carrier pilot, privacy, data trust, and transition gates pass.',
    ],
    splitRationale: [
      'Country packs keep the main app small and let operators load only the country they need.',
      'Country experts can maintain local names, landforms, languages, and source notes without touching the core engine.',
      'License risk is isolated because each country pack has its own source catalog and data license ledger.',
    ],
    compatibilityContract: {
      schemaId: AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID,
      enginePackage: '@agid/postal-forge-core',
      countryPackDoesNotContain: [
        'personal-addresses',
        'recipient-names',
        'phone-numbers',
        'private-aoid-bodies',
        'agid-s-payloads',
        'raw-third-party-datasets-without-license',
      ],
    },
  };
}

function findCountryPackTargetCountry(countryCode: string) {
  return listPostalZoneDesignerCountries().find(country => country.code === countryCode) || null;
}

function recommendationForTargetCountry(country: PostalZoneDesignerCountryPreset) {
  return recommendAgidPostalCountryPack(country.code) || createFallbackRecommendation(country);
}

export function listAgidPostalCountryPackTargetCountries(): AgidPostalCountryPackTargetCountry[] {
  return listPostalZoneDesignerCountries().map(country => {
    const strategyRecommendation = recommendAgidPostalCountryPack(country.code);
    const recommendation = strategyRecommendation || createFallbackRecommendation(country);
    return {
      countryCode: country.code,
      countryName: country.name,
      region: country.region,
      terrain: country.terrain,
      classHint: country.classHint,
      repositoryName: recommendation.repositoryName,
      packageName: recommendation.packageName,
      recommendationSource: strategyRecommendation ? 'strategy' : 'postal-zone-designer-fallback',
    };
  });
}

function createAlias(label: string, language = 'en') {
  return {
    label,
    language,
    status: 'preferred' as const,
  };
}

function flattenLocalities(
  countryCode: string,
  municipalities: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackLocality[] {
  const localities: AgidPostalCountryPackLocality[] = [];
  for (const municipality of municipalities) {
    localities.push({
      localityId: municipality.id,
      stableId: stablePackId(countryCode, 'municipality', municipality.id),
      name: municipality.name,
      kind: 'municipality',
      parentId: null,
      codePart: municipality.codePart,
      aliases: [
        createAlias(municipality.name),
        {
          label: municipality.name.replace('Municipality', 'Postal Area'),
          language: 'en',
          status: 'synthetic',
        },
      ],
    });
    for (const town of municipality.towns) {
      localities.push({
        localityId: town.id,
        stableId: stablePackId(countryCode, 'town', town.id),
        name: town.name,
        kind: 'town',
        parentId: municipality.id,
        codePart: town.codePart,
        aliases: [
          createAlias(town.name),
          {
            label: `${municipality.name} ${town.name}`,
            language: 'en',
            status: 'synthetic',
          },
        ],
      });
      for (const chome of town.chomes) {
        localities.push({
          localityId: chome.id,
          stableId: stablePackId(countryCode, 'block', chome.id),
          name: chome.label,
          kind: 'block',
          parentId: town.id,
          codePart: chome.codePart,
          aliases: [createAlias(chome.label)],
        });
      }
    }
  }
  return localities;
}

function officialDatasetSourceRole(source: OfficialMunicipalityDataset['sourceCatalog'][number]) {
  if (source.sourceId === 'usps-web-tools') {
    return 'credentialed postal authority validation source; metadata only and not bundled';
  }
  if (source.sourceId === 'hud-usps-zip-crosswalk') {
    return 'ZIP-to-geography crosswalk evidence for statistical compatibility checks';
  }
  if (source.sourceId === 'us-census-geocoder') {
    return 'geospatial lookup evidence; raw query and response payloads are not bundled';
  }
  return 'official municipality, locality, boundary, or administrative unit evidence';
}

function officialDatasetTransformedFields(source: OfficialMunicipalityDataset['sourceCatalog'][number]) {
  if (source.sourceId === 'usps-web-tools') {
    return ['sourceId', 'apiRole', 'officialPostalPattern', 'credentialRequirement'];
  }
  if (source.sourceId === 'hud-usps-zip-crosswalk') {
    return ['sourceId', 'crosswalkRole', 'postalGeographyRelation'];
  }
  if (source.sourceId === 'us-census-geocoder') {
    return ['sourceId', 'geographyLookupRole', 'benchmarkRole'];
  }
  return ['officialId', 'name', 'kind', 'parentOfficialId', 'codePart', 'geometryRef'];
}

function officialDatasetConfidenceNotes(source: OfficialMunicipalityDataset['sourceCatalog'][number]) {
  const commonNotes = [...source.notes];
  if (source.sourceId === 'usps-web-tools') {
    return [
      ...commonNotes,
      'USPS is the postal authority path for delivery-point validation; this pack stores source metadata only.',
    ];
  }
  if (source.sourceId === 'hud-usps-zip-crosswalk') {
    return [
      ...commonNotes,
      'Crosswalk evidence helps compare postal and statistical geography, but is not a delivery-point validity claim.',
    ];
  }
  if (source.sourceId === 'us-census-geocoder') {
    return [
      ...commonNotes,
      'Geocoder evidence may support geography compatibility checks, but raw lookup payloads remain outside the pack.',
    ];
  }
  return [
    ...commonNotes,
    'Official municipality records are used as locality planning references, not as a claim of postal-code official status.',
  ];
}

function createSourceCatalog(
  countryCode: string,
  officialMunicipalityDataset: OfficialMunicipalityDataset | null,
): AgidPostalCountryPackSource[] {
  const baseSources: AgidPostalCountryPackSource[] = [
    {
      sourceId: 'agid-synthetic-country-pack-fixtures',
      sourceName: 'AGID-generated country pack fixtures',
      sourceUrl: 'local:AGID',
      provider: 'AGID project',
      licenseOrTerms: 'Apache-2.0 for AGID-created metadata',
      redistributionStatus: 'agid-metadata-redistributable',
      role: 'synthetic locality, VPL seed, and conformance fixtures',
      transformedFields: ['countryCode', 'localityId', 'codePart', 'planningCell', 'routeEvidence', 'qualityEvidence', 'testVector'],
      confidenceNotes: [
        'Contains no personal addresses and no recipient data.',
        'Useful for OSS demos and conformance tests; not official postal authority data.',
      ],
    },
    {
      sourceId: 'official-boundary-required',
      sourceName: `${countryCode} official boundary and locality sources`,
      sourceUrl: 'source-metadata-only:official-authority-required',
      provider: 'government, municipality, postal authority, or carrier pilot authority',
      licenseOrTerms: 'source-specific; not bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official validation gate before pilot or public release',
      transformedFields: [],
      confidenceNotes: [
        'This pack records the required source slot only.',
        'No official raw boundary, road, population, postal, or address dataset is bundled.',
      ],
    },
    {
      sourceId: 'open-map-evidence-slot',
      sourceName: 'Open map evidence slot',
      sourceUrl: 'source-metadata-only:open-map-provider',
      provider: 'OSM, Overture, Natural Earth, or local open-data provider after license review',
      licenseOrTerms: 'source-specific; license review required',
      redistributionStatus: 'license-review-required',
      role: 'road, landform, port, settlement, and map preview evidence',
      transformedFields: ['featureClass', 'evidenceQuality', 'sourceFreshness'],
      confidenceNotes: [
        'Open map records are not bundled by default.',
        'Any derived database must keep source-specific attribution and redistribution obligations.',
      ],
    },
  ];
  const countrySpecificSources: AgidPostalCountryPackSource[] = countryCode === 'HN'
    ? [{
      sourceId: 'honducor-transparency-portal',
      sourceName: 'Empresa de Correos de Honduras (HONDUCOR) transparency profile',
      sourceUrl: 'https://portalunico.iaip.gob.hn/372/',
      provider: 'Empresa de Correos de Honduras (HONDUCOR), via the Honduras transparency portal',
      licenseOrTerms: 'Public transparency profile; no postcode-mapping license or redistribution grant is recorded, and no profile or postal records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator identity and publication reference; metadata only, not a national postcode format, mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The portal identifies HONDUCOR as the postal operator and presents institutional transparency material.',
        'This pack does not query, store, transform, or redistribute operator, contact, address, or postal records.',
        'The profile does not establish an authority-published national postcode format, mapping, rights, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'hn-ine-dee-2024',
      sourceName: 'Instituto Nacional de Estadistica de Honduras (INE) Directorio de Establecimientos Economicos 2024',
      sourceUrl: 'https://ine.gob.hn/dee/',
      provider: 'Instituto Nacional de Estadistica (INE), Honduras',
      licenseOrTerms: 'Official statistical publication page; no bulk-data redistribution terms are recorded here, and no source records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative division reference; metadata only, not a postcode mapping or address dataset',
      transformedFields: [],
      confidenceNotes: [
        'INE describes the 2024 directory as covering all 18 departments and 298 municipalities.',
        'This pack stores source metadata only and does not include establishment, locality, household, or address records.',
        'Administrative coverage does not establish postal-code coverage or delivery capability.',
      ],
    }, {
      sourceId: 'hn-sen-geoportal',
      sourceName: 'Sistema Estadistico Nacional de Honduras (SEN) Geoportal',
      sourceUrl: 'https://sen.ine.gob.hn/Home/IndicadoresGeoportal',
      provider: 'Sistema Estadistico Nacional / Instituto Nacional de Estadistica, Honduras',
      licenseOrTerms: 'Official geoportal page; no data reuse or redistribution terms are recorded here, and no geoportal records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official statistical geography reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The portal exposes department and municipality as geographic disaggregation choices.',
        'This pack does not query, store, transform, or redistribute geoportal records, geometries, or address data.',
        'Geoportal availability does not establish postal-code format, mapping, rights, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'hn-postcode-mapping-required',
      sourceName: 'Honduras postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:honduras-postcode-mapping-required',
      provider: 'Honduras postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: [
        'The recorded official references do not establish a reusable national postcode format or mapping.',
        'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.',
      ],
    }]
    : countryCode === 'NI'
    ? [{
      sourceId: 'correos-de-nicaragua-postcode-query',
      sourceName: 'Correos de Nicaragua - Consulta de Codigos Postales',
      sourceUrl: 'https://www.correos.gob.ni/postalcode/postalcodes.php',
      provider: 'Correos de Nicaragua',
      licenseOrTerms: 'Official query interface; no bulk-download, API, derived-data, or redistribution permission is recorded here, and no query result or postal record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal-query interface reference; metadata only, not an AGID lookup, offline postcode mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The official site exposes a postcode query interface and a general postcode summary.',
        'This pack does not query, store, transform, or redistribute query results, postal records, contact data, or addresses.',
        'Interface availability alone does not establish an offline reusable format, mapping, rights, version, coverage, or delivery-point capability.',
      ],
    }, {
      sourceId: 'correos-de-nicaragua-legal-framework',
      sourceName: 'Correos de Nicaragua legal framework',
      sourceUrl: 'https://www.correos.gob.ni/marco-legal-2/',
      provider: 'Correos de Nicaragua',
      licenseOrTerms: 'Official legal-framework page; no postcode-mapping license or redistribution grant is recorded here, and no legal or postal records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator legal and institutional reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The page describes Ley No. 758 and identifies Correos de Nicaragua as the state postal administrator and designated operator.',
        'This pack stores source metadata only and does not include legal text, operator records, postal records, addresses, or contact data.',
        'Postal governance does not establish a reusable postcode format, mapping, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'ineter-ide-boundaries',
      sourceName: 'INETER IDE - Nicaragua administrative boundaries geoportal',
      sourceUrl: 'https://www.ineter.gob.ni/geoportales/miacnicaragua/index.html',
      provider: 'Instituto Nicaraguense de Estudios Territoriales (INETER)',
      licenseOrTerms: 'Official geoportal page; no data reuse or redistribution terms are recorded here, and no geometry or boundary records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official national, departmental, and municipal boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'INETER describes national, departmental, and municipal boundary layers and OGC services.',
        'This pack does not query, store, transform, or redistribute geoportal records, geometries, layers, or address data.',
        'Administrative boundaries do not establish postal-code coverage, postal format, mapping rights, or delivery capability.',
      ],
    }, {
      sourceId: 'ni-postcode-mapping-required',
      sourceName: 'Nicaragua postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:nicaragua-postcode-mapping-required',
      provider: 'Nicaragua postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: [
        'The recorded official interfaces and references do not establish an offline reusable postcode format or mapping.',
        'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.',
      ],
    }]
    : countryCode === 'AL'
    ? [{
      sourceId: 'albania-akep-universal-postal-service-authorization-2025',
      sourceName: 'Albania AKEP universal postal service authorization',
      sourceUrl: 'https://akep.al/wp-content/uploads/2026/02/Vendim-17.pdf',
      provider: 'Electronic and Postal Communications Authority of Albania (AKEP)',
      licenseOrTerms: 'Official Decision 17 grants Posta Shqiptare J.S.C. a five-year individual authorization for universal postal service starting 2025-07-07. It is authority metadata only and does not provide a postcode-mapping license, format definition, or delivery-coverage grant. No carrier operational data is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator records the current national universal-service authorization.', 'Operator authority is separate from postcode format, mapping rights, coverage, and correction evidence.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'albania-asig-geoportal-terms',
      sourceName: 'Albania National Geoportal terms of use',
      sourceUrl: 'https://geoportal.asig.gov.al/en/info/terms',
      provider: 'State Authority for Geospatial Information of Albania (ASIG)',
      licenseOrTerms: 'Official terms allow Geoportal resources only for non-profit and non-commercial use and state that tariffs apply to download and transformation services. The terms do not establish redistribution rights for an AGID postcode or administrative artifact; no geospatial record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'geospatial reuse-terms and publication-safety reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Public viewing or access does not establish commercial redistribution rights.', 'No Geoportal data, services, metadata values, or geometry are retained.', 'The terms remain a release gate for any future administrative extract.'],
    }, {
      sourceId: 'albania-asig-administrative-boundary-metadata',
      sourceName: 'Albania ASIG administrative-territorial boundary metadata',
      sourceUrl: 'https://geoportal.asig.gov.al/en/node/956',
      provider: 'State Authority for Geospatial Information of Albania (ASIG)',
      licenseOrTerms: 'Official publication records updated administrative-territorial boundary information aligned with DCM 360 dated 2019-05-29. Geometry is excluded and the Geoportal terms do not provide the required general redistribution grant; no boundary, address, parcel, or location record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-boundary authority and safety-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Boundary authority is recorded separately from a releasable key-only extract.', 'No geometry, boundary feature, cadastral record, or address-system data is retained.', 'Administrative boundaries do not establish postal-code coverage or address-to-postcode mapping.'],
    }, {
      sourceId: 'albania-instat-administrative-divisions-classification',
      sourceName: 'Albania INSTAT administrative-divisions classification',
      sourceUrl: 'https://www.instat.gov.al/en/documentation/classifications/version/?verId=3488',
      provider: 'Institute of Statistics, Republic of Albania (INSTAT)',
      licenseOrTerms: 'Official administrative classification page describes counties and municipalities and presents a download surface. Resource-specific reuse terms, version cadence, and a postal crosswalk are not verified; no classification value, locality, postcode, or geographic record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-classification and unresolved-terms reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The classification is a useful official authority reference, not a verified reuse grant.', 'No administrative value is retained.', 'The source does not establish a postcode format, postal mapping, coverage, or correction process.'],
    }, {
      sourceId: 'al-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Albania current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:albania-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'AKEP, Posta Shqiptare, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded authorization and administrative sources are not substitutes for a safe offline postcode mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'BA'
    ? [{
      sourceId: 'bosnia-public-postal-operators-universal-service-coordination',
      sourceName: 'Bosnia and Herzegovina public postal operators universal-service coordination',
      sourceUrl: 'https://www.posta.ba/bh-posta-na-sastanku-javnih-postanskih-operatera-u-mostaru/',
      provider: 'JP BH Pošta d.o.o. Sarajevo',
      licenseOrTerms: 'Official public-operator publication records BH Pošta, HP Mostar, and Pošte Srpske working jointly on universal postal service. It is coordination metadata only and does not provide a postcode-mapping license, format definition, countrywide coverage artifact, or delivery-coverage grant. No carrier operational data is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'public postal-operator coordination reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The source supports the multi-operator release boundary.', 'Operator coordination does not establish a current reusable postcode artifact.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'bh-posta-postal-network-search',
      sourceName: 'BH Pošta postal-network search',
      sourceUrl: 'https://www.posta.ba/en/postal-network/',
      provider: 'JP BH Pošta d.o.o. Sarajevo',
      licenseOrTerms: 'Official postal-network search accepts postcode and address terms and returns postal-unit, address, contact, and work-time fields. No bulk postcode-mapping reuse grant or publication version is recorded; the interface is not queried and no result, postcode, address, office, contact, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal-network search authority and safety-boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['A searchable site is not a safe offline dataset or a redistribution license.', 'Its address-bearing result schema is outside the public pack boundary.', 'No query result is retained.'],
    }, {
      sourceId: 'poste-srpske-addressing-and-routing-tool',
      sourceName: 'Pošte Srpske addressing and routing tool',
      sourceUrl: 'https://www.postesrpske.com/eng/adresuj-posiljku/',
      provider: 'Preduzeće za Poštanski saobraćaj Republike Srpske a.d. Banja Luka',
      licenseOrTerms: 'Official addressing surface states that street or place searches return destination post office, postcode, and address form. No bulk postcode-mapping reuse grant or publication version is recorded; the interface is not queried and no result, postcode, locality, address, office, contact, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official operator postcode-addressing search and safety-boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The search surface cannot supply a public mapping artifact.', 'Street- and locality-query results remain outside the safety boundary.', 'No query result is retained.'],
    }, {
      sourceId: 'fbih-fgu-geoportal-boundary-metadata',
      sourceName: 'FBiH Federal Geodetic Administration GeoPortal boundary metadata',
      sourceUrl: 'https://www.fgu.com.ba/en/572.html',
      provider: 'Federal Administration for Geodetic and Real Property Affairs of the Federation of Bosnia and Herzegovina',
      licenseOrTerms: 'Official FBiH GeoPortal describes entity, canton, and municipality boundary coverage and carries an all-rights-reserved copyright notice. It is limited to FBiH and does not provide a whole-country redistribution grant; no boundary, cadastral, address, or geometry record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'entity administrative-boundary authority and safety-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Entity scope is not whole-country administrative coverage.', 'Boundary geometry and cadastral data are excluded.', 'Administrative boundary availability does not establish postcode coverage or address-to-postcode mapping.'],
    }, {
      sourceId: 'ba-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Bosnia and Herzegovina current postcode format, cross-operator mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:bosnia-herzegovina-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'Agency for Postal Traffic of Bosnia and Herzegovina and the authority-designated public postal operators',
      licenseOrTerms: 'Not yet acquired and verified as a current cross-operator safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['Recorded operator pages are not substitutes for a national safe offline mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'ME'
    ? [{
      sourceId: 'montenegro-ekip-universal-postal-operator',
      sourceName: 'Montenegro EKIP universal postal operator reference',
      sourceUrl: 'https://ekip.me/page/postal-services/universal-service-1/universal-postal-operator/content',
      provider: 'Agency for Electronic Communications and Postal Services of Montenegro (EKIP)',
      licenseOrTerms: 'Official regulator reference records Pošta Crne Gore as universal postal operator under special license 01-1 dated 2007-02-15. It is authority metadata only and does not provide a postcode-mapping license, format mapping, or redistribution grant. No postal, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator establishes the national universal postal operator context.', 'Operator designation does not establish postcode mapping rights, current coverage, correction process, or delivery-point evidence.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'montenegro-posta-crne-gore-addressing-rules-2020',
      sourceName: 'Pošta Crne Gore special conditions for postal services',
      sourceUrl: 'https://www.postacg.me/wp-content/uploads/30.-Pravilnik-o-posebnim-uslovima-za-obavljanje-postanskih-usluga-Poste-Crne-Gore.pdf',
      provider: 'Pošta Crne Gore A.D. Podgorica',
      licenseOrTerms: 'Official operator rule published 2020-06-10 states that its postal codes have five digits. Current applicability and a bulk postcode-mapping reuse grant are not verified; no postcode mapping, address, recipient, postal-unit, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-code format authority and addressing-rule reference; metadata only, not a current postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The source supports a five-digit format claim only.', 'The 2020 publication is not treated as proof of current operational applicability.', 'No postal-code row or address data is retained.'],
    }, {
      sourceId: 'montenegro-data-gov-municipalities-catalog',
      sourceName: 'Montenegro Open Data Portal municipalities catalog',
      sourceUrl: 'https://data.gov.me/en/dataset/lista-opstina-crne-gore',
      provider: 'Ministry of Public Administration of Montenegro',
      licenseOrTerms: 'Official portal dataset page lists a municipalities resource but reports no license provided and a 2024-11-19 update. The portal-wide terms cannot replace dataset-level license evidence; no municipality code, name, or record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-key catalog and unresolved-resource-license reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['A portal catalog does not establish resource-specific reuse permission.', 'No municipal key or locality data is retained.', 'The source does not establish postal mapping, coverage, or delivery capability.'],
    }, {
      sourceId: 'montenegro-monstat-municipalities-classification',
      sourceName: 'MONSTAT municipalities classification',
      sourceUrl: 'https://monstat.org/eng/page.php?id=105&pageid=105',
      provider: 'Statistical Office of Montenegro (MONSTAT)',
      licenseOrTerms: 'Official classification reference describes the 2022 list of municipalities and its code-and-name structure, but MONSTAT records an all-rights-reserved copyright notice. No classification entry, geographic key, boundary, or postcode record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official administrative-classification and copyright-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The classification authority is recorded separately from a redistributable artifact.', 'No source value is retained.', 'Administrative classification does not establish postal-code coverage or address-to-postcode mapping.'],
    }, {
      sourceId: 'me-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Montenegro current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:montenegro-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'EKIP, Pošta Crne Gore, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format-currentness, reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The operator rule is not a substitute for a current safe offline mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'RS'
    ? [{
      sourceId: 'serbia-ratel-universal-postal-service',
      sourceName: 'Serbia RATEL universal postal service reference',
      sourceUrl: 'https://www.ratel.rs/sr/univerzalna-postanska-usluga',
      provider: 'Regulatory Agency for Electronic Communications and Postal Services (RATEL)',
      licenseOrTerms: 'Official regulator reference records universal postal service as a nationwide public-interest service. It is authority metadata only and does not provide a postcode-mapping license, postcode format definition, or delivery-coverage grant. No postal, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service context; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator establishes nationwide service context, not a reusable postcode mapping.', 'No carrier operational data is retained.', 'The source does not establish an address-to-postcode or delivery-point claim.'],
    }, {
      sourceId: 'serbia-posta-proper-addressing-and-pak-locator',
      sourceName: 'Posta Srbije proper addressing and PAK locator reference',
      sourceUrl: 'https://www.posta.rs/eng/stanovnistvo/usluga.aspx?usluga=postal-services%2Fproper-addressing',
      provider: 'Public Enterprise Posta Srbije',
      licenseOrTerms: 'Official operator addressing page identifies postal number and Postal Address Code (PAK) in the addressing workflow. The related locator accepts address-level input and can return address-level results, so it is neither queried nor acquired. No PAK, postcode, address, recipient, office, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal addressing and address-level PAK locator boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The pack records the service boundary without sending any locator query.', 'Address-level PAK results are excluded from acquisition.', 'The page does not independently authorize a national postcode format or mapping claim.'],
    }, {
      sourceId: 'serbia-open-data-portal-reuse-license',
      sourceName: 'Serbia Open Data Portal reuse license',
      sourceUrl: 'https://data.gov.rs/sr/terms/',
      provider: 'Office for Information Technologies and eGovernment of Serbia',
      licenseOrTerms: 'Official portal terms describe non-exclusive, no-fee reuse with source, retrieval date, access URL, and modification attribution requirements for datasets published under the portal license unless otherwise stipulated. This governance page is not proof that any particular postal or administrative resource is safely reusable.',
      redistributionStatus: 'source-metadata-only',
      role: 'open-data reuse governance reference; metadata only, not a selected postcode or administrative dataset',
      transformedFields: [],
      confidenceNotes: ['The framework is recorded separately from dataset-level terms.', 'No data.gov.rs dataset is acquired in this pack.', 'A future artifact must still establish its own safe schema, current version, coverage, and correction path.'],
    }, {
      sourceId: 'serbia-rgz-administrative-units-register',
      sourceName: 'Serbia RGZ Administrative Units Register',
      sourceUrl: 'https://www.rgz.gov.rs/administrative-units-register',
      provider: 'Republic Geodetic Authority (RGZ)',
      licenseOrTerms: 'Official register page describes alphanumeric and geospatial administrative-unit data, including codes and polygons, but does not provide resource-level reuse terms for a safe key-only artifact. No administrative entry, code, boundary, geometry, or postcode record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative authority and unresolved resource-level rights reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The register includes fields outside the permitted schema, notably geospatial data.', 'No administrative key is retained.', 'Administrative authority does not establish postcode mapping or delivery coverage.'],
    }, {
      sourceId: 'serbia-rgz-address-register-exclusion',
      sourceName: 'Serbia RGZ Address Register exclusion reference',
      sourceUrl: 'https://www.rgz.gov.rs/address-regisrer',
      provider: 'Republic Geodetic Authority (RGZ)',
      licenseOrTerms: 'Official page describes an Address Register containing street, house-number, address-code, cadastral, and related attributes. Those records are prohibited for this program even where a public portal offers access; no record is queried, downloaded, stored, or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'source-exclusion boundary for address, property, and precise-location data; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The Address Register is expressly excluded because it contains address and property attributes.', 'No source query is sent.', 'Public availability does not satisfy the program safety boundary.'],
    }, {
      sourceId: 'rs-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Serbia current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:serbia-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'RATEL, Posta Srbije, RGZ, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The PAK locator is not a substitute for a reusable postcode mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'GE'
    ? [{
      sourceId: 'georgia-post-addressing-rule', sourceName: 'Georgia Post addressing rule', sourceUrl: 'https://www.gpost.ge/Content/ContentFiles/addressingRule24125.pdf', provider: 'Georgian Post Ltd',
      licenseOrTerms: 'Official operator addressing rule is recorded as metadata only. It includes address examples and is not used to acquire or retain personal, address, or postcode data; it also does not independently authorize a current national postcode-format or mapping claim.', redistributionStatus: 'source-metadata-only', role: 'postal addressing-rule boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['Address examples are excluded from all artifacts.', 'No postcode row or address data is retained.', 'The pack deliberately does not infer a format from examples.'],
    }, {
      sourceId: 'georgia-post-postcode-lookup-boundary', sourceName: 'Georgia Post postal-code lookup surface', sourceUrl: 'https://www.gpost.ge/?site-lang=en&site-path=help%2Fzipcodes', provider: 'Georgian Post Ltd',
      licenseOrTerms: 'Official operator site provides a postal-code search surface. It is not queried, does not provide a bulk-reuse grant, and no postcode, address, office, recipient, or location record is bundled.', redistributionStatus: 'source-metadata-only', role: 'postal-code lookup boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['No lookup request is sent.', 'Interactive availability is not a redistribution grant.', 'No operational postal data is retained.'],
    }, {
      sourceId: 'georgia-napr-public-registry-and-nsdi', sourceName: 'Georgia NAPR public registry and national spatial-data infrastructure reference', sourceUrl: 'https://www.napr.gov.ge/en', provider: 'National Agency of Public Registry (NAPR)',
      licenseOrTerms: 'Official NAPR page identifies address, municipality, public-registry, and national spatial-data infrastructure services. Resource-level reuse terms for a safe key-only artifact are not recorded; no administrative entry, address, boundary, geometry, or postcode record is acquired or bundled.', redistributionStatus: 'source-metadata-only', role: 'administrative and geospatial authority reference; metadata only, not a postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['Authority is recorded separately from a reusable artifact.', 'No resource-level terms are inferred.', 'No geographic or address data is retained.'],
    }, {
      sourceId: 'ge-current-postcode-format-mapping-rights-coverage-and-correction-required', sourceName: 'Georgia current postcode format, safe mapping, rights, coverage, and correction authority source', sourceUrl: 'source-metadata-only:georgia-current-postcode-format-mapping-rights-coverage-and-correction-required', provider: 'Georgian Post, NAPR, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled', redistributionStatus: 'not-bundled', role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims', transformedFields: [], confidenceNotes: ['The lookup surface is not a substitute for a safe offline mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'AZ'
    ? [{
      sourceId: 'azerbaijan-azerpost-index-search-boundary', sourceName: 'Azerbaijan Azerpost index-search boundary', sourceUrl: 'https://www.azerpost.az/en/frequently-asked-questions/general-br-questions/how-can-i-find-out-the-postal-code-of-my-residential-address', provider: 'Azerpost LLC', licenseOrTerms: 'Official operator FAQ records an index-search service. It is not queried, does not provide a bulk-reuse grant, and no postcode, address, office, recipient, or location record is bundled.', redistributionStatus: 'source-metadata-only', role: 'postal index-search boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['No lookup request is sent.', 'Interactive availability is not a redistribution grant.', 'No operational postal data is retained.'],
    }, {
      sourceId: 'azerbaijan-azerpost-addressing-rule', sourceName: 'Azerbaijan Azerpost mail-receiving and addressing procedure', sourceUrl: 'https://www.azerpost.az/storage/pages/3/procedure-for-receiving-mailings-1.pdf', provider: 'Azerpost LLC', licenseOrTerms: 'Official operator procedure is recorded as metadata only. It contains address-oriented instructions and is not used to acquire or retain personal, address, or postcode data; it also does not independently authorize a current national postcode-format or mapping claim.', redistributionStatus: 'source-metadata-only', role: 'postal addressing-rule boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['Address-oriented content is excluded from all artifacts.', 'No postcode row or address data is retained.', 'The pack deliberately does not infer a format from examples.'],
    }, {
      sourceId: 'azerbaijan-idda-open-data-portal', sourceName: 'Azerbaijan IDDA Open Data Portal', sourceUrl: 'https://opendata.az/az', provider: 'Innovation and Digital Development Agency (IDDA)', licenseOrTerms: 'Official portal catalog is recorded as a governance surface only. No dataset, resource-level license, version, coverage, or correction path is selected or inferred; no data is acquired or bundled.', redistributionStatus: 'source-metadata-only', role: 'open-data governance reference; metadata only, not a selected postcode or administrative dataset', transformedFields: [], confidenceNotes: ['A portal catalog is not a dataset-level reuse grant.', 'No dataset entry is retained.', 'A future artifact must establish its own safe schema and currentness.'],
    }, {
      sourceId: 'azerbaijan-electronic-land-cadastre-system', sourceName: 'Azerbaijan Electronic Land Cadastre Information System reference', sourceUrl: 'https://emlak.gov.az/az/page/view/32', provider: 'State Service on Property Issues', licenseOrTerms: 'Official cadastral-system page describes administrative boundaries and cadastral functions. Resource-level reuse terms are not recorded, and cadastral, boundary, property, and geometry data are excluded; no record is acquired or bundled.', redistributionStatus: 'source-metadata-only', role: 'administrative and cadastral authority reference; metadata only, not a postcode mapping or delivery-coverage dataset', transformedFields: [], confidenceNotes: ['The source includes fields outside the permitted schema.', 'No geographic or cadastral record is retained.', 'Administrative authority does not establish postcode mapping or delivery coverage.'],
    }, {
      sourceId: 'az-current-postcode-format-mapping-rights-coverage-and-correction-required', sourceName: 'Azerbaijan current postcode format, safe mapping, rights, coverage, and correction authority source', sourceUrl: 'source-metadata-only:azerbaijan-current-postcode-format-mapping-rights-coverage-and-correction-required', provider: 'Azerpost, IDDA, or authority-designated official publisher', licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled', redistributionStatus: 'not-bundled', role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims', transformedFields: [], confidenceNotes: ['The search surface is not a substitute for a safe offline mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'BG'
    ? [{
      sourceId: 'bulgaria-crc-postal-code-formation-system',
      sourceName: 'Bulgaria CRC postal-code formation system reference',
      sourceUrl: 'https://www.crc.bg/bg/rubriki/128/podzakonovi-aktove-po-zakona-za-poshtenskite-uslugi',
      provider: 'Communications Regulation Commission of Bulgaria (CRC)',
      licenseOrTerms: 'Official regulatory page records a postal-code formation-system reference. It is authority metadata only and does not independently establish a current national format, postcode mapping, or redistribution grant. No postal, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-code system regulatory reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator reference establishes that a national postal-code formation system exists.', 'The pack deliberately does not infer a pattern from that reference.', 'No index entry or operational postal data is retained.'],
    }, {
      sourceId: 'bulgaria-crc-national-postcode-index-catalog',
      sourceName: 'Bulgaria CRC national postcode-index catalog reference',
      sourceUrl: 'https://www.crc.bg/bg/rubriki/226/regulirane-na-poshtenskite-uslugi',
      provider: 'Communications Regulation Commission of Bulgaria (CRC)',
      licenseOrTerms: 'Official regulatory catalog lists the national postal-code index, but resource-specific reuse terms, current publication version, coverage, and correction path are not verified. The index is not downloaded or queried, and no postcode, address, locality, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'national postcode-index catalog and unresolved-reuse reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Catalog presence is not treated as a reuse grant.', 'No national-index entry is retained.', 'The source cannot establish a current offline mapping or coverage claim without further evidence.'],
    }, {
      sourceId: 'bulgaria-crc-universal-service-operator-2026',
      sourceName: 'Bulgaria CRC universal postal service license reference',
      sourceUrl: 'https://www.crc.bg/index.php/bg/novini/1744/zaplashtane-na-godishna-taksa-kontrol-po-zakona-za-poshtenskite-uslugi',
      provider: 'Communications Regulation Commission of Bulgaria (CRC)',
      licenseOrTerms: 'Official 2026 CRC reference identifies Bulgarian Posts EAD under an individual license for the universal postal service. It is authority metadata only and does not provide a postcode-mapping license, format definition, or delivery-coverage grant. No carrier operational data is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Operator licensing is separate from mapping rights, current coverage, correction process, and address-to-postcode evidence.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'bulgaria-cadastre-public-sector-reuse-framework',
      sourceName: 'Bulgaria cadastre public-sector information reuse service',
      sourceUrl: 'https://www.cadastre.bg/service/2-predostavyane-na-dostp-do-obschestvena-informaciya',
      provider: 'Agency for Geodesy, Cartography and Cadastre of Bulgaria',
      licenseOrTerms: 'Official access-and-reuse service is a governance reference, not a verified resource-specific license for a safe administrative-key extract. Cadastre materials can include excluded address, property, parcel, coordinate, and geometry fields; no record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-geography reuse-governance and safety-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['A general reuse framework does not authorize a particular data artifact.', 'No cadastral, boundary, property, address, or location data is retained.', 'Administrative publication does not establish postcode coverage or delivery capability.'],
    }, {
      sourceId: 'bg-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Bulgaria current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:bulgaria-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'Communications Regulation Commission, Bulgarian Posts, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit format authority, reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded regulatory references are not substitutes for a safe offline postcode mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'RO'
    ? [{
      sourceId: 'ancom-cnpr-universal-service-2025-2029',
      sourceName: 'ANCOM CNPR universal postal service designation',
      sourceUrl: 'https://www.ancom.ro/en/reglementare-ro-en/servicii-postale-en/universal-service/usp-in-the-field-of-postal-services/',
      provider: 'National Authority for Management and Regulation in Communications of Romania (ANCOM)',
      licenseOrTerms: 'Official regulator reference records National Company Romanian Post as universal-service provider through 2029-12-31. It is authority metadata only and does not provide a postcode-mapping license, format mapping, or redistribution grant. No postal, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator provides current operator and universal-service authority metadata.', 'Universal-service designation does not establish postcode mapping rights, current coverage, correction process, or delivery-point evidence.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'data-gov-ro-romania-postal-codes-ogl-2016',
      sourceName: 'Romania postal-codes open-data catalog',
      sourceUrl: 'https://data.gov.ro/en/dataset/coduri-postale-romania',
      provider: 'Romanian Post via data.gov.ro',
      licenseOrTerms: 'Government open-data catalog labels the resource OGL-ROU-1.0 and records a six-digit numeric postal-code system, but the catalog was last updated 2016-09-06 and describes street-level detail. No resource is downloaded or ingested because it is historical and its schema exceeds the AGID safety boundary.',
      redistributionStatus: 'source-metadata-only',
      role: 'historical postcode-format and license reference; metadata only, not a current postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The source supports the national six-digit format, not a current offline mapping.', 'OGL-ROU-1.0 does not cure staleness or permit storage of excluded street-level fields in this pack.', 'No postcode, locality, street, number, or administrative record is retained.'],
    }, {
      sourceId: 'posta-romana-current-zip-code-search',
      sourceName: 'Romanian Post current zip-code search',
      sourceUrl: 'https://www.posta-romana.ro/en/search-zip-code.html',
      provider: 'National Company Romanian Post S.A.',
      licenseOrTerms: 'Official search surface supports postcode and address queries and returns street-and-number and postal-unit result fields. No bulk postcode-mapping reuse grant or publication version is recorded; the interface is not queried and no result, postcode, address, office, contact, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal-code search authority and safety-boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['A searchable site is not a safe offline dataset or a redistribution license.', 'Its address-bearing results cannot be used as a source for the public pack.', 'No query result is retained.'],
    }, {
      sourceId: 'ancpi-administrative-boundaries-open-information-license',
      sourceName: 'ANCPI administrative-boundaries open-information application',
      sourceUrl: 'https://geoportal.ancpi.ro/portal/apps/webappviewer/index.html?id=faeba2d173374445b1f13512bd477bb2',
      provider: 'National Agency for Cadastre and Real Estate Publicity (ANCPI)',
      licenseOrTerms: 'Official application states acceptance of an open-information license for administrative-boundary spatial data and reports a 2026-05-05 update. Boundary geometry remains excluded from AGID; no geometry, point, address, parcel, or administrative record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'current administrative-boundary license and freshness reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The license is recorded separately from a safe key-only extraction.', 'Boundary geometry is excluded by the publication-safety boundary.', 'Administrative boundary availability does not establish postcode coverage or address-to-postcode mapping.'],
    }, {
      sourceId: 'ro-current-postcode-mapping-coverage-and-correction-required',
      sourceName: 'Romania current postcode mapping, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:romania-current-postcode-mapping-coverage-and-correction-required',
      provider: 'Romanian Post or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The historical OGL catalog and current search surface are not substitutes for a current safe offline mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'MK'
    ? [{
      sourceId: 'north-macedonia-postal-agency-universal-service-provider',
      sourceName: 'Postal Agency of North Macedonia universal-service provider reference',
      sourceUrl: 'https://ap.mk/mk/node/491',
      provider: 'Postal Agency of the Republic of North Macedonia',
      licenseOrTerms: 'Official regulatory reference that records JSC Post of North Macedonia as the universal-service provider. It is recorded as authority metadata only and does not provide a postcode-mapping license, format, or redistribution grant. No postal, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal regulator and universal-service operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The regulator records the universal-service provider and nationwide service obligation.', 'Operator authority is separate from postcode format, mapping rights, coverage, and correction evidence.', 'No carrier operational data is retained.'],
    }, {
      sourceId: 'north-macedonia-post-office-location-search',
      sourceName: 'North Macedonia Post office-location search',
      sourceUrl: 'https://www.posta.com.mk/locations_en/',
      provider: 'JSC Post of North Macedonia',
      licenseOrTerms: 'Official office-location search surface. Its result schema includes excluded address, contact, and work-time fields, and no bulk postcode-mapping reuse grant is recorded. The interface is not queried and no result, postcode, locality, address, telephone, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal office-search authority reference and safety-boundary evidence; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['A searchable site is not a safe offline dataset or a redistribution license.', 'Excluded office and location fields prevent acquisition until a separate safe postcode-only artifact exists.', 'No query result is retained.'],
    }, {
      sourceId: 'north-macedonia-makstat-territorial-units',
      sourceName: 'MakStat territorial-units statistical table',
      sourceUrl: 'https://makstat.stat.gov.mk/PXWeb/pxweb/en/MakStat/MakStat__ProstorniEdinici/125_PrEdn_reg_09_BrOpstiniNM_ml.px',
      provider: 'State Statistical Office of the Republic of North Macedonia',
      licenseOrTerms: 'MakStat states that data are available free of charge and require source attribution; the table is an aggregate territorial-units summary. No postcode mapping, address, locality, boundary, or geographic-key record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'attributed territorial-statistics reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The source supplies clear reuse and attribution context for aggregate territorial statistics.', 'The recorded table does not supply postcode mappings or administrative geographic keys for routing.', 'No raw statistical table data is retained in this pack.'],
    }, {
      sourceId: 'north-macedonia-cadastre-admin-boundary-and-address-catalog',
      sourceName: 'North Macedonia cadastre administrative-boundary and address catalog',
      sourceUrl: 'https://www.katastar.gov.mk/%D0%BF%D0%BE%D0%B4%D0%B0%D1%82%D0%BE%D1%86%D0%B8-%D0%BE%D0%B4-%D0%B3%D0%BA%D0%B8%D1%81/%D0%BF%D0%BE%D0%B4%D0%B0%D1%82%D0%BE%D1%86%D0%B8-%D0%B7%D0%B0-%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B8-%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B8/',
      provider: 'Agency for Real Estate Cadastre of the Republic of North Macedonia',
      licenseOrTerms: 'Official catalog describes administrative-boundary products alongside street and house-number products. Resource-specific reuse terms and a safe postcode-only or administrative-key schema are not verified; no boundary, street, house, parcel, geometry, or location record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-geography catalog and safety-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The mixed catalog cannot be treated as an approved administrative-key extraction source.', 'No geometry or cadastral, street, house-number, or address data is retained.', 'Administrative publication does not establish postal-code coverage, mapping rights, or delivery capability.'],
    }, {
      sourceId: 'mk-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'North Macedonia current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:north-macedonia-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'Postal Agency of the Republic of North Macedonia or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The office-search surface and aggregate statistics are not substitutes for a safe offline postcode mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'MD'
    ? [{
      sourceId: 'posta-moldovei-office-map',
      sourceName: 'Posta Moldovei office map',
      sourceUrl: 'https://posta.md/ro/map',
      provider: 'I.S. Posta Moldovei',
      licenseOrTerms: 'Official office-search surface with no recorded bulk postcode-mapping reuse grant. It is not queried, and no result, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal office-search authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The interface permits a search by address or postal code, but AGID does not submit a query.', 'Its availability does not establish a reusable national postcode format, offline mapping, coverage, version, correction path, or delivery capability.', 'No search result or postal record is retained.'],
    }, {
      sourceId: 'moldova-state-property-agency-posta-moldovei',
      sourceName: 'Moldova State Property Agency Posta Moldovei profile',
      sourceUrl: 'https://app.gov.md/companies/posta-moldovei/',
      provider: 'Agenția Proprietății Publice, Republic of Moldova',
      licenseOrTerms: 'Official government company profile reporting 2025 data. It is recorded as postal-operator authority metadata only; no postcode, address, recipient, or operational record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'government postal-operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The profile supplies a government reference for the national operator.', 'It does not state a postcode-mapping license, national postal-code format, current coverage, or correction workflow.', 'No government company data is reproduced.'],
    }, {
      sourceId: 'moldova-administrative-classifier-catalog',
      sourceName: 'Moldova administrative classifier catalog',
      sourceUrl: 'https://dataset.gov.md/ru/dataset/?_organization_limit=0&_tags_limit=0&groups=2233-clasificatoare-si-nomenclatoare&license_id=notspecified&tags=raioane',
      provider: 'Moldova Open Data Portal',
      licenseOrTerms: 'Official catalog listing with license not specified. No classifier, administrative key, boundary, geometry, locality, or postal record is acquired or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-key catalog and terms reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The catalog is recorded specifically to retain the unresolved resource-level license gate.', 'A public catalog presence does not provide reuse permission for the referenced resource.', 'No administrative geographic data is retained.'],
    }, {
      sourceId: 'moldova-spatial-data-reuse-framework',
      sourceName: 'Moldova legislative and normative acts for public-sector reuse',
      sourceUrl: 'https://inds.gov.md/en/legislative-and-normative-acts/',
      provider: 'Government of the Republic of Moldova',
      licenseOrTerms: 'Official governance reference to 2025 open-data and public-sector information reuse methodology. It is not a source-specific license or postcode-mapping grant, and no spatial, postal, address, property, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'public-sector reuse-governance reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Governance is recorded separately from resource-specific reuse terms.', 'The framework does not cure the classifier catalog license-unspecified status.', 'No raw data is acquired from this reference.'],
    }, {
      sourceId: 'md-current-postcode-format-mapping-rights-coverage-and-correction-required',
      sourceName: 'Moldova current postcode format, safe mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:moldova-current-postcode-format-mapping-rights-coverage-and-correction-required',
      provider: 'Posta Moldovei or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with explicit reuse terms, coverage, version, and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The office-search surface is not used as a substitute for a safe offline artifact.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until all release evidence is recorded.'],
    }]
    : countryCode === 'JO'
    ? [{
      sourceId: 'jordan-open-government-data-license-v1',
      sourceName: 'Jordan Open Government Data License issue v1.0',
      sourceUrl: 'https://portal.jordan.gov.jo/OGD-License_en.pdf',
      provider: 'Government of Jordan',
      licenseOrTerms: 'The official license permits use, copying, publication, distribution, and derivative works for data published on the government open-data platform, subject to its terms. It does not override the AGID safety boundary for address, location, or property fields. No raw dataset or protected field is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'government open-data reuse-license reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The license is recorded before any candidate data acquisition.', 'License evidence is distinct from field-level safety, coverage, and correction evidence.', 'This pack contains no raw government data.'],
    }, {
      sourceId: 'jordan-post-offices-open-data-catalog-2025',
      sourceName: 'Jordan Post Offices open-data catalog entry',
      sourceUrl: 'https://opendata.gov.jo/en/dataset/jordan-post-offices-1661-2023',
      provider: 'Jordan Post Company via Open Government Data Portal',
      licenseOrTerms: 'Catalog metadata records the Jordanian open-data license and a 2025-07-16 update. The listed resources combine postal codes with office address, work-hours, and property fields. The resources are intentionally not downloaded or ingested because AGID does not collect or store raw address, location, or property fields.',
      redistributionStatus: 'source-metadata-only',
      role: 'licensed postal-office dataset catalog and safety-boundary reference; metadata only, not an offline postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The catalog establishes a reusable license but not a safe postcode-only representation.', 'No office record, address, coordinate, property status, opening-hour, or postcode row is retained.', 'A general dataset license does not establish a safe schema, nationwide coverage, correction path, or delivery capability.'],
    }, {
      sourceId: 'upu-jordan-designated-operator',
      sourceName: 'UPU Jordan designated postal operator entry',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/statusOfPostalEntities/20240315dPRMAnListOfEntities_En.pdf',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'UPU status list dated 2024-03-15 records Jordan Post as the designated operator. It does not state a bulk postcode-mapping reuse grant, and no operator, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'international designated-operator authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The UPU entry supplies operator authority metadata only.', 'This pack does not access any postal lookup result.', 'Operator designation alone does not establish postcode format, mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'jo-current-postcode-format-coverage-and-correction-required',
      sourceName: 'Jordan current postcode format, safe mapping, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:jordan-current-postcode-format-coverage-and-correction-required',
      provider: 'Jordan Post or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current safe postcode-only artifact with coverage and correction evidence; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The existing open-data catalog is not acquired because its source schema contains excluded fields.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until a safe official artifact and all release evidence are recorded.'],
    }]
    : countryCode === 'TM'
    ? [{
      sourceId: 'turkmenistan-postal-communication-law-2021',
      sourceName: 'Turkmenistan Law on Postal Communication',
      sourceUrl: 'https://turkmenistan.gov.tm/ru/post/58755/zakon-turkmenistana-o-pochtovoj-svyazi',
      provider: 'Government of Turkmenistan',
      licenseOrTerms: 'Official law records the postal-code concept, national-operator functions, and postal secrecy for postal-address and user data. It does not provide a machine-readable national format or a bulk postcode-mapping reuse grant. No legal text, postcode, address, recipient, user, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-law and privacy-boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The legal definition does not establish a safe fixed postal-code regex.', 'Postal address and user data are treated as out of scope.', 'Legal authority alone does not establish mapping rights, coverage, version, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'turkmenistan-government-turkmenpochta-operator-reference',
      sourceName: 'Government Turkmenpochta postal operator reference',
      sourceUrl: 'https://turkmenistan.gov.tm/index.php/en/post/57704/little-about-history-and-services-postal-service-turkmenistan',
      provider: 'Government of Turkmenistan',
      licenseOrTerms: 'Official government reference identifies Turkmenpochta as the state postal operator. No postcode-mapping license or bulk redistribution grant is recorded here, and no postal, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'government postal-operator authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The reference supplies institutional context for the postal operator.', 'This pack does not query, store, transform, or redistribute operational service results.', 'Operator status alone does not establish format, mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'turkmenpost-official-service-surface',
      sourceName: 'Turkmenpost official service surface',
      sourceUrl: 'https://post.tm/services/sending',
      provider: 'Turkmenpost',
      licenseOrTerms: 'Official service page records postal services but states no postcode format, bulk mapping, API, derived-data, or redistribution permission. No tracking, office-search, postcode, locality, address, recipient, or location result is queried or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal-service surface reference; metadata only, not an AGID lookup, offline mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The service surface is recorded without submitting any query.', 'No format is inferred from tracking, service, or unrelated interface data.', 'Service availability does not establish reusable mapping rights, coverage, version, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'turkmenistan-2024-administrative-division-resolution',
      sourceName: 'Turkmenistan 2024 administrative-territorial division resolution',
      sourceUrl: 'https://turkmenistan.gov.tm/en/post/98762/resolution-mejlis-turkmenistan-administrative-territorial-division-turkmenistan',
      provider: 'Mejlis of Turkmenistan',
      licenseOrTerms: 'Official resolution records administrative-division changes. It does not state open-data, boundary, or administrative-key reuse terms, and no resolution text, key, boundary, geometry, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-division authority reference; metadata only, not a reusable administrative or postcode mapping dataset',
      transformedFields: [],
      confidenceNotes: ['The resolution confirms that administrative structure may change.', 'No administrative geography is acquired without explicit terms.', 'Administrative authority metadata does not establish postal mapping coverage or delivery capability.'],
    }, {
      sourceId: 'tm-current-postcode-mapping-rights-coverage-and-correction-required',
      sourceName: 'Turkmenistan current postcode format, mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:turkmenistan-current-postcode-mapping-rights-coverage-and-correction-required',
      provider: 'Turkmenpost or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current reusable format and mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['Recorded official references do not independently establish a reusable national format or mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until current rights, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'TJ'
    ? [{
      sourceId: 'tajik-post-postcode-list',
      sourceName: 'Tajik Post postcode list',
      sourceUrl: 'https://tajikpost.tj/ru/%D0%BF%D0%B5%D1%80%D0%B5%D1%87%D0%B5%D0%BD%D1%8C-%D0%BF%D0%BE%D1%87%D1%82%D0%BE%D0%B2%D1%8B%D1%85-%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%BE%D0%B2-%D1%82%D0%B0%D0%B4%D0%B6%D0%B8%D0%BA%D0%B8%D1%81/',
      provider: 'Unitary State Enterprise Tajik Post',
      licenseOrTerms: 'Official postal operator list establishes a six-digit postcode syntax. No bulk mapping, derived-data, or redistribution grant is recorded on the source. The list is not downloaded, copied, or redistributed, and no postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postcode-format reference; metadata only, not a current reusable offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Only the six-digit format pattern is represented; no individual postcode or locality record is retained.', 'The source is not treated as a reusable mapping without explicit terms.', 'Format evidence does not establish current mapping rights, coverage, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'upu-tajikistan-designated-operator',
      sourceName: 'UPU Tajikistan designated postal operator entry',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/statusOfPostalEntities/20240315dPRMAnListOfEntities_En.pdf',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'UPU status list dated 2024-03-15 records the Tajikistan designated operator. It does not state bulk postcode-mapping reuse permission, and no operator, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'international designated-operator authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The UPU entry supplies operator authority metadata only.', 'This pack does not access any postal lookup result.', 'Operator designation alone does not establish mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'tajstat-regions-2024-open-license',
      sourceName: 'Tajstat Regions in the Republic of Tajikistan 2024 publication',
      sourceUrl: 'https://www.stat.tj/en/released-statistical-publication-regions-in-the-republic-of-tajikistan-2024/',
      provider: 'Agency on Statistics under the President of the Republic of Tajikistan',
      licenseOrTerms: 'Tajstat site materials are published under Creative Commons Attribution 4.0 International, with source attribution required. This 2024 statistical publication describes administrative structure but is not a postcode mapping, boundary dataset, or machine-readable administrative-key source. No publication, key, geometry, locality, address, recipient, or location record is downloaded or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'reusable administrative-structure metadata reference; not a postal mapping, boundary, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The CC BY 4.0 terms are recorded for future source-specific evaluation.', 'No administrative dataset is acquired because this publication does not evidence a reusable postal-key or boundary schema.', 'Administrative structure information does not establish postcode mapping coverage or delivery capability.'],
    }, {
      sourceId: 'tj-current-postcode-mapping-rights-coverage-and-correction-required',
      sourceName: 'Tajikistan current postcode mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:tajikistan-current-postcode-mapping-rights-coverage-and-correction-required',
      provider: 'Tajik Post or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current reusable mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded official list establishes format, not a reusable current mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until current rights, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'KG'
    ? [{
      sourceId: 'kyrgyz-post-postal-code-search',
      sourceName: 'Kyrgyz Post postal-code search surface',
      sourceUrl: 'https://post.kg/language/en/postal-codes/',
      provider: 'OJSC Kyrgyz Post',
      licenseOrTerms: 'Official search surface requires personal address and building input to return an index. It does not state a national format, bulk mapping, query-result, derived-data, or redistribution permission. The surface is not queried, and no postcode, address, recipient, building, locality, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postal-code search-surface reference; metadata only, not an AGID lookup, offline mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The search surface is recorded without submitting a query.', 'No format is inferred from a personal-address search interface.', 'Search availability does not establish reusable mapping rights, coverage, version, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'mdd-kr-postal-services',
      sourceName: 'Ministry of Digital Development Kyrgyz Republic postal services reference',
      sourceUrl: 'https://digital.gov.kg/uslugi-svyazi-i-pochty/pochtovye-uslugi/',
      provider: 'Ministry of Digital Development of the Kyrgyz Republic',
      licenseOrTerms: 'Official ministry service page records Kyrgyz Post postal services. No postcode-mapping or bulk redistribution terms are recorded here, and no postal, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'government postal-service authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The page supplies government context for postal services.', 'This pack does not query, store, transform, or redistribute any operational service result.', 'Service information alone does not establish a postal format, mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'upu-kyrgyzstan-designated-operators',
      sourceName: 'UPU Kyrgyzstan designated operators entry',
      sourceUrl: 'https://www.upu.int/en/Postal-Solutions/Programmes-Services/Addressing-Solutions?cid=169&csid=20',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'Current UPU Postal Addressing Systems entry identifies Kyrgyzstan and its designated operators. It does not state bulk postcode-mapping reuse permission, and no operator, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'international designated-operator authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The UPU entry is recorded as authority metadata only.', 'This pack does not access any postcode search or operator lookup result.', 'Operator designation alone does not establish format, mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'kg-open-data-admin-classifier',
      sourceName: 'Kyrgyz Republic Open Data administrative-territorial classifier catalog entry',
      sourceUrl: 'https://data.gov.kg/tr/dataset/klassifikator-administrativno-territorialnyh-edinic',
      provider: 'Kyrgyz Republic Open Data Portal',
      licenseOrTerms: 'Catalog entry exposes an administrative classifier resource but states that its license is not specified and lists a 2019-11-04 update. No resource, administrative key, boundary, geometry, locality, address, recipient, or location record is downloaded or bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-key availability and terms reference; metadata only, not a reusable administrative or postcode mapping dataset',
      transformedFields: [],
      confidenceNotes: ['The unspecified license prevents acquisition or redistribution.', 'The dated catalog entry is insufficient for current administrative or postal coverage.', 'Administrative classifier availability does not establish postcode mapping coverage or delivery capability.'],
    }, {
      sourceId: 'kg-current-postcode-mapping-rights-coverage-and-correction-required',
      sourceName: 'Kyrgyzstan current postcode format, mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:kyrgyzstan-current-postcode-mapping-rights-coverage-and-correction-required',
      provider: 'Kyrgyz Post, Kyrgyz Express Post, or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current reusable format and mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['Recorded official surfaces do not independently establish a reusable national format or mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until current rights, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'MN'
    ? [{
      sourceId: 'mongol-post-zip-code-faq',
      sourceName: 'Mongol Post ZIP code FAQ',
      sourceUrl: 'https://www.mongolpost.mn/mn/faq',
      provider: 'Mongol Post JSC',
      licenseOrTerms: 'Official FAQ records a five-digit numeric ZIP-code format and points to a separate registry. It does not state bulk mapping, query-result, derived-data, or redistribution permission. No registry query, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postcode-format and registry-guidance reference; metadata only, not an offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The FAQ establishes only the national five-digit format.', 'The linked registry is not queried, and no result is stored or transformed.', 'Format guidance alone does not establish mapping rights, coverage, version, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'upu-mongolia-addressing-unit-2019',
      sourceName: 'UPU Mongolia addressing unit reference',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/mngEn.pdf',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'UPU reference dated 2019-01 records a five-digit postcode syntax but does not state a bulk mapping reuse grant. The document is not downloaded, copied, or redistributed, and no example, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'international postcode-format reference; metadata only, not a current offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['Only the format pattern is represented.', 'No individual postcode or example address is retained.', 'The 2019 reference does not establish current mapping rights, version, coverage, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'mongol-post-designated-operator',
      sourceName: 'Mongol Post designated-operator reference',
      sourceUrl: 'https://mongolpost.mn/en/about',
      provider: 'Mongol Post JSC',
      licenseOrTerms: 'Official operator profile describes the national postal role and universal-service obligation. No postcode-mapping license or redistribution grant is recorded here, and no postal, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator authority reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The profile supplies institutional context for the postal operator.', 'This pack does not query, store, transform, or redistribute postal lookup results or delivery records.', 'Operator status alone does not establish mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'nsdi-mongolia-geospatial-distribution-rules',
      sourceName: 'Mongolia NSDI geospatial distribution rules',
      sourceUrl: 'https://nsdi.gov.mn/service-page/21',
      provider: 'General Authority for Land Administration, Geodesy and Cartography, Mongolia',
      licenseOrTerms: 'Official NSDI service page describes geospatial data as copyright-protected works customarily used under license agreements. No reusable boundary or administrative-key license is verified, and no boundary, key, geometry, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-geodata distribution-rules reference; metadata only, not a postal mapping or boundary dataset',
      transformedFields: [],
      confidenceNotes: ['No administrative geography is acquired without source-specific permission.', 'This pack retains only metadata and does not use an unlicensed substitute.', 'Administrative-geodata availability does not establish postal mapping coverage or delivery capability.'],
    }, {
      sourceId: 'mn-current-postcode-mapping-rights-coverage-and-correction-required',
      sourceName: 'Mongolia current postcode mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:mongolia-current-postcode-mapping-rights-coverage-and-correction-required',
      provider: 'Mongol Post or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current reusable mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['Official format guidance and operator references do not establish a reusable current mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until current rights, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'VE'
    ? [{
      sourceId: 'upu-venezuela-addressing-unit-2019',
      sourceName: 'UPU Venezuela addressing unit reference',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/venEn.pdf',
      provider: 'Universal Postal Union (UPU), addressing information supplied by IPOSTEL',
      licenseOrTerms: 'UPU reference document dated 2019-05; it records a four-digit postcode syntax but does not state a bulk mapping reuse grant. The document is not downloaded, copied, or redistributed, and no example, address, postcode, locality, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'operator-supplied four-digit postcode-format reference; metadata only, not a current offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The reference records four digits to the right of a locality name and cites IPOSTEL.', 'Only the format pattern is represented; no individual postcode or sample address is retained.', 'The 2019 reference does not establish current mapping rights, version, coverage, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'upu-venezuela-designated-operator',
      sourceName: 'UPU Venezuela designated postal operator entry',
      sourceUrl: 'https://www.upu.int/en/Postal-Solutions/Programmes-Services/Addressing-Solutions?cid=325&csid=20',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'Official international postal-operator directory; no postcode-mapping license or redistribution grant is recorded here, and no operator, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'designated-operator authority reference for IPOSTEL; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['UPU records IPOSTEL as Venezuela’s designated postal operator.', 'This pack does not query, store, transform, or redistribute postal lookup results or tracking data.', 'Operator designation alone does not establish mapping rights, current coverage, or delivery-point capability.'],
    }, {
      sourceId: 'salb-venezuela-authority-and-availability',
      sourceName: 'UN SALB Venezuela authority and data-availability entry',
      sourceUrl: 'https://salb.un.org/en/data/ven',
      provider: 'United Nations Second Administrative Level Boundaries (SALB)',
      licenseOrTerms: 'Official UN availability page identifies the national geospatial authority but reports no Venezuela geospatial datasets available. No boundary, administrative-key, geometry, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-geodata authority and availability reference; metadata only, not a postal mapping or boundary dataset',
      transformedFields: [],
      confidenceNotes: ['SALB reports no downloadable Venezuela geospatial dataset, so no administrative geography is acquired.', 'This pack retains only source metadata and does not use unlicensed substitutes.', 'Administrative authority metadata does not establish postcode mapping coverage or delivery capability.'],
    }, {
      sourceId: 've-current-postcode-mapping-rights-coverage-and-correction-required',
      sourceName: 'Venezuela current postcode mapping, rights, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:venezuela-current-postcode-mapping-rights-coverage-and-correction-required',
      provider: 'IPOSTEL or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current reusable mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The UPU records format and operator authority, but not a current reusable mapping.', 'Do not add postcode rows, administrative keys, boundary data, address matching, delivery coverage, or carrier claims until current rights, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'UY'
    ? [{
      sourceId: 'correo-uruguayo-postcode-search-status',
      sourceName: 'Correo Uruguayo postcode search service status',
      sourceUrl: 'https://www.correo.com.uy/codigospostales',
      provider: 'Administración Nacional de Correos (Correo Uruguayo)',
      licenseOrTerms: 'Official service page records a 2026-05-04 update and links to the open-data catalog. It does not grant reuse of search results, and no query, postcode, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'official postcode service-status and currentness reference; metadata only, not an offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The page records its own update date and identifies the official open-data catalog.', 'This pack does not query, store, transform, or redistribute service results.', 'Service status does not establish a reusable mapping, national coverage, correction workflow, or delivery capability.'],
    }, {
      sourceId: 'correo-uruguayo-postcode-open-data-catalog',
      sourceName: 'Correo Uruguayo Código Postal open-data catalog',
      sourceUrl: 'https://catalogodatos.gub.uy/dataset/correo-codigo-postal',
      provider: 'Correo Uruguayo, Unidad de Geomática via Catálogo de Datos Abiertos',
      licenseOrTerms: 'Catalog metadata records the Licencia de Datos Abiertos - Uruguay, version 1.0, and a one-off publication last updated 2023-08-16. The license permits reuse with provider, license, and dataset attribution. No KML, SHP, postcode-zone, geometry, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'licensed postcode-zone catalog evidence; metadata only because the listed 2023 resources predate the 2026 operational service update',
      transformedFields: [],
      confidenceNotes: ['The catalog documents a five-digit national postcode format and KML/SHP resources updated in August 2023.', 'The listed resource is intentionally not downloaded or ingested because the official operational page is newer and the catalog declares a one-off publication cadence.', 'A public license does not cure an unresolved currentness, coverage, or correction-path gap.'],
    }, {
      sourceId: 'ursec-postal-services-reference',
      sourceName: 'URSEC postal services reference',
      sourceUrl: 'https://www.gub.uy/unidad-reguladora-servicios-comunicaciones/servicios-postales-servicios-a-la-ciudadania',
      provider: 'Unidad Reguladora de Servicios de Comunicaciones (URSEC)',
      licenseOrTerms: 'Official regulatory reference; no postcode mapping or bulk redistribution terms are recorded here, and no postal-operator, locality, address, recipient, or location record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-regulatory and correction-channel reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['URSEC links to Correo Uruguayo postcode listings by locality and has a service for reporting errors or suggesting improvements.', 'This pack records no regulator listings, postal-office locations, operator records, or location data.', 'The reference does not establish a current reusable mapping or delivery-point coverage.'],
    }, {
      sourceId: 'uy-current-postcode-mapping-coverage-and-correction-required',
      sourceName: 'Uruguay current postcode mapping, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:uruguay-current-postcode-mapping-coverage-and-correction-required',
      provider: 'Correo Uruguayo or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The official catalog terms support attributable future reuse, but its listed resources are older than the operational service status.', 'Do not add postcode rows, zones, geometry, address matching, delivery coverage, or carrier claims until current mapping, coverage, version, and correction evidence are recorded.'],
    }]
    : countryCode === 'PY'
    ? [{
      sourceId: 'dinacopa-postcode-format-guidance',
      sourceName: 'DINACOPA Paraguay postcode format guidance',
      sourceUrl: 'https://correoparaguayo.gov.py/sitio/el-codigo-postal-es-importante-para-ubicar-las-direcciones-5/',
      provider: 'Dirección Nacional de Correos del Paraguay (DINACOPA)',
      licenseOrTerms: 'Official postcode guidance page; it documents the six-digit format but does not by itself grant bulk mapping distribution or delivery-coverage claims, and no postcode, locality, address, or location record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'authority-published six-digit postcode-format reference; metadata only, not an offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['DINACOPA describes six digits partitioned into department, district, and barrio/locality components.', 'This pack stores the format rule only and does not copy illustrative codes, locality records, address material, or location-aware query results.', 'Format guidance does not establish current mapping coverage or delivery capability.'],
    }, {
      sourceId: 'dinacopa-postcode-open-data-catalog',
      sourceName: 'DINACOPA Nuevo Codigo Postal del Paraguay open-data catalog',
      sourceUrl: 'https://www.datos.gov.py/search?query=+Postal',
      provider: 'Dirección Nacional de Correos del Paraguay (DINACOPA) via Datos.gov.py',
      licenseOrTerms: 'The official catalog lists CSV, XLSX, and postal-zone resources under the Paraguayan Government Public Information Use License; catalog metadata was modified 2023-08-11 and resource metadata 2023-04-03. No raw mapping, geometry, location, address, or recipient record is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'licensed postcode-table and postal-zone catalog evidence; metadata only until a current raw mapping is separately acquired and row-reviewed',
      transformedFields: [],
      confidenceNotes: ['Catalog metadata records data-table and postal-zone resource formats with an explicit government public-information license.', 'The public pack does not include the catalog resources or derived mapping rows.', 'Catalog metadata alone does not establish current coverage, correction workflow, or delivery-point capability.'],
    }, {
      sourceId: 'dinacopa-postcode-data-dictionary',
      sourceName: 'DINACOPA postal-zone data dictionary',
      sourceUrl: 'https://www.datos.gov.py/sites/default/files/Diccionario%20de%20Datos%20-%20ZONA%20POSTAL%20PARAGUAY.xlsx',
      provider: 'Dirección Nacional de Correos del Paraguay (DINACOPA) via Datos.gov.py',
      licenseOrTerms: 'Licensed under the Paraguayan Government Public Information Use License. A 12,261-byte schema dictionary snapshot was acquired outside public packs on 2026-07-23 and identified only administrative and postal-zone schema fields; no raw records, mapping rows, geometry, address, recipient, or precise-location data is bundled.',
      redistributionStatus: 'source-metadata-only',
      role: 'externally retained source-schema evidence for controlled mapping ingestion; not a public mapping dataset',
      transformedFields: [],
      confidenceNotes: ['The external snapshot SHA-256 is recorded in the readiness artifact for reproducibility.', 'Schema inspection permits administrative and postal-zone identifiers but rejects address, street, building, coordinate, and geometry fields before any mapping ingestion.', 'A dictionary validates shape, not mapping-row accuracy, current coverage, or delivery capability.'],
    }, {
      sourceId: 'ine-paraguay-admin-cartography',
      sourceName: 'INE Paraguay digital administrative cartography',
      sourceUrl: 'https://www.ine.gov.py/microdatos/cartografia-digital-2012.php',
      provider: 'Instituto Nacional de Estadística (INE), Paraguay',
      licenseOrTerms: 'Official cartography page under the Paraguayan Government Public Information Use License; no boundary, locality, road, block, address, or coordinate record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'administrative-boundary and locality-cartography reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['INE describes downloadable administrative-cartography layers and labels their political-administrative boundaries as referential.', 'This pack does not download, store, transform, or redistribute cartographic layers, boundaries, roads, blocks, or precise location data.', 'Administrative cartography does not establish postcode mapping coverage or carrier deliverability.'],
    }, {
      sourceId: 'py-current-postcode-mapping-coverage-and-correction-required',
      sourceName: 'Paraguay current postcode mapping, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:paraguay-current-postcode-mapping-coverage-and-correction-required',
      provider: 'Dirección Nacional de Correos del Paraguay (DINACOPA) or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The catalog license and isolated schema dictionary support a controlled future ingestion, but no mapping rows or current coverage were validated.', 'Do not add real postcode records, address matching, delivery coverage, or carrier claims until a current mapping, coverage evidence, and correction path are recorded.'],
    }]
    : countryCode === 'PE'
    ? [{
      sourceId: 'mtc-peru-national-postcode-guidance',
      sourceName: 'MTC Peru national postcode guidance',
      sourceUrl: 'https://www.gob.pe/es/521-consulta-tu-codigo-postal-nacional',
      provider: 'Ministerio de Transportes y Comunicaciones (MTC), Peru',
      licenseOrTerms: 'Official public guidance page; it states the five-digit format but does not grant a postcode-mapping dataset or delivery-coverage claim, and no postal, locality, or address record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'authority-published five-digit national postcode-format reference; metadata only, not an offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The MTC page was last changed on 2024-01-14 and states that the national postcode has five digits.', 'This pack records the format rule only and does not query the location-aware service or copy postcode, locality, address, or location records.', 'Format guidance does not establish current postcode mapping coverage or delivery capability.'],
    }, {
      sourceId: 'mtc-peru-postal-statistics-2022',
      sourceName: 'MTC postal-sector statistics 2022',
      sourceUrl: 'https://cdn.www.gob.pe/uploads/document/file/5212120/Bolet%C3%ADn%20Estad%C3%ADstico%20del%20Sector%20Postal%20del%20A%C3%B1o%202022.pdf?v=1696049618',
      provider: 'Ministerio de Transportes y Comunicaciones (MTC), Peru',
      licenseOrTerms: 'Official statistics publication; no bulk postcode-mapping license or redistribution grant is recorded here, and no statistics, postcode, locality, address, or geographic records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'national postcode structure and 2022 scope reference; metadata only, not a current offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The 2022 publication documents a five-digit national postcode structure and its official consultation service.', 'This pack stores no mapping rows, service results, location queries, addresses, or geographic coordinates.', 'A historic statistics publication does not establish a current reusable mapping, coverage, correction process, or carrier deliverability.'],
    }, {
      sourceId: 'mtc-peru-postcode-open-data',
      sourceName: 'MTC Peru postcode open-data catalog entry',
      sourceUrl: 'https://www.datosabiertos.gob.pe/dataset/mtc-codigo-postal-peru',
      provider: 'Ministerio de Transportes y Comunicaciones (MTC) via Plataforma Nacional de Datos Abiertos',
      licenseOrTerms: 'Catalog metadata records public access and the Open Data Commons Attribution License for an XLSX resource released and modified 2018-03-23; automated resource retrieval returned HTTP 403 on 2026-07-23, so no raw snapshot, table, or derived data is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'licensed open-data catalog evidence and controlled acquisition target; metadata only until a lawful raw snapshot is separately acquired and schema-reviewed',
      transformedFields: [],
      confidenceNotes: ['The catalog records a public MTC postcode dataset with an explicit attribution license.', 'The automated retrieval failure is recorded instead of bypassed; raw source material remains outside public packs and no data is derived.', 'The 2018 metadata does not establish current coverage, update cadence, correction path, or delivery-point capability.'],
    }, {
      sourceId: 'pe-current-postcode-mapping-required',
      sourceName: 'Peru current postcode mapping, coverage, and correction authority source',
      sourceUrl: 'source-metadata-only:peru-current-postcode-mapping-required',
      provider: 'Ministerio de Transportes y Comunicaciones (MTC) or authority-designated official publisher',
      licenseOrTerms: 'Not yet acquired and verified as a current mapping; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The cataloged open-data resource is explicitly licensed, but its raw content and current coverage were not validated after automated retrieval returned HTTP 403.', 'Do not add real postcode records, address matching, delivery coverage, or carrier claims until a current mapping, coverage evidence, and correction path are recorded.'],
    }]
    : countryCode === 'GW'
    ? [{
      sourceId: 'upu-guinea-bissau-addressing-unit',
      sourceName: 'UPU Guinea-Bissau Addressing Unit',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/GNBEn.pdf',
      provider: 'Universal Postal Union / Direccao General dos Correios, Guinea-Bissau',
      licenseOrTerms: 'UPU addressing reference; no postcode-mapping license or redistribution grant is recorded here, and no locality, postal, or address record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'authority-published four-digit postcode-format reference; metadata only, not an offline mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The UPU document states that four digits precede the locality name.', 'This pack records only the format rule and does not copy example addresses, locality mappings, or postal records.', 'The publication date is 03/2005, so it does not establish current mapping coverage or delivery capability.'],
    }, {
      sourceId: 'itu-upu-guinea-bissau-post-office-list',
      sourceName: 'ITU/UPU Guinea-Bissau postal-office reference',
      sourceUrl: 'https://www.itu.int/dms_pub/itu-t/oth/02/05/T02050000050001PDFE.pdf',
      provider: 'International Telecommunication Union / Universal Postal Union',
      licenseOrTerms: 'International postal reference document; no reusable postcode-mapping terms are recorded here, and no office, postal, contact, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator and post-office reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The document identifies Direccao Geral dos Correios as the postal entity and lists an international postal-office reference.', 'This pack does not copy, store, transform, or redistribute office, locality, telephone, postal, contact, or address records.', 'Office references do not establish a versioned reusable postcode mapping, rights, or delivery-point coverage.'],
    }, {
      sourceId: 'guinea-bissau-official-admin-division-reference',
      sourceName: 'Guinea-Bissau official administrative-division reference',
      sourceUrl: 'https://www.stat-guinebissau.com/Menu_principal/Pubica%C3%A7%C3%B5es/saude/Trabalho_Infantil.pdf',
      provider: 'Guinea-Bissau national statistics publication',
      licenseOrTerms: 'Official statistical publication; no data reuse or redistribution terms are recorded here, and no administrative or geographic records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'regions and autonomous-sector reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The publication describes the country administrative division into regions, autonomous sector, and sectors.', 'This pack does not store or transform administrative codes, geographic records, locality records, or addresses.', 'Administrative structure does not establish postal-code coverage, mapping rights, or delivery capability.'],
    }, {
      sourceId: 'gw-postcode-mapping-required',
      sourceName: 'Guinea-Bissau postcode mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:guinea-bissau-postcode-mapping-required',
      provider: 'Guinea-Bissau postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded format reference does not establish a current reusable postcode-to-locality mapping.', 'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'SZ'
    ? [{
      sourceId: 'eswatini-postcode-table',
      sourceName: 'EswatiniPost postcode table',
      sourceUrl: 'https://www.eswatinipost.co.sz/postcode.php',
      provider: 'EswatiniPost',
      licenseOrTerms: 'Official postcode table page; no data reuse, bulk-download, API, derived-data, or redistribution permission is recorded here, and no postcode or locality record is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official postcode table reference; metadata only, not an AGID lookup or offline postcode mapping dataset',
      transformedFields: [],
      confidenceNotes: ['The page describes Eswatini postcode entries and shows region-grouped codes.', 'This pack does not copy, store, transform, or redistribute postcode, locality, address, or delivery records.', 'The page does not establish a stable reusable format specification, mapping version, rights, coverage, or correction path.'],
    }, {
      sourceId: 'eswatini-post-designated-operator',
      sourceName: 'EswatiniPost designated postal operator reference',
      sourceUrl: 'https://www.eswatinipost.co.sz/about.php',
      provider: 'EswatiniPost',
      licenseOrTerms: 'Official institutional page; no postcode-mapping license or redistribution grant is recorded here, and no postal, tracking, contact, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'designated-postal-operator reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['EswatiniPost identifies itself as the licensed designated postal operator.', 'This pack does not query, store, transform, or redistribute tracking, postal, contact, recipient, or address records.', 'Operator status does not establish an offline reusable postcode mapping, rights, or delivery-point coverage.'],
    }, {
      sourceId: 'eswatini-government-postal-policy',
      sourceName: 'Government of Eswatini Directorate of Communications postal-policy mandate',
      sourceUrl: 'https://www.gov.sz/index.php/component/content/?Itemid=397&id=387',
      provider: 'Government of the Kingdom of Eswatini',
      licenseOrTerms: 'Government policy page; no postcode-mapping license or redistribution grant is recorded here, and no records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'government postal-policy reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The Directorate states a mandate covering postal-services policy and regulatory frameworks.', 'This pack stores source metadata only and does not include policy text, postal, recipient, or address records.', 'Policy mandate does not establish a reusable postcode format, mapping, or delivery-point coverage.'],
    }, {
      sourceId: 'sz-postcode-mapping-required',
      sourceName: 'Eswatini postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:eswatini-postcode-mapping-required',
      provider: 'Eswatini postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded official references do not establish an offline reusable postcode format or mapping.', 'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'LS'
    ? [{
      sourceId: 'lesotho-postal-services-government-reference',
      sourceName: 'Lesotho Postal Services government reference',
      sourceUrl: 'https://www.lena.gov.ls/e-service-structure-unveiled/',
      provider: 'Lesotho News Agency / Government of Lesotho',
      licenseOrTerms: 'Government news page; no postcode-mapping license or redistribution grant is recorded here, and no postal, contact, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-service institutional reference; metadata only, not a national postcode format, mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The government news agency identifies Lesotho Postal Services within its ministry.', 'This pack does not store or transform postal, contact, customer, recipient, or address records.', 'Institutional reference does not establish a reusable postcode mapping or delivery coverage.'],
    }, {
      sourceId: 'lesotho-communications-authority-postal-report',
      sourceName: 'Lesotho Communications Authority postal-sector annual report',
      sourceUrl: 'https://lca.org.ls/wp-content/uploads/filr/3963/LCA-ANNUAL-REPORT_2023-24_.pdf',
      provider: 'Lesotho Communications Authority',
      licenseOrTerms: 'Regulatory annual report; no postcode-mapping license or redistribution grant is recorded here, and no postal or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-sector regulatory reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['The report identifies Lesotho Post as the designated national postal operator.', 'This pack stores source metadata only and does not include report content, postal, recipient, or address records.', 'Operator designation does not establish an offline reusable postcode mapping, rights, or delivery-point coverage.'],
    }, {
      sourceId: 'un-salb-lesotho-admin-boundaries',
      sourceName: 'United Nations SALB validated Lesotho administrative boundaries',
      sourceUrl: 'https://salb.un.org/en/data/lso',
      provider: 'United Nations Second Administrative Level Boundaries programme / Lesotho national geospatial authority',
      licenseOrTerms: 'Publicly downloadable validated administrative-boundary dataset; terms of use require separate confirmation before acquisition or redistribution, and no geometry or attribute records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'validated administrative-boundary source candidate; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: ['SALB lists validated administrative units with temporal validity through 2024-06-24 and downloadable formats.', 'This pack does not download, store, transform, or redistribute boundary geometries, administrative records, locations, or address data.', 'Administrative boundaries do not establish postal-code coverage, format, mapping rights, or delivery capability.'],
    }, {
      sourceId: 'ls-postcode-mapping-required',
      sourceName: 'Lesotho postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:lesotho-postcode-mapping-required',
      provider: 'Lesotho postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: ['The recorded official references do not establish an offline reusable postcode format or mapping.', 'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.'],
    }]
    : countryCode === 'PA'
    ? [{
      sourceId: 'panama-national-postcode-system',
      sourceName: 'Sistema de Codigos Postales de Panama',
      sourceUrl: 'https://www.codigospostalespanama.gob.pa/',
      provider: 'Correos Panama / Correos y Telegrafos Nacionales de Panama',
      licenseOrTerms: 'Official postcode-system interface; no bulk-download, API, derived-data, or redistribution permission is recorded here, and no query result, geographic key, postal record, or address is bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'national postcode-system reference; metadata only, not an AGID lookup, offline postcode mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The official system supports search by province, district, and corregimiento and describes a full-code presentation.',
        'This pack does not query, store, transform, infer, or redistribute results, geographic keys, postal records, addresses, buildings, or points.',
        'Interface availability does not establish offline reuse rights, a stable format specification, mapping version, correction path, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'correos-panama-postal-services',
      sourceName: 'Correos Panama postal services',
      sourceUrl: 'https://www.correospanama.gob.pa/servicios-postales/',
      provider: 'Correos y Telegrafos Nacionales de Panama',
      licenseOrTerms: 'Official postal-service page; no postcode-mapping license or redistribution grant is recorded here, and no postal, tracking, contact, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator service reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The page identifies national postal services operated by Correos Panama.',
        'This pack does not query, store, transform, or redistribute postal, tracking, contact, or address records.',
        'Service availability does not establish a reusable postcode mapping, rights, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'panama-miambiente-admin-boundaries',
      sourceName: 'MiAmbiente Panama political-administrative boundary geoportal',
      sourceUrl: 'https://geoportal.miambiente.gob.pa/server/rest/services/Nodo_Caracteristica_General/MapServer/13',
      provider: 'Ministerio de Ambiente (MiAmbiente), Panama',
      licenseOrTerms: 'Official geoportal layer description; no data reuse or redistribution terms are recorded here, and no geometry, attribute, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official province, comarca, district, and corregimiento boundary reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The layer groups province/comarca, district, and corregimiento administrative levels and lists geospatial service formats.',
        'This pack does not query, store, transform, or redistribute geoportal records, geometries, layers, or address data.',
        'Administrative boundaries do not establish postal-code coverage, format, mapping rights, or delivery capability.',
      ],
    }, {
      sourceId: 'pa-postcode-mapping-required',
      sourceName: 'Panama postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:panama-postcode-mapping-required',
      provider: 'Panama postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: [
        'The recorded official interfaces and references do not establish an offline reusable postcode format or mapping.',
        'Do not add real postcode records, address matching, geographic-key inference, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.',
      ],
    }]
    : countryCode === 'SV'
    ? [{
      sourceId: 'el-salvador-postal-operator',
      sourceName: 'Direccion General de Correos de El Salvador',
      sourceUrl: 'https://www.correos.gob.sv/',
      provider: 'Direccion General de Correos, El Salvador',
      licenseOrTerms: 'Official service page; no postcode-mapping license or redistribution grant is recorded here, and no postal, tracking, contact, or address records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal-operator identity and service reference; metadata only, not a national postcode format, mapping, or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The official site identifies the Direccion General de Correos and presents postal services.',
        'This pack does not query, store, transform, or redistribute tracking, postal, contact, or address records.',
        'Operator availability does not establish a reusable postcode format, mapping, rights, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'sv-correos-institutional-framework',
      sourceName: 'Direccion General de Correos institutional framework',
      sourceUrl: 'https://www.correos.gob.sv/marco-institucional/',
      provider: 'Direccion General de Correos, El Salvador',
      licenseOrTerms: 'Official institutional page; no postcode-mapping license or redistribution grant is recorded here, and no legal or postal records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'postal governance reference; metadata only, not a postcode mapping or delivery-coverage dataset',
      transformedFields: [],
      confidenceNotes: [
        'The page describes the postal institution, legal and normative framework, and universal postal-service mission.',
        'This pack stores source metadata only and does not include legal text, postal records, addresses, or contact data.',
        'Postal governance does not establish an offline reusable postcode format, mapping, or delivery-point coverage.',
      ],
    }, {
      sourceId: 'sv-cnr-geographic-location-codes',
      sourceName: 'Centro Nacional de Registros geographic location codes',
      sourceUrl: 'https://www.cnr.gob.sv/codigos-de-ubicaciones-geograficas-nacionales/',
      provider: 'Centro Nacional de Registros (CNR), El Salvador',
      licenseOrTerms: 'Official geographic-code page; availability of GeoJSON and shapefile downloads does not state reuse or redistribution terms here, and no records are bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'official department, municipality, and canton code reference; metadata only, not a postcode mapping or address dataset',
      transformedFields: [],
      confidenceNotes: [
        'CNR describes official geographic codes through department, municipality, and canton levels and offers files for download.',
        'This pack does not download, store, transform, or redistribute CNR codes, names, geometries, or address data.',
        'Administrative geography does not establish postal-code coverage, postal format, mapping rights, or delivery capability.',
      ],
    }, {
      sourceId: 'sv-postcode-mapping-required',
      sourceName: 'El Salvador postcode format, mapping, rights, and update authority source',
      sourceUrl: 'source-metadata-only:el-salvador-postcode-mapping-required',
      provider: 'El Salvador postal authority or authority-designated official publisher',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for national postcode format claims, real postcode lookup, address-to-postcode matching, or delivery-point claims',
      transformedFields: [],
      confidenceNotes: [
        'The recorded official references do not establish an offline reusable postcode format or mapping.',
        'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, coverage, and correction evidence are recorded.',
      ],
    }]
    : countryCode === 'GT'
    ? [{
      sourceId: 'gt-ine-censo-2018-lugares-poblados',
      sourceName: 'Guatemala INE Censo 2018 - Lugares Poblados',
      sourceUrl: 'https://datos.ine.gob.gt/es/dataset/censo-2018-lugares-poblados',
      provider: 'Instituto Nacional de Estadistica (INE), Guatemala',
      licenseOrTerms: 'Creative Commons Attribution, as declared by the INE dataset page; raw records are not bundled',
      redistributionStatus: 'source-metadata-only',
      role: 'country-specific populated-place source candidate; metadata only, not a postal-code mapping or address dataset',
      transformedFields: [],
      confidenceNotes: [
        'The INE dataset page declares Creative Commons Attribution and describes populated-place data.',
        'This source does not establish a national postal-code mapping or delivery-point coverage.',
        'This pack contains only source metadata and no locality, household, dwelling, or address records from the dataset.',
      ],
    }, {
      sourceId: 'upu-universal-postcode-database',
      sourceName: 'UPU Universal POST*CODE Database',
      sourceUrl: 'https://www.upu.int/en/postal-solutions/programmes-services/addressing-solutions',
      provider: 'Universal Postal Union (UPU)',
      licenseOrTerms: 'UPU Universal POST*CODE Database license documents; catalog update 2026.1 is listed by UPU. Contract, non-disclosure agreement, data-use declaration, and rates apply; no access or data is acquired.',
      redistributionStatus: 'license-review-required',
      role: 'international licensed postcode reference candidate; metadata only, not Guatemala postal-authority evidence',
      transformedFields: [],
      confidenceNotes: [
        'UPU describes this as a global postcode database and publishes license material and update metadata.',
        'This pack does not obtain, query, store, transform, or redistribute UPU postcode records.',
        'A UPU candidate does not establish Guatemala authority, mapping coverage, or delivery-point evidence.',
      ],
    }, {
      sourceId: 'gt-postal-code-mapping-required',
      sourceName: 'Guatemala postal-code and delivery-point authority source',
      sourceUrl: 'source-metadata-only:guatemala-postal-code-mapping-required',
      provider: 'Guatemala postal authority or authority-designated official source',
      licenseOrTerms: 'Not yet verified; not bundled',
      redistributionStatus: 'not-bundled',
      role: 'required gate for any real postal-code mapping, address-to-postcode lookup, or delivery-point claim',
      transformedFields: [],
      confidenceNotes: [
        'The five-digit format alone does not prove a postcode-to-locality or delivery-point mapping.',
        'Do not add real postcode records, address matching, or carrier deliverability assertions until authority, license, version, and redistribution evidence are recorded.',
      ],
    }]
    : countryCode === 'KE'
      ? [{
        sourceId: 'posta-kenya',
        sourceName: 'Postal Corporation of Kenya post offices',
        sourceUrl: 'https://posta.co.ke/post-offices/',
        provider: 'Postal Corporation of Kenya (Posta Kenya)',
        licenseOrTerms: 'Official locator page; no postal-mapping data license or redistribution grant is recorded, and no locator records are bundled',
        redistributionStatus: 'source-metadata-only',
        role: 'official postal-operator locator candidate; metadata only, not a national postcode mapping or delivery-coverage dataset',
        transformedFields: [],
        confidenceNotes: [
          'The official page presents a post-office locator and links to terms and privacy material.',
          'This pack does not query, store, transform, or redistribute locator records.',
          'The locator page alone does not establish a versioned postcode-to-locality mapping, redistribution rights, or delivery-point coverage.',
        ],
      }]
      : countryCode === 'KH'
        ? [{
          sourceId: 'cambodia-post-location',
          sourceName: 'Cambodia Post location page',
          sourceUrl: 'https://cambodiapost.com.kh/location',
          provider: 'Cambodia Post',
          licenseOrTerms: 'Official location page with linked terms and privacy policy; no postal-mapping data license or redistribution grant is recorded, and no location records are bundled',
          redistributionStatus: 'source-metadata-only',
          role: 'official postal-operator location page; metadata only, not a national postcode format, mapping, or delivery-coverage dataset',
          transformedFields: [],
          confidenceNotes: [
            'The official page presents Cambodia Post location categories and linked terms and privacy material.',
            'This pack does not query, store, transform, or redistribute location records or displayed addresses.',
            'Public format signals on this page do not establish an authority-published national postal-code regex.',
          ],
        }, {
          sourceId: 'mptc-cambodia-post-autonomous-unit',
          sourceName: 'MPTC autonomous-unit listing for Cambodia Post',
          sourceUrl: 'https://mptc.gov.kh/en/',
          provider: 'Ministry of Post and Telecommunications, Cambodia',
          licenseOrTerms: 'Official ministry webpage; no postal-mapping data license or redistribution grant is recorded, and no raw records are bundled',
          redistributionStatus: 'source-metadata-only',
          role: 'government-to-postal-operator relationship evidence; metadata only, not postal-code mapping evidence',
          transformedFields: [],
          confidenceNotes: [
            'The ministry webpage lists Cambodia Post among its autonomous units.',
            'This pack records only source metadata and does not infer a postal-code format, mapping coverage, or deliverability from that relationship.',
          ],
        }]
        : countryCode === 'LA'
          ? [{
            sourceId: 'laos-postal-service-postcode-page',
            sourceName: 'Laos Postal Service postcode page',
            sourceUrl: 'https://www.laopost.com.la/about/postcode',
            provider: 'Laos Postal Service',
            licenseOrTerms: 'Official postcode webpage; no postal-mapping data license or redistribution grant is recorded, and no postcode or location records are bundled',
            redistributionStatus: 'source-metadata-only',
            role: 'official postal-operator postcode page; metadata only, not a national postcode regex, mapping, or delivery-coverage dataset',
            transformedFields: [],
            confidenceNotes: [
              'The official postal-service site exposes a postcode page and postal-service navigation.',
              'This pack does not query, store, transform, or redistribute the page content, postcode records, branch records, or displayed addresses.',
              'The page alone does not establish a reusable national format, a versioned mapping, or redistribution rights.',
            ],
          }, {
            sourceId: 'lao-postal-law-post-code-definition',
            sourceName: 'Lao Law on Postal Services, Article 11 post-code definition',
            sourceUrl: 'https://www.laotradeportal.gov.la/en-gb/site/display/1164',
            provider: 'Lao Trade Portal publication of Law No. 45/NA',
            licenseOrTerms: 'Published legal text; no postal mapping or derived-data redistribution grant is recorded',
            redistributionStatus: 'source-metadata-only',
            role: 'legal postal-code governance evidence; metadata only, not a published postcode-to-locality mapping',
            transformedFields: [],
            confidenceNotes: [
              'Article 11 defines post codes as delivery geography indicators and assigns the Ministry of Post and Telecommunications a role in defining them with relevant authorities.',
              'This pack records the legal source metadata only and does not infer a fixed national regex, mapping coverage, or delivery-point evidence.',
            ],
          }]
          : countryCode === 'MM'
            ? [{
              sourceId: 'myanmar-post-postcode-search',
              sourceName: 'Myanmar Post postcode-search screen',
              sourceUrl: 'https://myanmarpost.com.mm/search-post',
              provider: 'Myanmar Post',
              licenseOrTerms: 'Official postcode-search webpage; no postal-mapping data license or redistribution grant is recorded, and no search results or records are queried or bundled',
              redistributionStatus: 'source-metadata-only',
              role: 'official postal-operator postcode-search surface; metadata only, not a national postcode regex, mapping, or operational-coverage dataset',
              transformedFields: [],
              confidenceNotes: [
                'The official page exposes a postcode-search screen; this pack never submits a query or stores a result.',
                'This pack does not query, store, transform, or redistribute postcode, address, locality, branch, recipient, or delivery-point records.',
                'The screen alone does not establish a reusable national format, a versioned mapping, redistribution rights, or current operational coverage.',
              ],
            }, {
              sourceId: 'motc-myanmar-post-government-site-list',
              sourceName: 'Ministry of Transport and Communications government-site listing for Myanmar Post',
              sourceUrl: 'https://www.motc.gov.mm/government-website-list',
              provider: 'Ministry of Transport and Communications, Myanmar',
              licenseOrTerms: 'Official government website list; no postal mapping or derived-data redistribution grant is recorded',
              redistributionStatus: 'source-metadata-only',
              role: 'government-to-postal-operator website relationship evidence; metadata only, not postcode mapping evidence',
              transformedFields: [],
              confidenceNotes: [
                'The ministry page lists Myanmar Post and links to myanmarpost.com.mm.',
                'This pack records only source metadata and does not infer national format, mapping coverage, operational availability, or deliverability from the listing.',
              ],
            }]
            : countryCode === 'NP'
              ? [{
                sourceId: 'nepal-post-national-postal-codes',
                sourceName: 'Nepal Postal Service national postal-codes publication',
                sourceUrl: 'https://nepalpost.gov.np/content/1716/1716-postal-codes-of-nepal/',
                provider: 'Department of Postal Service, Government of Nepal',
                licenseOrTerms: 'Official national postal-code publication page; no mapping data license or redistribution grant is recorded, and neither its PDF nor postal-code records are bundled',
                redistributionStatus: 'source-metadata-only',
                role: 'official national postal-code publication surface; metadata only, not a reusable national regex, mapping, or delivery-coverage dataset',
                transformedFields: [],
                confidenceNotes: [
                  'The Department of Postal Service hosts a national postal-codes publication page.',
                  'This pack does not download, read, store, transform, or redistribute the linked PDF, postal-code records, locality records, or displayed addresses.',
                  'The publication page alone does not establish a machine-readable national format, a versioned mapping, or redistribution rights.',
                ],
              }, {
                sourceId: 'pokhara-postal-directorate-postal-code-2025',
                sourceName: 'Postal Directorate Pokhara postal-code 2025 publication',
                sourceUrl: 'https://pokhara.nepalpost.gov.np/content/12/postal-code--2025/',
                provider: 'Postal Directorate Pokhara, Department of Postal Service, Government of Nepal',
                licenseOrTerms: 'Official regional postal-code publication page; no mapping data license or redistribution grant is recorded, and neither its PDF nor postal-code records are bundled',
                redistributionStatus: 'source-metadata-only',
                role: 'official regional publication and recency signal; metadata only, not a national mapping or delivery-coverage dataset',
                transformedFields: [],
                confidenceNotes: [
                  'The official postal directorate page publishes a postal-code item labeled 2025.',
                  'This pack records page metadata only and does not download, read, store, transform, or redistribute its linked document or postal records.',
                  'A regional publication does not establish national format scope, mapping completeness, or reuse rights.',
                ],
              }, {
                sourceId: 'parbat-district-post-new-postal-code-notice',
                sourceName: 'District Post Office Parbat new postal-code notice',
                sourceUrl: 'https://parbat.nepalpost.gov.np/content/13299/information-of-a-new-postal-cord-/',
                provider: 'District Post Office Parbat, Department of Postal Service, Government of Nepal',
                licenseOrTerms: 'Official district postal-code notice page; no mapping data license or redistribution grant is recorded, and neither its PDF nor postal-code records are bundled',
                redistributionStatus: 'source-metadata-only',
                role: 'official postal-code change-notice surface; metadata only, not a national mapping or change-feed dataset',
                transformedFields: [],
                confidenceNotes: [
                  'The official district post office page presents a notice titled as new postal-code information.',
                  'This pack records page metadata only and does not download, read, store, transform, or redistribute the linked notice, postal records, or displayed addresses.',
                  'A change notice without an authoritative machine-readable delta, version, scope, rights, and correction policy cannot support lookup or autofill.',
                ],
              }]
              : countryCode === 'PK'
                ? [{
                  sourceId: 'pakistan-post-postcode-directory',
                  sourceName: 'Pakistan Post post-code directory',
                  sourceUrl: 'https://pakpost.gov.pk/postcodes.php',
                  provider: 'Pakistan Post',
                  licenseOrTerms: 'Official post-code directory webpage; no postal-mapping data license or redistribution grant is recorded, and neither directory records nor linked downloads are bundled',
                  redistributionStatus: 'source-metadata-only',
                  role: 'official postal-operator post-code directory surface; metadata only, not a reusable national regex, mapping, or delivery-coverage dataset',
                  transformedFields: [],
                  confidenceNotes: [
                    'The official Pakistan Post page presents a post-code directory and links to downloadable delivery and non-delivery directory material.',
                    'This pack does not download, read, query, store, transform, or redistribute directory records, linked documents, locality records, or displayed addresses.',
                    'The page alone does not establish a machine-readable national format specification, a versioned mapping, redistribution rights, or current operational coverage.',
                  ],
                }]
                : countryCode === 'TZ'
                  ? [{
                    sourceId: 'tcra-tanzania-postcode',
                    sourceName: 'Tanzania Communications Regulatory Authority postcode service',
                    sourceUrl: 'https://address.tcra.go.tz/services/postcode',
                    provider: 'Tanzania Communications Regulatory Authority (TCRA)',
                    licenseOrTerms: 'Official regulator service page; no postcode-mapping data license or redistribution grant is recorded, and no search, map, or postcode records are bundled',
                    redistributionStatus: 'source-metadata-only',
                    role: 'official national postcode policy and format evidence; metadata only, not a reusable postcode mapping or delivery-coverage dataset',
                    transformedFields: [],
                    confidenceNotes: [
                      'The official TCRA service describes its statutory postcode role and a five-digit numeric national format.',
                      'This pack does not submit queries or download, read, store, transform, or redistribute postcode lists, maps, locality records, or displayed addresses.',
                      'Format evidence alone does not establish a versioned mapping, redistribution rights, operational coverage, or delivery-point validity.',
                    ],
                  }, {
                    sourceId: 'tcra-tanzania-postcode-list-publication',
                    sourceName: 'TCRA publication of postcode list notice',
                    sourceUrl: 'https://tcra.go.tz/services/publication-of-postcode-list',
                    provider: 'Tanzania Communications Regulatory Authority (TCRA)',
                    licenseOrTerms: 'Official regulator publication notice; no postcode-list or derived-data redistribution grant is recorded, and no list records are bundled',
                    redistributionStatus: 'source-metadata-only',
                    role: 'official postcode-list publication provenance; metadata only, not a reusable list or change-feed dataset',
                    transformedFields: [],
                    confidenceNotes: [
                      'The TCRA notice records publication of a Tanzania postcode list under a government gazette notice.',
                      'This pack records notice metadata only and does not download, read, store, transform, or redistribute the list, locality records, or displayed addresses.',
                      'A publication notice does not supply current list versioning, field-level reuse rights, correction cadence, or operational-coverage evidence.',
                    ],
                  }]
                  : countryCode === 'UG'
                    ? [{
                      sourceId: 'posta-uganda-postal-address',
                      sourceName: 'Posta Uganda postal-address service',
                      sourceUrl: 'https://ugapost.co.ug/our-services/physical-address/',
                      provider: 'Uganda Post Limited (Posta Uganda)',
                      licenseOrTerms: 'Official postal-operator service webpage; no postal-mapping data license or redistribution grant is recorded, and no postal-address, box, location, or service records are bundled',
                      redistributionStatus: 'source-metadata-only',
                      role: 'official postal-address service provenance; metadata only, not a national postal-code regex, reusable mapping, or delivery-coverage dataset',
                      transformedFields: [],
                      confidenceNotes: [
                        'The official Posta Uganda page describes postal addresses as boxes associated with post-office stations.',
                        'This pack records page metadata only and does not apply, query, store, transform, or redistribute postal-address, box, location, recipient, or delivery-point records.',
                        'The service page does not establish a national postcode syntax, a versioned mapping, redistribution rights, or current operational coverage.',
                      ],
                    }]
            : [];
  const officialSources: AgidPostalCountryPackSource[] = officialMunicipalityDataset
    ? officialMunicipalityDataset.sourceCatalog.map(source => ({
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      provider: source.provider,
      licenseOrTerms: source.licenseOrTerms,
      redistributionStatus: source.redistributionStatus === 'allowed'
        ? 'agid-metadata-redistributable'
        : source.redistributionStatus === 'metadata-only'
          ? 'source-metadata-only'
          : source.redistributionStatus === 'review-required'
            ? 'license-review-required'
            : 'not-bundled',
      role: officialDatasetSourceRole(source),
      transformedFields: officialDatasetTransformedFields(source),
      confidenceNotes: officialDatasetConfidenceNotes(source),
    }))
    : [];

  return [...baseSources, ...countrySpecificSources, ...officialSources];
}

function createLicenseLedger(countryCode: string): AgidPostalCountryPackLicenseEntry[] {
  const countrySpecificEntries: AgidPostalCountryPackLicenseEntry[] = countryCode === 'GT'
    ? [{
      subject: 'Guatemala INE Censo 2018 - Lugares Poblados source metadata',
      licenseOrTerms: 'Creative Commons Attribution, as declared by the INE dataset page',
      redistribution: 'metadata-only',
      notes: 'This release records source metadata only. It does not bundle locality, household, dwelling, postal-code, or address records; verify attribution, version, and field-level suitability before any derived publication.',
    }, {
      subject: 'UPU Universal POST*CODE Database candidate metadata',
      licenseOrTerms: 'UPU Universal POST*CODE Database license documents; contract and data-use review required',
      redistribution: 'review-required',
      notes: 'Only candidate metadata is recorded. No UPU credentials, samples, postcode records, address records, derived outputs, or license acceptance is included. This is not a substitute for Guatemala postal-authority evidence.',
    }, {
      subject: 'Guatemala real postal-code and delivery-point mapping',
      licenseOrTerms: 'Not yet verified',
      redistribution: 'not-bundled',
      notes: 'No real postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, or derived equivalent is included until a country-specific authority source and redistribution evidence are recorded.',
    }]
    : countryCode === 'KE'
      ? [{
        subject: 'Posta Kenya post-office locator source metadata',
        licenseOrTerms: 'Official locator page; page terms are linked but no data reuse or redistribution grant is recorded',
        redistribution: 'metadata-only',
        notes: 'This release records source metadata only. It does not query, bundle, or derive locator, postcode, address, post-office, recipient, or delivery-point records. Verify reuse rights, version, coverage, and correction policy before any derived publication.',
      }, {
        subject: 'Kenya real postcode and delivery-point mapping',
        licenseOrTerms: 'Not yet verified',
        redistribution: 'not-bundled',
        notes: 'No real postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, or derived equivalent is included until versioned mapping, redistribution, and freshness evidence are recorded.',
      }]
      : countryCode === 'KH'
        ? [{
          subject: 'Cambodia Post location and MPTC relationship source metadata',
          licenseOrTerms: 'Official operator and ministry webpages; terms and reuse rights for postal mapping are not recorded',
          redistribution: 'metadata-only',
          notes: 'This release records source metadata only. It does not query, bundle, or derive location, postcode, address, post-office, recipient, or delivery-point records. The webpages do not establish a national postal-code format or mapping reuse right.',
        }, {
          subject: 'Cambodia national postal-code format and delivery-point mapping',
          licenseOrTerms: 'Not yet verified',
          redistribution: 'not-bundled',
          notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, or derived equivalent is included until authority, version, redistribution, and correction evidence are recorded.',
        }]
        : countryCode === 'LA'
          ? [{
            subject: 'Laos Postal Service postcode page and postal-law source metadata',
            licenseOrTerms: 'Official postal-service webpage and published legal text; reuse rights for postal mapping are not recorded',
            redistribution: 'metadata-only',
            notes: 'This release records source metadata only. It does not query, bundle, or derive postcode, branch, address, recipient, or delivery-point records. The sources do not provide a reusable national regex or mapping reuse right.',
          }, {
            subject: 'Laos national postal-code format and delivery-point mapping',
            licenseOrTerms: 'Not yet verified',
            redistribution: 'not-bundled',
            notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, or derived equivalent is included until authority, version, redistribution, and correction evidence are recorded.',
          }]
          : countryCode === 'MM'
            ? [{
              subject: 'Myanmar Post postcode-search and ministry website-list source metadata',
              licenseOrTerms: 'Official postal-operator and government webpages; reuse rights for postal mapping are not recorded',
              redistribution: 'metadata-only',
              notes: 'This release records source metadata only. It does not submit search queries or bundle, derive, or retain postcode, address, locality, recipient, branch, or delivery-point records. The sources do not provide a reusable national regex or mapping reuse right.',
            }, {
              subject: 'Myanmar national postal-code format and delivery-point mapping',
              licenseOrTerms: 'Not yet verified',
              redistribution: 'not-bundled',
              notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, operational-coverage assertion, or derived equivalent is included until authority, version, redistribution, coverage, and correction evidence are recorded.',
            }]
            : countryCode === 'NP'
              ? [{
                subject: 'Nepal Postal Service national, regional, and change-notice source metadata',
                licenseOrTerms: 'Official Department of Postal Service webpages; reuse rights for postal mapping and linked documents are not recorded',
                redistribution: 'metadata-only',
                notes: 'This release records source metadata only. It does not download, query, bundle, derive, or retain postal-code, address, locality, recipient, branch, or delivery-point records. The webpages do not provide a reusable national regex or mapping reuse right.',
              }, {
                subject: 'Nepal national postal-code format and delivery-point mapping',
                licenseOrTerms: 'Not yet verified',
                redistribution: 'not-bundled',
                notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, operational-coverage assertion, or derived equivalent is included until authority, version, redistribution, coverage, and correction evidence are recorded.',
              }]
              : countryCode === 'PK'
                ? [{
                  subject: 'Pakistan Post post-code directory source metadata',
                  licenseOrTerms: 'Official Pakistan Post webpage; reuse rights for postal mapping and linked documents are not recorded',
                  redistribution: 'metadata-only',
                  notes: 'This release records source metadata only. It does not download, query, bundle, derive, or retain postal-code, address, locality, recipient, branch, or delivery-point records. The directory page does not provide a reusable national regex or mapping reuse right.',
                }, {
                  subject: 'Pakistan national postal-code format and delivery-point mapping',
                  licenseOrTerms: 'Not yet verified',
                  redistribution: 'not-bundled',
                  notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, operational-coverage assertion, or derived equivalent is included until authority, version, redistribution, coverage, and correction evidence are recorded.',
                }]
                : countryCode === 'TZ'
                  ? [{
                    subject: 'TCRA Tanzania postcode service and publication-notice metadata',
                    licenseOrTerms: 'Official regulator webpages; reuse rights for postcode mappings, lists, and linked records are not recorded',
                    redistribution: 'metadata-only',
                    notes: 'This release records format and source metadata only. It does not query, bundle, derive, or retain postcode, address, locality, recipient, map, or delivery-point records. The webpages do not provide mapping reuse rights.',
                  }, {
                    subject: 'Tanzania postcode mapping and delivery-point coverage',
                    licenseOrTerms: 'Not yet verified',
                    redistribution: 'not-bundled',
                    notes: 'The national five-digit format is recorded as format-only evidence. No postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, operational-coverage assertion, or derived equivalent is included until version, redistribution, coverage, and correction evidence are recorded.',
                  }]
                  : countryCode === 'UG'
                    ? [{
                      subject: 'Posta Uganda postal-address service source metadata',
                      licenseOrTerms: 'Official Uganda Post Limited webpage; reuse rights for postal-address or postal-code data are not recorded',
                      redistribution: 'metadata-only',
                      notes: 'This release records source metadata only. It does not apply, query, bundle, derive, or retain postal-address, box, postcode, locality, recipient, branch, or delivery-point records. The service page does not provide a reusable national regex or mapping reuse right.',
                    }, {
                      subject: 'Uganda national postal-code format and delivery-point mapping',
                      licenseOrTerms: 'Not yet verified',
                      redistribution: 'not-bundled',
                      notes: 'No fixed national regex, postcode mapping, address-to-postcode lookup, delivery-point record, carrier response, operational-coverage assertion, or derived equivalent is included until authority, version, redistribution, coverage, and correction evidence are recorded.',
                    }]
            : [];

  return [
    {
      subject: 'AGID-created country pack metadata',
      licenseOrTerms: 'Apache-2.0',
      redistribution: 'allowed',
      notes: 'Includes manifest, synthetic locality fixtures, VPL seeds, generated test vectors, and safety rules.',
    },
    {
      subject: 'Official postal, boundary, road, population, and locality datasets',
      licenseOrTerms: 'source-specific',
      redistribution: 'metadata-only',
      notes: 'Do not bundle raw official records unless a separate DATA_LICENSES entry permits redistribution.',
    },
    {
      subject: 'Open map provider extracts',
      licenseOrTerms: 'source-specific',
      redistribution: 'review-required',
      notes: 'OSM, Overture, Natural Earth, GeoNames, and similar data must be reviewed per source before bundling.',
    },
    ...countrySpecificEntries,
  ];
}

function createAdminBoundaryIndex(localities: AgidPostalCountryPackLocality[]): AgidPostalCountryPackAdminBoundary[] {
  return localities
    .filter(locality => locality.kind !== 'block')
    .map(locality => ({
      boundaryId: stablePackId('boundary', locality.localityId),
      localityId: locality.localityId,
      label: locality.name,
      boundaryClass: locality.kind === 'municipality' ? 'municipality' : 'town',
      geometryRef: `source-required://${locality.localityId}`,
      sourceId: 'official-boundary-required',
      precision: 'official-required',
    }));
}

function createLandformIndex(
  workspace: PostalZoneDesignerWorkspace,
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackLandform[] {
  const municipalityIds = localityChoices.map(choice => choice.id);
  if (workspace.country.terrain === 'archipelago') {
    return [
      {
        landformId: stablePackId(workspace.country.code, 'main-island'),
        label: 'Main island delivery area',
        kind: 'island',
        relatedLocalityIds: municipalityIds.slice(0, 1),
        sourceId: 'open-map-evidence-slot',
      },
      {
        landformId: stablePackId(workspace.country.code, 'outer-islands'),
        label: 'Outer island delivery area',
        kind: 'island',
        relatedLocalityIds: municipalityIds.slice(1),
        sourceId: 'open-map-evidence-slot',
      },
      {
        landformId: stablePackId(workspace.country.code, 'harbor-market'),
        label: 'Harbor and market corridor',
        kind: 'harbor',
        relatedLocalityIds: municipalityIds,
        sourceId: 'open-map-evidence-slot',
      },
    ];
  }
  if (workspace.country.terrain === 'desert') {
    return [{
      landformId: stablePackId(workspace.country.code, 'route-corridor'),
      label: 'Road corridor and oasis delivery skeleton',
      kind: 'desert-corridor',
      relatedLocalityIds: municipalityIds,
      sourceId: 'open-map-evidence-slot',
    }];
  }
  return [{
    landformId: stablePackId(workspace.country.code, 'mixed-terrain'),
    label: 'Mixed administrative and settlement terrain',
    kind: 'mixed',
    relatedLocalityIds: municipalityIds,
    sourceId: 'open-map-evidence-slot',
  }];
}

function createSettlementClusters(
  workspace: PostalZoneDesignerWorkspace,
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackSettlementCluster[] {
  return localityChoices.flatMap((municipality, municipalityIndex) => (
    municipality.towns.slice(0, 2).map((town, townIndex) => ({
      clusterId: stablePackId(workspace.country.code, 'cluster', municipality.id, town.id),
      label: `${municipality.name} / ${town.name}`,
      localityId: town.id,
      agidCellSeed: `${workspace.country.code}:${municipality.codePart}:${town.codePart}:${municipalityIndex + 1}${townIndex + 1}`,
      deliveryHints: [
        'confirm-official-boundary-before-pilot',
        'keep-visible-code-municipality-scoped',
        workspace.country.terrain === 'archipelago' ? 'check-port-or-ferry-route' : 'check-road-route',
      ],
      publicPrecision: 'town' as const,
    }))
  ));
}

function createVplSeeds(
  workspace: PostalZoneDesignerWorkspace,
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackVplSeed[] {
  const codes = workspace.virtualLocalityCodes.codes;
  return localityChoices.slice(0, Math.max(1, Math.min(codes.length, 6))).map((municipality, index) => ({
    vplId: stablePackId(workspace.country.code, 'vpl', String(index + 1)),
    label: `${municipality.name} synthetic postal locality ${index + 1}`,
    nonAdministrative: true,
    localityId: municipality.id,
    codeSeed: codes[index] || `${workspace.country.code}-VPL-${index + 1}`,
    reasons: [
      'reduce-address-ambiguity',
      'support-draft-postal-zone-design',
      workspace.country.terrain === 'archipelago' ? 'separate-island-delivery-context' : 'separate-local-delivery-context',
    ],
    status: 'draft',
  }));
}

function packRecordVolume(workspace: PostalZoneDesignerWorkspace) {
  const populationFactor = Math.ceil(Math.log10(Math.max(10, workspace.country.population)) * 18);
  const terrainFactor = workspace.country.terrain === 'archipelago'
    ? 64
    : workspace.country.terrain === 'desert'
      ? 48
      : workspace.country.terrain === 'mountain'
        ? 42
        : 36;
  const packFactor = workspace.designPlan.classification.class === 'C' ? 72 : 36;
  return Math.max(144, Math.min(384, populationFactor + terrainFactor + packFactor));
}

function coordinateOffset(index: number, axis: 'lat' | 'lng') {
  const ring = Math.floor(index / 16);
  const slot = index % 16;
  const radius = 0.045 + ring * 0.017;
  const angle = ((slot * 22.5) + (axis === 'lat' ? 0 : 11.25)) * Math.PI / 180;
  return Number((Math.sin(angle) * radius).toFixed(6));
}

function areaClassFor(workspace: PostalZoneDesignerWorkspace, index: number): AgidPostalCountryPackPlanningCell['areaClass'] {
  if (workspace.country.terrain === 'archipelago') return index % 5 === 0 ? 'island' : index % 3 === 0 ? 'remote' : 'peri-urban';
  if (workspace.country.terrain === 'desert') return index % 4 === 0 ? 'corridor' : index % 3 === 0 ? 'remote' : 'rural';
  if (workspace.country.terrain === 'mountain') return index % 4 === 0 ? 'remote' : index % 2 === 0 ? 'rural' : 'peri-urban';
  return index % 5 === 0 ? 'urban-core' : index % 3 === 0 ? 'rural' : 'peri-urban';
}

function createPlanningCellIndex(
  workspace: PostalZoneDesignerWorkspace,
  vplSeedRegions: AgidPostalCountryPackVplSeed[],
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackPlanningCell[] {
  const townLocalities = localityChoices.flatMap(municipality => municipality.towns);
  const count = packRecordVolume(workspace);
  return Array.from({ length: count }, (_, index) => {
    const municipality = localityChoices[index % localityChoices.length];
    const town = townLocalities[index % townLocalities.length] || municipality.towns[0];
    const vpl = vplSeedRegions[index % Math.max(1, vplSeedRegions.length)] || null;
    const lat = Math.max(-89.9, Math.min(89.9, Number((workspace.country.lat + coordinateOffset(index, 'lat')).toFixed(6))));
    const lng = Number((((workspace.country.lng + coordinateOffset(index, 'lng') + 540) % 360) - 180).toFixed(6));
    return {
      cellId: stablePackId(workspace.country.code, 'planning-cell', String(index + 1).padStart(4, '0')),
      agid: encodeAGID(lat, lng).id,
      localityId: town.id,
      vplId: vpl?.vplId || null,
      centroid: { lat, lng },
      codeSeed: `${workspace.country.code}-${municipality.codePart}-${town.codePart}-${String(index + 1).padStart(3, '0')}`,
      routeBucket: `${workspace.country.code}-route-${String((index % 12) + 1).padStart(2, '0')}`,
      areaClass: areaClassFor(workspace, index),
      publicPrecision: index % 7 === 0 ? 'municipality' : 'town',
      sourceId: 'agid-synthetic-country-pack-fixtures',
      noRawAddress: true,
    };
  });
}

function routeModeFor(workspace: PostalZoneDesignerWorkspace, index: number): AgidPostalCountryPackRouteEvidence['mode'] {
  if (workspace.country.terrain === 'archipelago') return index % 3 === 0 ? 'ferry' : index % 3 === 1 ? 'port' : 'air';
  if (workspace.country.terrain === 'desert') return index % 2 === 0 ? 'corridor' : 'road';
  if (workspace.country.terrain === 'mountain') return index % 3 === 0 ? 'corridor' : 'road';
  return index % 5 === 0 ? 'mixed' : 'road';
}

function createRouteEvidenceIndex(
  workspace: PostalZoneDesignerWorkspace,
  planningCellIndex: AgidPostalCountryPackPlanningCell[],
): AgidPostalCountryPackRouteEvidence[] {
  const count = Math.max(24, Math.min(96, Math.ceil(planningCellIndex.length / 4)));
  return Array.from({ length: count }, (_, index) => {
    const fromCell = planningCellIndex[index % planningCellIndex.length];
    const toCell = planningCellIndex[(index * 7 + 11) % planningCellIndex.length];
    const mode = routeModeFor(workspace, index);
    return {
      routeId: stablePackId(workspace.country.code, 'route-evidence', String(index + 1).padStart(3, '0')),
      label: `${workspace.country.code} ${mode} evidence slot ${index + 1}`,
      fromLocalityId: fromCell.localityId,
      toLocalityId: toCell.localityId,
      mode,
      evidenceRef: `source-required://${workspace.country.code}/route/${String(index + 1).padStart(3, '0')}`,
      sourceId: 'open-map-evidence-slot',
      status: 'source-required',
      riskFlags: [
        mode === 'ferry' || mode === 'port' ? 'weather-or-port-dependency' : 'confirm-road-passability',
        workspace.country.terrain === 'desert' ? 'long-distance-route-review' : 'local-route-review',
      ],
    };
  });
}

function confidenceBand(score: number): AgidPostalCountryPackQualityEvidence['confidenceBand'] {
  if (score >= 0.76) return 'high';
  if (score >= 0.56) return 'medium';
  return 'low';
}

function createQualityEvidenceIndex(
  workspace: PostalZoneDesignerWorkspace,
  planningCellIndex: AgidPostalCountryPackPlanningCell[],
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackQualityEvidence[] {
  const municipalityEvidence = localityChoices.map((municipality, index) => {
    const addressQuality = Number(Math.max(0.22, Math.min(0.92, workspace.profile.dataQuality.address - 0.02 + index * 0.006)).toFixed(2));
    const boundaryQuality = Number(Math.max(0.22, Math.min(0.94, workspace.profile.dataQuality.boundary - 0.01 + index * 0.004)).toFixed(2));
    const routeQuality = Number(Math.max(0.2, Math.min(0.9, workspace.profile.dataQuality.road - 0.015 + index * 0.005)).toFixed(2));
    const populationQuality = Number(Math.max(0.2, Math.min(0.9, workspace.profile.dataQuality.population - 0.01 + index * 0.004)).toFixed(2));
    const average = (addressQuality + boundaryQuality + routeQuality + populationQuality) / 4;
    return {
      evidenceId: stablePackId(workspace.country.code, 'quality', municipality.id),
      subjectId: municipality.id,
      subjectType: 'municipality' as const,
      addressQuality,
      boundaryQuality,
      routeQuality,
      populationQuality,
      confidenceBand: confidenceBand(average),
      verificationRequired: true as const,
      notes: [
        'synthetic-planning-quality-slot',
        'replace-with-reviewed-official-or-open-data-before-pilot',
      ],
    };
  });

  const planningEvidence = planningCellIndex
    .filter((_, index) => index % 6 === 0)
    .slice(0, 72)
    .map((cell, index) => {
      const areaPenalty = cell.areaClass === 'remote' ? 0.12 : cell.areaClass === 'corridor' ? 0.08 : 0.03;
      const addressQuality = Number(Math.max(0.18, workspace.profile.dataQuality.address - areaPenalty).toFixed(2));
      const boundaryQuality = Number(Math.max(0.18, workspace.profile.dataQuality.boundary - areaPenalty / 2).toFixed(2));
      const routeQuality = Number(Math.max(0.18, workspace.profile.dataQuality.road - areaPenalty).toFixed(2));
      const populationQuality = Number(Math.max(0.18, workspace.profile.dataQuality.population - areaPenalty / 2).toFixed(2));
      const average = (addressQuality + boundaryQuality + routeQuality + populationQuality) / 4;
      return {
        evidenceId: stablePackId(workspace.country.code, 'quality-cell', String(index + 1).padStart(3, '0')),
        subjectId: cell.cellId,
        subjectType: 'planning-cell' as const,
        addressQuality,
        boundaryQuality,
        routeQuality,
        populationQuality,
        confidenceBand: confidenceBand(average),
        verificationRequired: true as const,
        notes: [
          `area-class:${cell.areaClass}`,
          'no-personal-address-derived-score',
        ],
      };
    });

  return [
    {
      evidenceId: stablePackId(workspace.country.code, 'quality', 'country'),
      subjectId: workspace.country.code,
      subjectType: 'country',
      addressQuality: workspace.profile.dataQuality.address,
      boundaryQuality: workspace.profile.dataQuality.boundary,
      routeQuality: workspace.profile.dataQuality.road,
      populationQuality: workspace.profile.dataQuality.population,
      confidenceBand: confidenceBand(workspace.aiQuality.overallScore),
      verificationRequired: true,
      notes: [
        'country-level-quality-prior',
        'not-a-claim-of-official-postal-completeness',
      ],
    },
    ...municipalityEvidence,
    ...planningEvidence,
  ];
}

function createTestVectors(
  workspace: PostalZoneDesignerWorkspace,
  localityChoices: PostalZoneDesignerMunicipalityOption[],
): AgidPostalCountryPackTestVector[] {
  const generatedVectors: AgidPostalCountryPackTestVector[] = workspace.exampleGeneration.candidates
    .filter(candidate => candidate.code)
    .map((candidate, index) => {
      const municipality = localityChoices[index] || localityChoices[0];
      const town = municipality.towns[index] || municipality.towns[0];
      const chome = town.chomes[index + 1] || town.chomes[0];
      return {
        id: stablePackId(workspace.country.code, 'test-vector', String(index + 1)),
        input: {
          countryCode: workspace.country.code,
          municipalityId: municipality.id,
          townId: town.id,
          chomeId: chome?.id || null,
        },
        expected: {
          candidateCodePrefix: `${workspace.country.code}-`,
          sameMunicipalityOnly: true,
          containsPersonalData: false,
        },
      };
    });

  if (generatedVectors.length > 0 || workspace.designPlan.classification.class !== 'A') {
    return generatedVectors;
  }

  return localityChoices.slice(0, 3).map((municipality, index) => {
    const town = municipality.towns[index] || municipality.towns[0];
    const chome = town.chomes[index + 1] || town.chomes[0];
    return {
      id: stablePackId(workspace.country.code, 'test-vector', 'mature-blocked', String(index + 1)),
      input: {
        countryCode: workspace.country.code,
        municipalityId: municipality.id,
        townId: town.id,
        chomeId: chome?.id || null,
      },
      expected: {
        candidateCodePrefix: null,
        sameMunicipalityOnly: true,
        containsPersonalData: false,
        replacementBlocked: true,
        blockedReason: 'mature-postal-country-new-code-replacement-blocked',
        officialPostalPattern: workspace.country.profileOverrides?.existingPostalPattern,
      },
    };
  });
}

function createPostalPriors(
  recommendation: AgidPostalCountryPackRecommendation,
  workspace: PostalZoneDesignerWorkspace,
): AgidPostalCountryPackPostalPrior[] {
  return workspace.formatOptions.slice(0, 4).map(option => ({
    templateId: option.templateId,
    visibleFormat: option.format,
    recommendedUse: recommendation.recommendedUse,
    rationale: [
      option.description,
      ...option.reasons.slice(0, 2),
    ],
  }));
}

export function buildAgidPostalCountryPack(input: {
  countryCode?: string;
  generatedAt?: string;
  officialMunicipalityDataset?: OfficialMunicipalityDataset | null;
} = {}): AgidPostalCountryPack {
  const countryCode = (input.countryCode || 'FJ').trim().toUpperCase();
  const generatedAt = input.generatedAt || '2026-06-20T00:00:00.000Z';
  const targetCountry = findCountryPackTargetCountry(countryCode);
  if (!targetCountry) {
    const recommendedOnly = recommendAgidPostalCountryPack(countryCode);
    if (recommendedOnly) {
      throw new Error(`AGID Postal Country Pack has no Postal Zone Designer target preset: ${countryCode}`);
    }
    throw new Error(`AGID Postal Country Pack is not supported for unknown country code: ${countryCode}`);
  }
  const recommendation = recommendationForTargetCountry(targetCountry);
  const workspace = buildPostalZoneDesignerWorkspace({ countryCode, now: generatedAt });
  if (workspace.country.code !== countryCode) {
    throw new Error(`AGID Postal Country Pack target mismatch: requested ${countryCode}, got ${workspace.country.code}`);
  }
  const officialMunicipalityDataset = input.officialMunicipalityDataset || null;
  if (officialMunicipalityDataset) {
    const validation = validateOfficialMunicipalityDataset(officialMunicipalityDataset, countryCode);
    if (!validation.valid) {
      throw new Error(`Official municipality dataset for ${countryCode} is invalid: ${validation.errors.join(', ')}`);
    }
  }
  const localityChoices = officialMunicipalityDataset
    ? buildPostalZoneMunicipalityOptionsFromOfficialDataset(officialMunicipalityDataset)
    : workspace.localityChoices;
  const sourceCatalog = createSourceCatalog(countryCode, officialMunicipalityDataset);
  const localityIndex = flattenLocalities(countryCode, localityChoices);
  const adminBoundaryIndex = createAdminBoundaryIndex(localityIndex);
  const landformIndex = createLandformIndex(workspace, localityChoices);
  const settlementClusterIndex = createSettlementClusters(workspace, localityChoices);
  const vplSeedRegions = createVplSeeds(workspace, localityChoices);
  const planningCellIndex = createPlanningCellIndex(workspace, vplSeedRegions, localityChoices);
  const routeEvidenceIndex = createRouteEvidenceIndex(workspace, planningCellIndex);
  const qualityEvidenceIndex = createQualityEvidenceIndex(workspace, planningCellIndex, localityChoices);
  const testVectors = createTestVectors(workspace, localityChoices);
  const postalSourceReadiness = countryCode === 'HN'
    ? buildHondurasPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'NI'
    ? buildNicaraguaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'GW'
    ? buildGuineaBissauPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'MD'
    ? buildMoldovaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'MK'
    ? buildNorthMacedoniaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'AL'
    ? buildAlbaniaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'BA'
    ? buildBosniaHerzegovinaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'ME'
    ? buildMontenegroPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'RS'
    ? buildSerbiaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'GE'
    ? buildGeorgiaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'AZ'
    ? buildAzerbaijanPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'BG'
    ? buildBulgariaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'RO'
    ? buildRomaniaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'JO'
    ? buildJordanPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'TM'
    ? buildTurkmenistanPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'TJ'
    ? buildTajikistanPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'KG'
    ? buildKyrgyzstanPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'MN'
    ? buildMongoliaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'VE'
    ? buildVenezuelaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'UY'
    ? buildUruguayPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'PY'
    ? buildParaguayPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'PE'
    ? buildPeruPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'SZ'
    ? buildEswatiniPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'LS'
    ? buildLesothoPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'PA'
    ? buildPanamaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'SV'
    ? buildElSalvadorPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'GT'
    ? buildGuatemalaPostalSourceReadiness({ evaluatedAt: generatedAt })
    : countryCode === 'KE'
      ? buildKenyaPostalSourceReadiness({ evaluatedAt: generatedAt })
      : countryCode === 'KH'
        ? buildCambodiaPostalSourceReadiness({ evaluatedAt: generatedAt })
        : countryCode === 'LA'
          ? buildLaosPostalSourceReadiness({ evaluatedAt: generatedAt })
          : countryCode === 'MM'
            ? buildMyanmarPostalSourceReadiness({ evaluatedAt: generatedAt })
            : countryCode === 'NP'
              ? buildNepalPostalSourceReadiness({ evaluatedAt: generatedAt })
              : countryCode === 'PK'
                ? buildPakistanPostalSourceReadiness({ evaluatedAt: generatedAt })
                : countryCode === 'TZ'
                  ? buildTanzaniaPostalSourceReadiness({ evaluatedAt: generatedAt })
                  : countryCode === 'UG'
                    ? buildUgandaPostalSourceReadiness({ evaluatedAt: generatedAt })
                  : undefined;

  return {
    manifest: {
      schemaId: AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID,
      version: AGID_POSTAL_COUNTRY_PACK_VERSION,
      strategyVersion: AGID_POSTAL_COUNTRY_PACK_STRATEGY_VERSION,
      engineVersion: AGID_POSTAL_CODE_ENGINE_VERSION,
      generatedAt,
      countryCode,
      countryName: recommendation.countryName,
      repositoryName: recommendation.repositoryName,
      packageName: recommendation.packageName,
      requiredLayers: countryPackRequiredLayers(recommendation),
      containsPersonalData: false,
      containsRawThirdPartyData: false,
      officialStatus: 'draft',
      counts: {
        sources: sourceCatalog.length,
        localities: localityIndex.length,
        boundaries: adminBoundaryIndex.length,
        landforms: landformIndex.length,
        settlementClusters: settlementClusterIndex.length,
        vplSeeds: vplSeedRegions.length,
        planningCells: planningCellIndex.length,
        routeEvidence: routeEvidenceIndex.length,
        qualityEvidence: qualityEvidenceIndex.length,
        officialMunicipalityRecords: officialMunicipalityDataset?.records.length || 0,
        testVectors: testVectors.length,
      },
    },
    recommendation,
    countryProfile: {
      countryCode,
      countryName: workspace.country.name,
      region: workspace.country.region,
      terrain: workspace.country.terrain,
      classHint: workspace.country.classHint,
      planningCentroid: {
        lat: workspace.country.lat,
        lng: workspace.country.lng,
      },
      sourceNote: workspace.country.sourceNote,
    },
    sourceCatalog,
    ...(postalSourceReadiness ? { postalSourceReadiness } : {}),
    licenseLedger: createLicenseLedger(countryCode),
    officialMunicipalitySummary: summarizeOfficialMunicipalityDataset(officialMunicipalityDataset, countryCode),
    adminBoundaryIndex,
    localityIndex,
    landformIndex,
    settlementClusterIndex,
    vplSeedRegions,
    planningCellIndex,
    routeEvidenceIndex,
    qualityEvidenceIndex,
    postalSystemPriors: createPostalPriors(recommendation, workspace),
    governanceNotes: [
      'This country pack is not an official postal authority dataset.',
      'Use simulation or draft status until government, municipality, postal authority, or carrier pilot approval is recorded.',
      'Visible postal codes must remain within one municipality and preserve stable locality IDs across renames.',
      'Old-to-new transition mappings are required before split, merge, or reshaping events.',
    ],
    privacyThreatModel: [
      'Do not store personal addresses, recipient names, phone numbers, AOID private bodies, AGID-S payloads, or proof codes in this pack.',
      'Do not publish household-level, sensitive-facility-level, refuge-level, or high-risk precise zones.',
      'Use source metadata and geometry references until redistribution rights are verified.',
      'Use no-raw-address test vectors before publishing pack releases.',
    ],
    testVectors,
  };
}

export function buildAllAgidPostalCountryPacks(input: {
  generatedAt?: string;
} = {}): AgidPostalCountryPack[] {
  return listAgidPostalCountryPackTargetCountries().map(country => (
    buildAgidPostalCountryPack({
      countryCode: country.countryCode,
      generatedAt: input.generatedAt,
    })
  ));
}

export function validateAgidPostalCountryPack(
  pack = buildAgidPostalCountryPack(),
): AgidPostalCountryPackValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const localityIds = new Set<string>();
  const sourceIds = new Set(pack.sourceCatalog.map(source => source.sourceId));

  if (pack.manifest.schemaId !== AGID_POSTAL_COUNTRY_PACK_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (pack.manifest.version !== AGID_POSTAL_COUNTRY_PACK_VERSION) errors.push('version-mismatch');
  if (pack.manifest.countryCode !== pack.countryProfile.countryCode) errors.push('country-code-mismatch');
  if (pack.manifest.containsPersonalData !== false) errors.push('manifest-personal-data-not-false');
  if (pack.manifest.containsRawThirdPartyData !== false) errors.push('manifest-raw-third-party-data-not-false');
  if (pack.manifest.officialStatus === 'official') errors.push('country-pack-claims-official-status');
  if (pack.manifest.counts.localities !== pack.localityIndex.length) errors.push('locality-count-mismatch');
  if (pack.manifest.counts.sources !== pack.sourceCatalog.length) errors.push('source-count-mismatch');
  if (pack.manifest.counts.planningCells !== pack.planningCellIndex.length) errors.push('planning-cell-count-mismatch');
  if (pack.manifest.counts.routeEvidence !== pack.routeEvidenceIndex.length) errors.push('route-evidence-count-mismatch');
  if (pack.manifest.counts.qualityEvidence !== pack.qualityEvidenceIndex.length) errors.push('quality-evidence-count-mismatch');
  if (pack.manifest.counts.officialMunicipalityRecords !== pack.officialMunicipalitySummary.recordCount) {
    errors.push('official-municipality-record-count-mismatch');
  }
  if (pack.manifest.counts.testVectors !== pack.testVectors.length) errors.push('test-vector-count-mismatch');

  for (const source of pack.sourceCatalog) {
    if (!source.sourceId || !source.sourceName || !source.licenseOrTerms) errors.push(`source-missing-required-field:${source.sourceId}`);
    if (source.redistributionStatus !== 'agid-metadata-redistributable' && source.sourceUrl.startsWith('local:')) {
      errors.push(`non-redistributable-local-source:${source.sourceId}`);
    }
  }

  for (const sourceId of pack.officialMunicipalitySummary.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`official-municipality-source-missing:${sourceId}`);
  }

  if (pack.manifest.countryCode === 'HN') {
    if (!pack.postalSourceReadiness) {
      errors.push('honduras-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateHondurasPostalSourceReadiness(pack.postalSourceReadiness as HondurasPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `honduras-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`honduras-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'NI') {
    if (!pack.postalSourceReadiness) {
      errors.push('nicaragua-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateNicaraguaPostalSourceReadiness(pack.postalSourceReadiness as NicaraguaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `nicaragua-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`nicaragua-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'GW') {
    if (!pack.postalSourceReadiness) {
      errors.push('guinea-bissau-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateGuineaBissauPostalSourceReadiness(pack.postalSourceReadiness as GuineaBissauPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `guinea-bissau-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`guinea-bissau-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'MD') {
    if (!pack.postalSourceReadiness) {
      errors.push('moldova-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateMoldovaPostalSourceReadiness(pack.postalSourceReadiness as MoldovaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `moldova-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`moldova-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'MK') {
    if (!pack.postalSourceReadiness) {
      errors.push('north-macedonia-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateNorthMacedoniaPostalSourceReadiness(pack.postalSourceReadiness as NorthMacedoniaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `north-macedonia-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`north-macedonia-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'RO') {
    if (!pack.postalSourceReadiness) {
      errors.push('romania-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateRomaniaPostalSourceReadiness(pack.postalSourceReadiness as RomaniaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `romania-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`romania-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'AL') {
    if (!pack.postalSourceReadiness) {
      errors.push('albania-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateAlbaniaPostalSourceReadiness(pack.postalSourceReadiness as AlbaniaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `albania-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`albania-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'BA') {
    if (!pack.postalSourceReadiness) {
      errors.push('bosnia-herzegovina-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateBosniaHerzegovinaPostalSourceReadiness(pack.postalSourceReadiness as BosniaHerzegovinaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `bosnia-herzegovina-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`bosnia-herzegovina-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'ME') {
    if (!pack.postalSourceReadiness) {
      errors.push('montenegro-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateMontenegroPostalSourceReadiness(pack.postalSourceReadiness as MontenegroPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `montenegro-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`montenegro-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'RS') {
    if (!pack.postalSourceReadiness) {
      errors.push('serbia-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateSerbiaPostalSourceReadiness(pack.postalSourceReadiness as SerbiaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `serbia-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`serbia-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'GE') {
    if (!pack.postalSourceReadiness) {
      errors.push('georgia-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateGeorgiaPostalSourceReadiness(pack.postalSourceReadiness as GeorgiaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `georgia-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`georgia-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'AZ') {
    if (!pack.postalSourceReadiness) {
      errors.push('azerbaijan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateAzerbaijanPostalSourceReadiness(pack.postalSourceReadiness as AzerbaijanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `azerbaijan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`azerbaijan-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'BG') {
    if (!pack.postalSourceReadiness) {
      errors.push('bulgaria-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateBulgariaPostalSourceReadiness(pack.postalSourceReadiness as BulgariaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `bulgaria-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`bulgaria-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'JO') {
    if (!pack.postalSourceReadiness) {
      errors.push('jordan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateJordanPostalSourceReadiness(pack.postalSourceReadiness as JordanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `jordan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`jordan-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'TM') {
    if (!pack.postalSourceReadiness) {
      errors.push('turkmenistan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateTurkmenistanPostalSourceReadiness(pack.postalSourceReadiness as TurkmenistanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `turkmenistan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`turkmenistan-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'TJ') {
    if (!pack.postalSourceReadiness) {
      errors.push('tajikistan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateTajikistanPostalSourceReadiness(pack.postalSourceReadiness as TajikistanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `tajikistan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`tajikistan-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'KG') {
    if (!pack.postalSourceReadiness) {
      errors.push('kyrgyzstan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateKyrgyzstanPostalSourceReadiness(pack.postalSourceReadiness as KyrgyzstanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `kyrgyzstan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`kyrgyzstan-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'MN') {
    if (!pack.postalSourceReadiness) {
      errors.push('mongolia-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateMongoliaPostalSourceReadiness(pack.postalSourceReadiness as MongoliaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `mongolia-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`mongolia-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'VE') {
    if (!pack.postalSourceReadiness) {
      errors.push('venezuela-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateVenezuelaPostalSourceReadiness(pack.postalSourceReadiness as VenezuelaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `venezuela-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`venezuela-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'UY') {
    if (!pack.postalSourceReadiness) {
      errors.push('uruguay-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateUruguayPostalSourceReadiness(pack.postalSourceReadiness as UruguayPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `uruguay-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`uruguay-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'PY') {
    if (!pack.postalSourceReadiness) {
      errors.push('paraguay-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateParaguayPostalSourceReadiness(pack.postalSourceReadiness as ParaguayPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `paraguay-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`paraguay-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'PE') {
    if (!pack.postalSourceReadiness) {
      errors.push('peru-postal-source-readiness-missing');
    } else {
      const readinessValidation = validatePeruPostalSourceReadiness(pack.postalSourceReadiness as PeruPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `peru-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`peru-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'SZ') {
    if (!pack.postalSourceReadiness) {
      errors.push('eswatini-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateEswatiniPostalSourceReadiness(pack.postalSourceReadiness as EswatiniPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `eswatini-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`eswatini-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'LS') {
    if (!pack.postalSourceReadiness) {
      errors.push('lesotho-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateLesothoPostalSourceReadiness(pack.postalSourceReadiness as LesothoPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `lesotho-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) if (!sourceIds.has(source.sourceId)) errors.push(`lesotho-readiness-source-missing:${source.sourceId}`);
    }
  } else if (pack.manifest.countryCode === 'PA') {
    if (!pack.postalSourceReadiness) {
      errors.push('panama-postal-source-readiness-missing');
    } else {
      const readinessValidation = validatePanamaPostalSourceReadiness(pack.postalSourceReadiness as PanamaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `panama-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`panama-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'SV') {
    if (!pack.postalSourceReadiness) {
      errors.push('el-salvador-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateElSalvadorPostalSourceReadiness(pack.postalSourceReadiness as ElSalvadorPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `el-salvador-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`el-salvador-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'GT') {
    if (!pack.postalSourceReadiness) {
      errors.push('guatemala-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateGuatemalaPostalSourceReadiness(
        pack.postalSourceReadiness as GuatemalaPostalSourceReadiness,
      );
      errors.push(...readinessValidation.errors.map(error => `guatemala-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`guatemala-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'KE') {
    if (!pack.postalSourceReadiness) {
      errors.push('kenya-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateKenyaPostalSourceReadiness(pack.postalSourceReadiness as KenyaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `kenya-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`kenya-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'KH') {
    if (!pack.postalSourceReadiness) {
      errors.push('cambodia-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateCambodiaPostalSourceReadiness(pack.postalSourceReadiness as CambodiaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `cambodia-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`cambodia-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'LA') {
    if (!pack.postalSourceReadiness) {
      errors.push('laos-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateLaosPostalSourceReadiness(pack.postalSourceReadiness as LaosPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `laos-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`laos-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'MM') {
    if (!pack.postalSourceReadiness) {
      errors.push('myanmar-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateMyanmarPostalSourceReadiness(pack.postalSourceReadiness as MyanmarPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `myanmar-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`myanmar-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'NP') {
    if (!pack.postalSourceReadiness) {
      errors.push('nepal-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateNepalPostalSourceReadiness(pack.postalSourceReadiness as NepalPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `nepal-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`nepal-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'PK') {
    if (!pack.postalSourceReadiness) {
      errors.push('pakistan-postal-source-readiness-missing');
    } else {
      const readinessValidation = validatePakistanPostalSourceReadiness(pack.postalSourceReadiness as PakistanPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `pakistan-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`pakistan-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'TZ') {
    if (!pack.postalSourceReadiness) {
      errors.push('tanzania-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateTanzaniaPostalSourceReadiness(pack.postalSourceReadiness as TanzaniaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `tanzania-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`tanzania-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.manifest.countryCode === 'UG') {
    if (!pack.postalSourceReadiness) {
      errors.push('uganda-postal-source-readiness-missing');
    } else {
      const readinessValidation = validateUgandaPostalSourceReadiness(pack.postalSourceReadiness as UgandaPostalSourceReadiness);
      errors.push(...readinessValidation.errors.map(error => `uganda-postal-source-readiness:${error}`));
      for (const source of pack.postalSourceReadiness.sources) {
        if (!sourceIds.has(source.sourceId)) errors.push(`uganda-readiness-source-missing:${source.sourceId}`);
      }
    }
  } else if (pack.postalSourceReadiness) {
    errors.push(`unexpected-postal-source-readiness:${pack.manifest.countryCode}`);
  }

  for (const locality of pack.localityIndex) {
    if (localityIds.has(locality.localityId)) errors.push(`duplicate-locality:${locality.localityId}`);
    localityIds.add(locality.localityId);
    if (!locality.stableId || !locality.codePart) errors.push(`locality-missing-stable-id-or-code:${locality.localityId}`);
    if (locality.parentId && !pack.localityIndex.some(candidate => candidate.localityId === locality.parentId)) {
      errors.push(`locality-parent-missing:${locality.localityId}`);
    }
  }

  for (const boundary of pack.adminBoundaryIndex) {
    if (!localityIds.has(boundary.localityId)) errors.push(`boundary-locality-missing:${boundary.boundaryId}`);
    if (!boundary.geometryRef.startsWith('source-required://')) warnings.push(`boundary-may-bundle-geometry:${boundary.boundaryId}`);
  }

  for (const landform of pack.landformIndex) {
    if (!sourceIds.has(landform.sourceId)) errors.push(`landform-source-missing:${landform.landformId}`);
    for (const localityId of landform.relatedLocalityIds) {
      if (!localityIds.has(localityId)) errors.push(`landform-locality-missing:${landform.landformId}:${localityId}`);
    }
  }

  for (const cluster of pack.settlementClusterIndex) {
    if (!localityIds.has(cluster.localityId)) errors.push(`cluster-locality-missing:${cluster.clusterId}`);
    if (cluster.publicPrecision === 'block') warnings.push(`cluster-public-precision-block-review:${cluster.clusterId}`);
  }

  for (const vpl of pack.vplSeedRegions) {
    if (vpl.nonAdministrative !== true) errors.push(`vpl-not-non-administrative:${vpl.vplId}`);
    if (!localityIds.has(vpl.localityId)) errors.push(`vpl-locality-missing:${vpl.vplId}`);
    if (vpl.status !== 'draft') warnings.push(`vpl-not-draft:${vpl.vplId}`);
  }

  const planningCellIds = new Set<string>();
  for (const cell of pack.planningCellIndex) {
    if (planningCellIds.has(cell.cellId)) errors.push(`duplicate-planning-cell:${cell.cellId}`);
    planningCellIds.add(cell.cellId);
    if (!cell.agid || !cell.codeSeed) errors.push(`planning-cell-missing-id-or-code:${cell.cellId}`);
    if (!localityIds.has(cell.localityId)) errors.push(`planning-cell-locality-missing:${cell.cellId}`);
    if (cell.noRawAddress !== true) errors.push(`planning-cell-raw-address-flag:${cell.cellId}`);
    if (!sourceIds.has(cell.sourceId)) errors.push(`planning-cell-source-missing:${cell.cellId}`);
  }

  for (const route of pack.routeEvidenceIndex) {
    if (!sourceIds.has(route.sourceId)) errors.push(`route-evidence-source-missing:${route.routeId}`);
    if (!localityIds.has(route.fromLocalityId)) errors.push(`route-evidence-from-locality-missing:${route.routeId}`);
    if (!localityIds.has(route.toLocalityId)) errors.push(`route-evidence-to-locality-missing:${route.routeId}`);
    if (route.status !== 'source-required') errors.push(`route-evidence-status-not-source-required:${route.routeId}`);
  }

  for (const evidence of pack.qualityEvidenceIndex) {
    if (evidence.verificationRequired !== true) errors.push(`quality-evidence-verification-not-required:${evidence.evidenceId}`);
    for (const score of [evidence.addressQuality, evidence.boundaryQuality, evidence.routeQuality, evidence.populationQuality]) {
      if (score < 0 || score > 1) errors.push(`quality-evidence-score-out-of-range:${evidence.evidenceId}`);
    }
    if (evidence.subjectType === 'planning-cell' && !planningCellIds.has(evidence.subjectId)) {
      errors.push(`quality-evidence-planning-cell-missing:${evidence.evidenceId}`);
    }
    if ((evidence.subjectType === 'municipality' || evidence.subjectType === 'town') && !localityIds.has(evidence.subjectId)) {
      errors.push(`quality-evidence-locality-missing:${evidence.evidenceId}`);
    }
  }

  for (const vector of pack.testVectors) {
    if (vector.expected.containsPersonalData !== false) errors.push(`test-vector-personal-data:${vector.id}`);
    if (vector.expected.candidateCodePrefix) {
      if (!vector.expected.candidateCodePrefix.startsWith(pack.manifest.countryCode)) {
        errors.push(`test-vector-country-prefix-mismatch:${vector.id}`);
      }
    } else if (
      vector.expected.replacementBlocked !== true
      || vector.expected.blockedReason !== 'mature-postal-country-new-code-replacement-blocked'
    ) {
      errors.push(`test-vector-country-prefix-mismatch:${vector.id}`);
    }
  }

  const privacyText = pack.privacyThreatModel.join(' ').toLowerCase();
  for (const phrase of ['personal addresses', 'phone numbers', 'agid-s payloads']) {
    if (!privacyText.includes(phrase)) errors.push(`privacy-threat-model-missing:${phrase}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
