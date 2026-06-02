import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
buildRegisteredAddressQrPayload,
buildRegisteredAddressRecord,
buildSavedQrFromRegisteredAddress,
parseRegisteredAddressQrPayload,
} from './registeredAddressQr';

test('registered address records keep address data and round-trip through QR payloads', () => {
  const record = buildRegisteredAddressRecord(
    {
      country: 'JP',
      recipient: 'Aoi Kitau',
      organization: 'AGID Lab',
      street: '1-1 Chiyoda',
      suburb: 'Chiyoda-ku',
      city: 'Tokyo',
      state: 'Tokyo',
      postcode: '1000001',
      phone: '+81 90 0000 0000',
    },
    {
      mode: 'ADDRESS',
      agid: 'JP05AV8TJGH8',
      coords: { lat: 35.6895, lon: 139.6917 },
      now: '2026-05-31T00:00:00.000Z',
    },
  );

  assert.equal(record.type, 'ADDRESS');
  assert.equal(record.id, 'JP05AV8TJGH8');
  assert.equal(record.agid, 'JP05AV8TJGH8');
  assert.equal(record.name, 'Aoi Kitau');
  assert.equal(record.address, 'AGID Lab, 1-1 Chiyoda, Chiyoda-ku, Tokyo, Tokyo 1000001, JP');
  assert.equal(record.lat, 35.6895);
  assert.equal(record.lon, 139.6917);

  const payload = buildRegisteredAddressQrPayload(record);

  assert.match(payload, /^agid:address:/);
  assert.deepEqual(parseRegisteredAddressQrPayload(payload), record);
  assert.equal(parseRegisteredAddressQrPayload('JP05AV8TJGH8'), null);
});

test('AOID records use an AOID id while preserving the linked AGID and map position', () => {
  const record = buildRegisteredAddressRecord(
    {
      country: 'JP',
      recipient: 'Minato Receiver',
      street: '2-2 Roppongi',
      city: 'Tokyo',
      state: 'Tokyo',
      postcode: '1060032',
      suburb: 'Minato-ku',
      phone: '+81 3 0000 0000',
    },
    {
      mode: 'AOID',
      id: 'A0IDTEST1',
      agid: 'JP05AV8TJGH8',
      coords: { lat: 35.66, lon: 139.73 },
      now: '2026-05-31T00:10:00.000Z',
    },
  );

  assert.equal(record.type, 'AOID');
  assert.equal(record.id, 'A0IDTEST1');
  assert.equal(record.agid, 'JP05AV8TJGH8');
  assert.equal(record.name, 'Minato Receiver');
  assert.equal(record.address, '2-2 Roppongi, Minato-ku, Tokyo, Tokyo 1060032, JP');
  assert.equal(record.lat, 35.66);
  assert.equal(record.lon, 139.73);
});

test('registered addresses create saved QR entries that can be searched and scanned later', () => {
  const record = buildRegisteredAddressRecord(
    {
      country: 'VN',
      recipient: 'Lan Nguyen',
      organization: 'Landmark 81',
      street: 'Nguyen Huu Canh',
      suburb: 'Ward 22',
      city: 'Ho Chi Minh City',
      postcode: '700000',
    },
    {
      mode: 'ADDRESS',
      agid: 'VN00TEST0001',
      coords: { lat: 10.794, lon: 106.7218 },
      now: '2026-05-31T00:20:00.000Z',
    },
  );
  const payload = buildRegisteredAddressQrPayload(record);
  const savedQr = buildSavedQrFromRegisteredAddress(record, payload, '2026-05-31T00:21:00.000Z');

  assert.equal(savedQr.id, 'VN00TEST0001');
  assert.equal(savedQr.address, 'Landmark 81, Nguyen Huu Canh, Ward 22, Ho Chi Minh City 700000, VN');
  assert.equal(savedQr.regionName, 'VN Registered Address');
  assert.equal(savedQr.payload, payload);
  assert.equal(savedQr.lat, 10.794);
  assert.equal(savedQr.lon, 106.7218);
});
