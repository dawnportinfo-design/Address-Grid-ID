import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
expandSearchQuery,
normalizeSearchText,
scoreSearchCandidate,
} from './searchQuery';

test('expands multilingual place queries into English and native search candidates', () => {
  assert.deepEqual(expandSearchQuery('東京都').slice(0, 2), ['東京都', 'Tokyo']);
  assert.ok(expandSearchQuery('Ciudad de México').includes('Mexico City'));
  assert.ok(expandSearchQuery('Bogotá').includes('Bogota'));
  assert.ok(expandSearchQuery('São Paulo').includes('Sao Paulo'));
  assert.ok(expandSearchQuery('কলকাতা').includes('Kolkata'));
  assert.ok(expandSearchQuery('eGoli').includes('Johannesburg'));
  assert.ok(expandSearchQuery('iKapa').includes('Cape Town'));
});

test('adds typo-tolerant candidate queries for common global place names', () => {
  assert.ok(expandSearchQuery('Tokio').includes('Tokyo'));
  assert.ok(expandSearchQuery('Mexcio City').includes('Mexico City'));
  assert.ok(expandSearchQuery('Bogtoa').includes('Bogota'));
  assert.ok(expandSearchQuery('Sao Paolo').includes('Sao Paulo'));
  assert.ok(expandSearchQuery('Bangalore').includes('Bengaluru'));
  assert.ok(expandSearchQuery('Banaras').includes('Varanasi'));
  assert.ok(expandSearchQuery('Gqeberha').includes('Port Elizabeth'));
  assert.ok(expandSearchQuery('Pietersburg').includes('Polokwane'));
});

test('normalizes search text for accent-insensitive local matching', () => {
  assert.equal(normalizeSearchText('  São   José, Costa Rica  '), 'sao jose costa rica');
  assert.equal(normalizeSearchText('Av. Reforma #123'), 'avenida reforma 123');
});

test('scores exact, accent-insensitive, and typo-near candidates above unrelated text', () => {
  const queryVariants = expandSearchQuery('Bogtoa');

  assert.ok(scoreSearchCandidate('Bogotá, Colombia', queryVariants) > scoreSearchCandidate('Buenos Aires', queryVariants));
  assert.ok(scoreSearchCandidate('Bogota', queryVariants) >= 0.9);
});
