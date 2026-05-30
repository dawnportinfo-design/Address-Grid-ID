import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { fetchPolarContext } from './PolarService';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('polar context exposes open geodata sources for Antarctic natural features', async () => {
  globalThis.fetch = async () => new Response('[]', { status: 404 });

  const context = await fetchPolarContext(-75, 45);

  assert.ok(context, 'Antarctic coordinates should return polar context');
  assert.ok(context.openSourceIds?.includes('rema-antarctica'));
  assert.ok(context.openSourceIds?.includes('ibcso-southern-ocean'));
  assert.ok(context.naturalSources?.some(source => source.id === 'bedmap3-antarctica'));
  assert.match(context.seaIce ?? '', /NSIDC/);
  assert.match(context.bathymetry ?? '', /IBCSO|GEBCO/);
});

test('polar context exposes Arctic DEM and ocean sources for Arctic natural features', async () => {
  globalThis.fetch = async () => new Response('[]', { status: 404 });

  const context = await fetchPolarContext(78, 15);

  assert.ok(context, 'Arctic coordinates should return polar context');
  assert.ok(context.openSourceIds?.includes('arcticdem'));
  assert.ok(context.openSourceIds?.includes('ibcao-arctic-ocean'));
  assert.ok(context.naturalSources?.some(source => source.id === 'glims-glacier-db'));
  assert.match(context.bathymetry ?? '', /IBCAO|GEBCO/);
});
