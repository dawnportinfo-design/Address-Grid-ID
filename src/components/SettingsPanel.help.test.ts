import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'SettingsPanel.tsx'), 'utf8');

test('help center removes outdated precision/status claims and support mail links', () => {
  assert.doesNotMatch(source, /3m×3m|10文字|10-character|数センチメートル|99\.9% UP|support@|mailto:/);
});

test('help center is data-driven so FAQ coverage can grow without inline duplication', () => {
  assert.match(source, /getHelpCenterContent/);
  assert.doesNotMatch(source, /Q: AGIDとは何ですか？/);
});
