import {
  assessAddressValidationOfficialSourceEvidenceLedger,
  type AddressValidationOfficialSourceEvidenceLedger,
} from './addressValidationOfficialSourceEvidenceLedger';

export const ADDRESS_VALIDATION_OFFICIAL_SOURCE_PORTFOLIO_VERSION = 'address-validation-official-source-portfolio-v1';

export type AddressValidationOfficialSourcePortfolio = {
  version: string;
  checkedAt: string;
  countries: Array<{
    countryCode: string;
    priority: 'blocking' | 'renewal-due' | 'current';
    sourceCount: number;
    sourceIds: string[];
    blockers: string[];
    nextAction: string;
  }>;
  summary: {
    countryCount: number;
    blockingCountryCount: number;
    renewalDueCountryCount: number;
    currentCountryCount: number;
  };
  nonClaim: string;
};

export function buildAddressValidationOfficialSourcePortfolio(
  ledgers: AddressValidationOfficialSourceEvidenceLedger[],
  checkedAt: string,
): AddressValidationOfficialSourcePortfolio {
  const grouped = new Map<string, ReturnType<typeof assessAddressValidationOfficialSourceEvidenceLedger>[]>();
  for (const ledger of ledgers) {
    const assessment = assessAddressValidationOfficialSourceEvidenceLedger(ledger, checkedAt);
    const group = grouped.get(assessment.countryCode) || [];
    group.push(assessment);
    grouped.set(assessment.countryCode, group);
  }
  const countries = [...grouped.entries()].map(([countryCode, assessments]) => {
    const duplicateCountryLedger = assessments.length > 1;
    const records = assessments.flatMap(assessment => assessment.records);
    const assessmentBlockers = assessments.flatMap(assessment => assessment.blockers);
    const recordBlockers = records.flatMap(record => record.blockers);
    const priority = duplicateCountryLedger || assessments.some(assessment => assessment.status === 'blocked')
      ? 'blocking' as const
      : assessments.some(assessment => assessment.status === 'renewal-due')
        ? 'renewal-due' as const
        : 'current' as const;
    const blockers = [...new Set([
      ...(duplicateCountryLedger ? ['duplicate-country-source-evidence-ledger'] : []),
      ...assessmentBlockers,
      ...recordBlockers,
    ])].sort();
    return {
      countryCode,
      priority,
      sourceCount: records.length,
      sourceIds: [...new Set(records.map(record => record.sourceId).filter(Boolean))].sort(),
      blockers,
      nextAction: priority === 'blocking'
        ? 'resolve-country-source-evidence-blockers-before-quality-comparison'
        : priority === 'renewal-due'
          ? 'refresh-country-source-evidence-before-expiry'
          : 'reassess-country-source-evidence-on-schedule',
    };
  }).sort((left, right) => (
    (left.priority === right.priority ? left.countryCode.localeCompare(right.countryCode) :
      left.priority === 'blocking' ? -1 : right.priority === 'blocking' ? 1 :
        left.priority === 'renewal-due' ? -1 : 1)
  ));

  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_PORTFOLIO_VERSION,
    checkedAt,
    countries,
    summary: {
      countryCount: countries.length,
      blockingCountryCount: countries.filter(country => country.priority === 'blocking').length,
      renewalDueCountryCount: countries.filter(country => country.priority === 'renewal-due').length,
      currentCountryCount: countries.filter(country => country.priority === 'current').length,
    },
    nonClaim: 'This portfolio contains country codes and official-source lifecycle metadata only. It does not contain address records, recipients, precise locations, source payloads, credentials, or a claim of postal coverage or delivery reachability.',
  };
}
