import type { CountryValidationQualityReport } from './countryValidationQualityGate';
import { sha256Hex } from './sha256';

export const COUNTRY_VALIDATION_QUALITY_ATTESTATION_VERSION =
  'country-validation-quality-attestation-v5';
export const COUNTRY_VALIDATION_QUALITY_SIGNATURE_DOMAIN =
  'agid-country-validation-quality-review-ed25519-v5';
export const COUNTRY_VALIDATION_REVIEWER_REGISTRY_DIGEST_ALGORITHM =
  'sha256-country-quality-reviewer-registry-v1';
export const COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_VERSION =
  'country-validation-reviewer-registry-signature-v1';
export const COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_DOMAIN =
  'agid-country-validation-reviewer-registry-ed25519-v1';

export type CountryValidationQualityReviewerKey = {
  keyId: string;
  reviewerId: string;
  algorithm: 'Ed25519';
  purpose: 'country-validation-quality-review';
  publicKeyBase64Url: string;
  status: 'trusted' | 'revoked';
  revokedAt: string | null;
  supersedesKeyId: string | null;
  validFrom: string;
  validUntil: string;
  reviewedAt: string;
  reviewBy: string;
  registryUrl: string;
  revocationUrl: string;
};

export type CountryValidationQualityReviewerRegistry = {
  version: typeof COUNTRY_VALIDATION_QUALITY_ATTESTATION_VERSION;
  digestAlgorithm: typeof COUNTRY_VALIDATION_REVIEWER_REGISTRY_DIGEST_ALGORITHM;
  registryDigest: string;
  keys: CountryValidationQualityReviewerKey[];
};

export type CountryValidationQualitySignature = {
  algorithm: 'Ed25519';
  keyId: string;
  signedAt: string;
  signatureBase64Url: string;
};

export type CountryValidationReviewerRegistryIssuerKey = {
  keyId: string;
  issuerId: string;
  algorithm: 'Ed25519';
  purpose: 'country-validation-reviewer-registry';
  publicKeyBase64Url: string;
  status: 'trusted' | 'revoked';
  validFrom: string;
  validUntil: string;
  reviewedAt: string;
  reviewBy: string;
  registryUrl: string;
  revocationUrl: string;
};

export type CountryValidationReviewerRegistryIssuerRegistry = {
  version: typeof COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_VERSION;
  keys: CountryValidationReviewerRegistryIssuerKey[];
};

export type CountryValidationReviewerRegistrySignature = {
  algorithm: 'Ed25519';
  keyId: string;
  signedAt: string;
  signatureBase64Url: string;
};

export type CountryValidationReviewerRegistrySignatureVerification = {
  status: 'verified' | 'rejected';
  digestValid: boolean;
  trustValid: boolean;
  signatureValid: boolean;
  issues: string[];
  issuerId?: string;
};

export type CountryValidationQualityTrustChainVerification = {
  status: 'verified' | 'rejected';
  reviewerRegistryVerified: boolean;
  qualityReportVerified: boolean;
  deliveryClaimsEnabled: false;
  issues: string[];
};

export type CountryValidationQualityAttestationVerification = {
  status: 'verified' | 'rejected';
  digestBound: boolean;
  trustValid: boolean;
  signatureValid: boolean;
  independentReviewComplete: boolean;
  deliveryClaimsEnabled: false;
  reviewerId?: string;
  issues: string[];
};

function exactTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
    ? timestamp
    : null;
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function base64UrlBytes(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return new Uint8Array();
  try {
    return Uint8Array.from(Buffer.from(value, 'base64url'));
  } catch {
    return new Uint8Array();
  }
}

function ownedArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

const FORBIDDEN_ATTESTATION_FIELDS = new Set([
  'address',
  'rawaddress',
  'recipient',
  'privatekey',
  'secret',
  'credential',
  'latitude',
  'longitude',
  'coordinates',
  'querylog',
  'proofsecret',
]);

function forbiddenFieldPaths(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => forbiddenFieldPaths(item, `${path}[${index}]`));
  }
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
    const itemPath = path ? `${path}.${key}` : key;
    const normalizedKey = key.replace(/[^a-z]/gi, '').toLowerCase();
    return [
      ...(FORBIDDEN_ATTESTATION_FIELDS.has(normalizedKey) ? [itemPath] : []),
      ...forbiddenFieldPaths(item, itemPath),
    ];
  });
}

export function countryValidationReviewerRegistryDigest(
  registry: Pick<CountryValidationQualityReviewerRegistry, 'version' | 'keys'>,
) {
  const keys = registry.keys
    .map(key => ({ ...key }))
    .sort((left, right) => left.keyId.localeCompare(right.keyId));
  return `sha256:${sha256Hex(JSON.stringify({
    domain: COUNTRY_VALIDATION_REVIEWER_REGISTRY_DIGEST_ALGORITHM,
    version: registry.version,
    keys,
  }))}`;
}

export function countryValidationReviewerRegistrySigningMessage(input: {
  registry: CountryValidationQualityReviewerRegistry;
  signature: Pick<CountryValidationReviewerRegistrySignature, 'keyId' | 'signedAt'>;
}) {
  return JSON.stringify({
    domain: COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_DOMAIN,
    signatureVersion: COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_VERSION,
    registryVersion: input.registry.version,
    digestAlgorithm: input.registry.digestAlgorithm,
    registryDigest: input.registry.registryDigest,
    keyId: input.signature.keyId,
    signedAt: input.signature.signedAt,
  });
}

async function verifyEd25519(input: {
  message: string;
  publicKeyBase64Url: string;
  signatureBase64Url: string;
}) {
  const publicKey = base64UrlBytes(input.publicKeyBase64Url);
  const signature = base64UrlBytes(input.signatureBase64Url);
  if (publicKey.length !== 32 || signature.length !== 64 || !globalThis.crypto?.subtle) return false;
  try {
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      ownedArrayBuffer(publicKey),
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    return globalThis.crypto.subtle.verify(
      { name: 'Ed25519' },
      key,
      ownedArrayBuffer(signature),
      ownedArrayBuffer(new TextEncoder().encode(input.message)),
    );
  } catch {
    return false;
  }
}

export async function verifyCountryValidationReviewerRegistrySignature(input: {
  registry: CountryValidationQualityReviewerRegistry;
  signature: CountryValidationReviewerRegistrySignature;
  issuerRegistry: CountryValidationReviewerRegistryIssuerRegistry;
  asOf: string;
}): Promise<CountryValidationReviewerRegistrySignatureVerification> {
  const issues = forbiddenFieldPaths({
    signature: input.signature,
    issuerRegistry: input.issuerRegistry,
  }).map(path => `${path}: private or sensitive field is prohibited`);
  const digestValid = (
    input.registry.digestAlgorithm === COUNTRY_VALIDATION_REVIEWER_REGISTRY_DIGEST_ALGORITHM
    && /^sha256:[0-9a-f]{64}$/.test(input.registry.registryDigest)
    && input.registry.registryDigest === countryValidationReviewerRegistryDigest(input.registry)
  );
  if (!digestValid) issues.push('registry.registryDigest: unsupported or mismatched');
  if (input.issuerRegistry.version !== COUNTRY_VALIDATION_REVIEWER_REGISTRY_SIGNATURE_VERSION) {
    issues.push('issuerRegistry.version: unsupported');
  }
  if (input.signature.algorithm !== 'Ed25519') issues.push('signature.algorithm: unsupported');
  const asOf = exactTimestamp(input.asOf);
  const signedAt = exactTimestamp(input.signature.signedAt);
  if (asOf === null) issues.push('asOf: exact ISO timestamp required');
  if (signedAt === null) issues.push('signature.signedAt: exact ISO timestamp required');

  const duplicateKeyIds = new Set<string>();
  const seenKeyIds = new Set<string>();
  const duplicatePublicKeys = new Set<string>();
  const seenPublicKeys = new Set<string>();
  for (const key of input.issuerRegistry.keys) {
    if (seenKeyIds.has(key.keyId)) duplicateKeyIds.add(key.keyId);
    seenKeyIds.add(key.keyId);
    if (seenPublicKeys.has(key.publicKeyBase64Url)) duplicatePublicKeys.add(key.publicKeyBase64Url);
    seenPublicKeys.add(key.publicKeyBase64Url);
  }
  if (duplicateKeyIds.size) issues.push('issuerRegistry.keys: duplicate key id');
  if (duplicatePublicKeys.size) issues.push('issuerRegistry.keys: duplicate public key');

  const key = input.issuerRegistry.keys.find(candidate => candidate.keyId === input.signature.keyId);
  if (!key) {
    issues.push('signature.keyId: issuer key is not trusted');
  } else {
    const validFrom = exactTimestamp(key.validFrom);
    const validUntil = exactTimestamp(key.validUntil);
    const reviewedAt = exactTimestamp(key.reviewedAt);
    const reviewBy = exactTimestamp(key.reviewBy);
    if (key.algorithm !== 'Ed25519' || key.purpose !== 'country-validation-reviewer-registry') {
      issues.push('signature.keyId: issuer key purpose or algorithm is invalid');
    }
    if (key.status !== 'trusted') issues.push('signature.keyId: issuer key is revoked');
    if (!isHttpsUrl(key.registryUrl) || !isHttpsUrl(key.revocationUrl)) {
      issues.push('signature.keyId: HTTPS issuer registry and revocation URLs are required');
    }
    if (base64UrlBytes(key.publicKeyBase64Url).length !== 32) {
      issues.push('signature.keyId: invalid Ed25519 issuer public key');
    }
    if ([validFrom, validUntil, reviewedAt, reviewBy].some(value => value === null)) {
      issues.push('signature.keyId: exact ISO issuer validity and review timestamps are required');
    }
    if (signedAt !== null && asOf !== null && signedAt > asOf) {
      issues.push('signature.signedAt: cannot be in the future');
    }
    if (
      signedAt !== null
      && validFrom !== null
      && validUntil !== null
      && (signedAt < validFrom || signedAt > validUntil)
    ) {
      issues.push('signature.signedAt: outside issuer key validity window');
    }
    if (asOf !== null && reviewBy !== null && asOf > reviewBy) {
      issues.push('signature.keyId: issuer trust review is stale');
    }
  }

  let signatureValid = false;
  if (key && digestValid && issues.length === 0) {
    signatureValid = await verifyEd25519({
      message: countryValidationReviewerRegistrySigningMessage(input),
      publicKeyBase64Url: key.publicKeyBase64Url,
      signatureBase64Url: input.signature.signatureBase64Url,
    });
    if (!signatureValid) issues.push('signature: cryptographic verification failed');
  }
  const uniqueIssues = [...new Set(issues)].sort();
  const trustValid = Boolean(key) && !uniqueIssues.some(issue => (
    issue.startsWith('issuerRegistry.')
    || issue.startsWith('signature.keyId:')
  ));
  return {
    status: digestValid && trustValid && signatureValid && uniqueIssues.length === 0
      ? 'verified'
      : 'rejected',
    digestValid,
    trustValid,
    signatureValid,
    issues: uniqueIssues,
    issuerId: key?.issuerId,
  };
}

export async function verifyCountryValidationQualityTrustChain(input: {
  report: CountryValidationQualityReport;
  evaluatorId: string;
  qualitySignature: CountryValidationQualitySignature;
  reviewerRegistry: CountryValidationQualityReviewerRegistry;
  reviewerRegistrySignature: CountryValidationReviewerRegistrySignature;
  issuerRegistry: CountryValidationReviewerRegistryIssuerRegistry;
  asOf: string;
}): Promise<CountryValidationQualityTrustChainVerification> {
  const registryVerification = await verifyCountryValidationReviewerRegistrySignature({
    registry: input.reviewerRegistry,
    signature: input.reviewerRegistrySignature,
    issuerRegistry: input.issuerRegistry,
    asOf: input.asOf,
  });
  if (registryVerification.status !== 'verified') {
    return {
      status: 'rejected',
      reviewerRegistryVerified: false,
      qualityReportVerified: false,
      deliveryClaimsEnabled: false,
      issues: registryVerification.issues.map(issue => `reviewerRegistry.${issue}`),
    };
  }

  const qualityVerification = await verifyCountryValidationQualityAttestation({
    report: input.report,
    evaluatorId: input.evaluatorId,
    signature: input.qualitySignature,
    registry: input.reviewerRegistry,
    asOf: input.asOf,
  });
  return {
    status: qualityVerification.status,
    reviewerRegistryVerified: true,
    qualityReportVerified: qualityVerification.status === 'verified',
    deliveryClaimsEnabled: false,
    issues: qualityVerification.issues.map(issue => `qualityReport.${issue}`),
  };
}

export function countryValidationQualitySigningMessage(input: {
  report: CountryValidationQualityReport;
  evaluatorId: string;
  signature: Pick<CountryValidationQualitySignature, 'keyId' | 'signedAt'>;
}) {
  return JSON.stringify({
    domain: COUNTRY_VALIDATION_QUALITY_SIGNATURE_DOMAIN,
    attestationVersion: COUNTRY_VALIDATION_QUALITY_ATTESTATION_VERSION,
    qualityGateVersion: input.report.version,
    countryCode: input.report.countryCode,
    holdoutDigestAlgorithm: input.report.syntheticHoldoutDigestAlgorithm,
    holdoutDigest: input.report.syntheticHoldoutDigest,
    evaluatorId: input.evaluatorId,
    keyId: input.signature.keyId,
    signedAt: input.signature.signedAt,
  });
}

export async function verifyCountryValidationQualityAttestation(input: {
  report: CountryValidationQualityReport;
  evaluatorId: string;
  signature: CountryValidationQualitySignature;
  registry: CountryValidationQualityReviewerRegistry;
  asOf: string;
}): Promise<CountryValidationQualityAttestationVerification> {
  const issues: string[] = [];
  const forbiddenFields = forbiddenFieldPaths({
    registry: input.registry,
    signature: input.signature,
  });
  issues.push(...forbiddenFields.map(path => `${path}: private or sensitive field is prohibited`));
  const asOf = exactTimestamp(input.asOf);
  const signedAt = exactTimestamp(input.signature.signedAt);
  const digestBound = (
    input.report.syntheticAdministrativeEvaluationEligible
    && input.report.gates.every(gate => gate.status === 'passed')
    && input.report.syntheticHoldoutDigestAlgorithm !== null
    && /^sha256:[0-9a-f]{64}$/.test(input.report.syntheticHoldoutDigest || '')
  );
  if (!digestBound) issues.push('report: eligible digest-bound synthetic holdout is required');
  if (input.registry.version !== COUNTRY_VALIDATION_QUALITY_ATTESTATION_VERSION) {
    issues.push('registry.version: unsupported');
  }
  if (
    input.registry.digestAlgorithm !== COUNTRY_VALIDATION_REVIEWER_REGISTRY_DIGEST_ALGORITHM
    || !/^sha256:[0-9a-f]{64}$/.test(input.registry.registryDigest)
    || input.registry.registryDigest !== countryValidationReviewerRegistryDigest(input.registry)
  ) {
    issues.push('registry.registryDigest: unsupported or mismatched');
  }
  if (!input.evaluatorId.trim()) issues.push('evaluatorId: required');
  if (asOf === null) issues.push('asOf: exact ISO timestamp required');
  if (signedAt === null) issues.push('signature.signedAt: exact ISO timestamp required');
  if (input.signature.algorithm !== 'Ed25519') issues.push('signature.algorithm: unsupported');

  const duplicateKeyIds = new Set<string>();
  const seenKeyIds = new Set<string>();
  const duplicateReviewerIds = new Set<string>();
  const seenReviewerIds = new Set<string>();
  const duplicatePublicKeys = new Set<string>();
  const seenPublicKeys = new Set<string>();
  for (const key of input.registry.keys) {
    if (seenKeyIds.has(key.keyId)) duplicateKeyIds.add(key.keyId);
    seenKeyIds.add(key.keyId);
    if (seenReviewerIds.has(key.reviewerId)) duplicateReviewerIds.add(key.reviewerId);
    seenReviewerIds.add(key.reviewerId);
    if (seenPublicKeys.has(key.publicKeyBase64Url)) duplicatePublicKeys.add(key.publicKeyBase64Url);
    seenPublicKeys.add(key.publicKeyBase64Url);
  }
  if (duplicateKeyIds.size) issues.push('registry.keys: duplicate key id');
  if (duplicateReviewerIds.size) issues.push('registry.keys: duplicate reviewer id');
  if (duplicatePublicKeys.size) issues.push('registry.keys: duplicate public key');

  const key = input.registry.keys.find(candidate => candidate.keyId === input.signature.keyId);
  if (!key) {
    issues.push('signature.keyId: key is not trusted');
  } else {
    const validFrom = exactTimestamp(key.validFrom);
    const validUntil = exactTimestamp(key.validUntil);
    const reviewedAt = exactTimestamp(key.reviewedAt);
    const reviewBy = exactTimestamp(key.reviewBy);
    const revokedAt = key.revokedAt === null ? null : exactTimestamp(key.revokedAt);
    if (key.algorithm !== 'Ed25519' || key.purpose !== 'country-validation-quality-review') {
      issues.push('signature.keyId: key purpose or algorithm is invalid');
    }
    if (key.status !== 'trusted') issues.push('signature.keyId: key is revoked');
    if (
      (key.status === 'trusted' && key.revokedAt !== null)
      || (key.status === 'revoked' && revokedAt === null)
    ) {
      issues.push('signature.keyId: revocation status and timestamp are inconsistent');
    }
    if (key.reviewerId === input.evaluatorId) {
      issues.push('reviewerId: evaluator and independent reviewer must differ');
    }
    if (!isHttpsUrl(key.registryUrl) || !isHttpsUrl(key.revocationUrl)) {
      issues.push('signature.keyId: HTTPS registry and revocation URLs are required');
    }
    if (base64UrlBytes(key.publicKeyBase64Url).length !== 32) {
      issues.push('signature.keyId: invalid Ed25519 public key');
    }
    if ([validFrom, validUntil, reviewedAt, reviewBy].some(value => value === null)) {
      issues.push('signature.keyId: exact ISO validity and review timestamps are required');
    }
    if (
      validFrom !== null
      && validUntil !== null
      && validUntil <= validFrom
    ) {
      issues.push('signature.keyId: key validity window is inverted');
    }
    if (
      reviewedAt !== null
      && reviewBy !== null
      && reviewBy <= reviewedAt
    ) {
      issues.push('signature.keyId: trust review window is inverted');
    }
    if (reviewedAt !== null && asOf !== null && reviewedAt > asOf) {
      issues.push('signature.keyId: trust review cannot be in the future');
    }
    if (
      revokedAt !== null
      && validFrom !== null
      && validUntil !== null
      && (revokedAt < validFrom || revokedAt > validUntil)
    ) {
      issues.push('signature.keyId: revocation timestamp is outside key validity');
    }
    if (revokedAt !== null && asOf !== null && revokedAt > asOf) {
      issues.push('signature.keyId: revocation timestamp cannot be in the future');
    }
    if (signedAt !== null && revokedAt !== null && signedAt >= revokedAt) {
      issues.push('signature.signedAt: key was revoked at signing time');
    }
    if (signedAt !== null && asOf !== null && signedAt > asOf) {
      issues.push('signature.signedAt: cannot be in the future');
    }
    if (
      signedAt !== null
      && validFrom !== null
      && validUntil !== null
      && (signedAt < validFrom || signedAt > validUntil)
    ) {
      issues.push('signature.signedAt: outside key validity window');
    }
    if (asOf !== null && reviewBy !== null && asOf > reviewBy) {
      issues.push('signature.keyId: trust review is stale');
    }
    if (key.supersedesKeyId !== null) {
      const predecessor = input.registry.keys.find(candidate => candidate.keyId === key.supersedesKeyId);
      if (
        !predecessor
        || predecessor.keyId === key.keyId
        || predecessor.reviewerId !== key.reviewerId
      ) {
        issues.push('signature.keyId: key rotation predecessor is invalid');
      } else {
        const predecessorValidUntil = exactTimestamp(predecessor.validUntil);
        if (
          predecessorValidUntil === null
          || validFrom === null
          || predecessorValidUntil > validFrom
        ) {
          issues.push('signature.keyId: key rotation validity windows overlap');
        }
      }
    }
  }

  let signatureValid = false;
  if (key && digestBound && issues.length === 0) {
    signatureValid = await verifyEd25519({
      message: countryValidationQualitySigningMessage({
        report: input.report,
        evaluatorId: input.evaluatorId,
        signature: input.signature,
      }),
      publicKeyBase64Url: key.publicKeyBase64Url,
      signatureBase64Url: input.signature.signatureBase64Url,
    });
    if (!signatureValid) issues.push('signature: cryptographic verification failed');
  }

  const uniqueIssues = [...new Set(issues)].sort();
  const trustValid = Boolean(key) && !uniqueIssues.some(issue => (
    issue.startsWith('registry.')
    || issue.startsWith('signature.keyId:')
    || issue.startsWith('reviewerId:')
  ));
  const independentReviewComplete = digestBound
    && trustValid
    && signatureValid
    && uniqueIssues.length === 0;
  return {
    status: independentReviewComplete ? 'verified' : 'rejected',
    digestBound,
    trustValid,
    signatureValid,
    independentReviewComplete,
    deliveryClaimsEnabled: false,
    reviewerId: key?.reviewerId,
    issues: uniqueIssues,
  };
}
