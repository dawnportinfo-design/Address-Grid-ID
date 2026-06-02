import assert from 'node:assert/strict';
import { readdirSync,readFileSync,statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
ADDRESS_COVERAGE_POLICY_IDS,
classifyAddressCoveragePolicy,
summarizeAddressCoveragePolicies,
} from './addressCoveragePolicy';

const root = join(process.cwd(), 'src', 'data', 'address_formats');

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

test('classifies reliable postal APIs for strong postal autofill and verification', () => {
  const policy = classifyAddressCoveragePolicy({
    countryCode: 'JP',
    name: 'Japan',
    postalCode: {
      regex: '^\\d{3}-\\d{4}$',
      api: 'https://zipcloud.ibsnet.co.jp/api/search?zipcode={{postcode}}',
      source: 'Japan Post / zipcloud / jageocoder / Geolonia',
      format: 'NNN-NNNN',
    },
    addressRules: {
      postalCode: { label: '7 digits', required: true, usage: 'required' },
      openSourceIds: ['zipcloud-jp', 'japan-postcode-api', 'gsi-japan-tiles'],
    },
  });

  assert.equal(policy.id, 'postal-reliable-api');
  assert.equal(policy.validationMode, 'strong-postal');
  assert.equal(policy.autofillMode, 'postal-code');
});

test('classifies weak postal sources as candidate-only and manual-first', () => {
  const policy = classifyAddressCoveragePolicy({
    countryCode: 'ML',
    name: 'Mali',
    postalCode: {
      regex: '^\\d{4}$',
      api: null,
      source: 'GeoNames postal / regional table',
      format: 'NNNN',
    },
    addressRules: {
      postalCode: { label: '4 digits', required: true, usage: 'required' },
      openSourceIds: ['geonames-postal'],
    },
  });

  assert.equal(policy.id, 'postal-weak-api');
  assert.equal(policy.validationMode, 'format-and-candidates');
  assert.equal(policy.autofillMode, 'candidate-only');
});

test('classifies no-postal countries with strong official geography as geo verified', () => {
  const policy = classifyAddressCoveragePolicy({
    countryCode: 'HK',
    name: 'Hong Kong',
    postalCode: {
      regex: null,
      api: null,
      source: 'Hongkong Post / LandsD / CSDI (No postal codes used)',
      format: 'None',
    },
    addressRules: {
      postalCode: null,
      openSourceIds: ['landsd-hk', 'csdi-hk', 'osm-hong-kong', 'overture-maps'],
    },
  });

  assert.equal(policy.id, 'no-postal-strong-geo');
  assert.equal(policy.validationMode, 'geo-verified');
  assert.equal(policy.autofillMode, 'geo-fields');
});

test('classifies no-postal weak geography areas as manual required', () => {
  const policy = classifyAddressCoveragePolicy({
    countryCode: 'BT_T',
    name: 'Bir Tawil',
    postalCode: {
      regex: null,
      api: null,
      source: 'Special/disputed territory metadata; validate with OSM/Nominatim when available',
      format: null,
    },
    addressRules: {
      postalCode: { label: 'Not separately standardized', required: false, usage: 'limited' },
      openSourceIds: ['osm-nominatim', 'geonames-gazetteer'],
    },
  });

  assert.equal(policy.id, 'no-postal-weak-geo');
  assert.equal(policy.validationMode, 'manual-required');
  assert.equal(policy.autofillMode, 'manual');
});

test('all country, territory, and disputed address-format JSON files receive one policy class', () => {
  const formats = walkJsonFiles(root).map(file => JSON.parse(readFileSync(file, 'utf8')));
  const summary = summarizeAddressCoveragePolicies(formats);

  assert.equal(summary.total, formats.length);
  for (const id of ADDRESS_COVERAGE_POLICY_IDS) {
    assert.ok(summary.byPolicy[id], `${id} should exist in summary`);
    assert.ok(summary.byPolicy[id].countryCodes.length > 0, `${id} should include at least one country or territory`);
  }
});
