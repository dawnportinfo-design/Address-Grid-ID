import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildTradeReadinessReport,
  classifyHsCodeScope,
  normalizeHsCode,
  normalizeIncoterm,
  selectTradeOpenSources,
} from './tradeOpenSource';

test('normalizes HS codes and classifies their depth', () => {
  assert.equal(normalizeHsCode('8471.30.0100'), '8471300100');
  assert.equal(classifyHsCodeScope('84'), 'chapter');
  assert.equal(classifyHsCodeScope('8471'), 'heading');
  assert.equal(classifyHsCodeScope('8471.30'), 'subheading');
  assert.equal(classifyHsCodeScope('8471.30.0100'), 'tariff-line');
});

test('accepts Incoterms 2020 codes without exposing long copyrighted rule text', () => {
  assert.equal(normalizeIncoterm(' fob '), 'FOB');
  assert.equal(normalizeIncoterm('XYZ'), undefined);
});

test('selects open trade sources for ocean shipments involving the United States', () => {
  const sourceIds = selectTradeOpenSources({
    originCountryCode: 'JP',
    destinationCountryCode: 'US',
    mode: 'ocean',
  }).map(source => source.id);

  assert.deepEqual(sourceIds, ['un-locode', 'dcsa-openapi', 'wco-hs-reference', 'usitc-hts']);
});

test('builds a customs readiness report for international parcels', () => {
  const report = buildTradeReadinessReport({
    originCountryCode: 'JP',
    destinationCountryCode: 'DE',
    mode: 'parcel',
    incoterm: 'DAP',
    items: [
      {
        description: 'Cotton shirt',
        hsCode: '6205.20',
        value: 32,
        currency: 'USD',
        weightKg: 0.4,
        quantity: 1,
      },
    ],
  });

  assert.equal(report.normalizedIncoterm, 'DAP');
  assert.deepEqual(report.sources.map(source => source.id), ['wco-hs-reference']);
  assert.ok(report.documentHints.includes('customs declaration'));
  assert.equal(report.itemChecks[0].normalizedHsCode, '620520');
  assert.equal(report.itemChecks[0].warnings.length, 0);
});

test('flags missing trade data and regulated-item hints', () => {
  const report = buildTradeReadinessReport({
    originCountryCode: 'US',
    destinationCountryCode: 'CA',
    mode: 'air',
    incoterm: 'bad',
    items: [
      {
        description: '',
        containsBattery: true,
        value: -1,
        weightKg: 0,
      },
    ],
  });

  assert.match(report.warnings.join('\n'), /Unsupported Incoterms 2020 code/);
  assert.ok(report.sources.some(source => source.id === 'un-locode'));
  assert.ok(report.sources.some(source => source.id === 'usitc-hts'));
  assert.match(report.itemChecks[0].warnings.join('\n'), /Battery shipment/);
  assert.match(report.itemChecks[0].warnings.join('\n'), /HS code is missing/);
});
