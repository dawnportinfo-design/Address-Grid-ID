import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatAddressDisplayText, shouldPreserveAddressDisplayLines } from './addressDisplay';

test('regular English address display is compact and removes needless line breaks', () => {
  assert.equal(
    formatAddressDisplayText('Chiyoda-ku\nTokyo 1006727\nJAPAN', { tab: 'en' }),
    'Chiyoda-ku, Tokyo 1006727, JAPAN'
  );
});

test('international shipping labels keep deliberate line breaks', () => {
  assert.equal(
    formatAddressDisplayText('1 1-1\nNAGATACHO, CHIYODA-KU\nTOKYO 100-0014\nJAPAN', { tab: 'intl_en' }),
    '1 1-1\nNAGATACHO, CHIYODA-KU\nTOKYO 100-0014\nJAPAN'
  );
  assert.equal(shouldPreserveAddressDisplayLines('shipping_label'), true);
});
