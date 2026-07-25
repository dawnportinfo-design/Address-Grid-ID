import {
  assessAddressValidationOfficialSourceEvidenceLedger,
  type AddressValidationOfficialSourceEvidenceLedger,
} from './addressValidationOfficialSourceEvidenceLedger';

export const ADDRESS_VALIDATION_OFFICIAL_SOURCE_UPDATE_QUEUE_VERSION = 'address-validation-official-source-update-queue-v1';

export type AddressValidationOfficialSourceUpdateQueueItem = {
  countryCode: string;
  priority: 'blocking' | 'renewal-due';
  sourceIds: string[];
  reason: string;
};

export type AddressValidationOfficialSourceUpdateQueue = {
  version: string;
  checkedAt: string;
  countryCount: number;
  currentCountryCount: number;
  items: AddressValidationOfficialSourceUpdateQueueItem[];
  nonClaim: string;
};

export function buildAddressValidationOfficialSourceUpdateQueue(
  ledgers: AddressValidationOfficialSourceEvidenceLedger[],
  checkedAt: string,
): AddressValidationOfficialSourceUpdateQueue {
  const assessments = ledgers.map(ledger => assessAddressValidationOfficialSourceEvidenceLedger(ledger, checkedAt));
  const items = assessments.flatMap(assessment => {
    if (assessment.status === 'current') return [];
    const priority: AddressValidationOfficialSourceUpdateQueueItem['priority'] = assessment.status === 'blocked'
      ? 'blocking'
      : 'renewal-due';
    return [{
      countryCode: assessment.countryCode,
      priority,
      sourceIds: assessment.records
        .filter(record => priority === 'blocking'
          ? record.status === 'expired-or-invalid'
          : record.status === 'renewal-due')
        .map(record => record.sourceId)
        .sort(),
      reason: priority === 'blocking'
        ? assessment.blockers.join(',')
        : 'official-source-evidence-renewal-window',
    }];
  }).sort((left, right) => (
    (left.priority === right.priority ? left.countryCode.localeCompare(right.countryCode) : left.priority === 'blocking' ? -1 : 1)
  ));

  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_UPDATE_QUEUE_VERSION,
    checkedAt,
    countryCount: assessments.length,
    currentCountryCount: assessments.filter(assessment => assessment.status === 'current').length,
    items,
    nonClaim: 'This update queue contains source identifiers and lifecycle state only. It does not contain address records, provider responses, credentials, key material, or a claim of postal coverage.',
  };
}
