import {
  assessAddressValidationQualityReportAttestation,
  verifyAddressValidationQualityReportSignature,
  type AddressValidationQualityReport,
  type AddressValidationQualityReportAttestation,
} from './addressValidationQualityReport';

export const ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE = 'address-validation-quality-report' as const;

export type AddressValidationQualityReportTrustedPublicKey = {
  id: string;
  algorithm: 'ed25519';
  purpose: typeof ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE;
  publicKeyPem: string;
  validFrom: string;
  validUntil: string;
};

export type AddressValidationQualityReportSignatureVerification = {
  status:
    | 'report-or-attestation-not-ready'
    | 'trusted-key-not-found'
    | 'trusted-key-not-valid-for-attestation'
    | 'signature-invalid'
    | 'signature-verified';
  reissueRequired: boolean;
};

function parseTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function resolveAddressValidationQualityReportTrustedKey(
  keys: AddressValidationQualityReportTrustedPublicKey[],
  attestation: AddressValidationQualityReportAttestation,
): AddressValidationQualityReportTrustedPublicKey | null {
  const key = keys.find(candidate => (
    candidate.id === attestation.keyId &&
    candidate.algorithm === attestation.algorithm &&
    candidate.purpose === ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE
  ));
  if (!key) return null;

  const validFrom = parseTimestamp(key.validFrom);
  const validUntil = parseTimestamp(key.validUntil);
  const signedAt = parseTimestamp(attestation.signedAt);
  if (validFrom === null || validUntil === null || signedAt === null || validUntil <= validFrom) return null;
  return signedAt >= validFrom && signedAt < validUntil ? key : null;
}

export function verifyAddressValidationQualityReportWithKeyring(
  report: AddressValidationQualityReport,
  attestation: AddressValidationQualityReportAttestation,
  checkedAt: string,
  keys: AddressValidationQualityReportTrustedPublicKey[],
): AddressValidationQualityReportSignatureVerification {
  const attestationAssessment = assessAddressValidationQualityReportAttestation(report, attestation, checkedAt);
  if (attestationAssessment.status !== 'signature-verification-required') {
    return {
      status: 'report-or-attestation-not-ready',
      reissueRequired: attestationAssessment.reissueRequired,
    };
  }

  const matchingId = keys.some(key => key.id === attestation.keyId);
  const key = resolveAddressValidationQualityReportTrustedKey(keys, attestation);
  if (!key) {
    return {
      status: matchingId ? 'trusted-key-not-valid-for-attestation' : 'trusted-key-not-found',
      reissueRequired: matchingId,
    };
  }

  return verifyAddressValidationQualityReportSignature(report, attestation, checkedAt, key.publicKeyPem)
    ? { status: 'signature-verified', reissueRequired: false }
    : { status: 'signature-invalid', reissueRequired: true };
}
