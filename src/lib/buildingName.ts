export type BuildingNameCandidate = {
  name: string;
  nameEn?: string;
  source: string;
  category?: string;
  distanceMeters?: number;
  osmId?: number;
  osmType?: string;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

const GENERIC_BUILDING_VALUES = new Set([
  'yes',
  'no',
  'true',
  'building',
  'apartments',
  'residential',
  'commercial',
  'retail',
  'office',
  'house',
  'detached',
  'semidetached_house',
  'terrace',
  'garage',
  'garages',
  'industrial',
  'warehouse',
  'roof',
  'hut',
  'shed',
  'school',
  'hospital',
  'church',
  'chapel',
  'temple',
  'mosque',
  'public',
  'civic',
  'hotel',
  'dormitory',
]);

const CATEGORY_PRIORITY: Record<string, number> = {
  building: 0,
  housename: 0,
  address: 0,
  poi: 4,
  office: 3,
  amenity: 4,
  tourism: 4,
  healthcare: 4,
  shop: 5,
  leisure: 6,
  place: 8,
};

const SOURCE_PRIORITY: Record<string, number> = {
  'overture:buildings': 0,
  'addr:housename': 0,
  'nominatim:addr:housename': 0,
  'building:name': 1,
  'nominatim:building:name': 1,
  'nominatim:address.building': 1,
  'nominatim:address.office': 3,
  'nominatim:address.amenity': 4,
  'nominatim:address.shop': 5,
  'nominatim:address.tourism': 5,
  'nominatim:address.leisure': 6,
  'openfreemap:building': 1,
  'openfreemap:housename': 1,
  'overture:places': 2,
  'name:localized': 2,
  'name:en': 3,
  official_name: 4,
  name: 5,
  'openfreemap:poi': 6,
  'openfreemap:label': 7,
  loc_name: 6,
  alt_name: 7,
  brand: 8,
};

function cleanName(value: unknown) {
  if (value === undefined || value === null) return '';
  return String(value)
    .normalize('NFKC')
    .replace(/[\u3000\s]+/g, ' ')
    .trim();
}

function languageTag(langCode = '') {
  const normalized = langCode.toLowerCase();
  if (!normalized || normalized === 'local' || normalized === 'international' || normalized === 'intl_en') return '';
  if (normalized.startsWith('zh-hans')) return 'zh-Hans';
  if (normalized.startsWith('zh-hant')) return 'zh-Hant';
  if (normalized.startsWith('en')) return 'en';
  return normalized.split('-')[0];
}

function isGenericBuildingValue(value: string) {
  return GENERIC_BUILDING_VALUES.has(value.toLowerCase());
}

function firstNamedValue(tags: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = cleanName(tags[key]);
    if (!value || isGenericBuildingValue(value)) continue;
    return { name: value, source: key };
  }
  return null;
}

function nameKeysForLanguage(langCode = '') {
  const lang = languageTag(langCode);
  const keys = ['addr:housename', 'building:name'];
  if (lang) keys.push(`name:${lang}`);
  if (lang && lang !== 'en') keys.push('name:en');
  keys.push('official_name', 'name', 'loc_name', 'alt_name', 'brand');
  return Array.from(new Set(keys));
}

function looseNameKeysForLanguage(langCode = '') {
  const lang = languageTag(langCode);
  const keys = ['addr:housename', 'housename', 'building:name', 'building_name'];
  if (lang) {
    keys.push(`name:${lang}`, `name_${lang}`, `name:${lang.toLowerCase()}`, `name_${lang.toLowerCase()}`);
  }
  if (lang && lang !== 'en') keys.push('name:en', 'name_en');
  keys.push(
    'name:en',
    'name_en',
    'name:latin',
    'name_latin',
    'name:nonlatin',
    'name_nonlatin',
    'name_int',
    'official_name',
    'name',
    'loc_name',
    'alt_name',
    'brand',
  );
  return Array.from(new Set(keys));
}

function categoryFromTags(tags: Record<string, string>) {
  if (tags['addr:housename']) return 'housename';
  if (tags.building) return 'building';
  return (
    ['office', 'amenity', 'tourism', 'healthcare', 'shop', 'leisure', 'place']
      .find(key => cleanName(tags[key])) || 'place'
  );
}

function normalizeSource(source: string) {
  if (source.startsWith('name:') && source !== 'name:en') return 'name:localized';
  return source;
}

function featureProperties(feature: any) {
  return Object.fromEntries(
    Object.entries(feature?.properties || {}).map(([key, value]) => [key, cleanName(value)]),
  ) as Record<string, string>;
}

function openMapLayerId(feature: any) {
  return cleanName(feature?.sourceLayer || feature?.sourceLayerId || feature?.layer?.['source-layer'] || feature?.layer?.sourceLayer || feature?.layer?.id);
}

function isOpenMapRoadOrTransitOnlyFeature(feature: any, props: Record<string, string>) {
  if (props['addr:housename'] || props.housename || props['building:name'] || props.building_name) return false;
  const layer = openMapLayerId(feature).toLowerCase();
  return (
    layer.includes('transportation') ||
    layer.includes('road') ||
    layer.includes('railway') ||
    layer.includes('waterway')
  );
}

function openMapSource(feature: any, props: Record<string, string>) {
  const layer = openMapLayerId(feature).toLowerCase();
  if (props['addr:housename'] || props.housename || props['building:name'] || props.building_name) return 'openfreemap:housename';
  if (layer.includes('building') || cleanName(props.building)) return 'openfreemap:building';
  if (layer.includes('poi') || props.class || props.subclass || props.amenity || props.shop || props.tourism) return 'openfreemap:poi';
  return 'openfreemap:label';
}

function openMapCategory(feature: any, props: Record<string, string>) {
  const layer = openMapLayerId(feature).toLowerCase();
  if (layer.includes('building') || props.building) return 'building';
  if (props['addr:housename'] || props.housename) return 'housename';
  if (layer.includes('poi')) return 'poi';
  return props.class || props.subclass || 'place';
}

function featureCenter(feature: any): { lat?: number; lon?: number } {
  const geometry = feature?.geometry;
  if (!geometry) return {};
  if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
    return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]) };
  }
  return {};
}

export function extractBuildingNameFromOsmTags(
  rawTags: Record<string, unknown> = {},
  langCode = '',
): Pick<BuildingNameCandidate, 'name' | 'nameEn' | 'source'> | null {
  const tags = Object.fromEntries(
    Object.entries(rawTags).map(([key, value]) => [key, cleanName(value)]),
  ) as Record<string, string>;

  const best = firstNamedValue(tags, nameKeysForLanguage(langCode));
  if (!best) return null;

  const nameEn = cleanName(tags['name:en']) || (languageTag(langCode) === 'en' ? best.name : '');
  return {
    name: best.name,
    ...(nameEn ? { nameEn } : {}),
    source: best.source,
  };
}

export function extractBuildingNameFromReverseGeocode(
  data: any,
  langCode = '',
): Pick<BuildingNameCandidate, 'name' | 'nameEn' | 'source'> | null {
  const address = data?.address || {};
  const namedetails = data?.namedetails || {};
  const extratags = data?.extratags || {};
  const addressKeys = ['building', 'office', 'amenity', 'shop', 'tourism', 'leisure', 'historic', 'healthcare'];

  for (const key of addressKeys) {
    const value = cleanName(address[key]);
    if (value && !isGenericBuildingValue(value)) {
      const nameEn = cleanName(namedetails['name:en']) || cleanName(extratags['name:en']);
      return {
        name: value,
        ...(nameEn ? { nameEn } : {}),
        source: `nominatim:address.${key}`,
      };
    }
  }

  const fromTags = extractBuildingNameFromOsmTags({ ...extratags, ...namedetails }, langCode);
  return fromTags ? { ...fromTags, source: `nominatim:${fromTags.source}` } : null;
}

export function rankBuildingNameCandidates(candidates: BuildingNameCandidate[]) {
  return [...candidates]
    .filter(candidate => cleanName(candidate.name))
    .sort((a, b) => {
      const sourceDiff = (SOURCE_PRIORITY[normalizeSource(a.source)] ?? 10) - (SOURCE_PRIORITY[normalizeSource(b.source)] ?? 10);
      if (sourceDiff !== 0) return sourceDiff;
      const categoryDiff = (CATEGORY_PRIORITY[a.category || 'place'] ?? 9) - (CATEGORY_PRIORITY[b.category || 'place'] ?? 9);
      if (categoryDiff !== 0) return categoryDiff;
      return (a.distanceMeters ?? Number.POSITIVE_INFINITY) - (b.distanceMeters ?? Number.POSITIVE_INFINITY);
    });
}

export function buildingNameCandidateFromOpenMapFeature(
  feature: any,
  langCode = '',
  distanceMeters?: number,
): BuildingNameCandidate | null {
  const props = featureProperties(feature);
  if (isOpenMapRoadOrTransitOnlyFeature(feature, props)) return null;

  const best = firstNamedValue(props, looseNameKeysForLanguage(langCode));
  if (!best) return null;

  const nameEn = cleanName(props['name:en']) || cleanName(props.name_en) || (languageTag(langCode) === 'en' ? best.name : '');
  const center = featureCenter(feature);
  return {
    name: best.name,
    ...(nameEn ? { nameEn } : {}),
    source: openMapSource(feature, props),
    category: openMapCategory(feature, props),
    distanceMeters,
    osmId: typeof feature?.id === 'number' ? feature.id : undefined,
    osmType: openMapLayerId(feature) || undefined,
    ...center,
    tags: props,
  };
}

export function queryOpenFreeMapBuildingNameCandidates(
  mapLike: {
    project?: (lngLat: [number, number]) => { x: number; y: number };
    queryRenderedFeatures?: (geometry?: unknown, options?: unknown) => any[];
  } | null | undefined,
  lat: number,
  lon: number,
  langCode = '',
  pixelRadius = 28,
): BuildingNameCandidate[] {
  if (!mapLike?.project || !mapLike.queryRenderedFeatures) return [];
  try {
    const point = mapLike.project([lon, lat]);
    const r = Math.max(4, Math.min(pixelRadius, 64));
    const features = mapLike.queryRenderedFeatures([
      [point.x - r, point.y - r],
      [point.x + r, point.y + r],
    ]);
    const deduped = new Map<string, BuildingNameCandidate>();
    for (const feature of features || []) {
      const candidate = buildingNameCandidateFromOpenMapFeature(feature, langCode);
      if (!candidate) continue;
      const key = `${candidate.source}|${candidate.name.toLocaleLowerCase()}|${candidate.osmId || ''}`;
      if (!deduped.has(key)) deduped.set(key, candidate);
    }
    return Array.from(deduped.values());
  } catch (error) {
    console.warn('Failed to query OpenFreeMap rendered building labels:', error);
    return [];
  }
}

export function buildBuildingNameOverpassQuery(lat: number, lon: number, radius = 90) {
  return `
    [out:json][timeout:25];
    (
      node["addr:housename"](around:${radius},${lat},${lon});
      way["addr:housename"](around:${radius},${lat},${lon});
      relation["addr:housename"](around:${radius},${lat},${lon});
      node["building"]["name"](around:${radius},${lat},${lon});
      way["building"]["name"](around:${radius},${lat},${lon});
      relation["building"]["name"](around:${radius},${lat},${lon});
      node["building"]["building:name"](around:${radius},${lat},${lon});
      way["building"]["building:name"](around:${radius},${lat},${lon});
      relation["building"]["building:name"](around:${radius},${lat},${lon});
      node["office"]["name"](around:${radius},${lat},${lon});
      way["office"]["name"](around:${radius},${lat},${lon});
      relation["office"]["name"](around:${radius},${lat},${lon});
      node["amenity"]["name"](around:${radius},${lat},${lon});
      way["amenity"]["name"](around:${radius},${lat},${lon});
      relation["amenity"]["name"](around:${radius},${lat},${lon});
      node["shop"]["name"](around:${radius},${lat},${lon});
      way["shop"]["name"](around:${radius},${lat},${lon});
      relation["shop"]["name"](around:${radius},${lat},${lon});
      node["tourism"]["name"](around:${radius},${lat},${lon});
      way["tourism"]["name"](around:${radius},${lat},${lon});
      relation["tourism"]["name"](around:${radius},${lat},${lon});
      node["healthcare"]["name"](around:${radius},${lat},${lon});
      way["healthcare"]["name"](around:${radius},${lat},${lon});
      relation["healthcare"]["name"](around:${radius},${lat},${lon});
      node["leisure"]["name"](around:${radius},${lat},${lon});
      way["leisure"]["name"](around:${radius},${lat},${lon});
      relation["leisure"]["name"](around:${radius},${lat},${lon});
      node["historic"]["name"](around:${radius},${lat},${lon});
      way["historic"]["name"](around:${radius},${lat},${lon});
      relation["historic"]["name"](around:${radius},${lat},${lon});
      node["man_made"]["name"](around:${radius},${lat},${lon});
      way["man_made"]["name"](around:${radius},${lat},${lon});
      relation["man_made"]["name"](around:${radius},${lat},${lon});
      node["public_transport"]["name"](around:${radius},${lat},${lon});
      way["public_transport"]["name"](around:${radius},${lat},${lon});
      relation["public_transport"]["name"](around:${radius},${lat},${lon});
      node["railway"~"station|halt|tram_stop"]["name"](around:${radius},${lat},${lon});
      way["railway"~"station|halt|tram_stop"]["name"](around:${radius},${lat},${lon});
      relation["railway"~"station|halt|tram_stop"]["name"](around:${radius},${lat},${lon});
    );
    out center tags;
  `;
}

export function buildingNameCandidateFromOsmElement(
  element: any,
  langCode = '',
  distanceMeters?: number,
): BuildingNameCandidate | null {
  const tags = element?.tags || {};
  const extracted = extractBuildingNameFromOsmTags(tags, langCode);
  if (!extracted) return null;

  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  return {
    ...extracted,
    category: categoryFromTags(tags),
    distanceMeters,
    osmId: element.id,
    osmType: element.type,
    lat,
    lon,
    tags,
  };
}
