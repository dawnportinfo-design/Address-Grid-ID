import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'SavedLocations.tsx'), 'utf8');

test('saved QR list can render generated QR codes from registered-address payloads', () => {
  assert.match(source, /QRCodeCanvas/);
  assert.match(source, /q\.payload && !q\.imageData/);
  assert.match(source, /value=\{q\.payload\}/);
});
