import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRANSLATIONS } from '../constants/translations';

test('international shipping English labels avoid carrier wording', () => {
  const labels = TRANSLATIONS as any;

  assert.equal(labels.en.international_en, 'International Shipping English');
  assert.equal(labels.ja.international_en, '国際配送向け英語');
  assert.equal(labels.en.tab_carrier, 'International Shipping English');
  assert.doesNotMatch(labels.en.tab_carrier, /carrier/i);
});
