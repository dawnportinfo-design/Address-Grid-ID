import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatAddress } from './addressUtils';

test('formatAddress uses marine natural address when no street address exists', async () => {
  const formatted = await formatAddress({
    country_code: '74',
    sea_context: {
      sea_name: 'Coral Sea',
      bathymetry: -1400,
      features: [{ name: 'Coral Sea', type: 'Sea', distance: 0 }],
    },
    plus_code: '5R7H+Q2',
  }, 'en');

  assert.match(formatted, /Coral Sea/);
  assert.match(formatted, /Marine address area/);
  assert.match(formatted, /Depth: 1400 m below sea level/);
});

test('formatAddress keeps normal road address even when nearby water context exists', async () => {
  const formatted = await formatAddress({
    country_code: 'nz',
    house_number: '10',
    road: 'Marine Parade',
    city: 'Napier',
    country: 'New Zealand',
    nature_context: {
      beaches: [{ name: 'Napier Beach', type: 'beach', distance: 90 }],
    },
  }, 'en');

  assert.match(formatted, /10 Marine Parade/);
  assert.doesNotMatch(formatted, /Waterfront \/ hydrology address area/);
});
