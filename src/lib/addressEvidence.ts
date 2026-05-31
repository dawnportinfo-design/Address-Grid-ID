export type AddressEvidenceFields = {
  country_code?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  suburb?: string;
  road?: string;
  house_number?: string;
  building?: string;
  postcode?: string;
  poi?: string;
  plus_code?: string;
};

export type OpenSourceAddressEvidence = {
  source: string;
  priority: number;
  fields: AddressEvidenceFields;
};

const clean = (value: unknown) =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u3000\s]+/g, ' ')
    .trim();

const hasValue = (value: unknown) => clean(value).length > 0;

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

function first(...values: unknown[]) {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function addEvidence(
  evidences: OpenSourceAddressEvidence[],
  source: string,
  priority: number,
  fields: AddressEvidenceFields,
) {
  const cleanedFields = Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, clean(value)])
      .filter(([, value]) => value)
  ) as AddressEvidenceFields;

  if (Object.keys(cleanedFields).length === 0) return;
  evidences.push({ source, priority, fields: cleanedFields });
}

function fieldsFromPostalLike(data: any = {}): AddressEvidenceFields {
  const record = asRecord(data);
  const zippopotamPlace = Array.isArray(record.places) ? asRecord(record.places[0]) : {};
  return {
    country_code: first(record.country_code, record.countryCode, record.cc, record['country abbreviation']),
    country: first(record.country, record.countryName, record['country']),
    state: first(
      record.state,
      record.province,
      record.region,
      record.department,
      record.context,
      record.county,
      record.adminName1,
      record.uf,
      zippopotamPlace.state,
      zippopotamPlace['state abbreviation'],
    ),
    city: first(
      record.city,
      record.town,
      record.village,
      record.municipality,
      record.locality,
      record.commune,
      record.localidade,
      record.placeName,
      record['place name'],
      record.adminName2,
      zippopotamPlace['place name'],
    ),
    district: first(record.district, record.county, record.department, record.adminName2),
    subdistrict: first(
      record.subdistrict,
      record.suburb,
      record.neighbourhood,
      record.neighborhood,
      record.quarter,
      record.bairro,
      record.adminName3,
    ),
    road: first(record.road, record.street, record.streetName, record.logradouro),
    house_number: first(record.house_number, record.houseNumber, record.housenumber, record.house),
    building: first(record.building, record.building_name, record.organization),
    postcode: first(record.postcode, record.postalCode, record.postal_code, record.zip, record.cep, record['post code']),
    plus_code: first(record.plus_code),
  };
}

function fieldsFromJapanPostcode(data: any = {}): AddressEvidenceFields {
  const record = asRecord(data);
  return {
    state: first(record.address1),
    city: first(record.address2),
    subdistrict: first(record.address3),
  };
}

function fieldsFromJapanGeo(data: any = {}): AddressEvidenceFields {
  const record = asRecord(data);
  return {
    state: first(record.prefecture),
    city: first(record.city),
    district: first(record.ward),
    subdistrict: first(record.town, record.chome),
    road: first(record.block),
    house_number: first(record.number),
    building: first(record.building),
  };
}

function fieldsFromUkPostcode(data: any = {}): AddressEvidenceFields {
  const record = asRecord(data);
  return {
    postcode: first(record.postcode),
    city: first(record.admin_district, record.parish),
    district: first(record.admin_ward),
    state: first(record.region, record.country),
    country: first(record.country),
  };
}

function fieldsFromHkAls(data: any = {}): AddressEvidenceFields {
  const record = asRecord(data);
  return {
    district: first(record.district),
    subdistrict: first(record.area, record.estate, record.street),
    building: first(record.building, record.name),
  };
}

function fieldsFromOpenAddressesMatch(match: any = {}): AddressEvidenceFields {
  const source = asRecord(match);
  const record = asRecord(source.record || source);
  return {
    country_code: first(record.countryCode, record.country_code),
    state: first(record.state),
    city: first(record.city),
    road: first(record.street, record.road),
    house_number: first(record.houseNumber, record.house_number),
    postcode: first(record.postcode),
  };
}

export function collectOpenSourceAddressEvidence(details: any): OpenSourceAddressEvidence[] {
  const evidences: OpenSourceAddressEvidence[] = [];
  if (!details) return evidences;

  addEvidence(evidences, 'regional-open-data', 94, fieldsFromPostalLike(details.european_postal_data));
  addEvidence(evidences, 'nordic-open-data', 95, fieldsFromPostalLike(details.nordic_context?.addressDetails));
  addEvidence(evidences, 'asia-oceania-open-data', 92, fieldsFromPostalLike(details.asia_oceania_data));
  addEvidence(evidences, 'japan-postcode-api', 96, fieldsFromJapanPostcode(details.asia_oceania_data?.japanDetails));
  addEvidence(evidences, 'japanese-open-data', 98, fieldsFromJapanGeo(details.japanese_geo_context));
  addEvidence(evidences, 'official-regional-api', 90, fieldsFromPostalLike(details.official_regional_data));
  addEvidence(evidences, 'viacep', 97, fieldsFromPostalLike(details.official_regional_data?.viaCEP));
  addEvidence(evidences, 'hk-als', 93, fieldsFromHkAls(details.official_regional_data?.hkALS));
  addEvidence(evidences, 'postcodes-io', 88, fieldsFromUkPostcode(details.uk_ireland_context?.postcodeDetails));
  addEvidence(evidences, 'geonames-postal', 82, fieldsFromPostalLike(details.local_postal_data));
  addEvidence(evidences, 'zippopotam', 80, fieldsFromPostalLike(details.zippopotam_data));

  const referenceMatches = [
    ...(Array.isArray(details.openaddresses_matches) ? details.openaddresses_matches : []),
    ...(Array.isArray(details.address_analysis?.referenceMatches) ? details.address_analysis.referenceMatches : []),
  ];
  for (const match of referenceMatches) {
    const record = asRecord(match);
    addEvidence(
      evidences,
      clean(record.source) || 'openaddresses',
      Math.round((Number(record.confidence) || 0.75) * 100),
      fieldsFromOpenAddressesMatch(record),
    );
  }

  return evidences.sort((a, b) => b.priority - a.priority);
}

export function collectOpenSourceAddressEvidenceSources(details: any) {
  return Array.from(new Set(collectOpenSourceAddressEvidence(details).map(evidence => evidence.source)));
}

function isWeakAddressValue(field: keyof AddressEvidenceFields, value: unknown) {
  const cleaned = clean(value);
  if (!cleaned) return true;
  if (field === 'house_number' || field === 'postcode') return false;
  if (/^[.,;:\-]+$/.test(cleaned)) return true;
  if (/^\d+[.]?$/.test(cleaned)) return true;
  return false;
}

function shouldReplaceField(
  field: keyof AddressEvidenceFields,
  current: unknown,
  next: unknown,
  priority: number,
) {
  const currentValue = clean(current);
  const nextValue = clean(next);
  if (!nextValue) return false;
  if (!currentValue) return true;
  if (currentValue.toLowerCase() === nextValue.toLowerCase()) return false;
  if (priority >= 90 && isWeakAddressValue(field, currentValue)) return true;
  if (field === 'postcode' && priority >= 90 && currentValue.replace(/\s+/g, '') === nextValue.replace(/\s+/g, '')) {
    return true;
  }
  return false;
}

export function mergeOpenSourceAddressEvidence<T extends AddressEvidenceFields>(
  base: T,
  details: any,
): { address: T; sources: string[] } {
  const merged: AddressEvidenceFields = { ...base };
  const usedSources = new Set<string>();

  for (const evidence of collectOpenSourceAddressEvidence(details)) {
    for (const [field, value] of Object.entries(evidence.fields) as Array<[keyof AddressEvidenceFields, string]>) {
      if (shouldReplaceField(field, merged[field], value, evidence.priority)) {
        merged[field] = value;
        usedSources.add(evidence.source);
      }
    }
  }

  if (hasValue(merged.country_code)) {
    merged.country_code = clean(merged.country_code).toUpperCase();
  }

  return { address: merged as T, sources: Array.from(usedSources) };
}
