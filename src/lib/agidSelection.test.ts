import assert from 'node:assert/strict';
import { describe,it } from 'node:test';
import { encodeAGID } from './agid';
import { getAgidCoordinates } from './agidSelection';

describe('getAgidCoordinates', () => {
  it('decodes canonical AGID ids', () => {
    const agid = encodeAGID(35.6812, 139.7671);
    const coords = getAgidCoordinates(agid);

    assert.ok(coords);
    assert.ok(Math.abs(coords.lat - 35.6812) < 0.001);
    assert.ok(Math.abs(coords.lon - 139.7671) < 0.001);
  });

  it('falls back to stored coordinates for non-decodable AGID-like selections', () => {
    assert.deepEqual(
      getAgidCoordinates({ id: 'legacy-or-special-id', lat: -33.8688, lon: 151.2093 }),
      { lat: -33.8688, lon: 151.2093 },
    );
  });

  it('returns null when neither id nor stored coordinates are usable', () => {
    assert.equal(getAgidCoordinates({ id: 'bad' }), null);
  });
});
