import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'App.tsx'), 'utf8');
const persistenceHookSource = readFileSync(join(here, 'hooks', 'useAppDatabasePersistence.ts'), 'utf8');

test('App persists regular address registrations and links them to generated QR payloads', () => {
  assert.match(source, /useAppDatabasePersistence\(\{/);
  assert.match(persistenceHookSource, /agid_registered_addresses/);
  assert.match(persistenceHookSource, /loadAppDatabaseSnapshot/);
  assert.match(persistenceHookSource, /persistRegisteredAddresses/);
  assert.match(persistenceHookSource, /persistSavedQrs/);
  assert.match(source, /buildRegisteredAddressQrPayload/);
  assert.match(source, /buildSavedQrFromRegisteredAddress/);
  assert.match(source, /setRegisteredAddresses/);
  assert.match(persistenceHookSource, /localStorage\.setItem\('saved_qrs', JSON\.stringify\(savedQrs\)\)/);
});

test('App can read registered-address QR payloads before falling back to AGID or general search', () => {
  const qrBlock = source.match(/const handleQrResult = React\.useCallback\(\(text: string\) => \{[\s\S]*?\n  \}, \[[^\]]+\]\);/);

  assert.ok(qrBlock, 'handleQrResult block should exist');
  assert.match(qrBlock[0], /parseRegisteredAddressQrPayload\(result\)/);
  assert.match(qrBlock[0], /Registered address imported from QR/);
  assert.match(qrBlock[0], /setRegisteredAddresses/);
});

test('AOID registrations are saved with the normalized AOID shape and persisted locally', () => {
  assert.match(source, /data\.type === 'AOID' \|\| data\.isAoid/);
  assert.match(persistenceHookSource, /localStorage\.setItem\('agid_grid_aoids', JSON\.stringify\(aoids\)\)/);
});

test('address registration opened from the menu still has a current map AGID and coordinates for QR use', () => {
  assert.match(source, /initialAgid=\{clickedAgid\?\.id \|\| encodeAGID\(lat, lng\)\.id\}/);
  assert.match(source, /currentCoords=\{clickedAgid \? \{ lat: clickedAgid\.lat, lon: clickedAgid\.lon \} : \{ lat, lon: lng \}\}/);
});
