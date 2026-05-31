import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchCommunicationHealth } from './CommunicationService';

test('communication health uses the standard AGID API result envelope', async () => {
  const result = await fetchCommunicationHealth(async () => Response.json({
      ok: true,
      data: {
        rest: true,
        sse: true,
        localFirstSync: true,
        externalApiProxy: true,
      },
      sources: ['agid-server'],
      warnings: [],
      requestId: 'req-1',
    }));

  assert.equal(result.ok, true);
  assert.equal(result.data?.rest, true);
  assert.equal(result.data?.sse, true);
  assert.deepEqual(result.sources, ['agid-server']);
});
