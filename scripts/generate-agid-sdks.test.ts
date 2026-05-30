import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { AGID_SDK_TARGETS, generateAgidSdks } from './generate-agid-sdks';

test('generates every requested AGID SDK package target', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'agid-sdks-'));

  try {
    const result = await generateAgidSdks(outputDir);

    assert.deepEqual(result.targets.map(target => target.id), AGID_SDK_TARGETS.map(target => target.id));

    for (const target of AGID_SDK_TARGETS) {
      const targetPath = path.join(outputDir, target.directory);
      assert.equal((await stat(targetPath)).isDirectory(), true);
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('writes shared spec, manifests, and API files for publishable SDKs', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'agid-sdks-'));

  try {
    await generateAgidSdks(outputDir);

    const spec = await readFile(path.join(outputDir, 'agid-spec', 'agid-spec.json'), 'utf8');
    assert.match(spec, /"base32Alphabet": "0123456789ABCDEFGHJKMNPQRSTVWXYZ"/);
    assert.match(spec, /"hashLength": 10/);
    assert.match(spec, /"totalLength": 12/);

    const rustManifest = await readFile(path.join(outputDir, 'agid-rs', 'Cargo.toml'), 'utf8');
    assert.match(rustManifest, /name = "agid"/);

    const cHeader = await readFile(path.join(outputDir, 'agid-c', 'include', 'agid.h'), 'utf8');
    assert.match(cHeader, /agid_encode/);
    assert.match(cHeader, /agid_decode/);

    const jsManifest = await readFile(path.join(outputDir, 'agid-js-ts', 'package.json'), 'utf8');
    assert.match(jsManifest, /"name": "@agid\/agid"/);

    const pyManifest = await readFile(path.join(outputDir, 'agid-py', 'pyproject.toml'), 'utf8');
    assert.match(pyManifest, /name = "agid"/);

    const javaManifest = await readFile(path.join(outputDir, 'agid-java', 'pom.xml'), 'utf8');
    assert.match(javaManifest, /<artifactId>agid<\/artifactId>/);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('includes additional ecosystem SDKs for desktop, mobile, data, and systems users', () => {
  assert.deepEqual(
    AGID_SDK_TARGETS
      .filter(target => target.id.startsWith('agid-'))
      .map(target => target.id),
    [
      'agid-spec',
      'agid-rs',
      'agid-c',
      'agid-cpp',
      'agid-wasm',
      'agid-js-ts',
      'agid-py',
      'agid-go',
      'agid-swift',
      'agid-kotlin',
      'agid-java',
      'agid-php',
      'agid-dotnet',
      'agid-ruby',
      'agid-dart',
      'agid-r',
      'agid-julia',
      'agid-elixir',
      'agid-lua',
      'agid-zig',
      'agid-nim',
    ]
  );
});
