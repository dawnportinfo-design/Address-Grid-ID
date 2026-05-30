import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAddressLanguageTabLabel } from './languageLabels';

test('labels domestic English by Inner and Outer Circle when requested', () => {
  assert.equal(
    getAddressLanguageTabLabel('en_domestic', undefined, { englishMode: 'domestic', englishCircle: 'inner' }),
    'English (Inner Circle Domestic)',
  );
  assert.equal(
    getAddressLanguageTabLabel('en_domestic', undefined, { englishMode: 'domestic', englishCircle: 'outer' }),
    'English (Outer Circle Domestic)',
  );
  assert.equal(
    getAddressLanguageTabLabel('en_domestic', undefined, { englishMode: 'domestic' }),
    'English (Domestic)',
  );
});

test('keeps international shipping English distinct from circle-specific domestic English', () => {
  assert.equal(
    getAddressLanguageTabLabel('en', undefined, { englishMode: 'international', englishCircle: 'outer' }),
    'English (International Shipping)',
  );
});
