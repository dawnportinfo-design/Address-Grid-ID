import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AddressRenderer, type CanonicalAddress } from './addressRendering';

const japaneseAddress: CanonicalAddress = {
  country_code: 'JP',
  country: '日本',
  state: '東京都',
  city: '千代田区',
  district: '',
  subdistrict: '永田町',
  suburb: '',
  road: '1-1',
  house_number: '1',
  building: '中央合同庁舎',
  postcode: '100-0014',
  poi: '',
};

test('renders international English addresses without leaking native script', () => {
  const rendered = AddressRenderer.render('intl_en', japaneseAddress);

  assert.equal(rendered, 'Chuo Godo Chosha\n1 1-1\nNagatacho, Chiyoda-ku\nTokyo 100-0014\nJAPAN');
  assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(rendered), false);
});

test('plain English tab for non-English countries uses compatible international order', () => {
  const rendered = AddressRenderer.render('en', {
    ...japaneseAddress,
    subdistrict: '',
    road: '',
    house_number: '',
    building: '',
    postcode: '1006727',
  });

  assert.equal(rendered, 'Chiyoda-ku\nTokyo 1006727\nJAPAN');
  assert.doesNotMatch(rendered, /^,/m);
  assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(rendered), false);
});

test('renders domestic English without adding the destination country line', () => {
  const rendered = AddressRenderer.render('en', {
    ...japaneseAddress,
    country_code: 'US',
    country: 'United States',
    state: 'CA',
    city: 'Cupertino',
    subdistrict: '',
    road: 'Infinite Loop',
    house_number: '1',
    building: '',
    postcode: '95014',
  });

  assert.equal(rendered, '1 Infinite Loop\nCupertino\nCA 95014');
});

test('renders Outer Circle domestic English with the same domestic layout', () => {
  const rendered = AddressRenderer.render('en', {
    ...japaneseAddress,
    country_code: 'AE',
    country: 'United Arab Emirates',
    state: 'Dubai',
    city: 'Dubai',
    subdistrict: 'Downtown Dubai',
    road: 'Sheikh Mohammed bin Rashid Boulevard',
    house_number: '1',
    building: 'Burj Khalifa',
    postcode: '',
  });

  assert.equal(rendered, 'Burj Khalifa\n1 Sheikh Mohammed bin Rashid Boulevard\nDowntown Dubai, Dubai\nDubai');
});
