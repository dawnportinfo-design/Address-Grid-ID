import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AgidHttpError,agidFetch,normalizeAgidApiResult } from './agidHttpClient';

test('normalizes legacy API JSON into a standard AGID result', () => {
  const result = normalizeAgidApiResult<{ name: string }>(
    { name: 'Tokyo Station' },
    { requestId: 'req-1', source: 'osm-nominatim' },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { name: 'Tokyo Station' });
  assert.deepEqual(result.sources, ['osm-nominatim']);
  assert.equal(result.requestId, 'req-1');
});

test('keeps server-provided AGID result metadata', () => {
  const result = normalizeAgidApiResult<{ postcode: string }>(
    {
      ok: true,
      data: { postcode: '100-0005' },
      confidence: 0.92,
      sources: ['japan-post'],
      warnings: ['partial'],
      cache: 'hit',
      requestId: 'req-server',
    },
    { requestId: 'req-client' },
  );

  assert.equal(result.requestId, 'req-server');
  assert.equal(result.confidence, 0.92);
  assert.deepEqual(result.sources, ['japan-post']);
  assert.deepEqual(result.warnings, ['partial']);
});

test('agidFetch retries idempotent failed requests and returns normalized data', async () => {
  let calls = 0;
  const result = await agidFetch<{ okValue: number }>('/api/example', {
    retries: 1,
    fetcher: async () => {
      calls += 1;
      if (calls === 1) return new Response('temporary', { status: 503 });
      return Response.json({ okValue: 1 });
    },
  });

  assert.equal(calls, 2);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { okValue: 1 });
});

test('agidFetch does not retry POST unless retryUnsafe is enabled', async () => {
  let calls = 0;
  await assert.rejects(
    agidFetch('/api/example', {
      method: 'POST',
      retries: 2,
      fetcher: async () => {
        calls += 1;
        return new Response('temporary', { status: 503 });
      },
    }),
    (error: unknown) => error instanceof AgidHttpError && error.code === 'HTTP',
  );

  assert.equal(calls, 1);
});

