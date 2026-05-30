export type RegisteredAddressMode = 'ADDRESS' | 'AOID';

export type RegisteredAddressFormData = {
  country?: string;
  recipient?: string;
  organization?: string;
  street?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  building?: string;
  room?: string;
  [key: string]: unknown;
};

export type RegisteredAddressRecord = RegisteredAddressFormData & {
  type: RegisteredAddressMode;
  id: string;
  agid?: string;
  name: string;
  address: string;
  registeredAt: string;
  lat?: number;
  lon?: number;
  lng?: number;
  updatedAt?: number;
};

export type SavedRegisteredAddressQr = {
  id: string;
  lat?: number;
  lon?: number;
  address: string;
  regionName: string;
  savedAt: string;
  payload: string;
  source: 'registered_address';
};

const QR_PREFIX = 'agid:address:';

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function compact(parts: string[]) {
  return parts.map(part => part.trim()).filter(Boolean);
}

export function formatRegisteredAddress(formData: RegisteredAddressFormData) {
  const organization = clean(formData.organization);
  const street = clean(formData.street);
  const suburb = clean(formData.suburb);
  const city = clean(formData.city);
  const state = clean(formData.state);
  const postcode = clean(formData.postcode);
  const country = clean(formData.country);

  const parts: string[] = [];
  if (organization) parts.push(organization);
  if (street) parts.push(street);
  if (suburb) parts.push(suburb);

  if (city && state) {
    parts.push(city);
    parts.push(compact([state, postcode]).join(' '));
  } else if (city) {
    parts.push(compact([city, postcode]).join(' '));
  } else if (state) {
    parts.push(compact([state, postcode]).join(' '));
  } else if (postcode) {
    parts.push(postcode);
  }

  if (country) parts.push(country);
  return compact(parts).join(', ');
}

export function buildRegisteredAddressRecord(
  formData: RegisteredAddressFormData,
  options: {
    mode?: RegisteredAddressMode;
    id?: string;
    agid?: string;
    coords?: { lat: number; lon: number };
    now?: string;
  } = {},
): RegisteredAddressRecord {
  const mode = options.mode || 'ADDRESS';
  const registeredAt = options.now || new Date().toISOString();
  const timestampId = registeredAt.replace(/\D/g, '').slice(0, 14) || Date.now().toString();
  const agid = clean(options.agid);
  const id = clean(options.id) || (mode === 'ADDRESS' && agid ? agid : `${mode}-${timestampId}`);
  const name = clean(formData.recipient) || clean(formData.organization) || id;
  const address = formatRegisteredAddress(formData);
  const lat = options.coords?.lat;
  const lon = options.coords?.lon;

  return {
    ...formData,
    type: mode,
    id,
    ...(agid ? { agid } : {}),
    name,
    address,
    registeredAt,
    ...(typeof lat === 'number' ? { lat } : {}),
    ...(typeof lon === 'number' ? { lon, lng: lon } : {}),
    updatedAt: Date.parse(registeredAt),
  };
}

export function buildRegisteredAddressQrPayload(record: RegisteredAddressRecord) {
  return `${QR_PREFIX}${encodeURIComponent(JSON.stringify({ version: 1, record }))}`;
}

export function parseRegisteredAddressQrPayload(text: string): RegisteredAddressRecord | null {
  const value = text.trim();
  if (!value.startsWith(QR_PREFIX)) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value.slice(QR_PREFIX.length)));
    const record = parsed?.record || parsed;
    if (!record || (record.type !== 'ADDRESS' && record.type !== 'AOID') || !record.id) {
      return null;
    }
    return record as RegisteredAddressRecord;
  } catch {
    return null;
  }
}

export function buildSavedQrFromRegisteredAddress(
  record: RegisteredAddressRecord,
  payload: string,
  savedAt = new Date().toISOString(),
): SavedRegisteredAddressQr {
  return {
    id: record.agid || record.id,
    lat: record.lat,
    lon: record.lon ?? record.lng,
    address: record.address,
    regionName: `${record.country || 'AGID'} Registered Address`,
    savedAt,
    payload,
    source: 'registered_address',
  };
}
