import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseAddressWithOptionalLibpostal } from './libpostalGateway';

test('falls back to local parser when libpostal service is not configured', async () => {
  const result = await parseAddressWithOptionalLibpostal({
    text: '1 Infinite Loop, Cupertino, CA 95014, United States',
    countryCode: 'us',
    fetcher: async () => {
      throw new Error('should not call fetcher without endpoint');
    },
  });

  assert.equal(result.source, 'local-parser');
  assert.equal(result.available, false);
  assert.equal(result.canonical.house_number, '1');
  assert.equal(result.canonical.road, 'Infinite Loop');
  assert.equal(result.canonical.postcode, '95014');
});

test('uses configured libpostal endpoint and normalizes parsed labels', async () => {
  const result = await parseAddressWithOptionalLibpostal({
    text: '〒100-0014 東京都千代田区永田町1-1',
    countryCode: 'jp',
    endpoint: '/api/address/parse',
    fetcher: async (_url, init) => {
      assert.equal(init?.method, 'POST');
      return {
        ok: true,
        json: async () => ({
          source: 'libpostal',
          components: [
            { label: 'postcode', value: '100-0014' },
            { label: 'state', value: '東京都' },
            { label: 'city', value: '千代田区' },
            { label: 'road', value: '永田町' },
            { label: 'house_number', value: '1-1' },
          ],
        }),
      } as Response;
    },
  });

  assert.equal(result.source, 'libpostal');
  assert.equal(result.available, true);
  assert.equal(result.canonical.country_code, 'jp');
  assert.equal(result.canonical.postcode, '100-0014');
  assert.equal(result.canonical.road, '永田町');
});

test('keeps server-side local parser fallback as unavailable', async () => {
  const result = await parseAddressWithOptionalLibpostal({
    text: '10 Downing Street, London SW1A 2AA, United Kingdom',
    countryCode: 'gb',
    endpoint: '/api/address/parse',
    fetcher: async () => ({
      ok: true,
      json: async () => ({
        source: 'local-parser',
        available: false,
        canonical: {
          house_number: '10',
          road: 'Downing Street',
          city: 'London',
          postcode: 'SW1A 2AA',
          country_code: 'gb',
        },
        components: [
          { label: 'house_number', value: '10' },
          { label: 'road', value: 'Downing Street' },
        ],
      }),
    } as Response),
  });

  assert.equal(result.source, 'local-parser');
  assert.equal(result.available, false);
  assert.equal(result.canonical.road, 'Downing Street');
});
