import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'appConstants.ts'), 'utf8');

test('does not expose fixed AGID grid size copy in public resource labels', () => {
  assert.doesNotMatch(source, /Grid Size/i);
  assert.doesNotMatch(source, /4x4m|4m/);
});
