export const POSTAL_SOURCE_SCOPE_LEDGER_VERSION = 'postal-source-scope-ledger-v1';
export const POSTAL_SOURCE_SCOPE_RETRIEVAL_MAX_AGE_DAYS = 90;

export type PostalSourceReuseStatus =
  | 'conditional-open-reuse'
  | 'licensed-restricted'
  | 'terms-review-required'
  | 'no-neutral-operator-dataset';

export type PostalSourceScopeLedgerEntry = {
  countryCode: 'EH' | 'ES' | 'PT' | 'SJ';
  scopeId: string;
  formatVariants: string[];
  scopeStatus: 'coverage-review-required' | 'operator-confirmation-required' | 'neutral-scope-required';
  sources: Array<{
    sourceId: string;
    authority: 'official-eu-statistical-service' | 'national-postal-operator' | 'intergovernmental-context';
    sourceUrl: string;
    termsUrl: string;
    correctionUrl: string;
    correctionPathStatus: 'source-specific-confirmed' | 'general-contact-only' | 'not-recorded';
    correctionPathEvidenceUrl?: string;
    correctionPathEvidenceNote?: string;
    sourceVersion: string;
    retrievedAt: string;
    reviewBy: string;
    reuseStatus: PostalSourceReuseStatus;
    allowedUse: 'non-delivery-postal-metadata-only' | 'none-without-separate-license-or-permission';
    limitations: string[];
  }>;
  nonClaim: string;
};

export const POSTAL_SOURCE_SCOPE_LEDGER: PostalSourceScopeLedgerEntry[] = [
  {
    countryCode: 'ES',
    scopeId: 'es-mainland-balearic-canary-format-scope',
    formatVariants: [
      'europe/southern_europe/ES.json',
      'europe/spanish_autonomous_regions/ES_BAL.json',
      'europe/spanish_autonomous_regions/ES_CAN.json',
    ],
    scopeStatus: 'coverage-review-required',
    sources: [
      {
        sourceId: 'eurostat-gisco-postal-code-points-2024',
        authority: 'official-eu-statistical-service',
        sourceUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        termsUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        correctionUrl: 'https://ec.europa.eu/eurostat/help/support',
        correctionPathStatus: 'source-specific-confirmed',
        correctionPathEvidenceUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        correctionPathEvidenceNote: 'The dataset page directs omissions and errors in the postal-code dataset to Eurostat user support.',
        sourceVersion: '2024',
        retrievedAt: '2026-07-24T00:00:00.000Z',
        reviewBy: '2026-10-22T00:00:00.000Z',
        reuseStatus: 'conditional-open-reuse',
        allowedUse: 'non-delivery-postal-metadata-only',
        limitations: [
          'Attribute under the stated CC-BY-SA 4.0 terms.',
          'The dataset may omit non-geographical postal codes and may not include or correctly locate every code.',
          'Coverage must be reviewed by format scope before any country-level lookup claim.',
        ],
      },
      {
        sourceId: 'correos-postal-code-database',
        authority: 'national-postal-operator',
        sourceUrl: 'https://www.correos.es/es/es/empresas/marketing/identifica-a-tus-clientes-potenciales/base-de-datos-de-codigos-postales',
        termsUrl: 'https://www.correos.es/es/es/empresas/marketing/identifica-a-tus-clientes-potenciales/base-de-datos-de-codigos-postales',
        correctionUrl: 'https://www.correos.es/es/es/atencion-al-cliente',
        correctionPathStatus: 'general-contact-only',
        sourceVersion: 'license-product-terms-reviewed-2026-07-24',
        retrievedAt: '2026-07-24T00:00:00.000Z',
        reviewBy: '2026-10-22T00:00:00.000Z',
        reuseStatus: 'licensed-restricted',
        allowedUse: 'none-without-separate-license-or-permission',
        limitations: [
          'The published product terms require a contract and restrict sublicensing.',
          'The published product terms prohibit an external postcode search service without separate permission.',
        ],
      },
    ],
    nonClaim: 'This scope records format variants and source terms only. It does not determine regional status, assert postal coverage, or permit delivery-point validation.',
  },
  {
    countryCode: 'PT',
    scopeId: 'pt-mainland-azores-madeira-format-scope',
    formatVariants: [
      'europe/southern_europe/PT.json',
      'europe/portuguese_autonomous_regions/PT_AZO.json',
      'europe/portuguese_autonomous_regions/PT_MAD.json',
    ],
    scopeStatus: 'coverage-review-required',
    sources: [
      {
        sourceId: 'eurostat-gisco-postal-code-points-2024',
        authority: 'official-eu-statistical-service',
        sourceUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        termsUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        correctionUrl: 'https://ec.europa.eu/eurostat/help/support',
        correctionPathStatus: 'source-specific-confirmed',
        correctionPathEvidenceUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
        correctionPathEvidenceNote: 'The dataset page directs omissions and errors in the postal-code dataset to Eurostat user support.',
        sourceVersion: '2024',
        retrievedAt: '2026-07-24T00:00:00.000Z',
        reviewBy: '2026-10-22T00:00:00.000Z',
        reuseStatus: 'conditional-open-reuse',
        allowedUse: 'non-delivery-postal-metadata-only',
        limitations: [
          'Attribute under the stated CC-BY-SA 4.0 terms.',
          'The dataset may omit non-geographical postal codes and may not include or correctly locate every code.',
          'Mainland and autonomous-region format scopes require separate coverage review.',
        ],
      },
      {
        sourceId: 'ctt-universal-service-information',
        authority: 'national-postal-operator',
        sourceUrl: 'https://www.ctt.pt/home/servico-postal-universal/condicoes-gerais-de-acesso-e-utilizacao-do-servico-universal',
        termsUrl: 'https://www.ctt.pt/home/servico-postal-universal/condicoes-gerais-de-acesso-e-utilizacao-do-servico-universal',
        correctionUrl: 'https://www.ctt.pt/ajuda/empresas/apoio-ao-cliente/contactos/reclamacoes',
        correctionPathStatus: 'general-contact-only',
        sourceVersion: 'service-terms-reviewed-2026-07-24',
        retrievedAt: '2026-07-24T00:00:00.000Z',
        reviewBy: '2026-10-22T00:00:00.000Z',
        reuseStatus: 'terms-review-required',
        allowedUse: 'none-without-separate-license-or-permission',
        limitations: [
          'Postal service terms establish service context but do not provide an explicit reusable postcode dataset licence.',
        ],
      },
    ],
    nonClaim: 'This scope records format variants and source terms only. It does not assert coverage of mainland or autonomous regions, postal completeness, or delivery-point validation.',
  },
  {
    countryCode: 'SJ',
    scopeId: 'sj-svalbard-jan-mayen-separate-operational-scope',
    formatVariants: [
      'europe/northern_europe/SJ.json',
      'europe/northern_europe/SJ_SVA.json',
      'europe/northern_europe/SJ_JAN.json',
    ],
    scopeStatus: 'operator-confirmation-required',
    sources: [{
      sourceId: 'posten-svalbard-and-jan-mayen-service-information',
      authority: 'national-postal-operator',
      sourceUrl: 'https://www.posten.no/en/sending/domestic/svalbard',
      termsUrl: 'https://www.posten.no/en/terms-and-conditions/general-terms-of-delivery',
      correctionUrl: 'https://www.posten.no/en/contact-us',
      correctionPathStatus: 'general-contact-only',
      sourceVersion: 'service-terms-reviewed-2026-07-24',
      retrievedAt: '2026-07-24T00:00:00.000Z',
      reviewBy: '2026-10-22T00:00:00.000Z',
      reuseStatus: 'terms-review-required',
      allowedUse: 'none-without-separate-license-or-permission',
      limitations: [
        'Service terms confirm operational context but do not provide an explicit reusable postcode dataset licence.',
        'Svalbard and Jan Mayen require separate operational-scope confirmation before lookup use.',
      ],
    }],
    nonClaim: 'This scope keeps Svalbard and Jan Mayen operationally separate. It does not treat service pages as reusable postal data or claim delivery coverage.',
  },
  {
    countryCode: 'EH',
    scopeId: 'eh-neutral-postal-operator-scope',
    formatVariants: [
      'africa/disputed_territories/EH.json',
      'special/disputed_territories/EH.json',
    ],
    scopeStatus: 'neutral-scope-required',
    sources: [{
      sourceId: 'upu-western-sahara-postal-context',
      authority: 'intergovernmental-context',
      sourceUrl: 'https://www.upu.int/UPU/media/upu/DL.PHIL/Circulaires/2008-071/English.pdf',
      termsUrl: 'https://www.upu.int/UPU/media/upu/DL.PHIL/Circulaires/2008-071/English.pdf',
      correctionUrl: 'https://www.upu.int/en/Universal-Postal-Union/About-UPU/Contact-Us',
      correctionPathStatus: 'general-contact-only',
      sourceVersion: 'context-review-2026-07-24',
      retrievedAt: '2026-07-24T00:00:00.000Z',
      reviewBy: '2026-10-22T00:00:00.000Z',
      reuseStatus: 'no-neutral-operator-dataset',
      allowedUse: 'none-without-separate-license-or-permission',
      limitations: [
        'No neutral, operator-specific reusable postcode dataset was confirmed in this review.',
        'Any later source must pass separate provenance, scope, rights, and non-assertion review.',
      ],
    }],
    nonClaim: 'This neutral scope does not determine sovereignty, territorial status, jurisdiction, postal administration, postal coverage, or delivery reachability.',
  },
];

export function assessPostalSourceScopeLedgerEntry(entry: PostalSourceScopeLedgerEntry, checkedAt: string) {
  const isHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  };
  const hasTimezoneQualifiedTimestamp = (value: string) =>
    /T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value));
  const isTraceableVersion = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return Boolean(normalized) && !['unknown', 'n/a', 'na', 'none', 'unversioned'].includes(normalized);
  };
  const checkedTimestamp = hasTimezoneQualifiedTimestamp(checkedAt) ? Date.parse(checkedAt) : Number.NaN;
  const conditionallyOpenSources = entry.sources.filter(source =>
    source.reuseStatus === 'conditional-open-reuse' && source.allowedUse === 'non-delivery-postal-metadata-only');
  const sourceIdCounts = new Map<string, number>();
  for (const source of conditionallyOpenSources) {
    const sourceId = source.sourceId.trim();
    sourceIdCounts.set(sourceId, (sourceIdCounts.get(sourceId) || 0) + 1);
  }
  const sourceEvidenceBlockers = new Map<string, string[]>();
  for (const source of conditionallyOpenSources) {
    const retrievedAt = Date.parse(source.retrievedAt);
    const reviewBy = Date.parse(source.reviewBy);
    const blockers = [
      !source.sourceId.trim() ? 'source-id-invalid' : null,
      (sourceIdCounts.get(source.sourceId.trim()) || 0) > 1 ? `source-${source.sourceId}-id-duplicate` : null,
      !isHttpUrl(source.sourceUrl) ? `source-${source.sourceId}-url-invalid` : null,
      !isHttpUrl(source.termsUrl) ? `source-${source.sourceId}-terms-url-invalid` : null,
      !isHttpUrl(source.correctionUrl) ? `source-${source.sourceId}-correction-url-invalid` : null,
      source.correctionPathStatus !== 'source-specific-confirmed'
        ? `source-${source.sourceId}-correction-path-unconfirmed`
        : null,
      source.correctionPathStatus === 'source-specific-confirmed' &&
        (!isHttpUrl(source.correctionPathEvidenceUrl || '') || !source.correctionPathEvidenceNote?.trim())
        ? `source-${source.sourceId}-correction-path-evidence-missing`
        : null,
      !isTraceableVersion(source.sourceVersion) ? `source-${source.sourceId}-version-untraceable` : null,
      !hasTimezoneQualifiedTimestamp(source.retrievedAt) ? `source-${source.sourceId}-retrieved-at-invalid` : null,
      !hasTimezoneQualifiedTimestamp(source.reviewBy) ? `source-${source.sourceId}-review-by-invalid` : null,
      !Number.isFinite(retrievedAt) || retrievedAt > checkedTimestamp
        ? `source-${source.sourceId}-retrieved-at-not-current` : null,
      Number.isFinite(retrievedAt) && checkedTimestamp - retrievedAt > POSTAL_SOURCE_SCOPE_RETRIEVAL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
        ? `source-${source.sourceId}-retrieval-stale` : null,
      !Number.isFinite(reviewBy) || reviewBy <= checkedTimestamp
        ? `source-${source.sourceId}-review-expired` : null,
      Number.isFinite(reviewBy) && Number.isFinite(retrievedAt) && reviewBy <= retrievedAt
        ? `source-${source.sourceId}-review-window-invalid` : null,
    ].filter(Boolean) as string[];
    sourceEvidenceBlockers.set(source.sourceId, blockers);
  }
  const approvedSources = conditionallyOpenSources.filter(source =>
    sourceEvidenceBlockers.get(source.sourceId)?.length === 0);
  const blockers = [
    !Number.isFinite(checkedTimestamp) ? 'checked-at-invalid' : null,
    !entry.formatVariants.length ? 'format-variants-missing' : null,
    entry.scopeStatus !== 'coverage-review-required' ? `scope-status-${entry.scopeStatus}` : null,
    !approvedSources.length ? 'no-approved-non-delivery-metadata-source' : null,
    ...conditionallyOpenSources.flatMap(source => sourceEvidenceBlockers.get(source.sourceId) || []),
    ...(!approvedSources.length ? entry.sources.flatMap(source => [
      source.reuseStatus !== 'conditional-open-reuse' ? `source-${source.sourceId}-reuse-${source.reuseStatus}` : null,
      source.allowedUse !== 'non-delivery-postal-metadata-only' ? `source-${source.sourceId}-use-not-approved` : null,
    ].filter(Boolean) as string[]) : []),
  ].filter(Boolean) as string[];
  const approvedSourceIds = approvedSources
    .map(source => source.sourceId)
    .sort();
  return {
    countryCode: entry.countryCode,
    status: blockers.length ? 'blocked' as const : 'metadata-only-source-ready' as const,
    approvedSourceIds,
    blockers,
    nonClaim: 'A metadata-only source-ready result does not authorize postal lookup, delivery validation, address collection, data download, or public data redistribution.',
  };
}
