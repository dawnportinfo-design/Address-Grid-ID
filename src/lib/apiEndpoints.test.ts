import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiEndpoints } from './apiEndpoints';

test('builds country admin endpoints with normalized country codes', () => {
  assert.equal(apiEndpoints.countryStats(' jp '), '/api/country-stats?cc=JP');
  assert.equal(apiEndpoints.countryCities('vn'), '/api/country-cities?cc=VN');
  assert.equal(apiEndpoints.countryBoundary('br'), '/api/country-boundary?cc=BR');
});

test('builds encoded search and routing endpoints', () => {
  assert.equal(
    apiEndpoints.osmSearch({ q: 'São Paulo, Brazil', limit: 1, polygonGeojson: true }),
    '/api/osm-search?q=S%C3%A3o+Paulo%2C+Brazil&limit=1&polygon_geojson=1',
  );
  assert.equal(
    apiEndpoints.osrmRoute({ lng: 139.7, lat: 35.6 }, { lng: 139.8, lat: 35.7 }, 'driving'),
    '/api/osrm/route?start=139.7%2C35.6&end=139.8%2C35.7&profile=driving',
  );
});

test('omits optional reverse geocode parameters when absent', () => {
  assert.equal(
    apiEndpoints.nominatimReverse({ lat: 35.6812, lon: 139.7671 }),
    '/api/nominatim/reverse?lat=35.6812&lon=139.7671&zoom=18&addressdetails=1',
  );
});
