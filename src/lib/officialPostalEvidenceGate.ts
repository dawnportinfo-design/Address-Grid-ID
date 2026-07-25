import {
  POSTAL_SOURCE_SCOPE_LEDGER,
  assessPostalSourceScopeLedgerEntry,
} from './postalSourceScopeLedger';
import { buildOfficialPostalSourceReuseLedger } from './officialPostalSourceReuseLedger';

export const OFFICIAL_POSTAL_EVIDENCE_GATE_VERSION = 'official-postal-evidence-gate-v1';

export type ScopedPostalEvidenceCandidate = {
  sourceId?: string;
  url?: string;
  sourceScopeId?: string;
  sourceVersion?: string;
  sourceRetrievedAt?: string;
  sourceTermsUrl?: string;
  sourceCorrectionUrl?: string;
  lat?: number;
  lon?: number;
};

const CANDIDATE_ALLOWED_PROPERTIES = new Set([
  'sourceId',
  'url',
  'sourceScopeId',
  'sourceVersion',
  'sourceRetrievedAt',
  'sourceTermsUrl',
  'sourceCorrectionUrl',
  'lat',
  'lon',
]);

export type OfficialPostalEvidenceGateResult = {
  status: 'not-required' | 'accepted' | 'rejected';
  countryCode: string;
  sourceId?: string;
  scopeId?: string;
  blockers: string[];
  nonClaim: string;
};

const clean = (value: unknown) => String(value ?? '').trim();
const normalizeCountryCode = (value: unknown) => clean(value).toUpperCase().replace(/[^A-Z0-9]/g, '');

export function assessOfficialPostalEvidenceGate(input: {
  countryCode?: string;
  candidate: ScopedPostalEvidenceCandidate | null;
  evaluatedAt?: string;
}): OfficialPostalEvidenceGateResult {
  const countryCode = normalizeCountryCode(input.countryCode);
  const entry = POSTAL_SOURCE_SCOPE_LEDGER.find(candidate => candidate.countryCode === countryCode);
  if (!entry) {
    return {
      status: 'not-required',
      countryCode,
      blockers: [],
      nonClaim: 'No additional postal-source scope gate is configured for this country.',
    };
  }

  const candidate = input.candidate;
  const sourceId = clean(candidate?.sourceId);
  const scopeAssessment = assessPostalSourceScopeLedgerEntry(entry, input.evaluatedAt || new Date().toISOString());
  const reuseLedger = buildOfficialPostalSourceReuseLedger(input.evaluatedAt || new Date().toISOString());
  const source = entry.sources.find(item => item.sourceId === sourceId);
  const reuseRecord = reuseLedger.records.find(record => (
    record.sourceId === sourceId && record.scopeIds.includes(entry.scopeId)
  ));
  const blockers = [
    ...scopeAssessment.blockers,
    !candidate ? 'postal-evidence-not-provided' : null,
    candidate && Object.keys(candidate).some(key => !CANDIDATE_ALLOWED_PROPERTIES.has(key))
      ? 'postal-evidence-unrecognized-field'
      : null,
    !sourceId ? 'source-id-missing' : null,
    !source ? 'source-id-not-approved-for-country-scope' : null,
    source && reuseRecord?.status !== 'metadata-only-approved' ? 'source-reuse-ledger-not-approved' : null,
    source && clean(candidate?.sourceScopeId) !== entry.scopeId ? 'scope-id-mismatch' : null,
    source && clean(candidate?.url) !== source.sourceUrl ? 'source-url-mismatch' : null,
    source && clean(candidate?.sourceVersion) !== source.sourceVersion ? 'source-version-mismatch' : null,
    source && clean(candidate?.sourceTermsUrl) !== source.termsUrl ? 'source-terms-url-mismatch' : null,
    source && clean(candidate?.sourceCorrectionUrl) !== source.correctionUrl ? 'source-correction-url-mismatch' : null,
    source && clean(candidate?.sourceRetrievedAt) !== source.retrievedAt ? 'source-retrieved-at-mismatch' : null,
    candidate && (Number.isFinite(candidate.lat) || Number.isFinite(candidate.lon)) ? 'precise-coordinates-not-accepted' : null,
  ].filter(Boolean) as string[];

  return {
    status: blockers.length ? 'rejected' : 'accepted',
    countryCode,
    sourceId: source?.sourceId,
    scopeId: entry.scopeId,
    blockers,
    nonClaim: 'Acceptance only binds an ephemeral postal-code candidate to recorded official-source metadata. It does not assert complete coverage, delivery reachability, address-level validation, or permission to retain or redistribute source records.',
  };
}
