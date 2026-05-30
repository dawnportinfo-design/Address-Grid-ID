import type { CanonicalAddressParts } from './addressIntelligence';

export type OpenAddressesRecord = {
  source: string;
  countryCode?: string;
  state?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
};

export type AddressReferenceMatch = {
  source: string;
  confidence: number;
  record: OpenAddressesRecord;
};

const clean = (value: unknown) => String(value ?? '').normalize('NFKC').trim().toLowerCase();

function scoreField(left: unknown, right: unknown, weight: number) {
  const a = clean(left);
  const b = clean(right);
  if (!a || !b) return 0;
  return a === b ? weight : 0;
}

export function matchOpenAddressesReference(
  address: CanonicalAddressParts,
  records: OpenAddressesRecord[]
): AddressReferenceMatch | null {
  let best: AddressReferenceMatch | null = null;

  for (const record of records) {
    const score =
      scoreField(address.country_code, record.countryCode, 0.1) +
      scoreField(address.state, record.state, 0.1) +
      scoreField(address.city, record.city, 0.15) +
      scoreField(address.road, record.street, 0.25) +
      scoreField(address.house_number, record.houseNumber, 0.25) +
      scoreField(address.postcode, record.postcode, 0.1);
    const confidence = Math.round(Math.min(0.95, score) * 100) / 100;

    if (confidence >= 0.75 && (!best || confidence > best.confidence)) {
      best = { source: record.source, confidence, record };
    }
  }

  return best;
}
