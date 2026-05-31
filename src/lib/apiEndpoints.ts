type Coordinate = {
  lat: number;
  lon: number;
};

type ReverseGeocodeParams = Coordinate & {
  zoom?: number;
  addressdetails?: 0 | 1;
  lang?: string;
  countryCode?: string;
};

type OsmSearchParams = {
  q: string;
  limit?: number;
  polygonGeojson?: boolean;
  viewbox?: string;
  bounded?: boolean;
};

function cleanCountryCode(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

function withParams(path: string, params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export const apiEndpoints = {
  countryStats(countryCode: string) {
    return withParams('/api/country-stats', { cc: cleanCountryCode(countryCode) });
  },

  countryCities(countryCode: string) {
    return withParams('/api/country-cities', { cc: cleanCountryCode(countryCode) });
  },

  countryBoundary(countryCode: string) {
    return withParams('/api/country-boundary', { cc: cleanCountryCode(countryCode) });
  },

  dataQualityReport() {
    return '/api/data-quality/report';
  },

  osmSearch({ q, limit, polygonGeojson, viewbox, bounded }: OsmSearchParams) {
    return withParams('/api/osm-search', {
      q,
      limit,
      polygon_geojson: polygonGeojson ? 1 : undefined,
      viewbox,
      bounded: bounded ? 1 : undefined,
    });
  },

  photonSearch(query: string, limit = 5) {
    return withParams('/api/photon', { q: query, limit });
  },

  osrmRoute(start: { lng: number; lat: number }, end: { lng: number; lat: number }, profile: string) {
    return withParams('/api/osrm/route', {
      start: `${start.lng},${start.lat}`,
      end: `${end.lng},${end.lat}`,
      profile,
    });
  },

  nominatimReverse({ lat, lon, zoom = 18, addressdetails = 1, lang, countryCode }: ReverseGeocodeParams) {
    return withParams('/api/nominatim/reverse', {
      lat,
      lon,
      zoom,
      addressdetails,
      lang,
      cc: countryCode ? cleanCountryCode(countryCode) : undefined,
    });
  },

  osmReverse({ lat, lon, zoom = 18, addressdetails = 1, lang, countryCode }: ReverseGeocodeParams) {
    return withParams('/api/osm-reverse', {
      lat,
      lon,
      zoom,
      addressdetails,
      lang,
      cc: countryCode ? cleanCountryCode(countryCode) : undefined,
    });
  },

  overpass() {
    return '/api/overpass';
  },

  terrainTile() {
    return '/api/terrain/{z}/{x}/{y}.png';
  },
};
