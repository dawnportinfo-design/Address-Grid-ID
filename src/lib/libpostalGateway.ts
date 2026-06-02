import { normalizeApiAddress,parseAddressText,type CanonicalAddressParts } from './addressIntelligence';

export type LibpostalComponent = {
  label: string;
  value: string;
};

export type OptionalLibpostalResult = {
  source: 'libpostal' | 'local-parser';
  available: boolean;
  canonical: CanonicalAddressParts;
  components: LibpostalComponent[];
};

type ParseOptions = {
  text: string;
  countryCode?: string;
  endpoint?: string;
  fetcher?: typeof fetch;
};

const LABEL_TO_CANONICAL: Record<string, keyof CanonicalAddressParts> = {
  country: 'country',
  country_code: 'country_code',
  state: 'state',
  province: 'state',
  city: 'city',
  city_district: 'district',
  suburb: 'suburb',
  road: 'road',
  street: 'road',
  house_number: 'house_number',
  postcode: 'postcode',
  postal_code: 'postcode',
  building: 'building',
  house: 'building',
  venue: 'poi',
};

function componentsToCanonical(components: LibpostalComponent[], countryCode?: string): CanonicalAddressParts {
  const raw: Record<string, string> = {};
  for (const component of components) {
    const key = LABEL_TO_CANONICAL[component.label];
    if (key && !raw[key]) raw[key] = component.value;
  }
  if (countryCode && !raw.country_code) raw.country_code = countryCode.toLowerCase();
  return normalizeApiAddress(raw);
}

function localResult(text: string, countryCode?: string): OptionalLibpostalResult {
  const canonical = parseAddressText(text);
  if (countryCode && !canonical.country_code) canonical.country_code = countryCode.toLowerCase();
  return {
    source: 'local-parser',
    available: false,
    canonical,
    components: Object.entries(canonical).map(([label, value]) => ({ label, value: String(value) })),
  };
}

export async function parseAddressWithOptionalLibpostal({
  text,
  countryCode,
  endpoint,
  fetcher = fetch,
}: ParseOptions): Promise<OptionalLibpostalResult> {
  if (!endpoint) return localResult(text, countryCode);

  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, countryCode }),
    });
    if (!response.ok) return localResult(text, countryCode);

    const data = await response.json();
    const components = Array.isArray(data.components) ? data.components : [];
    if (data.source === 'local-parser' || data.available === false) {
      return {
        source: 'local-parser',
        available: false,
        canonical: data.canonical ? normalizeApiAddress(data.canonical) : componentsToCanonical(components, countryCode),
        components,
      };
    }

    return {
      source: 'libpostal',
      available: true,
      canonical: componentsToCanonical(components, countryCode),
      components,
    };
  } catch {
    return localResult(text, countryCode);
  }
}
