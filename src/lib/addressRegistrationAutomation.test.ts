import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildPostcodeAutofillLanguageDrafts,
  isPostcodeReadyForAutofill,
  mapPostcodeLookupResponse,
  mergePostcodeAutofill,
  translateRegistrationFormFields,
} from './addressRegistrationAutomation';

test('detects when a country postcode is complete enough for autofill lookup', () => {
  const japanFormat = {
    postalCode: {
      regex: '^\\d{3}-?\\d{4}$',
      format: 'NNN-NNNN',
    },
  };

  assert.equal(isPostcodeReadyForAutofill(japanFormat, '100-0001'), true);
  assert.equal(isPostcodeReadyForAutofill(japanFormat, '1000001'), true);
  assert.equal(isPostcodeReadyForAutofill(japanFormat, '100-00'), false);
});

test('maps Japan postcode API results into registration address fields', () => {
  const patch = mapPostcodeLookupResponse('JP', {
    status: 200,
    results: [{
      zipcode: '1000001',
      address1: '東京都',
      address2: '千代田区',
      address3: '千代田',
    }],
  });

  assert.deepEqual(patch, {
    postcode: '1000001',
    state: '東京都',
    city: '千代田区',
    suburb: '千代田',
  });
});

test('maps Zippopotam global postcode results into city and state fields', () => {
  const patch = mapPostcodeLookupResponse('US', {
    'post code': '94043',
    country: 'United States',
    places: [{
      'place name': 'Mountain View',
      state: 'California',
      'state abbreviation': 'CA',
    }],
  });

  assert.deepEqual(patch, {
    postcode: '94043',
    city: 'Mountain View',
    state: 'California',
  });
});

test('merges postcode autofill without overwriting manually typed address details', () => {
  const merged = mergePostcodeAutofill(
    {
      country: 'US',
      postcode: '94043',
      state: '',
      city: 'Already Typed City',
      suburb: '',
      street: '1600 Amphitheatre Pkwy',
    },
    {
      postcode: '94043',
      state: 'California',
      city: 'Mountain View',
      suburb: 'Santa Clara County',
    },
  );

  assert.equal(merged.state, 'California');
  assert.equal(merged.city, 'Already Typed City');
  assert.equal(merged.street, '1600 Amphitheatre Pkwy');
  assert.equal(merged.suburb, 'Santa Clara County');
});

test('translates registration fields for address language tabs while preserving routing fields', async () => {
  const translated = await translateRegistrationFormFields({
    formData: {
      country: 'JP',
      postcode: '100-0001',
      phone: '+81',
      state: '東京都',
      city: '千代田区',
      street: '丸の内',
      houseNumber: '1-1',
    },
    targetLanguage: 'en',
    countryCode: 'JP',
  });

  assert.equal(translated.country, 'JP');
  assert.equal(translated.postcode, '100-0001');
  assert.equal(translated.phone, '+81');
  assert.equal(translated.state, 'Tokyo');
  assert.equal(translated.city, 'Chiyoda-ku');
  assert.equal(translated.street, 'Marunouchi');
  assert.equal(translated.houseNumber, '1-1');
});

test('translates native building and organization names for English address tabs', async () => {
  const translated = await translateRegistrationFormFields({
    formData: {
      country: 'JP',
      postcode: '150-0002',
      state: '東京都',
      city: '渋谷区',
      street: '渋谷',
      houseNumber: '2-24-12',
      building: '渋谷スクランブルスクエア',
      organization: '中央合同庁舎',
    },
    targetLanguage: 'en',
    countryCode: 'JP',
  });

  assert.equal(translated.building, 'Shibuya Scramble Square');
  assert.equal(translated.organization, 'Chuo Godo Chosha');
  assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(String(translated.building)), false);
  assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(String(translated.organization)), false);
});

test('builds language-tab drafts from postcode open-source autofill data', async () => {
  const drafts = await buildPostcodeAutofillLanguageDrafts({
    formData: {
      country: 'JP',
      postcode: '1000001',
      state: '',
      city: '',
      suburb: '',
    },
    patch: {
      postcode: '1000001',
      state: '東京都',
      city: '千代田区',
      suburb: '千代田',
    },
    countryCode: 'JP',
    languageTabs: ['local', 'en', 'fr'],
    translator: async ({ text, target, source }) => {
      assert.equal(source, 'local');
      return `${target}:${text}`;
    },
  });

  assert.equal(drafts.local.state, '東京都');
  assert.equal(drafts.local.city, '千代田区');
  assert.equal(drafts.en.state, 'Tokyo');
  assert.equal(drafts.en.city, 'Chiyoda-ku');
  assert.equal(drafts.fr.state, 'fr:東京都');
  assert.equal(drafts.fr.city, 'fr:千代田区');
  assert.equal(drafts.en.postcode, '1000001');
});
