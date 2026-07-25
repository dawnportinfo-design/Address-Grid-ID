import {
  assessAddressValidationCommercialParity,
  type AddressValidationCommercialParityInput,
} from './addressVerificationBenchmark';
import { createHash, verify as verifySignature } from 'node:crypto';
import {
  assessAddressValidationOfficialSourceEvidence,
  assessAddressValidationOfficialSourceEvidenceLedger,
  type AddressValidationOfficialSourceEvidenceLedger,
  type AddressValidationQualityOfficialSourceEvidence,
} from './addressValidationOfficialSourceEvidenceLedger';
import { buildAddressValidationOfficialSourceUpdateQueue } from './addressValidationOfficialSourceUpdateQueue';

export type { AddressValidationQualityOfficialSourceEvidence } from './addressValidationOfficialSourceEvidenceLedger';

export const ADDRESS_VALIDATION_QUALITY_REPORT_VERSION = 'address-validation-quality-report-v1';
export const ADDRESS_VALIDATION_QUALITY_REPORT_SIGNATURE_CONTEXT = 'agid-address-validation-quality-report';

export type AddressValidationQualityReport = {
  version: string;
  countryCode: string;
  publicationStatus:
    | 'internal-only-evidence-incomplete'
    | 'internal-only-measurement-incomplete'
    | 'internal-only-source-evidence-not-current'
    | 'awaiting-independent-signature';
  evaluatedAt: string | null;
  aggregateMetrics: {
    measuredAt: string;
    sampleCount: number;
    exactMatchRate: number;
    falseAcceptRate: number;
    p95LatencyMs: number;
    availabilityPct: number;
    normalizationExactMatchRate: number | null;
    typoCorrectionPrecision: number | null;
    typoCorrectionFalseChangeRate: number | null;
  } | null;
  measurementTrace: {
    protocolVersion: string;
    metricDefinitionVersion: string;
    corpusKind: 'synthetic' | 'aggregate-only';
    scope: 'country-specific-holdout';
    rawDataHandling: 'no-raw-addresses-or-responses-recorded';
    testVectorDigest: string;
    inputScriptClassCount: number | null;
    availabilityObservationWindowSeconds: number | null;
  } | null;
  officialSourceEvidence: {
    status: 'fresh' | 'missing-or-not-current';
    sourceId: string | null;
    sourceVersion: string | null;
    sourceUrl: string | null;
    retrievedAt: string | null;
    validUntil: string | null;
    rightsUrl: string | null;
    correctionUrl: string | null;
    correctionPathEvidenceUrls: string[];
    correctionPathEvidenceNotes: string[];
  };
  officialSourceUpdate: {
    status: 'not-provided' | 'current' | 'renewal-due' | 'blocking' | 'country-mismatch';
    sourceIds: string[];
  };
  gateSummary: {
    passedCount: number;
    totalCount: number;
    blockers: string[];
  };
  integrity: {
    status: 'external-signature-required';
    supportedAlgorithm: 'ed25519';
    note: string;
  };
  nonClaim: string;
};

export type AddressValidationQualityReportAttestation = {
  algorithm: 'ed25519';
  keyId: string;
  signedAt: string;
  validUntil: string;
  reportDigest: string;
  signature: string;
};

export type AddressValidationQualityReportAttestationAssessment = {
  status:
    | 'report-not-ready'
    | 'report-digest-mismatch'
    | 'attestation-not-yet-valid'
    | 'attestation-expired'
    | 'signature-verification-required';
  reissueRequired: boolean;
  signaturePayload: string | null;
};

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Quality reports cannot contain non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  throw new Error('Quality reports must contain JSON-compatible values.');
}

export function calculateAddressValidationQualityReportDigest(report: AddressValidationQualityReport) {
  return createHash('sha256').update(canonicalJson(report)).digest('hex');
}

function parseTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function officialSourceEvidenceStatus(
  source: AddressValidationQualityOfficialSourceEvidence | undefined,
  evaluatedAt: string | undefined,
) {
  return assessAddressValidationOfficialSourceEvidence(source, evaluatedAt || '') === 'expired-or-invalid'
    ? 'missing-or-not-current'
    : 'fresh';
}

function officialSourceEvidenceMatchesLedger(
  source: AddressValidationQualityOfficialSourceEvidence | undefined,
  ledger: AddressValidationOfficialSourceEvidenceLedger | undefined,
) {
  if (!ledger) return true;
  if (!source) return false;
  const sameStrings = (left: string[] | undefined, right: string[] | undefined) =>
    JSON.stringify([...(left || [])].sort()) === JSON.stringify([...(right || [])].sort());
  return ledger.records.some(record =>
    record.sourceId === source.sourceId &&
    record.sourceVersion === source.sourceVersion &&
    record.sourceUrl === source.sourceUrl &&
    record.retrievedAt === source.retrievedAt &&
    record.validUntil === source.validUntil &&
    record.rightsUrl === source.rightsUrl &&
    record.correctionUrl === source.correctionUrl &&
    sameStrings(record.correctionPathEvidenceUrls, source.correctionPathEvidenceUrls) &&
    sameStrings(record.correctionPathEvidenceNotes, source.correctionPathEvidenceNotes),
  );
}

function signaturePayload(digest: string) {
  return `${ADDRESS_VALIDATION_QUALITY_REPORT_SIGNATURE_CONTEXT}.${digest}`;
}

export function assessAddressValidationQualityReportAttestation(
  report: AddressValidationQualityReport,
  attestation: AddressValidationQualityReportAttestation,
  checkedAt: string,
): AddressValidationQualityReportAttestationAssessment {
  if (report.publicationStatus !== 'awaiting-independent-signature') {
    return { status: 'report-not-ready', reissueRequired: false, signaturePayload: null };
  }

  const digest = calculateAddressValidationQualityReportDigest(report);
  if (attestation.reportDigest !== digest) {
    return { status: 'report-digest-mismatch', reissueRequired: true, signaturePayload: null };
  }

  const signedAt = parseTimestamp(attestation.signedAt);
  const validUntil = parseTimestamp(attestation.validUntil);
  const now = parseTimestamp(checkedAt);
  if (signedAt === null || validUntil === null || now === null || validUntil <= signedAt || signedAt > now) {
    return { status: 'attestation-not-yet-valid', reissueRequired: true, signaturePayload: null };
  }
  if (validUntil <= now) {
    return { status: 'attestation-expired', reissueRequired: true, signaturePayload: null };
  }

  return {
    status: 'signature-verification-required',
    reissueRequired: false,
    signaturePayload: signaturePayload(digest),
  };
}

export function verifyAddressValidationQualityReportSignature(
  report: AddressValidationQualityReport,
  attestation: AddressValidationQualityReportAttestation,
  checkedAt: string,
  trustedPublicKeyPem: string,
) {
  const assessment = assessAddressValidationQualityReportAttestation(report, attestation, checkedAt);
  if (assessment.status !== 'signature-verification-required' || !assessment.signaturePayload) return false;

  try {
    return verifySignature(
      null,
      Buffer.from(assessment.signaturePayload, 'utf8'),
      trustedPublicKeyPem,
      Buffer.from(attestation.signature, 'base64url'),
    );
  } catch {
    return false;
  }
}

export function buildAddressValidationQualityReport(
  input: AddressValidationCommercialParityInput,
  officialSourceEvidence?: AddressValidationQualityOfficialSourceEvidence,
  officialSourceEvidenceLedger?: AddressValidationOfficialSourceEvidenceLedger,
): AddressValidationQualityReport {
  const readiness = assessAddressValidationCommercialParity(input);
  const aggregate = input.aggregateEvaluation;
  const contract = aggregate?.measurementContract;
  const recordedSourceEvidenceStatus = officialSourceEvidenceStatus(officialSourceEvidence, input.evaluatedAt);
  const ledgerAssessment = officialSourceEvidenceLedger && input.evaluatedAt
    ? assessAddressValidationOfficialSourceEvidenceLedger(officialSourceEvidenceLedger, input.evaluatedAt)
    : null;
  const ledgerCountryMatches = !ledgerAssessment || ledgerAssessment.countryCode === readiness.countryCode;
  const sourceEvidenceLedgerMatches = officialSourceEvidenceMatchesLedger(
    officialSourceEvidence,
    officialSourceEvidenceLedger,
  );
  const sourceEvidenceStatus = recordedSourceEvidenceStatus === 'fresh' && ledgerCountryMatches && sourceEvidenceLedgerMatches
    ? 'fresh' as const
    : 'missing-or-not-current' as const;
  const sourceEvidenceLedgerBlockers = [
    officialSourceEvidenceLedger && !ledgerCountryMatches ? 'official-source-evidence-ledger-country-mismatch' : null,
    officialSourceEvidenceLedger && !sourceEvidenceLedgerMatches ? 'official-source-evidence-ledger-provenance-mismatch' : null,
  ].filter(Boolean) as string[];
  const sourceUpdateItem = officialSourceEvidenceLedger && input.evaluatedAt
    ? buildAddressValidationOfficialSourceUpdateQueue([officialSourceEvidenceLedger], input.evaluatedAt).items[0]
    : undefined;
  const sourceUpdate = !officialSourceEvidenceLedger
    ? { status: 'not-provided' as const, sourceIds: [] }
    : !ledgerCountryMatches
      ? { status: 'country-mismatch' as const, sourceIds: [] }
      : sourceUpdateItem
        ? {
          status: sourceUpdateItem.priority === 'blocking' ? 'blocking' as const : 'renewal-due' as const,
          sourceIds: sourceUpdateItem.sourceIds,
        }
        : { status: 'current' as const, sourceIds: [] };
  const publicationStatus = readiness.status === 'blocked'
    ? 'internal-only-evidence-incomplete'
    : readiness.status === 'measurement-required'
      ? 'internal-only-measurement-incomplete'
      : sourceEvidenceStatus !== 'fresh'
        ? 'internal-only-source-evidence-not-current'
        : sourceUpdate.status === 'blocking' || sourceUpdate.status === 'renewal-due' || sourceUpdate.status === 'country-mismatch'
          ? 'internal-only-source-evidence-not-current'
          : 'awaiting-independent-signature';

  return {
    version: ADDRESS_VALIDATION_QUALITY_REPORT_VERSION,
    countryCode: readiness.countryCode,
    publicationStatus,
    evaluatedAt: input.evaluatedAt || null,
    aggregateMetrics: aggregate ? {
      measuredAt: aggregate.measuredAt,
      sampleCount: aggregate.sampleCount,
      exactMatchRate: aggregate.exactMatchRate,
      falseAcceptRate: aggregate.falseAcceptRate,
      p95LatencyMs: aggregate.p95LatencyMs,
      availabilityPct: aggregate.availabilityPct,
      normalizationExactMatchRate: aggregate.normalizationExactMatchRate ?? null,
      typoCorrectionPrecision: aggregate.typoCorrectionPrecision ?? null,
      typoCorrectionFalseChangeRate: aggregate.typoCorrectionFalseChangeRate ?? null,
    } : null,
    measurementTrace: contract ? {
      protocolVersion: contract.protocolVersion,
      metricDefinitionVersion: contract.metricDefinitionVersion,
      corpusKind: contract.corpusKind,
      scope: contract.scope,
      rawDataHandling: contract.rawDataHandling,
      testVectorDigest: contract.testVectorDigest,
      inputScriptClassCount: contract.inputScriptClassCount ?? null,
      availabilityObservationWindowSeconds: contract.availabilityObservationWindowSeconds ?? null,
    } : null,
    officialSourceEvidence: {
      status: sourceEvidenceStatus,
      sourceId: officialSourceEvidence?.sourceId || null,
      sourceVersion: officialSourceEvidence?.sourceVersion || null,
      sourceUrl: officialSourceEvidence?.sourceUrl || null,
      retrievedAt: officialSourceEvidence?.retrievedAt || null,
      validUntil: officialSourceEvidence?.validUntil || null,
      rightsUrl: officialSourceEvidence?.rightsUrl || null,
      correctionUrl: officialSourceEvidence?.correctionUrl || null,
      correctionPathEvidenceUrls: officialSourceEvidence?.correctionPathEvidenceUrls || [],
      correctionPathEvidenceNotes: officialSourceEvidence?.correctionPathEvidenceNotes || [],
    },
    officialSourceUpdate: sourceUpdate,
    gateSummary: {
      passedCount: readiness.gates.filter(gate => gate.passed).length,
      totalCount: readiness.gates.length,
      blockers: [...new Set([...readiness.blockers, ...sourceEvidenceLedgerBlockers])],
    },
    integrity: {
      status: 'external-signature-required',
      supportedAlgorithm: 'ed25519',
      note: 'The report intentionally contains no signature, key material, raw address, provider response, or test vector. An independent release process must sign the finalized artifact.',
    },
    nonClaim: `${readiness.nonClaim} This report publishes aggregate evidence only and is not a deliverability result for any address.`,
  };
}
