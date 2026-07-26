import assert from 'node:assert/strict';
import test from 'node:test';

import { createAddressQlHttpServer } from './run-addressql-api';

test('P1 HTTP adapter serves the practical API on loopback without reflecting input', async (context) => {
  const server = createAddressQlHttpServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  }));

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const health = await fetch(`${baseUrl}/v1/health`);
  const validation = await fetch(`${baseUrl}/v1/postal/validate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'http.test-1',
    },
    body: JSON.stringify({
      countryCode: 'JP',
      postalCode: '1000001',
      purpose: 'format',
    }),
  });
  const validationText = await validation.text();
  const validationBody = JSON.parse(validationText) as Record<string, unknown>;

  assert.equal(health.status, 200);
  assert.equal(validation.status, 200);
  assert.equal(validation.headers.get('cache-control'), 'no-store');
  assert.equal(validationBody.requestId, 'http.test-1');
  assert.equal((validationBody.validation as Record<string, unknown>).status, 'pass');
  assert.doesNotMatch(validationText, /100-0001|1000001/);
});

test('P1 HTTP adapter rejects non-JSON and malformed JSON bodies', async (context) => {
  const server = createAddressQlHttpServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  }));

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const nonJson = await fetch(`${baseUrl}/v1/postal/validate`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: '{}',
  });
  const malformed = await fetch(`${baseUrl}/v1/postal/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });

  assert.equal(nonJson.status, 415);
  assert.equal(malformed.status, 400);
});
