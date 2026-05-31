import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'App.tsx'), 'utf8');

test('shows an explicit map location permission button before a location is available', () => {
  assert.match(source, /locationPermissionState/);
  assert.match(source, /isMapLoaded && !userLocation && locationPermissionState !== 'unsupported' && locationPermissionState !== 'denied'/);
  assert.match(source, /t\('allow_location_access'\)/);
  assert.match(source, /onClick=\{jumpToMyLocation\}/);
});

test('location permission button uses the same geolocation flow that updates the map', () => {
  const jumpBlock = source.match(/const jumpToMyLocation = React\.useCallback\(\(\) => \{[\s\S]*?\n  \}, \[[^\]]+\]\);/);

  assert.ok(jumpBlock, 'jumpToMyLocation block should exist');
  assert.match(jumpBlock[0], /navigator\.geolocation\.getCurrentPosition/);
  assert.match(jumpBlock[0], /setLocationPermissionState\('granted'\)/);
  assert.match(jumpBlock[0], /setUserLocation/);
  assert.match(jumpBlock[0], /map\.current\?\.flyTo/);
  assert.match(jumpBlock[0], /reverseGeocode/);
});

test('location denied state is silent instead of repeatedly showing blocked copy', () => {
  const jumpBlock = source.match(/const jumpToMyLocation = React\.useCallback\(\(\) => \{[\s\S]*?\n  \}, \[[^\]]+\]\);/);

  assert.ok(jumpBlock, 'jumpToMyLocation block should exist');
  assert.match(jumpBlock[0], /setLocationPermissionState\('denied'\)/);
  assert.doesNotMatch(jumpBlock[0], /showAlert\(t\('gps_blocked_title'\), t\('gps_blocked_body'\)\)/);
  assert.doesNotMatch(source, /locationPermissionState === 'denied'\s*\?\s*t\('location_permission_blocked'\)/);
});
