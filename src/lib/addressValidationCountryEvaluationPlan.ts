import type { AddressValidationQualityReport } from './addressValidationQualityReport';
import type { AddressValidationOfficialSourcePortfolio } from './addressValidationOfficialSourcePortfolio';
import { buildAddressValidationQualityScorecard } from './addressValidationQualityScorecard';
import {
  assessAddressValidationAggregateMeasurementFreshness,
  type AddressValidationAggregateMeasurementFreshness,
} from './addressValidationAggregateMeasurementFreshness';

export const ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION = 'address-validation-country-evaluation-plan-v1';

export type AddressValidationCountryEvaluationPlan = {
  version: string;
  countries: Array<{
    countryCode: string;
    phase: 'source-evidence-remediation' | 'evidence-completion' | 'aggregate-measurement' | 'independent-signature' | 'monitoring';
    priority: 'blocking' | 'high' | 'normal';
    blockers: string[];
    nextAction: string;
    measurementFreshness: AddressValidationAggregateMeasurementFreshness;
    reassessBy: string;
  }>;
  nonClaim: string;
};

function sourcePriority(priority: 'blocking' | 'renewal-due' | 'current') {
  return priority === 'blocking' ? 'blocking' as const : priority === 'renewal-due' ? 'high' as const : 'normal' as const;
}

export function buildAddressValidationCountryEvaluationPlan(
  portfolio: AddressValidationOfficialSourcePortfolio,
  reports: AddressValidationQualityReport[],
): AddressValidationCountryEvaluationPlan {
  const reportsByCountry = new Map<string, AddressValidationQualityReport[]>();
  for (const report of reports) {
    const group = reportsByCountry.get(report.countryCode) || [];
    group.push(report);
    reportsByCountry.set(report.countryCode, group);
  }
  const portfolioByCountry = new Map(portfolio.countries.map(country => [country.countryCode, country]));
  const countryCodes = [...new Set([...portfolioByCountry.keys(), ...reportsByCountry.keys()])].sort();
  const countries = countryCodes.map(countryCode => {
    const source = portfolioByCountry.get(countryCode);
    const countryReports = reportsByCountry.get(countryCode) || [];
    const report = countryReports.length === 1 ? countryReports[0]! : undefined;
    const measurementFreshness = assessAddressValidationAggregateMeasurementFreshness(
      report?.aggregateMetrics,
      portfolio.checkedAt,
    );
    if (!source) {
      return {
        countryCode,
        phase: 'source-evidence-remediation' as const,
        priority: 'blocking' as const,
        blockers: ['official-source-evidence-ledger-missing'],
        nextAction: 'record-current-official-source-rights-version-freshness-and-correction-evidence',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    if (source.priority !== 'current') {
      return {
        countryCode,
        phase: 'source-evidence-remediation' as const,
        priority: sourcePriority(source.priority),
        blockers: source.blockers.length ? source.blockers : ['official-source-evidence-renewal-due'],
        nextAction: source.nextAction,
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    if (countryReports.length !== 1) {
      return {
        countryCode,
        phase: 'aggregate-measurement' as const,
        priority: countryReports.length > 1 ? 'high' as const : 'normal' as const,
        blockers: countryReports.length > 1 ? ['duplicate-country-quality-report'] : ['aggregate-quality-report-missing'],
        nextAction: countryReports.length > 1
          ? 'select-one-canonical-country-quality-report-before-comparison'
          : 'run-the-versioned-aggregate-only-country-holdout-evaluation',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    if (report.publicationStatus === 'internal-only-evidence-incomplete') {
      return {
        countryCode,
        phase: 'evidence-completion' as const,
        priority: 'high' as const,
        blockers: report.gateSummary.blockers,
        nextAction: 'complete-the-country-evidence-gates-before-aggregate-comparison',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    if (report.publicationStatus === 'internal-only-source-evidence-not-current') {
      return {
        countryCode,
        phase: 'source-evidence-remediation' as const,
        priority: 'blocking' as const,
        blockers: ['quality-report-source-evidence-not-current'],
        nextAction: 'refresh-official-source-evidence-and-reissue-the-country-quality-report',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    if (report.publicationStatus === 'internal-only-measurement-incomplete') {
      return {
        countryCode,
        phase: 'aggregate-measurement' as const,
        priority: 'high' as const,
        blockers: report.gateSummary.blockers,
        nextAction: 'run-or-refresh-the-versioned-aggregate-only-country-holdout-evaluation',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    const scorecard = buildAddressValidationQualityScorecard(report);
    if (scorecard.status === 'blocked') {
      return {
        countryCode,
        phase: 'aggregate-measurement' as const,
        priority: 'high' as const,
        blockers: scorecard.blockers,
        nextAction: 'resolve-scorecard-thresholds-before-requesting-an-independent-signature',
        measurementFreshness,
        reassessBy: portfolio.checkedAt,
      };
    }
    return {
      countryCode,
      phase: 'independent-signature' as const,
      priority: 'normal' as const,
      blockers: [],
      nextAction: 'obtain-and-verify-an-independent-signature-over-the-aggregate-quality-report',
      measurementFreshness,
      reassessBy: measurementFreshness.refreshDueAt || portfolio.checkedAt,
    };
  });

  return {
    version: ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION,
    countries,
    nonClaim: 'This plan schedules aggregate evidence work only. It does not process address inputs, claim provider parity, authorize delivery, or permit publication without the separate independent-signature release gate.',
  };
}
