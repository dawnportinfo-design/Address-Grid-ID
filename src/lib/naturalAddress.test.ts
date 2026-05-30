import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildNaturalAddress, formatNaturalAddress } from './naturalAddress';

test('renders marine addresses with sea name, protected area, depth, plus code, and open sources', () => {
  const formatted = formatNaturalAddress({
    sea_context: {
      sea_name: 'Philippine Sea',
      bathymetry: -5420,
      marine_protected_area: 'Mariana Trench Marine National Monument',
      features: [
        { name: 'Philippine Sea', type: 'Sea', distance: 0 },
        { name: 'Mariana Trench', type: 'trench', distance: 18000 },
      ],
    },
    plus_code: '73H9+22',
  });

  assert.ok(formatted);
  assert.match(formatted, /Philippine Sea/);
  assert.match(formatted, /Marine protected area: Mariana Trench Marine National Monument/);
  assert.match(formatted, /Depth: 5420 m below sea level/);
  assert.match(formatted, /Plus Code: 73H9\+22/);
  assert.match(formatted, /Sources: Marine Regions, OpenStreetMap, open elevation\/bathymetry/);
});

test('renders mountain addresses when no street-level address exists', () => {
  const naturalAddress = buildNaturalAddress({
    mountain_name: 'Mount Fuji',
    elevation: 3776,
    state: 'Shizuoka',
    country: 'Japan',
    nature_context: {
      mountains: [
        { name: 'Mount Fuji', type: 'peak', distance: 120 },
        { name: 'Hoeizan', type: 'peak', distance: 2100 },
      ],
    },
    plus_code: { global_code: '8Q7X+XX' },
  });

  assert.ok(naturalAddress);
  assert.equal(naturalAddress.kind, 'mountain');
  assert.equal(naturalAddress.label, 'Mount Fuji');
  assert.ok(naturalAddress.lines.includes('Elevation: 3776 m'));
  assert.ok(naturalAddress.lines.some(line => line.includes('Nearby peaks: Mount Fuji (peak) - 120 m; Hoeizan (peak) - 2.1 km')));
  assert.ok(naturalAddress.sources.includes('OpenStreetMap'));
  assert.ok(naturalAddress.sources.includes('open elevation'));
});

test('renders waterfront and hydrology addresses with beaches, harbours, water risk, and sources', () => {
  const formatted = formatNaturalAddress({
    lake: 'Lake Geneva',
    city: 'Montreux',
    country: 'Switzerland',
    flood_risk: 'Moderate (Water Proximity)',
    nature_context: {
      beaches: [{ name: 'Plage de Clarens', type: 'beach', distance: 450 }],
      ports: [{ name: 'Port de Montreux', type: 'harbour', distance: 620 }],
    },
    plus_code: '8FVF9X2C+M5',
  });

  assert.ok(formatted);
  assert.match(formatted, /Lake Geneva/);
  assert.match(formatted, /Waterfront \/ hydrology address area/);
  assert.match(formatted, /Nearby beaches: Plage de Clarens \(beach\) - 450 m/);
  assert.match(formatted, /Nearby ports or harbours: Port de Montreux \(harbour\) - 620 m/);
  assert.match(formatted, /Water risk: Moderate \(Water Proximity\)/);
  assert.match(formatted, /Montreux, Switzerland/);
  assert.match(formatted, /Sources: OpenStreetMap, open water-risk model/);
});

test('does not replace normal street addresses with natural context', () => {
  const formatted = formatNaturalAddress({
    road: 'Lake Road',
    house_number: '12',
    lake: 'Lake Taupo',
    nature_context: {
      beaches: [{ name: 'Taupo Beach', type: 'beach', distance: 100 }],
    },
  });

  assert.equal(formatted, null);
});
