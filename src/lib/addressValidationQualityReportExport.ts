import {
  calculateAddressValidationQualityReportDigest,
  type AddressValidationQualityReport,
} from './addressValidationQualityReport';

export const ADDRESS_VALIDATION_QUALITY_REPORT_EXPORT_VERSION = 'address-validation-quality-report-export-v1';

export type AddressValidationQualityReportExport = {
  version: string;
  contentType: 'application/vnd.agid.address-validation-quality-report+json';
  publicationScope: 'internal' | 'public-pending-independent-signature';
  reportDigest: string;
  report: AddressValidationQualityReport;
  privacy: {
    containsRawAddressData: false;
    containsProviderResponses: false;
    containsCredentialsOrKeyMaterial: false;
  };
  nonClaim: string;
};

export type AddressValidationQualityReportExportPreflight = {
  status: 'invalid-export' | 'internal-only' | 'independent-signature-required';
  errors: string[];
  nextActions: string[];
  nonClaim: string;
};

const FORBIDDEN_PROPERTY_NAMES = /(?:^|_)(address|recipient|location|coordinates?|latitude|longitude|lat|lon|postal_?code|postcode|street|building|house_?number|unit|email|phone|credential|secret|privatekey|publickey|signature)(?:$|_)/i;

const REPORT_ALLOWED_PROPERTIES: Record<string, readonly string[]> = {
  report: ['version', 'countryCode', 'publicationStatus', 'evaluatedAt', 'aggregateMetrics', 'measurementTrace', 'officialSourceEvidence', 'officialSourceUpdate', 'gateSummary', 'integrity', 'nonClaim'],
  'report.aggregateMetrics': ['measuredAt', 'sampleCount', 'exactMatchRate', 'falseAcceptRate', 'p95LatencyMs', 'availabilityPct', 'normalizationExactMatchRate', 'typoCorrectionPrecision', 'typoCorrectionFalseChangeRate'],
  'report.measurementTrace': ['protocolVersion', 'metricDefinitionVersion', 'corpusKind', 'scope', 'rawDataHandling', 'testVectorDigest', 'inputScriptClassCount', 'availabilityObservationWindowSeconds'],
  'report.officialSourceEvidence': ['status', 'sourceId', 'sourceVersion', 'sourceUrl', 'retrievedAt', 'validUntil', 'rightsUrl', 'correctionUrl', 'correctionPathEvidenceUrls', 'correctionPathEvidenceNotes'],
  'report.officialSourceUpdate': ['status', 'sourceIds'],
  'report.gateSummary': ['passedCount', 'totalCount', 'blockers'],
  'report.integrity': ['status', 'supportedAlgorithm', 'note'],
};

function assertNoSensitiveProperties(value: unknown, path = 'report'): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveProperties(item, `${path}[${index}]`));
    return;
  }
  const allowedProperties = REPORT_ALLOWED_PROPERTIES[path];
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PROPERTY_NAMES.test(key.replace(/([a-z])([A-Z])/g, '$1_$2'))) {
      throw new Error(`Sensitive property is not permitted in a quality-report export: ${path}.${key}`);
    }
    if (allowedProperties && !allowedProperties.includes(key)) {
      throw new Error(`Unexpected property is not permitted in a quality-report export: ${path}.${key}`);
    }
    assertNoSensitiveProperties(nested, `${path}.${key}`);
  }
}

export function buildAddressValidationQualityReportExport(
  report: AddressValidationQualityReport,
): AddressValidationQualityReportExport {
  assertNoSensitiveProperties(report);
  return {
    version: ADDRESS_VALIDATION_QUALITY_REPORT_EXPORT_VERSION,
    contentType: 'application/vnd.agid.address-validation-quality-report+json',
    publicationScope: report.publicationStatus === 'awaiting-independent-signature'
      ? 'public-pending-independent-signature'
      : 'internal',
    reportDigest: calculateAddressValidationQualityReportDigest(report),
    report,
    privacy: {
      containsRawAddressData: false,
      containsProviderResponses: false,
      containsCredentialsOrKeyMaterial: false,
    },
    nonClaim: 'This export contains aggregate quality evidence only. It is not a delivery result, an address-validation result for any individual input, or a claim of commercial-provider parity.',
  };
}

export function serializeAddressValidationQualityReportExport(
  report: AddressValidationQualityReport,
) {
  return `${JSON.stringify(buildAddressValidationQualityReportExport(report), null, 2)}\n`;
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function preflightAddressValidationQualityReportExport(
  candidate: unknown,
): AddressValidationQualityReportExportPreflight {
  const exported = object(candidate);
  const report = object(exported?.report);
  const errors: string[] = [];
  if (exported?.version !== ADDRESS_VALIDATION_QUALITY_REPORT_EXPORT_VERSION) errors.push('unsupported-export-version');
  if (exported?.contentType !== 'application/vnd.agid.address-validation-quality-report+json') errors.push('unexpected-content-type');
  if (!report) {
    errors.push('report-missing');
  } else {
    try {
      assertNoSensitiveProperties(report);
      if (exported?.reportDigest !== calculateAddressValidationQualityReportDigest(report as AddressValidationQualityReport)) {
        errors.push('report-digest-mismatch');
      }
    } catch {
      errors.push('report-contains-forbidden-sensitive-property');
    }
  }
  const privacy = object(exported?.privacy);
  if (!privacy || privacy.containsRawAddressData !== false || privacy.containsProviderResponses !== false ||
    privacy.containsCredentialsOrKeyMaterial !== false) {
    errors.push('privacy-declaration-invalid');
  }
  if (typeof exported?.nonClaim !== 'string' || !exported.nonClaim.trim()) errors.push('non-claim-missing');

  if (errors.length) {
    return {
      status: 'invalid-export',
      errors,
      nextActions: ['rebuild-the-export-from-a-valid-aggregate-only-quality-report'],
      nonClaim: 'An invalid export must not be treated as publishable evidence.',
    };
  }

  return exported?.publicationScope === 'public-pending-independent-signature'
    ? {
      status: 'independent-signature-required',
      errors: [],
      nextActions: ['obtain-and-verify-an-independent-signature-over-the-report-digest-before-publication'],
      nonClaim: 'Passing export preflight does not publish the report or establish address-validation parity.',
    }
    : {
      status: 'internal-only',
      errors: [],
      nextActions: ['resolve-evidence-or-measurement-blockers-before-requesting-an-independent-signature'],
      nonClaim: 'Internal-only exports are not approved for public distribution.',
    };
}
