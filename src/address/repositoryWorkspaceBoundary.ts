export const AGID_REPOSITORY_BOUNDARY_MANIFEST_VERSION =
  'agid-repository-boundary-manifest-v1';

export type RepositorySourceOwnership = 'workspace-owned' | 'legacy-root';
export type RepositoryExtractionReadiness = 'release-gated' | 'deferred';

export type RepositoryWorkspaceBoundary = {
  id: string;
  packageName: string;
  workspacePath: string;
  suggestedRepository: string;
  sourceOwnership: RepositorySourceOwnership;
  extractionReadiness: RepositoryExtractionReadiness;
  allowedInternalDependencies: readonly string[];
  legacyEntrypoints: readonly string[];
  rationale: string;
};

export type RepositoryWorkspaceExtractionEvidence = {
  packageManifestPresent: boolean;
  contractTestsPassing: boolean;
  noRawAddressGatePassing: boolean;
  provenanceAndLicenseManifestPresent: boolean;
  stableVersionDeclared: boolean;
};

export type RepositoryWorkspaceExtractionResult = {
  manifestVersion: typeof AGID_REPOSITORY_BOUNDARY_MANIFEST_VERSION;
  packageName: string;
  suggestedRepository: string;
  status: 'ready' | 'blocked';
  reasons: string[];
  nextAction: string;
};

export const AGID_REPOSITORY_WORKSPACE_BOUNDARIES: readonly RepositoryWorkspaceBoundary[] = [
  {
    id: 'contracts',
    packageName: '@agid/contracts',
    workspacePath: 'packages/contracts',
    suggestedRepository: 'agid-contracts',
    sourceOwnership: 'workspace-owned',
    extractionReadiness: 'release-gated',
    allowedInternalDependencies: [],
    legacyEntrypoints: [
      'src/lib/agidContract.ts',
      'src/address/postalSourcePromotionGate.ts',
    ],
    rationale: 'Dependency-free public contracts can be released independently once release evidence is present.',
  },
  {
    id: 'core',
    packageName: '@agid/core',
    workspacePath: 'packages/core',
    suggestedRepository: 'agid-core',
    sourceOwnership: 'legacy-root',
    extractionReadiness: 'deferred',
    allowedInternalDependencies: ['@agid/contracts'],
    legacyEntrypoints: ['src/lib/agid.ts', 'src/lib/agidAddressReference.ts'],
    rationale: 'Keep the compatibility bridge until core implementation modules move without widening the public surface.',
  },
  {
    id: 'country-data',
    packageName: '@agid/country-data',
    workspacePath: 'packages/country-data',
    suggestedRepository: 'agid-country-data',
    sourceOwnership: 'legacy-root',
    extractionReadiness: 'deferred',
    allowedInternalDependencies: ['@agid/contracts', '@agid/core'],
    legacyEntrypoints: [
      'src/data/address_formats',
      'src/lib/countryValidationQualityGate.ts',
      'src/lib/countryValidationQualityAttestation.ts',
    ],
    rationale: 'Country packs remain staged because source evidence and generated data need independent provenance gates.',
  },
  {
    id: 'addressql',
    packageName: '@agid/addressql',
    workspacePath: 'packages/addressql',
    suggestedRepository: 'addressql',
    sourceOwnership: 'legacy-root',
    extractionReadiness: 'deferred',
    allowedInternalDependencies: ['@agid/contracts', '@agid/core', '@agid/country-data'],
    legacyEntrypoints: [
      'sdk/addressql-js-ts/src/index.ts',
      'src/lib/addressQlPracticalApi.ts',
      'src/lib/addressQlDeliveryPointDecision.ts',
    ],
    rationale: 'The API and SDK need a standalone release boundary before becoming a separate repository.',
  },
  {
    id: 'topography',
    packageName: '@agid/topography',
    workspacePath: 'packages/topography',
    suggestedRepository: 'agid-topography',
    sourceOwnership: 'legacy-root',
    extractionReadiness: 'deferred',
    allowedInternalDependencies: ['@agid/contracts', '@agid/core'],
    legacyEntrypoints: [
      'src/lib/topographicExport.ts',
      'src/lib/topographicExportSerializers.ts',
      'src/lib/globalTopographicOpenSourceStack.ts',
    ],
    rationale: 'Keep the export stack integrated until source-backed artifacts and optional tools have a stable package boundary.',
  },
  {
    id: 'studio',
    packageName: '@agid/studio',
    workspacePath: 'apps/studio',
    suggestedRepository: 'agid-studio',
    sourceOwnership: 'legacy-root',
    extractionReadiness: 'deferred',
    allowedInternalDependencies: [
      '@agid/addressql',
      '@agid/core',
      '@agid/country-data',
      '@agid/topography',
    ],
    legacyEntrypoints: [
      'src/RootApp.tsx',
      'src/components/TopographicExportStudioScreen.tsx',
      'src/lib/appNavigation.ts',
    ],
    rationale: 'The application remains the integration surface until deployment contracts are independent.',
  },
];

export function getRepositoryWorkspaceBoundary(packageName: string) {
  return AGID_REPOSITORY_WORKSPACE_BOUNDARIES.find(
    boundary => boundary.packageName === packageName,
  );
}

export function evaluateRepositoryWorkspaceExtraction(
  boundary: RepositoryWorkspaceBoundary,
  evidence: RepositoryWorkspaceExtractionEvidence,
): RepositoryWorkspaceExtractionResult {
  const reasons: string[] = [];

  if (boundary.sourceOwnership !== 'workspace-owned') {
    reasons.push('Implementation is still owned by a legacy root module.');
  }
  if (boundary.extractionReadiness !== 'release-gated') {
    reasons.push('The package is intentionally deferred for staged extraction.');
  }
  if (!evidence.packageManifestPresent) reasons.push('Package manifest is missing.');
  if (!evidence.contractTestsPassing) reasons.push('Contract tests have not passed.');
  if (!evidence.noRawAddressGatePassing) {
    reasons.push('No-raw-address release gate has not passed.');
  }
  if (!evidence.provenanceAndLicenseManifestPresent) {
    reasons.push('Provenance and license manifest is missing.');
  }
  if (!evidence.stableVersionDeclared) {
    reasons.push('A stable package version has not been declared.');
  }

  const status = reasons.length === 0 ? 'ready' : 'blocked';
  return {
    manifestVersion: AGID_REPOSITORY_BOUNDARY_MANIFEST_VERSION,
    packageName: boundary.packageName,
    suggestedRepository: boundary.suggestedRepository,
    status,
    reasons,
    nextAction: status === 'ready'
      ? 'Create the repository from this package only, preserve the root compatibility facade, and publish immutable release metadata.'
      : 'Keep the package in the monorepo and satisfy every listed gate before creating a physical GitHub repository.',
  };
}
