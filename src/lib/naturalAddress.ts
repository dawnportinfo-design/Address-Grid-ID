type Landmark = {
  name?: string;
  type?: string;
  distance?: number;
};

export type NaturalAddressResult = {
  kind: 'marine' | 'mountain' | 'waterfront' | 'nature';
  label: string;
  lines: string[];
  sources: string[];
  confidence: number;
};

const hasValue = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const cleanName = (value: unknown) =>
  hasValue(value) ? value.trim().replace(/\s+/g, ' ') : '';

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const formatDistance = (distance?: number) => {
  if (typeof distance !== 'number' || !Number.isFinite(distance) || distance <= 0) return '';
  if (distance < 1000) return `${Math.round(distance)} m`;
  return `${(distance / 1000).toFixed(distance < 10000 ? 1 : 0)} km`;
};

const marineTypeLabels: Record<string, string> = {
  ocean: 'Ocean',
  sea: 'Sea',
  gulf: 'Gulf',
  bay: 'Bay',
  strait: 'Strait',
  channel: 'Channel',
  trench: 'Trench',
  ridge: 'Ridge',
  seamount: 'Seamount',
  reef: 'Reef',
  deep: 'Deep',
};

const marineAreaRank: Record<string, number> = {
  Ocean: 1,
  Sea: 2,
  Gulf: 3,
  Bay: 4,
  Strait: 5,
  Channel: 5,
};

const normalizeMarineType = (value: unknown) => {
  const cleaned = cleanName(value);
  if (!cleaned) return '';
  const normalized = cleaned.toLowerCase().replace(/[_-]+/g, ' ');
  return marineTypeLabels[normalized] || cleaned.replace(/\b\w/g, char => char.toUpperCase());
};

const isGenericOpenOcean = (value: string) => /^open\s+ocean$/i.test(value);

const getCoordinateLine = (details: any) => {
  const lat = Number(details.lat ?? details.latitude ?? details.coordinates?.lat ?? details.coords?.lat);
  const lon = Number(details.lon ?? details.lng ?? details.longitude ?? details.coordinates?.lon ?? details.coords?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '';
  return `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
};

const landmarkLabel = (landmark: Landmark) => {
  const name = cleanName(landmark.name);
  if (!name || name === 'Unnamed Feature') return '';
  const type = cleanName(landmark.type);
  const distance = formatDistance(landmark.distance);
  return [name, type && type !== name ? `(${type})` : '', distance ? `- ${distance}` : '']
    .filter(Boolean)
    .join(' ');
};

const getNearbyLine = (label: string, landmarks: Landmark[] = []) => {
  const values = unique(landmarks.map(landmarkLabel)).slice(0, 3);
  return values.length ? `${label}: ${values.join('; ')}` : '';
};

const marineLandmarkLabel = (landmark: Landmark) => {
  const name = cleanName(landmark.name);
  if (!name || name === 'Unnamed Feature') return '';
  const type = normalizeMarineType(landmark.type);
  const distance = formatDistance(landmark.distance);
  return [name, type && type !== name ? `(${type})` : '', distance ? `- ${distance}` : '']
    .filter(Boolean)
    .join(' ');
};

const getNearbyMarineLine = (label: string, landmarks: Landmark[] = []) => {
  const values = unique(landmarks.map(marineLandmarkLabel)).slice(0, 3);
  return values.length ? `${label}: ${values.join('; ')}` : '';
};

const getMarineAreaFeatures = (features: Landmark[] = []) =>
  features
    .map(feature => ({ ...feature, type: normalizeMarineType(feature.type) }))
    .filter(feature => cleanName(feature.name) && marineAreaRank[feature.type || ''])
    .sort((a, b) => marineAreaRank[a.type || ''] - marineAreaRank[b.type || '']);

const getMarineHierarchyLine = (features: Landmark[] = []) => {
  const names = unique(getMarineAreaFeatures(features).map(feature => cleanName(feature.name)));
  return names.length > 1 ? `Marine hierarchy: ${names.join(' > ')}` : '';
};

const getMarineLabel = (seaContext: any, areaFeatures: Landmark[]) => {
  const explicitName = cleanName(seaContext.sea_name);
  if (explicitName && !isGenericOpenOcean(explicitName)) {
    const explicitType = normalizeMarineType(areaFeatures.find(feature => cleanName(feature.name) === explicitName)?.type);
    const moreSpecific = areaFeatures
      .filter(feature => marineAreaRank[normalizeMarineType(feature.type)] > (marineAreaRank[explicitType] || 0))
      .at(-1);
    return cleanName(moreSpecific?.name) || explicitName;
  }

  return cleanName(areaFeatures.at(-1)?.name) || 'Open ocean';
};

const getAreaLine = (details: any) => {
  const area = [
    cleanName(details.suburb || details.neighbourhood || details.city_district || details.district),
    cleanName(details.city || details.town || details.village || details.county),
    cleanName(details.state || details.province || details.region),
    cleanName(details.country),
  ];
  return unique(area).join(', ');
};

const hasStreetAddress = (details: any) =>
  hasValue(details.house_number) || hasValue(details.road) || hasValue(details.street);

export function buildNaturalAddress(details: any): NaturalAddressResult | null {
  if (!details || typeof details !== 'object') return null;

  const seaContext = details.sea_context;
  const natureContext = details.nature_context;
  const plusCode = cleanName(details.plus_code?.global_code || details.plus_code?.plus_code || details.plus_code);
  const areaLine = getAreaLine(details);
  const sources = new Set<string>();

  if (seaContext) {
    sources.add('Marine Regions');
    sources.add('OpenStreetMap');
    if (typeof seaContext.bathymetry === 'number') sources.add('GEBCO/open bathymetry');
    if (plusCode) sources.add('Google Open Location Code');

    const seaFeatures: Landmark[] = seaContext.features ?? [];
    const marineAreaFeatures = getMarineAreaFeatures(seaFeatures);
    const marineAreaNames = new Set(marineAreaFeatures.map(feature => cleanName(feature.name)));
    const seabedFeatures = seaFeatures.filter(feature => !marineAreaNames.has(cleanName(feature.name)));
    const seaName = getMarineLabel(seaContext, marineAreaFeatures);
    const depth = typeof seaContext.bathymetry === 'number' && seaContext.bathymetry < 0
      ? `Depth: ${Math.round(Math.abs(seaContext.bathymetry))} m below sea level`
      : '';

    const lines = [
      seaName,
      'Marine address area (non-postal)',
      getMarineHierarchyLine(seaFeatures),
      cleanName(seaContext.marine_protected_area) ? `Marine protected area: ${cleanName(seaContext.marine_protected_area)}` : '',
      getNearbyMarineLine('Nearby marine or seabed features', seabedFeatures),
      depth,
      areaLine,
      getCoordinateLine(details),
      plusCode ? `Plus Code: ${plusCode}` : '',
      `Sources: ${Array.from(sources).join(', ')}`,
    ].filter(Boolean);

    return {
      kind: 'marine',
      label: seaName,
      lines,
      sources: Array.from(sources),
      confidence: seaName === 'Open ocean' ? 0.66 : 0.86,
    };
  }

  const mountainName = cleanName(details.mountain_name) || cleanName(natureContext?.mountains?.[0]?.name);
  if (mountainName && !hasStreetAddress(details)) {
    sources.add('OpenStreetMap');
    if (typeof details.elevation === 'number') sources.add('open elevation');

    const elevation = typeof details.elevation === 'number'
      ? `Elevation: ${Math.round(details.elevation)} m`
      : '';
    const lines = [
      mountainName,
      'Mountain / highland address area',
      elevation,
      getNearbyLine('Nearby peaks', natureContext?.mountains),
      getNearbyLine('Nearby shelters or landmarks', details.mountain_context?.landmarks),
      areaLine,
      plusCode ? `Plus Code: ${plusCode}` : '',
      `Sources: ${Array.from(sources).join(', ')}`,
    ].filter(Boolean);

    return {
      kind: 'mountain',
      label: mountainName,
      lines,
      sources: Array.from(sources),
      confidence: 0.82,
    };
  }

  const waterName = cleanName(
    details.waterway ||
    details.river ||
    details.stream ||
    details.canal ||
    details.lake ||
    details.bay ||
    details.water ||
    details.natural
  );
  const beaches: Landmark[] = natureContext?.beaches ?? [];
  const ports: Landmark[] = natureContext?.ports ?? [];
  const hasWaterfrontContext = waterName || beaches.length > 0 || ports.length > 0 || hasValue(details.flood_risk);

  if (hasWaterfrontContext && !hasStreetAddress(details)) {
    sources.add('OpenStreetMap');
    if (hasValue(details.flood_risk)) sources.add('open water-risk model');
    const label = waterName || cleanName(beaches[0]?.name) || cleanName(ports[0]?.name) || 'Waterfront area';
    const lines = [
      label,
      'Waterfront / hydrology address area',
      getNearbyLine('Nearby beaches', beaches),
      getNearbyLine('Nearby ports or harbours', ports),
      hasValue(details.flood_risk) ? `Water risk: ${details.flood_risk}` : '',
      areaLine,
      plusCode ? `Plus Code: ${plusCode}` : '',
      `Sources: ${Array.from(sources).join(', ')}`,
    ].filter(Boolean);

    return {
      kind: 'waterfront',
      label,
      lines,
      sources: Array.from(sources),
      confidence: waterName ? 0.78 : 0.68,
    };
  }

  const deserts: Landmark[] = natureContext?.deserts ?? [];
  if (deserts.length > 0 && !hasStreetAddress(details)) {
    sources.add('OpenStreetMap');
    const label = cleanName(deserts[0].name) || 'Natural area';
    const lines = [
      label,
      'Natural feature address area',
      getNearbyLine('Nearby natural features', deserts),
      areaLine,
      plusCode ? `Plus Code: ${plusCode}` : '',
      `Sources: ${Array.from(sources).join(', ')}`,
    ].filter(Boolean);

    return {
      kind: 'nature',
      label,
      lines,
      sources: Array.from(sources),
      confidence: 0.64,
    };
  }

  return null;
}

export function formatNaturalAddress(details: any): string | null {
  const naturalAddress = buildNaturalAddress(details);
  return naturalAddress ? naturalAddress.lines.join('\n') : null;
}
