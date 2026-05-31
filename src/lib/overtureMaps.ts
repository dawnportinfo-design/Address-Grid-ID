import type { BuildingNameCandidate } from './buildingName';

export const DEFAULT_OVERTURE_RELEASE = '2026-04-15.0';

function cleanValue(value: unknown) {
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

function valueFromCommonName(entry: any) {
  if (typeof entry === 'string') return entry;
  return entry?.value || entry?.name || entry?.text || entry?.primary || '';
}

function langFromCommonName(entry: any) {
  return cleanValue(entry?.language || entry?.lang || entry?.locale).toLowerCase();
}

function pickOvertureName(names: any, langCode = '') {
  const lang = languageTag(langCode).toLowerCase();
  const primary = cleanValue(names?.primary);
  const common = Array.isArray(names?.common)
    ? names.common
    : names?.common && typeof names.common === 'object'
      ? Object.entries(names.common).map(([language, value]) => ({ language, value }))
      : [];

  if (lang) {
    const localized = common
      .map((entry: any) => ({ name: cleanValue(valueFromCommonName(entry)), lang: langFromCommonName(entry) }))
      .find((entry: any) => entry.name && entry.lang === lang);
    if (localized) return localized.name;
  }

  return primary || cleanValue(valueFromCommonName(common[0]));
}

function pickOvertureEnglishName(names: any) {
  const common = Array.isArray(names?.common)
    ? names.common
    : names?.common && typeof names.common === 'object'
      ? Object.entries(names.common).map(([language, value]) => ({ language, value }))
      : [];
  const english = common
    .map((entry: any) => ({ name: cleanValue(valueFromCommonName(entry)), lang: langFromCommonName(entry) }))
    .find((entry: any) => entry.name && entry.lang === 'en');
  return english?.name || cleanValue(names?.primary);
}

function propertiesFromFeature(feature: any) {
  return feature?.properties ? { ...feature.properties, geometry: feature.geometry } : feature;
}

function overtureSource(props: any) {
  const theme = cleanValue(props.theme || props.overture_theme).toLowerCase();
  const type = cleanValue(props.type || props.overture_type).toLowerCase();
  if (theme === 'buildings' || type === 'building') return 'overture:buildings';
  if (theme === 'places' || type === 'place') return 'overture:places';
  return 'overture:maps';
}

function overtureCategory(props: any) {
  const theme = cleanValue(props.theme || props.overture_theme).toLowerCase();
  const type = cleanValue(props.type || props.overture_type).toLowerCase();
  if (theme === 'buildings' || type === 'building') return 'building';
  return cleanValue(props.categories?.primary || props.category || type || 'place');
}

export function buildingNameCandidateFromOvertureFeature(
  feature: any,
  langCode = '',
): BuildingNameCandidate | null {
  const props = propertiesFromFeature(feature);
  const names = props?.names || {};
  const name = pickOvertureName(names, langCode);
  if (!name) return null;

  const nameEn = pickOvertureEnglishName(names);
  return {
    name,
    ...(nameEn ? { nameEn } : {}),
    source: overtureSource(props),
    category: overtureCategory(props),
    distanceMeters: typeof props.distanceMeters === 'number' ? props.distanceMeters : undefined,
    osmId: props.id,
    osmType: cleanValue(props.type || props.overture_type) || undefined,
    lat: typeof props.lat === 'number' ? props.lat : undefined,
    lon: typeof props.lon === 'number' ? props.lon : undefined,
    tags: {
      overture_id: cleanValue(props.id),
      overture_confidence: cleanValue(props.confidence),
    },
  };
}

function safeRelease(release: string) {
  return release.replace(/[^0-9A-Za-z._-]/g, '') || DEFAULT_OVERTURE_RELEASE;
}

function bboxForRadius(lat: number, lon: number, radiusMeters: number) {
  const latDelta = radiusMeters / 111_320;
  const lonDelta = radiusMeters / (111_320 * Math.max(Math.cos(lat * Math.PI / 180), 0.01));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

export function buildOvertureBuildingNameDuckDbSql(
  lat: number,
  lon: number,
  radiusMeters = 90,
  release = DEFAULT_OVERTURE_RELEASE,
) {
  const bbox = bboxForRadius(lat, lon, radiusMeters);
  const releaseId = safeRelease(release);
  const base = `s3://overturemaps-us-west-2/release/${releaseId}`;

  return `
INSTALL spatial;
LOAD spatial;
INSTALL httpfs;
LOAD httpfs;
SET s3_region='us-west-2';

WITH bounds AS (
  SELECT
    ${bbox.minLon}::DOUBLE AS min_lon,
    ${bbox.maxLon}::DOUBLE AS max_lon,
    ${bbox.minLat}::DOUBLE AS min_lat,
    ${bbox.maxLat}::DOUBLE AS max_lat
),
candidates AS (
  SELECT
    id,
    names.primary AS name,
    names.primary AS name_en,
    'buildings' AS theme,
    'building' AS type,
    confidence,
    bbox.xmin AS lon,
    bbox.ymin AS lat
  FROM read_parquet('${base}/theme=buildings/type=building/*', filename=true, hive_partitioning=1, union_by_name=true), bounds
  WHERE names.primary IS NOT NULL
    AND bbox.xmax >= bounds.min_lon AND bbox.xmin <= bounds.max_lon
    AND bbox.ymax >= bounds.min_lat AND bbox.ymin <= bounds.max_lat

  UNION ALL

  SELECT
    id,
    names.primary AS name,
    names.primary AS name_en,
    'places' AS theme,
    'place' AS type,
    confidence,
    bbox.xmin AS lon,
    bbox.ymin AS lat
  FROM read_parquet('${base}/theme=places/type=place/*', filename=true, hive_partitioning=1, union_by_name=true), bounds
  WHERE names.primary IS NOT NULL
    AND bbox.xmin BETWEEN bounds.min_lon AND bounds.max_lon
    AND bbox.ymin BETWEEN bounds.min_lat AND bounds.max_lat
)
SELECT *
FROM candidates
LIMIT 30;
`.trim();
}
