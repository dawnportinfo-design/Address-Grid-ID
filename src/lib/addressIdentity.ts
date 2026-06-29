export type AddressIdentityLayer = 'AGID' | 'AOID';

export type AddressIdentityVisibility = 'public' | 'private';

export type AddressIdentitySubject = 'place-or-public-address' | 'person-or-organization';

export type AddressIdentityUpdateAuthority = 'operator-spec-only' | 'owner-only';

export type AddressIdentityQrAuthority = 'immutable-location' | 'owner-only';

export type AddressIdentityDistributionMode =
  | 'sdk-and-device-generated'
  | 'owner-controlled-private-sync';

export type AddressIdentityPolicy = {
  layer: AddressIdentityLayer;
  label: string;
  visibility: AddressIdentityVisibility;
  subject: AddressIdentitySubject;
  represents: string;
  includesPublicAddress: boolean;
  includesBuildingName: boolean;
  includesUnitOrRoom: boolean;
  mayIncludePersonalData: boolean;
  updateAuthority: AddressIdentityUpdateAuthority;
  qrUpdateAuthority: AddressIdentityQrAuthority;
  centralRole: string;
  distributedRole: string;
  distributionMode: AddressIdentityDistributionMode;
  publicLayerSafe: boolean;
};

export type AddressIdentityComparisonRow = {
  item: string;
  agid: string;
  aoid: string;
};

export type AddressIdentityCommunicationPolicy = {
  layer: AddressIdentityLayer;
  defaultMode: string;
  publicApiSurface: string;
  sdkSurface: string;
  qrSurface: string;
  syncSurface: string;
  realtimeSurface: string;
  allowedNetworkPayloads: string[];
  forbiddenNetworkPayloads: string[];
  cachePolicy: string;
  ownershipRule: string;
};

const ADDRESS_IDENTITY_POLICIES: Record<AddressIdentityLayer, AddressIdentityPolicy> = {
  AGID: {
    layer: 'AGID',
    label: 'Address Grid ID',
    visibility: 'public',
    subject: 'place-or-public-address',
    represents: 'public location, address, building, and map-feature layer',
    includesPublicAddress: true,
    includesBuildingName: true,
    includesUnitOrRoom: false,
    mayIncludePersonalData: false,
    updateAuthority: 'operator-spec-only',
    qrUpdateAuthority: 'immutable-location',
    centralRole: 'govern grid specification, reserved ranges, deprecation rules, and public quality packs',
    distributedRole: 'encode, decode, and calculate cell bounds in SDKs and devices without central approval',
    distributionMode: 'sdk-and-device-generated',
    publicLayerSafe: true,
  },
  AOID: {
    layer: 'AOID',
    label: 'Address Owner ID',
    visibility: 'private',
    subject: 'person-or-organization',
    represents: 'private address and delivery layer',
    includesPublicAddress: true,
    includesBuildingName: true,
    includesUnitOrRoom: true,
    mayIncludePersonalData: true,
    updateAuthority: 'owner-only',
    qrUpdateAuthority: 'owner-only',
    centralRole: 'optional encrypted or private sync, recovery, and quality assistance after explicit owner consent',
    distributedRole: 'local-first owner storage, owner-generated QR, and SDK-readable private payloads',
    distributionMode: 'owner-controlled-private-sync',
    publicLayerSafe: false,
  },
};

export const ADDRESS_IDENTITY_COMPARISON: AddressIdentityComparisonRow[] = [
  { item: '公開範囲', agid: 'パブリック', aoid: 'プライベート' },
  { item: '対象', agid: '場所・公開住所・公開建物・公開地物', aoid: '人・組織・施設' },
  { item: '表現するもの', agid: '地理空間・公開住所・建物・地物', aoid: '配送先・私的配送情報' },
  { item: '住所', agid: '公開住所ラベルを含む', aoid: '所有者管理の配送先住所を含む' },
  { item: '建物名', agid: '公開建物名を含む', aoid: '所有者管理の建物詳細を含む' },
  { item: '部屋番号', agid: '含まない', aoid: '含む' },
  { item: '個人情報', agid: '含まない', aoid: '含む場合がある' },
  { item: '更新権限', agid: '運営主体の仕様管理のみ', aoid: '所有者のみ' },
  { item: 'QR更新', agid: '位置IDとして不変', aoid: '所有者のみ可能' },
  { item: '主な用途', agid: '位置識別・仮想郵便番号', aoid: '住所管理・配送先管理' },
];

export const ADDRESS_IDENTITY_COMMUNICATION: Record<AddressIdentityLayer, AddressIdentityCommunicationPolicy> = {
  AGID: {
    layer: 'AGID',
    defaultMode: 'public-or-local',
    publicApiSurface: 'public REST/OpenAPI endpoints for grid, address evidence, postal, geocoding, building, public map features, terrain, and quality checks',
    sdkSurface: 'offline encode/decode/cellBounds and optional public source-pack reads',
    qrSurface: 'public AGID cards and public registered-address references',
    syncSurface: 'saved public grid references and public descriptors only',
    realtimeSurface: 'job status and public-quality progress events only',
    allowedNetworkPayloads: [
      'AGID',
      'coordinates when needed for public evidence lookup',
      'country or sea code',
      'public address label',
      'public building or place name',
      'public map feature name',
      'source and confidence metadata',
    ],
    forbiddenNetworkPayloads: [
      'recipient',
      'phone',
      'unit or room',
      'private delivery instruction',
      'private ownership proof',
    ],
    cachePolicy: 'public evidence may use read-through cache or versioned data packs; dynamic API responses still use privacy-safe no-store headers',
    ownershipRule: 'no owner proof is required to generate, decode, share, or cache AGID',
  },
  AOID: {
    layer: 'AOID',
    defaultMode: 'local-first-private',
    publicApiSurface: 'public surfaces expose only a reference handle plus linked AGID',
    sdkSurface: 'owner apps may create/read private payloads locally; SDK use does not grant ownership',
    qrSurface: 'public QR is reference-only; full QR is private trusted-device transfer',
    syncSurface: 'owner-consented owner-device encrypted envelope only',
    realtimeSurface: 'sync status only; no plaintext private AOID fields in events',
    allowedNetworkPayloads: [
      'AOID id',
      'linked AGID',
      'public handle',
      'status or version',
      'opaque encrypted payload',
      'owner key id',
      'device key id',
    ],
    forbiddenNetworkPayloads: [
      'plaintext recipient',
      'plaintext phone',
      'plaintext unit or room',
      'plaintext delivery instruction',
      'exact private coordinates in public payloads',
      'update timestamp in public payloads',
    ],
    cachePolicy: 'no public cache, no public data-pack export, and no plaintext server persistence',
    ownershipRule: 'only explicit owner consent plus owner/device keys can authorize private sync or update',
  },
};

export function getAddressIdentityPolicy(layer: AddressIdentityLayer): AddressIdentityPolicy {
  return ADDRESS_IDENTITY_POLICIES[layer];
}

export function getAddressIdentityCommunicationPolicy(layer: AddressIdentityLayer): AddressIdentityCommunicationPolicy {
  return ADDRESS_IDENTITY_COMMUNICATION[layer];
}

export function listAddressIdentityPolicies(): AddressIdentityPolicy[] {
  return Object.values(ADDRESS_IDENTITY_POLICIES);
}

export function listAddressIdentityCommunicationPolicies(): AddressIdentityCommunicationPolicy[] {
  return Object.values(ADDRESS_IDENTITY_COMMUNICATION);
}

export function canPublishIdentityLayer(layer: AddressIdentityLayer): boolean {
  return getAddressIdentityPolicy(layer).publicLayerSafe;
}

export function canOwnerUpdateIdentityLayer(layer: AddressIdentityLayer): boolean {
  return getAddressIdentityPolicy(layer).updateAuthority === 'owner-only';
}

export function getAddressIdentitySummary(layer: AddressIdentityLayer): string {
  const policy = getAddressIdentityPolicy(layer);
  return `${policy.layer}: ${policy.represents}; ${policy.visibility}; ${policy.distributionMode}`;
}
