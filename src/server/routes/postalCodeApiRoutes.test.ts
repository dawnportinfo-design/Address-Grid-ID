import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import type { Server } from 'node:http';

import { registerPostalCodeApiRoutes } from './postalCodeApiRoutes';

let server: Server;
let baseUrl = '';

before(async () => {
  const app = express();
  app.use(express.json());
  registerPostalCodeApiRoutes(app);
  await new Promise<void>(resolve => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

test('postal code API reports strict no-data capabilities', async () => {
  const response = await fetch(`${baseUrl}/api/postal-codes/capabilities`);
  const body = await response.json() as { ok: boolean; data: { inputBoundary: { rawAddressAccepted: boolean }; outputBoundary: { officialDataReplicated: boolean } } };

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.inputBoundary.rawAddressAccepted, false);
  assert.equal(body.data.outputBoundary.officialDataReplicated, false);
});

test('postal code API performs a local format-only check without echoing the code', async () => {
  const response = await fetch(`${baseUrl}/api/postal-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jurisdictionId: 'PT', postalCode: '0000-000' }),
  });
  const body = await response.json() as { ok: boolean; data: { status: string; formatMatched: boolean; lookupPerformed: boolean; deliveryConfirmed: boolean } };

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.status, 'valid-format');
  assert.equal(body.data.formatMatched, true);
  assert.equal(body.data.lookupPerformed, false);
  assert.equal(body.data.deliveryConfirmed, false);
  assert.equal(JSON.stringify(body).includes('0000-000'), false);
});

test('postal code API rejects raw address material and guards sensitive jurisdictions', async () => {
  const rawResponse = await fetch(`${baseUrl}/api/postal-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jurisdictionId: 'PT', postalCode: '0000-000', addressText: 'not accepted' }),
  });
  const rawBody = await rawResponse.json() as { ok: boolean; warnings: string[] };
  const guardedResponse = await fetch(`${baseUrl}/api/postal-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jurisdictionId: 'EH', postalCode: '00000' }),
  });
  const guardedBody = await guardedResponse.json() as { ok: boolean; data: { status: string; formatMatched: null } };

  assert.equal(rawResponse.status, 400);
  assert.equal(rawBody.ok, false);
  assert.ok(rawBody.warnings.some(warning => warning.startsWith('private-or-address-field:addressText')));
  assert.equal(guardedResponse.status, 403);
  assert.equal(guardedBody.ok, false);
  assert.equal(guardedBody.data.status, 'guarded');
  assert.equal(guardedBody.data.formatMatched, null);
});
