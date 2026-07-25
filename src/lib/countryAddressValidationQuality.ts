import {
  classifyAddressCoveragePolicy,
  type AddressCoverageFormatLike,
  type AddressCoveragePolicyId,
} from './addressCoveragePolicy';
import { DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES } from './addressVerificationEngine';
import {
  assessAddressValidationOfficialSourceEvidenceLedger,
  type AddressValidationOfficialSourceEvidenceLedger,
} from './addressValidationOfficialSourceEvidenceLedger';

export const COUNTRY_ADDRESS_VALIDATION_QUALITY_VERSION = 'country-address-validation-quality-v1';

export type CountryAddressValidationQualityInput = {
  file: string;
  format: AddressCoverageFormatLike;
};

export type CountryAddressValidationQualityTier =
  | 'strong-open-rules'
  | 'structured-rules'
  | 'candidate-limited'
  | 'manual-review-required';

export type CountryAddressValidationQuality = {
  countryCode: string;
  name: string;
  formatVariantCount: number;
  coveragePolicy: AddressCoveragePolicyId;
  qualityTier: CountryAddressValidationQualityTier;
  explicitVerificationPolicy: boolean;
  officialSourceEvidence: 'not-recorded' | 'local-metadata-recorded' | 'local-metadata-reuse-verified' | 'metadata-only-current' | 'current' | 'renewal-due' | 'blocked';
  blockers: string[];
  improvementActions: string[];
  nonClaim: string;
};

export type CountryAddressValidationQualityPortfolio = {
  version: string;
  countries: CountryAddressValidationQuality[];
  summary: {
    countryCount: number;
    byQualityTier: Record<CountryAddressValidationQualityTier, number>;
    byOfficialSourceEvidence: Record<CountryAddressValidationQuality['officialSourceEvidence'], number>;
    needsRulesImprovementCount: number;
    needsOfficialSourceEvidenceCount: number;
  };
  nonClaim: string;
};

function normalizeCountryCode(value: string) {
  const code = value.normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

const policyRank: Record<AddressCoveragePolicyId, number> = {
  'postal-reliable-api': 4,
  'no-postal-strong-geo': 3,
  'postal-weak-api': 2,
  'no-postal-weak-geo': 1,
};

function weakestPolicy(policies: AddressCoveragePolicyId[]) {
  return policies.sort((left, right) => policyRank[left] - policyRank[right] || left.localeCompare(right))[0]
    || 'no-postal-weak-geo';
}

function qualityTier(policy: AddressCoveragePolicyId, explicitVerificationPolicy: boolean, variantCount: number) {
  if (policy === 'postal-reliable-api' && explicitVerificationPolicy && variantCount === 1) return 'strong-open-rules' as const;
  if (policy === 'postal-reliable-api' || policy === 'no-postal-strong-geo') return 'structured-rules' as const;
  if (policy === 'postal-weak-api') return 'candidate-limited' as const;
  return 'manual-review-required' as const;
}

function sourceEvidenceStatus(
  countryCode: string,
  ledgers: AddressValidationOfficialSourceEvidenceLedger[],
  checkedAt: string | undefined,
  metadataOnlyCountryCodes: Set<string>,
  localMetadataCountryCodes: Set<string>,
  localMetadataReuseVerifiedCountryCodes: Set<string>,
): CountryAddressValidationQuality['officialSourceEvidence'] {
  const localStatus = localMetadataReuseVerifiedCountryCodes.has(countryCode)
    ? 'local-metadata-reuse-verified' as const
    : localMetadataCountryCodes.has(countryCode) ? 'local-metadata-recorded' as const : 'not-recorded' as const;
  if (!checkedAt) return localStatus;
  const countryLedgers = ledgers.filter(ledger => normalizeCountryCode(ledger.countryCode) === countryCode);
  if (countryLedgers.length !== 1) return localStatus;
  const status = assessAddressValidationOfficialSourceEvidenceLedger(countryLedgers[0]!, checkedAt).status;
  return status === 'current'
    ? metadataOnlyCountryCodes.has(countryCode) ? 'metadata-only-current' : 'current'
    : status === 'renewal-due' ? 'renewal-due' : 'blocked';
}

export function buildCountryAddressValidationQualityPortfolio(
  inputs: CountryAddressValidationQualityInput[],
  options: {
    officialSourceLedgers?: AddressValidationOfficialSourceEvidenceLedger[];
    metadataOnlySourceCountryCodes?: string[];
    localMetadataSourceCountryCodes?: string[];
    localMetadataReuseVerifiedCountryCodes?: string[];
    checkedAt?: string;
  } = {},
): CountryAddressValidationQualityPortfolio {
  const grouped = new Map<string, CountryAddressValidationQualityInput[]>();
  for (const input of inputs) {
    const countryCode = normalizeCountryCode(input.format.countryCode || '');
    if (!countryCode) continue;
    const group = grouped.get(countryCode) || [];
    group.push(input);
    grouped.set(countryCode, group);
  }
  const ledgers = options.officialSourceLedgers || [];
  const metadataOnlyCountryCodes = new Set((options.metadataOnlySourceCountryCodes || []).map(normalizeCountryCode));
  const localMetadataCountryCodes = new Set((options.localMetadataSourceCountryCodes || []).map(normalizeCountryCode));
  const localMetadataReuseVerifiedCountryCodes = new Set(
    (options.localMetadataReuseVerifiedCountryCodes || []).map(normalizeCountryCode),
  );
  const countries = [...grouped.entries()].map(([countryCode, variants]) => {
    const policies = variants.map(variant => classifyAddressCoveragePolicy(variant.format).id);
    const coveragePolicy = weakestPolicy(policies);
    const explicitVerificationPolicy = Boolean(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES[countryCode]);
    const sourceEvidence = sourceEvidenceStatus(
      countryCode,
      ledgers,
      options.checkedAt,
      metadataOnlyCountryCodes,
      localMetadataCountryCodes,
      localMetadataReuseVerifiedCountryCodes,
    );
    const tier = qualityTier(coveragePolicy, explicitVerificationPolicy, variants.length);
    const blockers = [
      variants.length > 1 ? 'multiple-country-format-variants-require-scope-review' : null,
      !explicitVerificationPolicy ? 'country-verification-policy-not-explicit' : null,
      coveragePolicy === 'postal-weak-api' ? 'postal-source-is-candidate-only' : null,
      coveragePolicy === 'no-postal-weak-geo' ? 'no-strong-postal-or-geographic-source-recorded' : null,
      sourceEvidence === 'not-recorded' ? 'official-source-evidence-not-recorded' : null,
      sourceEvidence === 'local-metadata-recorded' ? 'official-source-evidence-local-metadata-only' : null,
      sourceEvidence === 'local-metadata-reuse-verified' ? 'official-source-evidence-local-metadata-only' : null,
      sourceEvidence === 'metadata-only-current' ? 'official-source-evidence-metadata-only' : null,
      sourceEvidence === 'renewal-due' ? 'official-source-evidence-renewal-due' : null,
      sourceEvidence === 'blocked' ? 'official-source-evidence-blocked' : null,
    ].filter(Boolean) as string[];
    const improvementActions = [
      !explicitVerificationPolicy ? 'add-an-explicit-country-verification-policy-with-safe-format-and-evidence-gates' : null,
      coveragePolicy === 'postal-weak-api'
        ? 'record-an-authoritative-reuse-reviewed-postal-source-or-keep-postcodes-at-format-and-candidate-only'
        : null,
      coveragePolicy === 'no-postal-strong-geo'
        ? 'maintain-administrative-hierarchy-and-geo-evidence-without-claiming-postal-deliverability'
        : null,
      coveragePolicy === 'no-postal-weak-geo'
        ? 'identify-an-authoritative-administrative-or-geographic-source-and-keep-manual-confirmation-enabled'
        : null,
      variants.length > 1 ? 'review-country-format-variant-scope-before-raising-the-country-quality-tier' : null,
      sourceEvidence !== 'current' ? 'record-or-refresh-official-source-rights-version-freshness-and-correction-evidence' : null,
      sourceEvidence === 'metadata-only-current'
        ? 'obtain-explicit-reuse-approval-and-coverage-evidence-before-enabling-postal-lookup-or-delivery-validation'
        : null,
      sourceEvidence === 'local-metadata-recorded'
        ? 'convert-country-source-readiness-metadata-into-a-reviewed-official-source-evidence-ledger'
        : null,
      sourceEvidence === 'local-metadata-reuse-verified'
        ? 'obtain-country-specific-postal-mapping-coverage-and-correction-evidence-before-enabling-postal-lookup-or-delivery-validation'
        : null,
      'run-a-versioned-synthetic-or-aggregate-only-holdout-evaluation-before-quality-publication',
    ].filter(Boolean) as string[];
    return {
      countryCode,
      name: variants.map(variant => variant.format.name || '').find(Boolean) || countryCode,
      formatVariantCount: variants.length,
      coveragePolicy,
      qualityTier: tier,
      explicitVerificationPolicy,
      officialSourceEvidence: sourceEvidence,
      blockers,
      improvementActions: [...new Set(improvementActions)],
      nonClaim: 'This is a static rules-and-source-metadata readiness assessment. It is not an accuracy measurement, delivery-point validation result, postal coverage claim, or comparison with a commercial provider.',
    };
  }).sort((left, right) => left.countryCode.localeCompare(right.countryCode));
  const byQualityTier = {
    'strong-open-rules': 0,
    'structured-rules': 0,
    'candidate-limited': 0,
    'manual-review-required': 0,
  } as Record<CountryAddressValidationQualityTier, number>;
  const byOfficialSourceEvidence = {
    'not-recorded': 0,
    'local-metadata-recorded': 0,
    'local-metadata-reuse-verified': 0,
    'metadata-only-current': 0,
    current: 0,
    'renewal-due': 0,
    blocked: 0,
  } as Record<CountryAddressValidationQuality['officialSourceEvidence'], number>;
  for (const country of countries) {
    byQualityTier[country.qualityTier] += 1;
    byOfficialSourceEvidence[country.officialSourceEvidence] += 1;
  }

  return {
    version: COUNTRY_ADDRESS_VALIDATION_QUALITY_VERSION,
    countries,
    summary: {
      countryCount: countries.length,
      byQualityTier,
      byOfficialSourceEvidence,
      needsRulesImprovementCount: countries.filter(country =>
        country.qualityTier === 'candidate-limited' || country.qualityTier === 'manual-review-required').length,
      needsOfficialSourceEvidenceCount: countries.filter(country => country.officialSourceEvidence !== 'current').length,
    },
    nonClaim: 'This portfolio uses country-level format rules and source lifecycle metadata only. It contains no address, recipient, precise location, credential, key, or provider-response data, and it does not support provider-parity or deliverability claims.',
  };
}
