import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatAddress } from './addressUtils';

test('international English converts Japan big-to-small native order into small-to-big shipping order', async () => {
  const formatted = await formatAddress({
    country_code: 'jp',
    country: 'Japan',
    postcode: '100-0005',
    state: '東京都',
    city: '千代田区',
    road: '丸の内',
    house_number: '1-9-1',
    amenity: '東京駅',
    'ISO3166-2-lvl4': 'JP-13',
  }, 'international');

  const lines = formatted.split('\n');
  assert.match(lines[0], /Tokyo Station|Tokyo/i);
  assert.match(formatted, /1-9-1/);
  assert.match(formatted, /Marunouchi|Marunouchi/i);
  assert.match(lines.at(-1) || '', /JAPAN|Japan/);
  const streetIndex = lines.findIndex(line => /1-9-1/.test(line));
  assert.ok(streetIndex >= 0);
  assert.ok(lines.slice(streetIndex + 1).some(line => /Chiyoda|Tokyo|100-0005/i.test(line)));
});

test('international English falls back safely when address metadata is partial', async () => {
  const formatted = await formatAddress({
    country_code: 'zz',
    country: 'Testland',
    city: 'Capital',
    road: 'Main Street',
    house_number: '10',
  }, 'international');

  assert.equal(formatted, '10 Main Street\nCapital\nTESTLAND');
});
