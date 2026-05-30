import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AddressFormat } from '../data/address_formats';
import { resolveAddressMorphism } from './addressMorphism';
import { buildMorphismCandidateFromSources } from './addressMorphismSources';

const japanFormat: AddressFormat = {
  countryCode: 'JP',
  name: 'Japan',
  postalCode: {
    format: 'NNN-NNNN',
    regex: '^\\d{3}-\\d{4}$',
    api: 'https://zipcloud.ibsnet.co.jp/api/search?zipcode={{postcode}}',
    source: 'Japan Post / zipcloud',
  },
  openSourceIds: ['zipcloud-jp', 'osm-nominatim', 'openaddresses'],
  addressRules: {
    languages: [{ code: 'ja', name: 'Japanese' }],
    nativeOrder: ['postcode', 'prefecture', 'city', 'districtOrBlock'],
    englishOrder: ['postcode', 'prefecture', 'city', 'block'],
    regionalHierarchy: ['prefecture', 'city'],
    postalCode: { label: '7 digits', required: true, usage: 'required' },
    openSourceIds: ['zipcloud-jp', 'geonames-postal'],
  },
};

test('country JSON and postal OSS metadata strengthen a morphism candidate', () => {
  const candidate = buildMorphismCandidateFromSources({
    id: 'jp-marunouchi',
    label: '東京都千代田区丸の内1丁目9-1',
    canonical: {
      country_code: 'jp',
      state: '東京都',
      city: '千代田区',
      subdistrict: '丸の内',
      road: '丸の内',
      house_number: '1-9-1',
      postcode: '100-0005',
    },
    addressFormat: japanFormat,
    sources: ['parser'],
    confidence: 0.74,
  });

  assert.ok(candidate.validationScore! > 0.9);
  assert.ok(candidate.sources!.includes('zipcloud-jp'));
  assert.ok(candidate.sources!.includes('geonames-postal'));
  assert.equal(candidate.canonical.state, 'Tokyo');
  assert.equal(candidate.canonical.city, 'Chiyoda-ku');
  assert.equal(candidate.canonical.subdistrict, 'Marunouchi');
});

test('Google libaddressinput metadata is promoted as high-trust AMT evidence', () => {
  const candidate = buildMorphismCandidateFromSources({
    id: 'us-googleplex',
    label: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    canonical: {
      country_code: 'us',
      state: 'CA',
      city: 'Mountain View',
      road: 'Amphitheatre Parkway',
      house_number: '1600',
      postcode: '94043',
    },
    addressFormat: {
      countryCode: 'US',
      name: 'United States',
      postalCode: {
        format: 'NNNNN',
        regex: '^\\d{5}([ \\-]\\d{4})?$',
        api: null,
        source: 'libaddressinput',
      },
    },
    sources: ['parser'],
    confidence: 0.62,
  });

  assert.ok(candidate.sources!.includes('google-libaddressinput'));
  assert.ok(candidate.validationScore! > 0.95);
  assert.ok(candidate.confidence! >= 0.9);
});

test('Google Open Location Code strengthens natural addresses without postal codes', () => {
  const candidate = buildMorphismCandidateFromSources({
    id: 'pacific-reef',
    label: 'Remote reef, Pacific Ocean',
    canonical: {
      country_code: 'p1',
      poi: 'Remote reef',
    },
    plusCode: '73H9+22',
    naturalContext: {
      kind: 'sea',
      name: 'Pacific Ocean',
      sourceIds: ['marine-regions'],
    },
    sources: ['parser'],
    confidence: 0.5,
  });

  assert.match(candidate.label, /73H9\+22/);
  assert.ok(candidate.sources!.includes('google-open-location-code'));

  const result = resolveAddressMorphism({
    input: '73H9+22 Pacific Ocean',
    candidates: [candidate],
    context: { purpose: 'emergency' },
  });

  assert.equal(result.status, 'partial');
  assert.ok(result.pid);
});

test('dialect or script romanization is searchable through AMT text energy', () => {
  const candidate = buildMorphismCandidateFromSources({
    id: 'jp-shibuya',
    label: '東京都渋谷区渋谷2丁目',
    canonical: {
      country_code: 'jp',
      state: '東京都',
      city: '渋谷区',
      subdistrict: '渋谷',
      house_number: '2',
      postcode: '150-0002',
    },
    addressFormat: japanFormat,
    sources: ['parser'],
    confidence: 0.7,
  });

  const result = resolveAddressMorphism({
    input: 'Shibuya Tokyo 150-0002',
    candidates: [candidate],
    context: { countryCode: 'jp', postcode: '150-0002' },
  });

  assert.notEqual(result.status, 'unresolved');
  assert.ok(result.energySummary.best < 0.45);
});

test('sea and mountain context can produce a partial natural-address candidate without postal code', () => {
  const candidate = buildMorphismCandidateFromSources({
    id: 'fuji',
    label: 'Mount Fuji summit',
    canonical: {
      country_code: 'jp',
      state: 'Yamanashi',
      poi: 'Mount Fuji',
    },
    naturalContext: {
      kind: 'mountain',
      name: 'Mount Fuji',
      distanceMeters: 80,
      sourceIds: ['osm-overpass', 'geonames-gazetteer'],
    },
    sources: ['osm_nominatim'],
    confidence: 0.78,
  });

  const result = resolveAddressMorphism({
    input: 'Mount Fuji',
    candidates: [candidate],
    context: { countryCode: 'jp', purpose: 'emergency' },
  });

  assert.equal(candidate.naturalContext?.kind, 'mountain');
  assert.equal(result.status, 'partial');
  assert.ok(result.pid);
});
