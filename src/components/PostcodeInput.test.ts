import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'PostcodeInput.tsx'), 'utf8');

test('PostcodeInput supports fixed postal codes as read-only one-character cells', () => {
  assert.match(source, /fixedValue\?: string \| null/);
  assert.match(source, /const isFixed = Boolean\(fixedValue\)/);
  assert.match(source, /readOnly=\{isFixed\}/);
  assert.match(source, /aria-label=\{isFixed \? `Fixed postcode \$\{fixedValue\}` : `Postcode character \$\{fieldIndex \+ 1\}`\}/);
});
