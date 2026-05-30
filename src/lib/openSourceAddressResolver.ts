export type OpenSourceAddressResolutionSource =
  | 'osm-nominatim'
  | 'geonames-gazetteer'
  | 'local-fallback'
  | 'unchanged';

export type OpenSourceAddressResolution = {
  value: string;
  source: OpenSourceAddressResolutionSource;
  confidence: number;
};

type ResolveOptions = {
  fetcher?: typeof fetch;
  fallback?: (value: string, countryCode: string) => string;
  timeoutMs?: number;
};

const cache = new Map<string, Promise<OpenSourceAddressResolution>>();

function clean(value: unknown) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function countryToNominatimCode(countryCode: string) {
  const code = countryCode.trim().slice(0, 2).toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : '';
}

function pickEnglishName(namedetails: Record<string, unknown> = {}) {
  const candidates = [
    namedetails['name:en'],
    namedetails['official_name:en'],
    namedetails['short_name:en'],
    namedetails['alt_name:en'],
    namedetails.name,
  ];

  return clean(candidates.find(candidate => clean(candidate)));
}

async function fetchJson(fetcher: typeof fetch, url: string, timeoutMs: number) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetcher(url, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function resolveWithNominatim(text: string, countryCode: string, fetcher: typeof fetch, timeoutMs: number) {
  const countrycodes = countryToNominatimCode(countryCode);
  const params = new URLSearchParams({
    q: text,
    format: 'jsonv2',
    addressdetails: '1',
    namedetails: '1',
    limit: '3',
  });
  if (countrycodes) params.set('countrycodes', countrycodes);

  const data = await fetchJson(fetcher, `/api/nominatim/search?${params.toString()}`, timeoutMs);
  if (!Array.isArray(data)) return '';

  for (const item of data) {
    const englishName = pickEnglishName(item?.namedetails || {});
    if (englishName && englishName.toLowerCase() !== text.toLowerCase()) return englishName;
  }
  return '';
}

async function resolveWithGeoNames(text: string, countryCode: string, fetcher: typeof fetch, timeoutMs: number) {
  const country = countryToNominatimCode(countryCode).toUpperCase();
  const params = new URLSearchParams({
    q: text,
    maxRows: '3',
    style: 'FULL',
    type: 'json',
    lang: 'en',
  });
  if (country) params.set('country', country);

  const data = await fetchJson(fetcher, `https://secure.geonames.org/searchJSON?${params.toString()}`, timeoutMs);
  const rows = Array.isArray(data?.geonames) ? data.geonames : [];
  for (const row of rows) {
    const alternateNames = Array.isArray(row?.alternateNames) ? row.alternateNames : [];
    const englishAlternate = alternateNames.find((alternate: Record<string, unknown>) =>
      clean(alternate.lang).toLowerCase() === 'en' && clean(alternate.name)
    );
    const englishName = clean(englishAlternate?.name || row?.toponymName || row?.name);
    if (englishName && englishName.toLowerCase() !== text.toLowerCase()) return englishName;
  }
  return '';
}

async function resolveUncached(
  rawText: string,
  countryCode: string,
  { fetcher = fetch, fallback, timeoutMs = 1200 }: ResolveOptions,
): Promise<OpenSourceAddressResolution> {
  const text = clean(rawText);
  if (!text) return { value: '', source: 'unchanged', confidence: 0 };

  const nominatim = await resolveWithNominatim(text, countryCode, fetcher, timeoutMs);
  if (nominatim) return { value: nominatim, source: 'osm-nominatim', confidence: 0.92 };

  const geonames = await resolveWithGeoNames(text, countryCode, fetcher, timeoutMs);
  if (geonames) return { value: geonames, source: 'geonames-gazetteer', confidence: 0.86 };

  const fallbackValue = clean(fallback?.(text, countryCode));
  if (fallbackValue && fallbackValue !== text) {
    return { value: fallbackValue, source: 'local-fallback', confidence: 0.62 };
  }

  return { value: text, source: 'unchanged', confidence: 0.3 };
}

export function resolveEnglishAddressPartOpenSource(
  text: string,
  countryCode: string,
  options: ResolveOptions = {},
) {
  const key = `${countryCode.toUpperCase()}::${clean(text).toLowerCase()}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = resolveUncached(text, countryCode, options);
  cache.set(key, promise);
  return promise;
}
