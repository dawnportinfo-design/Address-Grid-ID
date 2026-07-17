import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type PackageManifest = {
  name: string;
  packagePath: string;
  runtime: string;
  entrypoints: string[];
  readme: string;
  examples: string[];
  verifyCommand: string;
  publishReadiness: string;
  publicSurfaces: string[];
  safetyControls: string[];
};

type IntegrationContract = {
  name: string;
  reactExample: string;
  nextjsRoute: string;
  testCoverage: string[];
};

type Manifest = {
  version: string;
  status: string;
  packages: PackageManifest[];
  integrationContracts: IntegrationContract[];
};

const root = process.cwd();
const manifestPath = join(root, 'sdk/veygrit-address-login-packages.manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
const rootPackageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};

const errors: string[] = [];
const requiredSharedSafetyControls = [
  'no-raw-address-material',
  'no-recipient-material',
  'no-witness-material',
  'no-private-key-material',
  'no-proof-secret-material',
  'no-production-credentials',
];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    errors.push(message);
  }
}

function pathExists(relativePath: string): boolean {
  return existsSync(join(root, relativePath));
}

function readPackageJson(packagePath: string): { name?: string; scripts?: Record<string, string>; files?: string[] } {
  return JSON.parse(readFileSync(join(root, packagePath, 'package.json'), 'utf8')) as {
    name?: string;
    scripts?: Record<string, string>;
    files?: string[];
  };
}

assert(manifest.version === '0.1.0', 'manifest version must remain explicit at 0.1.0');
assert(manifest.status === 'oss-prep-local', 'manifest status must stay local until release gates exist');
assert(Array.isArray(manifest.packages) && manifest.packages.length === 2, 'manifest must describe the React and Next.js packages');

const packageNames = new Set<string>();

for (const sdkPackage of manifest.packages ?? []) {
  packageNames.add(sdkPackage.name);

  assert(sdkPackage.packagePath.startsWith('sdk/veygrit-address-login-'), `${sdkPackage.name} must stay under sdk/veygrit-address-login-*`);
  assert(pathExists(sdkPackage.packagePath), `${sdkPackage.name} package path must exist`);
  assert(pathExists(`${sdkPackage.packagePath}/package.json`), `${sdkPackage.name} package.json must exist`);
  assert(pathExists(`${sdkPackage.packagePath}/${sdkPackage.readme}`), `${sdkPackage.name} README must exist`);
  assert(pathExists(`${sdkPackage.packagePath}/tsconfig.json`), `${sdkPackage.name} tsconfig must exist`);

  const packageJson = readPackageJson(sdkPackage.packagePath);
  assert(packageJson.name === sdkPackage.name, `${sdkPackage.name} manifest name must match package.json`);
  assert(Boolean(packageJson.scripts?.build), `${sdkPackage.name} must expose a build script`);
  assert(Boolean(packageJson.scripts?.test), `${sdkPackage.name} must expose a test script`);
  assert(Boolean(packageJson.scripts?.typecheck), `${sdkPackage.name} must expose a typecheck script`);
  assert(packageJson.files?.includes('dist') === true, `${sdkPackage.name} npm files must include dist`);
  assert(packageJson.files?.includes('examples') === true, `${sdkPackage.name} npm files must include examples`);
  assert(packageJson.files?.includes('README.md') === true, `${sdkPackage.name} npm files must include README.md`);

  const verifyScript = sdkPackage.verifyCommand.replace(/^npm run /, '');
  assert(Boolean(rootPackageJson.scripts?.[verifyScript]), `${sdkPackage.name} verify command must exist in root package.json`);
  assert(sdkPackage.publishReadiness !== 'production-ready', `${sdkPackage.name} must not claim production readiness`);
  assert(sdkPackage.publicSurfaces.length >= 8, `${sdkPackage.name} must declare key public SDK surfaces`);

  for (const entrypoint of sdkPackage.entrypoints) {
    assert(pathExists(`${sdkPackage.packagePath}/${entrypoint}`), `${sdkPackage.name} entrypoint missing: ${entrypoint}`);
  }

  for (const example of sdkPackage.examples) {
    assert(pathExists(`${sdkPackage.packagePath}/${example}`), `${sdkPackage.name} example missing: ${example}`);
  }

  for (const control of requiredSharedSafetyControls) {
    assert(sdkPackage.safetyControls.includes(control), `${sdkPackage.name} missing safety control: ${control}`);
  }
}

assert(packageNames.has('@veygrit/address-login-react'), 'React SDK package must be present');
assert(packageNames.has('@veygrit/address-login-nextjs'), 'Next.js SDK package must be present');

for (const contract of manifest.integrationContracts ?? []) {
  assert(pathExists(contract.reactExample), `${contract.name} React example path must exist`);
  assert(pathExists(contract.nextjsRoute), `${contract.name} Next.js route path must exist`);
  assert(contract.testCoverage.length >= 3, `${contract.name} must list covered handoff behavior`);
}

if (errors.length > 0) {
  console.error('verify-veygrit-address-login-packages failed');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('verify-veygrit-address-login-packages passed');
