import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  AGID_REPOSITORY_BOUNDARY_MANIFEST_VERSION,
  AGID_REPOSITORY_WORKSPACE_BOUNDARIES,
  evaluateRepositoryWorkspaceExtraction,
  getRepositoryWorkspaceBoundary,
} from './repositoryWorkspaceBoundary';

const completeEvidence = {
  packageManifestPresent: true,
  contractTestsPassing: true,
  noRawAddressGatePassing: true,
  provenanceAndLicenseManifestPresent: true,
  stableVersionDeclared: true,
};

test('repository boundary manifest covers every bounded workspace without claiming physical repositories', () => {
  assert.equal(
    AGID_REPOSITORY_BOUNDARY_MANIFEST_VERSION,
    'agid-repository-boundary-manifest-v1',
  );
  assert.deepEqual(
    AGID_REPOSITORY_WORKSPACE_BOUNDARIES.map(boundary => boundary.packageName),
    [
      '@agid/contracts',
      '@agid/core',
      '@agid/country-data',
      '@agid/addressql',
      '@agid/topography',
      '@agid/studio',
    ],
  );
  assert.ok(
    AGID_REPOSITORY_WORKSPACE_BOUNDARIES.every(
      boundary => boundary.suggestedRepository.trim().length > 0,
    ),
  );
});

test('only an owned package can pass the staged extraction decision', () => {
  const contracts = getRepositoryWorkspaceBoundary('@agid/contracts');
  assert.ok(contracts);
  assert.equal(
    evaluateRepositoryWorkspaceExtraction(contracts, completeEvidence).status,
    'ready',
  );

  const addressql = getRepositoryWorkspaceBoundary('@agid/addressql');
  assert.ok(addressql);
  const result = evaluateRepositoryWorkspaceExtraction(addressql, completeEvidence);
  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.includes('Implementation is still owned by a legacy root module.'));
  assert.ok(result.reasons.includes('The package is intentionally deferred for staged extraction.'));
});

test('missing release evidence blocks even a source-owned package', () => {
  const contracts = getRepositoryWorkspaceBoundary('@agid/contracts');
  assert.ok(contracts);
  const result = evaluateRepositoryWorkspaceExtraction(contracts, {
    ...completeEvidence,
    provenanceAndLicenseManifestPresent: false,
  });

  assert.equal(result.status, 'blocked');
  assert.deepEqual(result.reasons, ['Provenance and license manifest is missing.']);
});
