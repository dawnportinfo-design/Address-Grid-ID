import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { ADDRESSQL_WORKSPACE_BRIDGE_VERSION } from '@agid/addressql';
import {
  AGID_CONTRACTS_WORKSPACE_BRIDGE_VERSION,
  AGID_SPEC_SECURITY_PROFILE as packageAgidSecurityProfile,
} from '@agid/contracts';
import { AGID_SPEC_SECURITY_PROFILE as packageAgidSecurityProfileSubpath } from '@agid/contracts/agid-contract';
import { evaluatePostalSourcePromotion as packagePostalSourcePromotion } from '@agid/contracts/postal-source-promotion-gate';
import { AGID_CORE_WORKSPACE_BRIDGE_VERSION } from '@agid/core';
import { AGID_COUNTRY_DATA_WORKSPACE_BRIDGE_VERSION } from '@agid/country-data';
import { AGID_STUDIO_WORKSPACE_BRIDGE_VERSION } from '@agid/studio';
import { AGID_TOPOGRAPHY_WORKSPACE_BRIDGE_VERSION } from '@agid/topography';
import { AGID_SPEC_SECURITY_PROFILE as legacyAgidSecurityProfile } from '../lib/agidContract';
import { evaluatePostalSourcePromotion as legacyPostalSourcePromotion } from './postalSourcePromotionGate';

type WorkspaceManifest = {
  name: string;
  version: string;
  private: boolean;
  exports?: Record<string, string>;
  types?: string;
  dependencies?: Record<string, string>;
  agidWorkspace?: {
    role?: string;
    migrationPhase?: string;
    repositoryStatus?: string;
    legacyEntrypoints?: string[];
  };
};

type ContractReleaseManifest = {
  packageName: string;
  releaseStatus: string;
  sourceOwnership: string;
  suggestedRepository: string;
  compatibility: {
    legacyEntrypoints: string[];
    packageEntrypoints: string[];
  };
};

type ContractSourceRegistry = {
  externalDataSources: unknown[];
  sourceReview: {
    requiredBeforeRelease: boolean;
  };
};

type ContractQualityGates = {
  releaseStatus: string;
  requiredCommands: Array<{ id: string; command: string }>;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const expectedWorkspaces = [
  {
    path: 'packages/contracts',
    name: '@agid/contracts',
    rank: 0,
    dependencies: [],
    migrationPhase: 'owned-source-with-legacy-facade',
    repositoryStatus: 'source-owned-release-gated',
    bridgeVersion: 'AGID_CONTRACTS_WORKSPACE_BRIDGE_VERSION',
  },
  {
    path: 'packages/core',
    name: '@agid/core',
    rank: 1,
    dependencies: ['@agid/contracts'],
    migrationPhase: 'compatibility-bridge',
    repositoryStatus: undefined,
    bridgeVersion: 'AGID_CORE_WORKSPACE_BRIDGE_VERSION',
  },
  {
    path: 'packages/country-data',
    name: '@agid/country-data',
    rank: 2,
    dependencies: ['@agid/contracts', '@agid/core'],
    migrationPhase: 'compatibility-bridge',
    repositoryStatus: undefined,
    bridgeVersion: 'AGID_COUNTRY_DATA_WORKSPACE_BRIDGE_VERSION',
  },
  {
    path: 'packages/addressql',
    name: '@agid/addressql',
    rank: 3,
    dependencies: ['@agid/contracts', '@agid/core', '@agid/country-data'],
    migrationPhase: 'compatibility-bridge',
    repositoryStatus: undefined,
    bridgeVersion: 'ADDRESSQL_WORKSPACE_BRIDGE_VERSION',
  },
  {
    path: 'packages/topography',
    name: '@agid/topography',
    rank: 3,
    dependencies: ['@agid/contracts', '@agid/core'],
    migrationPhase: 'compatibility-bridge',
    repositoryStatus: undefined,
    bridgeVersion: 'AGID_TOPOGRAPHY_WORKSPACE_BRIDGE_VERSION',
  },
  {
    path: 'apps/studio',
    name: '@agid/studio',
    rank: 4,
    dependencies: [
      '@agid/addressql',
      '@agid/core',
      '@agid/country-data',
      '@agid/topography',
    ],
    migrationPhase: 'compatibility-bridge',
    repositoryStatus: undefined,
    bridgeVersion: 'AGID_STUDIO_WORKSPACE_BRIDGE_VERSION',
  },
] as const;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

test('root registers exactly the six bounded AGID workspaces', () => {
  const rootManifest = readJson<{ workspaces?: string[] }>(
    resolve(root, 'package.json'),
  );

  assert.deepEqual(
    rootManifest.workspaces,
    expectedWorkspaces.map(workspace => workspace.path),
  );
});

test('workspace manifests preserve the directed compatibility graph', () => {
  const rankByName = new Map(
    expectedWorkspaces.map(workspace => [workspace.name, workspace.rank]),
  );

  for (const expected of expectedWorkspaces) {
    const workspaceRoot = resolve(root, expected.path);
    const manifest = readJson<WorkspaceManifest>(
      resolve(workspaceRoot, 'package.json'),
    );
    const internalDependencies = Object.keys(manifest.dependencies ?? {})
      .filter(name => name.startsWith('@agid/'))
      .sort();

    assert.equal(manifest.name, expected.name);
    assert.equal(manifest.version, '0.1.0');
    assert.equal(manifest.private, true);
    assert.equal(manifest.exports?.['.'], './src/index.ts');
    assert.equal(manifest.types, './src/index.ts');
    assert.equal(manifest.agidWorkspace?.migrationPhase, expected.migrationPhase);
    assert.equal(manifest.agidWorkspace?.repositoryStatus, expected.repositoryStatus);
    assert.ok(manifest.agidWorkspace?.role?.trim());
    assert.deepEqual(internalDependencies, [...expected.dependencies].sort());

    for (const dependency of internalDependencies) {
      const dependencyRank = rankByName.get(dependency);
      assert.notEqual(
        dependencyRank,
        undefined,
        `${manifest.name} references an unregistered AGID workspace`,
      );
      assert.ok(
        dependencyRank! < expected.rank,
        `${manifest.name} must not depend sideways or back toward ${dependency}`,
      );
    }
  }
});

test('root declares the contracts package used by legacy compatibility facades', () => {
  const rootManifest = readJson<{ dependencies?: Record<string, string> }>(
    resolve(root, 'package.json'),
  );

  assert.equal(rootManifest.dependencies?.['@agid/contracts'], '0.1.0');
});

test('contracts own migrated modules and legacy entrypoints remain compatibility facades', () => {
  const contractsRoot = resolve(root, 'packages/contracts');
  const contractsIndex = readFileSync(resolve(contractsRoot, 'src/index.ts'), 'utf8');
  const legacyAgidContract = readFileSync(resolve(root, 'src/lib/agidContract.ts'), 'utf8');
  const legacyPostalGate = readFileSync(
    resolve(root, 'src/address/postalSourcePromotionGate.ts'),
    'utf8',
  );

  assert.equal(existsSync(resolve(contractsRoot, 'src/agidContract.ts')), true);
  assert.equal(existsSync(resolve(contractsRoot, 'src/postalSourcePromotionGate.ts')), true);
  assert.match(contractsIndex, /export \* from '\.\/agidContract';/);
  assert.match(contractsIndex, /export \* from '\.\/postalSourcePromotionGate';/);
  assert.doesNotMatch(contractsIndex, /\.\.\/\.\.\/\.\.\/src\//);
  assert.match(
    legacyAgidContract,
    /export \* from '@agid\/contracts\/agid-contract';/,
  );
  assert.match(
    legacyPostalGate,
    /export \* from '@agid\/contracts\/postal-source-promotion-gate';/,
  );
  assert.equal(legacyAgidSecurityProfile, packageAgidSecurityProfile);
  assert.equal(packageAgidSecurityProfile, packageAgidSecurityProfileSubpath);
  assert.equal(legacyPostalSourcePromotion, packagePostalSourcePromotion);
});

test('contracts carries staged repository release metadata without claiming publication', () => {
  const contractsRoot = resolve(root, 'packages/contracts');
  const manifest = readJson<ContractReleaseManifest>(
    resolve(contractsRoot, 'manifest.json'),
  );
  const sources = readJson<ContractSourceRegistry>(
    resolve(contractsRoot, 'sources.json'),
  );
  const gates = readJson<ContractQualityGates>(
    resolve(contractsRoot, 'quality-gates.json'),
  );

  assert.equal(existsSync(resolve(contractsRoot, 'LICENSE.md')), true);
  assert.equal(manifest.packageName, '@agid/contracts');
  assert.equal(manifest.releaseStatus, 'release-gated');
  assert.equal(manifest.sourceOwnership, 'workspace-owned');
  assert.equal(manifest.suggestedRepository, 'agid-contracts');
  assert.deepEqual(manifest.compatibility.legacyEntrypoints, [
    'src/lib/agidContract.ts',
    'src/address/postalSourcePromotionGate.ts',
  ]);
  assert.ok(
    manifest.compatibility.packageEntrypoints.includes(
      '@agid/contracts/agid-contract',
    ),
  );
  assert.deepEqual(sources.externalDataSources, []);
  assert.equal(sources.sourceReview.requiredBeforeRelease, true);
  assert.equal(gates.releaseStatus, 'release-gated');
  assert.deepEqual(
    gates.requiredCommands.map(gate => gate.id),
    [
      'contracts-tests',
      'workspace-compatibility',
      'no-raw-address',
      'typecheck',
    ],
  );
});

test('compatibility bridges and every declared legacy entrypoint remain present', () => {
  for (const expected of expectedWorkspaces) {
    const workspaceRoot = resolve(root, expected.path);
    const indexPath = resolve(workspaceRoot, 'src/index.ts');
    const manifest = readJson<WorkspaceManifest>(
      resolve(workspaceRoot, 'package.json'),
    );
    const indexSource = readFileSync(indexPath, 'utf8');

    assert.ok(existsSync(resolve(workspaceRoot, 'README.md')));
    assert.match(indexSource, new RegExp(`export const ${expected.bridgeVersion}`));

    const legacyEntrypoints = manifest.agidWorkspace?.legacyEntrypoints ?? [];
    assert.ok(legacyEntrypoints.length > 0);
    for (const legacyEntrypoint of legacyEntrypoints) {
      assert.equal(
        existsSync(resolve(root, legacyEntrypoint)),
        true,
        `${manifest.name} legacy entrypoint is missing: ${legacyEntrypoint}`,
      );
    }
  }
});

test('only Studio may own third-party runtime dependencies during bridge migration', () => {
  for (const expected of expectedWorkspaces) {
    const manifest = readJson<WorkspaceManifest>(
      resolve(root, expected.path, 'package.json'),
    );
    const thirdPartyDependencies = Object.keys(manifest.dependencies ?? {})
      .filter(name => !name.startsWith('@agid/'));

    if (expected.name === '@agid/studio') {
      assert.deepEqual(
        thirdPartyDependencies.sort(),
        ['lucide-react', 'react', 'react-dom'],
      );
    } else {
      assert.deepEqual(thirdPartyDependencies, []);
    }
  }
});

test('all six package names resolve through their public compatibility entrypoints', () => {
  assert.deepEqual(
    [
      AGID_CONTRACTS_WORKSPACE_BRIDGE_VERSION,
      AGID_CORE_WORKSPACE_BRIDGE_VERSION,
      AGID_COUNTRY_DATA_WORKSPACE_BRIDGE_VERSION,
      ADDRESSQL_WORKSPACE_BRIDGE_VERSION,
      AGID_TOPOGRAPHY_WORKSPACE_BRIDGE_VERSION,
      AGID_STUDIO_WORKSPACE_BRIDGE_VERSION,
    ],
    [
      'agid-contracts-workspace-bridge-v1',
      'agid-core-workspace-bridge-v1',
      'agid-country-data-workspace-bridge-v1',
      'addressql-workspace-bridge-v1',
      'agid-topography-workspace-bridge-v1',
      'agid-studio-workspace-bridge-v1',
    ],
  );
});
