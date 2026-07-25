import type { Express } from 'express';

import {
  getPostalCodeApiCapabilities,
  getPostalCodeApiProfile,
  validatePostalCodeApiFormat,
} from '../../lib/postalCodeApi';
import { getServerAddressFormat } from '../addressFormatFileLoader';
import { sendAgidResult } from '../agidResult';
import { objectBody, type JsonRecord } from '../requestParsing';

const ALLOWED_REQUEST_FIELDS = new Set(['jurisdictionid', 'postalcode']);
const PRIVATE_OR_ADDRESS_FIELDS = new Set([
  'address',
  'addresstext',
  'city',
  'country',
  'countrycode',
  'email',
  'house',
  'housenumber',
  'name',
  'recipient',
  'street',
  'telephone',
]);

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z]/g, '');
}

function invalidRequestField(body: JsonRecord) {
  for (const key of Object.keys(body)) {
    const normalized = normalizeKey(key);
    if (PRIVATE_OR_ADDRESS_FIELDS.has(normalized)) return `private-or-address-field:${key}`;
    if (!ALLOWED_REQUEST_FIELDS.has(normalized)) return `unsupported-request-field:${key}`;
  }
  return undefined;
}

function formatRegexFor(jurisdictionId: unknown) {
  const profile = getPostalCodeApiProfile(jurisdictionId);
  if (!profile?.formatLookupCode) return undefined;
  return getServerAddressFormat(profile.formatLookupCode)?.postalCode?.regex;
}

export function registerPostalCodeApiRoutes(app: Express) {
  app.get('/api/postal-codes/capabilities', (req, res) => {
    return sendAgidResult(req, res, {
      ok: true,
      data: getPostalCodeApiCapabilities(),
      confidence: 1,
      sources: ['agid-postal-code-api-profile-v1'],
      warnings: [],
      cache: 'none',
    });
  });

  app.post('/api/postal-codes/validate', (req, res) => {
    const body = objectBody(req.body);
    const rejectedField = invalidRequestField(body);
    if (rejectedField) {
      return sendAgidResult(req, res, {
        ok: false,
        error: 'Postal code API accepts only jurisdictionId and postalCode.',
        sources: ['agid-postal-code-api-profile-v1'],
        warnings: [rejectedField, 'Raw address and recipient material are not accepted.'],
        cache: 'none',
      }, 400);
    }

    const result = validatePostalCodeApiFormat({
      jurisdictionId: body.jurisdictionId,
      postalCode: body.postalCode,
      formatRegex: formatRegexFor(body.jurisdictionId),
    });
    const status = result.status === 'guarded'
      ? 403
      : result.status === 'unsupported'
        ? 404
        : 200;
    const ok = result.status !== 'guarded' && result.status !== 'unsupported';

    return sendAgidResult(req, res, {
      ok,
      data: result,
      error: ok ? undefined : result.status,
      confidence: result.status === 'valid-format' || result.status === 'invalid-format' ? 1 : 0.5,
      sources: [
        'agid-postal-code-api-profile-v1',
        ...(result.status === 'valid-format' || result.status === 'invalid-format'
          ? ['local-address-format-metadata']
          : []),
      ],
      warnings: result.warnings,
      cache: 'none',
    }, status);
  });
}
