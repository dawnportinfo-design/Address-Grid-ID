import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildAddressQlOssReadinessReport,
  type AddressQlOssReadinessReport,
} from '../src/lib/addressQlOssReadiness';

export type ExportItem = {
  from: string;
  to: string;
  required: boolean;
};

type AddressQlRepositoryExportFailure =
  | {
    status: 'failed';
    missing: ExportItem[];
  }
  | {
    status: 'failed';
    reason: 'addressql-oss-readiness-failed';
    score: number;
    errors: string[];
    warnings: string[];
  };

type AddressQlRepositoryExportGate =
  | {
    ok: true;
    outDir: string;
    readiness: AddressQlOssReadinessReport;
  }
  | {
    ok: false;
    failure: AddressQlRepositoryExportFailure;
  };

export type AddressQlRepositoryExportCheckSnapshot = {
  status: 'ok';
  mode: 'check';
  outDir: string;
  files: number;
  readiness: {
    version: AddressQlOssReadinessReport['version'];
    score: number;
    target: AddressQlOssReadinessReport['target'];
    verifiedPaths: string[];
  };
  included: string[];
};

export const ADDRESSQL_EXPORT_ITEMS: ExportItem[] = [
  { from: 'docs/addressql/repository-files/README.md', to: 'README.md', required: true },
  { from: 'docs/addressql/repository-files/LICENSE', to: 'LICENSE', required: true },
  { from: 'docs/addressql/repository-files/LICENSES-DATA.md', to: 'LICENSES-DATA.md', required: true },
  { from: 'docs/addressql/repository-files/CONTRIBUTING.md', to: 'CONTRIBUTING.md', required: true },
  { from: 'docs/addressql/repository-files/SECURITY.md', to: 'SECURITY.md', required: true },
  { from: 'docs/addressql/repository-files/CODE_OF_CONDUCT.md', to: 'CODE_OF_CONDUCT.md', required: true },
  { from: 'docs/addressql', to: 'docs', required: true },
  {
    from: 'docs/specs/fixtures/addressql-postal-validation-negative-claims-v0.1.json',
    to: 'docs/specs/fixtures/addressql-postal-validation-negative-claims-v0.1.json',
    required: true,
  },
  {
    from: 'docs/specs/schemas/addressql-postal-validation-negative-claims-v0.1.schema.json',
    to: 'docs/specs/schemas/addressql-postal-validation-negative-claims-v0.1.schema.json',
    required: true,
  },
  { from: 'extensions/addressql-postgres', to: 'extensions/addressql-postgres', required: true },
  { from: 'extensions/addressql-duckdb', to: 'extensions/addressql-duckdb', required: true },
  { from: 'native/addressql-core', to: 'native/addressql-core', required: true },
  { from: 'sdk/addressql-js-ts', to: 'sdk/addressql-js-ts', required: true },
  { from: 'sdk/addressql-py', to: 'sdk/addressql-py', required: true },
  { from: 'sdk/addressql-rs', to: 'sdk/addressql-rs', required: true },
  { from: 'integrations/addressql-calcite', to: 'integrations/addressql-calcite', required: true },
  { from: 'scripts/verify-addressql-postal-negative-claims.ts', to: 'scripts/verify-addressql-postal-negative-claims.ts', required: true },
  { from: 'scripts/verify-addressql-duckdb-cli.ts', to: 'scripts/verify-addressql-duckdb-cli.ts', required: true },
  { from: 'scripts/verify-addressql-oss-readiness.ts', to: 'scripts/verify-addressql-oss-readiness.ts', required: true },
  { from: '.github/workflows/addressql-duckdb-cli.yml', to: '.github/workflows/addressql-duckdb-cli.yml', required: true },
];

export function evaluateAddressQlRepositoryExportGate(root = process.cwd()): AddressQlRepositoryExportGate {
  const outDir = join(root, 'dist', 'addressql-repository');
  const missing = ADDRESSQL_EXPORT_ITEMS.filter(item => item.required && !existsSync(join(root, item.from)));
  if (missing.length) return { ok: false, failure: { status: 'failed', missing } };

  const readiness = buildAddressQlOssReadinessReport(root);
  if (!readiness.ready) {
    return {
      ok: false,
      failure: {
        status: 'failed',
        reason: 'addressql-oss-readiness-failed',
        score: readiness.score,
        errors: readiness.errors,
        warnings: readiness.warnings,
      },
    };
  }

  return { ok: true, outDir, readiness };
}

export function buildAddressQlRepositoryExportCheckSnapshot(root = process.cwd()): AddressQlRepositoryExportCheckSnapshot {
  const gate = evaluateAddressQlRepositoryExportGate(root);
  if (gate.ok === false) throw new Error(JSON.stringify(gate.failure));

  return {
    status: 'ok',
    mode: 'check',
    outDir: gate.outDir,
    files: ADDRESSQL_EXPORT_ITEMS.length + 1,
    readiness: {
      version: gate.readiness.version,
      score: gate.readiness.score,
      target: gate.readiness.target,
      verifiedPaths: gate.readiness.verifiedPaths,
    },
    included: ADDRESSQL_EXPORT_ITEMS.map(item => item.to),
  };
}

export function writeAddressQlRepositoryExport(root = process.cwd()) {
  const gate = evaluateAddressQlRepositoryExportGate(root);
  if (gate.ok === false) throw new Error(JSON.stringify(gate.failure));

  rmSync(gate.outDir, { recursive: true, force: true });
  mkdirSync(gate.outDir, { recursive: true });

  for (const item of ADDRESSQL_EXPORT_ITEMS) {
    const from = join(root, item.from);
    if (!existsSync(from)) continue;
    const to = join(gate.outDir, item.to);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { recursive: true });
  }

  writeFileSync(join(gate.outDir, 'repository-manifest.json'), JSON.stringify({
    repository: 'addressql',
    owner: 'dawnportinfo-design',
    generatedAt: new Date().toISOString(),
    sourceWorkspace: 'Address-Grid-ID',
    exportBoundary: 'Open-source AddressQL only; no commercial hosted registry, managed proof service, production credentials, or private address data.',
    readiness: {
      version: gate.readiness.version,
      score: gate.readiness.score,
      target: gate.readiness.target,
      verifiedPaths: gate.readiness.verifiedPaths,
    },
    included: ADDRESSQL_EXPORT_ITEMS.map(item => item.to),
    verification: [
      'npm run verify:addressql',
      'npm run verify:addressql-oss',
      'npm run verify:addressql-export',
      'npm run verify:addressql-duckdb:cli -- --require-cli',
      'npm run verify:addressql-core:cargo',
    ],
    nonClaims: [
      'This export contains synthetic fixtures and source metadata, not complete global postal data.',
      'Postal validation is separate from address identity, carrier deliverability, and ZK proof soundness.',
    ],
  }, null, 2));

  return {
    status: 'ok' as const,
    outDir: gate.outDir,
    files: ADDRESSQL_EXPORT_ITEMS.length + 1,
  };
}

export function runAddressQlRepositoryExportCli(argv = process.argv.slice(2), root = process.cwd()): number {
  const args = new Set(argv);
  const checkOnly = args.has('--check') || args.has('--dry-run');

  const gate = evaluateAddressQlRepositoryExportGate(root);
  if (gate.ok === false) {
    console.error(JSON.stringify(gate.failure, null, 2));
    return 1;
  }

  const output = checkOnly
    ? buildAddressQlRepositoryExportCheckSnapshot(root)
    : writeAddressQlRepositoryExport(root);
  console.log(JSON.stringify(output, null, 2));
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = runAddressQlRepositoryExportCli();
}
