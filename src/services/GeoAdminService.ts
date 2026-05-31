import { apiEndpoints } from '../lib/apiEndpoints';
import { agidFetch, type AgidFetchOptions } from '../lib/agidHttpClient';

export type CountryCity = {
  name?: string;
  nameEn?: string;
  type?: string;
  lat?: number;
  lon?: number;
};

export type CountryStats = {
  population?: number;
  area?: number;
  region?: string;
  subregion?: string;
  capital?: string;
};

export type DataQualityReport = {
  timestamp: number;
  report: string;
  stats: unknown;
  continentQuality: unknown;
};

export type OsmSearchResult = {
  lat?: string;
  lon?: string;
  geojson?: unknown;
  [key: string]: unknown;
};

type FetchOptions = Pick<AgidFetchOptions, 'fetcher' | 'timeoutMs' | 'retries'>;

export async function fetchCountryCities(countryCode: string, options: FetchOptions = {}) {
  const result = await agidFetch<CountryCity[]>(apiEndpoints.countryCities(countryCode), {
    source: 'country-cities',
    timeoutMs: 45000,
    ...options,
  });
  return result.data ?? [];
}

export async function fetchCountryBoundary(countryCode: string, options: FetchOptions = {}) {
  const result = await agidFetch<unknown>(apiEndpoints.countryBoundary(countryCode), {
    source: 'country-boundary',
    timeoutMs: 45000,
    ...options,
  });
  return result.data ?? null;
}

export async function fetchCountryStats(countryCode: string, options: FetchOptions = {}) {
  const result = await agidFetch<CountryStats>(apiEndpoints.countryStats(countryCode), {
    source: 'country-stats',
    timeoutMs: 20000,
    ...options,
  });
  return result.data ?? null;
}

export async function fetchDataQualityReport(options: FetchOptions = {}) {
  const result = await agidFetch<DataQualityReport>(apiEndpoints.dataQualityReport(), {
    source: 'data-quality',
    timeoutMs: 20000,
    ...options,
  });
  return result.data ?? null;
}

export async function searchOsmRegion(query: string, options: FetchOptions = {}) {
  const result = await agidFetch<OsmSearchResult[]>(apiEndpoints.osmSearch({
    q: query,
    limit: 1,
    polygonGeojson: true,
  }), {
    source: 'osm-search',
    timeoutMs: 30000,
    ...options,
  });
  return result.data ?? [];
}
