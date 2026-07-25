import {
  type AddressValidationQualityReport,
  type AddressValidationQualityReportAttestation,
} from './addressValidationQualityReport';
import { OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS } from './addressValidationOfficialSourceEvidenceLedger';
import {
  verifyAddressValidationQualityReportWithKeyring,
  type AddressValidationQualityReportTrustedPublicKey,
} from './addressValidationQualityKeyring';
import {
  preflightAddressValidationQualityReportExport,
  type AddressValidationQualityReportExport,
} from './addressValidationQualityReportExport';

export type AddressValidationQualityReportReleaseAssessment = {
  status: 'blocked' | 'publishable-aggregate-evidence';
  blockers: string[];
  nextActions: string[];
  nonClaim: string;
};

function isHttpUrl(value: string | null) {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function releaseSourceFreshnessBlockers(report: AddressValidationQualityReport, checkedAt: string) {
  const checkedTimestamp = Date.parse(checkedAt);
  const retrievedTimestamp = Date.parse(report.officialSourceEvidence.retrievedAt || '');
  const validUntilTimestamp = Date.parse(report.officialSourceEvidence.validUntil || '');
  const renewalLeadMs = OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS * 24 * 60 * 60 * 1000;

  return [
    report.officialSourceEvidence.status !== 'fresh' ? 'official-source-evidence-not-fresh-at-release' : null,
    !isHttpUrl(report.officialSourceEvidence.sourceUrl)
      ? 'official-source-url-invalid-at-release'
      : null,
    !isHttpUrl(report.officialSourceEvidence.rightsUrl)
      ? 'official-source-rights-url-invalid-at-release'
      : null,
    !isHttpUrl(report.officialSourceEvidence.correctionUrl)
      ? 'official-source-correction-url-invalid-at-release'
      : null,
    Number.isNaN(checkedTimestamp) || Number.isNaN(retrievedTimestamp) || Number.isNaN(validUntilTimestamp)
      ? 'official-source-evidence-timestamp-invalid-at-release'
      : null,
    !Number.isNaN(checkedTimestamp) && !Number.isNaN(retrievedTimestamp) && retrievedTimestamp > checkedTimestamp
      ? 'official-source-evidence-retrieval-time-invalid-at-release'
      : null,
    !Number.isNaN(checkedTimestamp) && !Number.isNaN(validUntilTimestamp) && validUntilTimestamp <= checkedTimestamp
      ? 'official-source-evidence-expired-at-release'
      : null,
    !Number.isNaN(checkedTimestamp) && !Number.isNaN(validUntilTimestamp) && validUntilTimestamp > checkedTimestamp &&
      validUntilTimestamp - checkedTimestamp <= renewalLeadMs
      ? 'official-source-evidence-renewal-due-at-release'
      : null,
  ].filter(Boolean) as string[];
}

function releaseAttestationTimingBlockers(
  report: AddressValidationQualityReport,
  attestation: AddressValidationQualityReportAttestation,
) {
  const evaluatedTimestamp = Date.parse(report.evaluatedAt || '');
  const signedTimestamp = Date.parse(attestation.signedAt || '');
  const measuredTimestamp = Date.parse(report.aggregateMetrics?.measuredAt || '');
  const retrievedTimestamp = Date.parse(report.officialSourceEvidence.retrievedAt || '');
  return [
    Number.isNaN(evaluatedTimestamp) ? 'quality-report-evaluated-at-invalid-at-release' : null,
    Number.isNaN(signedTimestamp) ? 'independent-attestation-signed-at-invalid-at-release' : null,
    Number.isNaN(measuredTimestamp) ? 'aggregate-measurement-time-invalid-at-release' : null,
    !Number.isNaN(evaluatedTimestamp) && !Number.isNaN(signedTimestamp) && signedTimestamp < evaluatedTimestamp
      ? 'independent-attestation-predates-report-evaluation'
      : null,
    !Number.isNaN(evaluatedTimestamp) && !Number.isNaN(measuredTimestamp) && evaluatedTimestamp < measuredTimestamp
      ? 'quality-report-evaluation-predates-aggregate-measurement'
      : null,
    !Number.isNaN(evaluatedTimestamp) && !Number.isNaN(retrievedTimestamp) && evaluatedTimestamp < retrievedTimestamp
      ? 'quality-report-evaluation-predates-source-retrieval'
      : null,
  ].filter(Boolean) as string[];
}

export function assessAddressValidationQualityReportRelease(
  candidate: unknown,
  attestation: AddressValidationQualityReportAttestation,
  checkedAt: string,
  trustedKeys: AddressValidationQualityReportTrustedPublicKey[],
): AddressValidationQualityReportReleaseAssessment {
  const preflight = preflightAddressValidationQualityReportExport(candidate);
  if (preflight.status !== 'independent-signature-required') {
    return {
      status: 'blocked',
      blockers: preflight.errors.length ? preflight.errors : ['export-is-not-ready-for-independent-signature'],
      nextActions: preflight.nextActions,
      nonClaim: 'A blocked release assessment does not authorize publication or establish address-validation quality.',
    };
  }

  const exported = candidate as AddressValidationQualityReportExport;
  const sourceFreshnessBlockers = releaseSourceFreshnessBlockers(exported.report, checkedAt);
  if (sourceFreshnessBlockers.length) {
    return {
      status: 'blocked',
      blockers: sourceFreshnessBlockers,
      nextActions: ['refresh-official-source-evidence-and-rebuild-the-quality-report-before-requesting-an-independent-signature'],
      nonClaim: 'A report whose official source evidence is stale or due for renewal cannot be published, even when its signature is otherwise valid.',
    };
  }

  const attestationTimingBlockers = releaseAttestationTimingBlockers(exported.report, attestation);
  if (attestationTimingBlockers.length) {
    return {
      status: 'blocked',
      blockers: attestationTimingBlockers,
      nextActions: ['obtain-an-independent-attestation-signed-at-or-after-the-report-evaluation-time'],
      nonClaim: 'An attestation that predates its report cannot establish independent review of that report and therefore cannot authorize publication.',
    };
  }

  const signature = verifyAddressValidationQualityReportWithKeyring(
    exported.report,
    attestation,
    checkedAt,
    trustedKeys,
  );
  if (signature.status !== 'signature-verified') {
    return {
      status: 'blocked',
      blockers: [signature.status],
      nextActions: signature.reissueRequired
        ? ['reissue-or-refresh-the-independent-attestation-and-repeat-release-preflight']
        : ['supply-a-current-attestation-from-a-trusted-independent-public-key'],
      nonClaim: 'A signature verification failure does not imply that the underlying aggregate measurements are false; it only blocks publication until provenance is resolved.',
    };
  }

  return {
    status: 'publishable-aggregate-evidence',
    blockers: [],
    nextActions: ['publish-only-the-verified-aggregate-evidence-export-with-its-non-claim'],
    nonClaim: 'This gate permits publication of signed aggregate evidence only. It does not claim equivalence or superiority to Google, Smarty, Loqate, Melissa, or any other provider; it does not claim delivery-point reachability or nationwide coverage.',
  };
}
