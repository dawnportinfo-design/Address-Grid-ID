import { createHash } from 'node:crypto';

import {
  ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION,
  type AddressValidationCountryEvaluationPlan,
} from './addressValidationCountryEvaluationPlan';

export const ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_EXPORT_VERSION =
  'address-validation-country-evaluation-plan-export-v1';

export type AddressValidationCountryEvaluationPlanExport = {
  version: string;
  contentType: 'application/vnd.agid.address-validation-country-evaluation-plan+json';
  publicationScope: 'internal-review-only';
  planDigest: string;
  plan: AddressValidationCountryEvaluationPlan;
  privacy: {
    containsRawAddressData: false;
    containsRecipientData: false;
    containsPreciseLocations: false;
    containsCredentialsOrKeyMaterial: false;
  };
  nonClaim: string;
};

export type AddressValidationCountryEvaluationPlanExportPreflight = {
  status: 'invalid-export' | 'internal-review-only';
  errors: string[];
  nextActions: string[];
  nonClaim: string;
};

const FORBIDDEN_PROPERTY_NAMES = /(?:^|_)(address|recipient|location|latitude|longitude|lat|lon|credential|secret|privatekey|publickey|signature)(?:$|_)/i;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Country evaluation plans cannot contain non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  throw new Error('Country evaluation plans must contain JSON-compatible values.');
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function assertNoSensitiveProperties(value: unknown, path = 'plan'): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveProperties(item, `${path}[${index}]`));
    return;
  }
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PROPERTY_NAMES.test(key.replace(/([a-z])([A-Z])/g, '$1_$2'))) {
      throw new Error(`Sensitive property is not permitted in a country-evaluation-plan export: ${path}.${key}`);
    }
    assertNoSensitiveProperties(nested, `${path}.${key}`);
  }
}

export function calculateAddressValidationCountryEvaluationPlanDigest(plan: AddressValidationCountryEvaluationPlan) {
  return createHash('sha256').update(canonicalJson(plan)).digest('hex');
}

export function buildAddressValidationCountryEvaluationPlanExport(
  plan: AddressValidationCountryEvaluationPlan,
): AddressValidationCountryEvaluationPlanExport {
  assertNoSensitiveProperties(plan);
  return {
    version: ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_EXPORT_VERSION,
    contentType: 'application/vnd.agid.address-validation-country-evaluation-plan+json',
    publicationScope: 'internal-review-only',
    planDigest: calculateAddressValidationCountryEvaluationPlanDigest(plan),
    plan,
    privacy: {
      containsRawAddressData: false,
      containsRecipientData: false,
      containsPreciseLocations: false,
      containsCredentialsOrKeyMaterial: false,
    },
    nonClaim: 'This export is an internal review artifact containing country-level aggregate evidence workflow metadata only. It is not a public quality claim, provider comparison, delivery decision, or individual address-validation result.',
  };
}

export function preflightAddressValidationCountryEvaluationPlanExport(
  candidate: unknown,
): AddressValidationCountryEvaluationPlanExportPreflight {
  const exported = object(candidate);
  const plan = object(exported?.plan);
  const errors: string[] = [];
  if (exported?.version !== ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_EXPORT_VERSION) errors.push('unsupported-export-version');
  if (exported?.contentType !== 'application/vnd.agid.address-validation-country-evaluation-plan+json') errors.push('unexpected-content-type');
  if (exported?.publicationScope !== 'internal-review-only') errors.push('publication-scope-invalid');
  if (!plan || plan.version !== ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION) {
    errors.push('plan-missing-or-version-invalid');
  } else {
    try {
      assertNoSensitiveProperties(plan);
      if (exported?.planDigest !== calculateAddressValidationCountryEvaluationPlanDigest(plan as AddressValidationCountryEvaluationPlan)) {
        errors.push('plan-digest-mismatch');
      }
    } catch {
      errors.push('plan-contains-forbidden-sensitive-property');
    }
  }
  const privacy = object(exported?.privacy);
  if (!privacy || privacy.containsRawAddressData !== false || privacy.containsRecipientData !== false ||
    privacy.containsPreciseLocations !== false || privacy.containsCredentialsOrKeyMaterial !== false) {
    errors.push('privacy-declaration-invalid');
  }
  if (typeof exported?.nonClaim !== 'string' || !exported.nonClaim.trim()) errors.push('non-claim-missing');

  return errors.length
    ? {
      status: 'invalid-export',
      errors,
      nextActions: ['rebuild-the-export-from-a-valid-metadata-only-country-evaluation-plan'],
      nonClaim: 'An invalid country evaluation plan export must not be shared for review.',
    }
    : {
      status: 'internal-review-only',
      errors: [],
      nextActions: ['review-source-evidence-and-measurement-gates-without-adding-raw-data-to-the-export'],
      nonClaim: 'Passing this preflight permits internal review only. It does not authorize public release or establish address-validation quality.',
    };
}
