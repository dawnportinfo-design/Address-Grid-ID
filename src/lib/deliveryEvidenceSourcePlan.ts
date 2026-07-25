import {
  getOfficialPostalSourcesForCountry,
  type OfficialPostalSourceProfile,
} from './officialPostalSourceCatalog';

export const DELIVERY_EVIDENCE_SOURCE_PLAN_VERSION = 'delivery-evidence-source-plan-v2';

export type DeliveryEvidenceSourcePlanStatus =
  | 'official-delivery-source-available'
  | 'no-authoritative-delivery-source-cataloged';

export type DeliveryEvidenceSourceMetadataGate =
  | 'terms-url'
  | 'correction-url'
  | 'version'
  | 'coverage'
  | 'evidence-expiry';

export type DeliveryEvidenceSourcePlan = {
  version: string;
  countryCode: string;
  status: DeliveryEvidenceSourcePlanStatus;
  capturePolicy: 'metadata-only-no-raw-address-storage';
  sources: Array<{
    id: string;
    label: string;
    url: string;
    availability: OfficialPostalSourceProfile['availability'];
    requiresCredential: boolean;
    requirements: string[];
    activationStatus: 'blocked-pending-source-metadata';
    missingMetadataGates: DeliveryEvidenceSourceMetadataGate[];
  }>;
  blockers: string[];
  nextActions: string[];
};

function normalizeCountryCode(value: unknown) {
  const code = String(value ?? '').normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

function deliveryPointProfiles(countryCode: string) {
  return getOfficialPostalSourcesForCountry(countryCode).filter(profile => (
    profile.trustTier === 'authoritative' && profile.depth === 'delivery-point'
  ));
}

function requirementsFor(profile: OfficialPostalSourceProfile) {
  return [
    'keep-address-input-and-provider-response-outside-AGID-persistent-storage',
    'retain-only-the-minimum-delivery-evidence-metadata-required-by-the-engine',
    'record-source-version-terms-correction-path-and-evidence-expiry',
    profile.requiresCredential ? 'obtain-and-isolate-provider-credentials-in-a-deployment-secret-store' : null,
    profile.availability === 'licensed-bulk-data' || profile.availability === 'commercial-or-restricted'
      ? 'obtain-explicit-license-for-the-intended-use-before-enabling'
      : null,
  ].filter(Boolean) as string[];
}

const REQUIRED_SOURCE_METADATA_GATES: DeliveryEvidenceSourceMetadataGate[] = [
  'terms-url',
  'correction-url',
  'version',
  'coverage',
  'evidence-expiry',
];

export function buildDeliveryEvidenceSourcePlan(countryCode: string): DeliveryEvidenceSourcePlan {
  const code = normalizeCountryCode(countryCode);
  const profiles = deliveryPointProfiles(code);

  if (!profiles.length) {
    return {
      version: DELIVERY_EVIDENCE_SOURCE_PLAN_VERSION,
      countryCode: code,
      status: 'no-authoritative-delivery-source-cataloged',
      capturePolicy: 'metadata-only-no-raw-address-storage',
      sources: [],
      blockers: ['no-authoritative-delivery-point-source-cataloged'],
      nextActions: [
        'record-an-authoritative-delivery-point-source-with-terms-version-coverage-and-correction-path',
        'do-not-claim-delivery-point-or-carrier-deliverability',
      ],
    };
  }

  return {
    version: DELIVERY_EVIDENCE_SOURCE_PLAN_VERSION,
    countryCode: code,
    status: 'official-delivery-source-available',
    capturePolicy: 'metadata-only-no-raw-address-storage',
    sources: profiles.map(profile => ({
      id: profile.id,
      label: profile.label,
      url: profile.url,
      availability: profile.availability,
      requiresCredential: profile.requiresCredential,
      requirements: requirementsFor(profile),
      // Catalog discovery never authorizes use of a provider or proves freshness.
      activationStatus: 'blocked-pending-source-metadata',
      missingMetadataGates: REQUIRED_SOURCE_METADATA_GATES,
    })),
    blockers: [
      'delivery-source-candidates-require-terms-correction-version-coverage-and-expiry-evidence-before-enablement',
    ],
    nextActions: [
      'record-source-specific-terms-correction-version-coverage-and-expiry-metadata-without-bundling-address-records',
      'obtain-source-specific-credentials-only-after-the-source-metadata-gates-pass',
      'connect-through-a-customer-controlled-or-isolated-ephemeral-lookup-boundary',
      'emit-only-fresh-catalog-matched-delivery-evidence-to-address-verification',
    ],
  };
}
