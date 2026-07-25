import type { AddressValidationQualityReport } from './addressValidationQualityReport';
import type { AddressValidationQualityReportReleaseAssessment } from './addressValidationQualityReportReleaseGate';
import {
  buildAddressValidationQualityScorecard,
  type AddressValidationQualityScorecard,
} from './addressValidationQualityScorecard';

export type AddressValidationQualityScorecardPublication = {
  status: 'blocked' | 'publishable-signed-aggregate-scorecard';
  scorecard: AddressValidationQualityScorecard | null;
  blockers: string[];
  nextActions: string[];
  nonClaim: string;
};

export function assessAddressValidationQualityScorecardPublication(
  report: AddressValidationQualityReport,
  release: AddressValidationQualityReportReleaseAssessment,
): AddressValidationQualityScorecardPublication {
  if (release.status !== 'publishable-aggregate-evidence') {
    return {
      status: 'blocked',
      scorecard: null,
      blockers: release.blockers,
      nextActions: release.nextActions,
      nonClaim: 'A scorecard cannot be published until the underlying aggregate report has passed independent signature verification.',
    };
  }

  const scorecard = buildAddressValidationQualityScorecard(report);
  if (scorecard.status !== 'internally-comparable-awaiting-signature') {
    return {
      status: 'blocked',
      scorecard: null,
      blockers: scorecard.blockers,
      nextActions: ['resolve-the-scorecard-blockers-and-repeat-the-signed-report-release-gate'],
      nonClaim: 'A signed report does not override incomplete metrics, stale source evidence, or a blocked scorecard.',
    };
  }

  return {
    status: 'publishable-signed-aggregate-scorecard',
    scorecard,
    blockers: [],
    nextActions: ['publish-only-the-signed-aggregate-scorecard-with-its-source-and-non-claim-links'],
    nonClaim: 'This permits publication of independently signed aggregate scorecard evidence only. It does not claim parity or superiority to Google, Smarty, Loqate, Melissa, or any other provider; it does not validate individual addresses or establish delivery-point reachability.',
  };
}
