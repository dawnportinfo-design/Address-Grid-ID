import {
  distanceMeters,
  type NavigationDestinationInput,
  type OsmElementLike,
} from './navigationDestination';

export type DroneAltitudeMode = 'agl' | 'msl';

export type DroneSafetyLevel = 'clear' | 'caution' | 'restricted' | 'unknown';

export type DroneObstacleKind =
  | 'building'
  | 'power-line'
  | 'tower'
  | 'airport'
  | 'heliport'
  | 'restricted-aeroway'
  | 'tree'
  | 'unknown';

export type DroneAltitudeConstraintInput = NavigationDestinationInput & {
  requestedAltitudeM?: number;
  minAltitudeM?: number;
  maxAltitudeM?: number;
  stepCm?: number;
  mode?: DroneAltitudeMode;
};

export type DroneElevationData = {
  elevation: number;
  source: string;
} | null;

export type DroneAltitudeResolution = {
  mode: DroneAltitudeMode;
  stepCm: number;
  requestedAltitudeM: number;
  groundElevationM: number | null;
  groundElevationSource: string | null;
  altitudeAglCm: number | null;
  altitudeMslCm: number | null;
  altitudeAglM: number | null;
  altitudeMslM: number | null;
  confidence: number;
  warnings: string[];
  sources: string[];
};

export type DroneObstacleCandidate = NavigationDestinationInput & {
  id: string;
  kind: DroneObstacleKind;
  source: string;
  distanceMeters: number;
  heightM?: number;
  tags?: Record<string, string>;
};

export type DroneObstacleSummary = {
  safety: DroneSafetyLevel;
  confidence: number;
  warnings: string[];
  sources: string[];
  candidates: DroneObstacleCandidate[];
};

export type ResolvedDroneNavigationPoint = {
  inputPoint: NavigationDestinationInput;
  point: NavigationDestinationInput & {
    mode: DroneAltitudeMode;
    stepCm: number;
    altitudeAglCm: number | null;
    altitudeMslCm: number | null;
    altitudeAglM: number | null;
    altitudeMslM: number | null;
  };
  groundElevationM: number | null;
  groundElevationSource: string | null;
  safety: DroneSafetyLevel;
  confidence: number;
  warnings: string[];
  sources: string[];
  candidates: DroneObstacleCandidate[];
};

const EARTH_RADIUS_METERS = 6371000;
const DEFAULT_ALTITUDE_M = 30;
const DEFAULT_MAX_ALTITUDE_M = 120;
const DEFAULT_STEP_CM = 10;

type OsmTags = Record<string, string | undefined>;

function toRad(value: number) {
  return value * Math.PI / 180;
}

function roundTo(value: number, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function metersToCentimeters(valueM: number) {
  return Math.round(valueM * 100);
}

export function centimetersToMeters(valueCm: number) {
  return valueCm / 100;
}

export function normalizeDroneStepCm(stepCm = DEFAULT_STEP_CM) {
  if (!Number.isFinite(stepCm)) return DEFAULT_STEP_CM;
  const rounded = Math.round(stepCm / 10) * 10;
  return Math.min(Math.max(rounded, 10), 1000);
}

export function snapCentimetersToStep(valueCm: number, stepCm = DEFAULT_STEP_CM) {
  const step = normalizeDroneStepCm(stepCm);
  return Math.round(valueCm / step) * step;
}

function cleanTags(tags?: OsmTags): Record<string, string> {
  const result: Record<string, string> = {};
  if (!tags) return result;
  for (const [key, value] of Object.entries(tags)) {
    if (typeof value === 'string' && value.trim()) result[key] = value.trim();
  }
  return result;
}

function parseHeightMeters(value?: string) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(',', '.');
  const firstNumber = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!firstNumber) return undefined;
  const amount = Number(firstNumber[0]);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  if (normalized.includes('ft') || normalized.includes('feet') || normalized.includes("'")) {
    return roundTo(amount * 0.3048, 1);
  }
  return roundTo(amount, 1);
}

function projectLocal(origin: NavigationDestinationInput, point: NavigationDestinationInput) {
  const latRad = toRad(origin.lat);
  return {
    x: toRad(point.lon - origin.lon) * EARTH_RADIUS_METERS * Math.cos(latRad),
    y: toRad(point.lat - origin.lat) * EARTH_RADIUS_METERS,
  };
}

function unprojectLocal(origin: NavigationDestinationInput, point: { x: number; y: number }): NavigationDestinationInput {
  const latRad = toRad(origin.lat);
  return {
    lat: origin.lat + (point.y / EARTH_RADIUS_METERS) * 180 / Math.PI,
    lon: origin.lon + (point.x / (EARTH_RADIUS_METERS * Math.cos(latRad))) * 180 / Math.PI,
  };
}

function nearestPointOnSegment(
  target: NavigationDestinationInput,
  a: NavigationDestinationInput,
  b: NavigationDestinationInput,
) {
  const p = projectLocal(target, target);
  const ap = projectLocal(target, a);
  const bp = projectLocal(target, b);
  const dx = bp.x - ap.x;
  const dy = bp.y - ap.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return a;
  const t = Math.max(0, Math.min(1, ((p.x - ap.x) * dx + (p.y - ap.y) * dy) / len2));
  return unprojectLocal(target, { x: ap.x + t * dx, y: ap.y + t * dy });
}

function pointForElement(
  target: NavigationDestinationInput,
  element: OsmElementLike,
  nodesById: Map<string, NavigationDestinationInput>,
) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    return { lat: Number(element.lat), lon: Number(element.lon) };
  }
  if (Number.isFinite(element.center?.lat) && Number.isFinite(element.center?.lon)) {
    return { lat: Number(element.center?.lat), lon: Number(element.center?.lon) };
  }

  const nodePoints = (element.nodes || [])
    .map(id => nodesById.get(String(id)))
    .filter(Boolean) as NavigationDestinationInput[];

  if (!nodePoints.length) return null;
  if (nodePoints.length === 1) return nodePoints[0];

  let best: NavigationDestinationInput | null = null;
  let bestDistance = Infinity;
  for (let index = 0; index < nodePoints.length - 1; index += 1) {
    const projected = nearestPointOnSegment(target, nodePoints[index], nodePoints[index + 1]);
    const dist = distanceMeters(target, projected);
    if (dist < bestDistance) {
      best = projected;
      bestDistance = dist;
    }
  }

  if (best) return best;
  const sum = nodePoints.reduce((acc, point) => ({ lat: acc.lat + point.lat, lon: acc.lon + point.lon }), { lat: 0, lon: 0 });
  return { lat: sum.lat / nodePoints.length, lon: sum.lon / nodePoints.length };
}

function classifyObstacle(tags: Record<string, string>): { kind: DroneObstacleKind; source: string } | null {
  const aeroway = tags.aeroway;
  if (aeroway === 'aerodrome') return { kind: 'airport', source: 'osm:aeroway:aerodrome' };
  if (aeroway === 'helipad') return { kind: 'heliport', source: 'osm:aeroway:helipad' };
  if (aeroway === 'runway' || aeroway === 'taxiway' || aeroway === 'apron') {
    return { kind: 'restricted-aeroway', source: `osm:aeroway:${aeroway}` };
  }
  if (tags.power === 'line' || tags.power === 'minor_line') return { kind: 'power-line', source: `osm:power:${tags.power}` };
  if (tags.power === 'tower' || tags.power === 'pole') return { kind: 'tower', source: `osm:power:${tags.power}` };
  if (tags.man_made === 'tower' || tags.man_made === 'mast' || tags.man_made === 'chimney') {
    return { kind: 'tower', source: `osm:man_made:${tags.man_made}` };
  }
  if (tags.building) return { kind: 'building', source: 'osm:building' };
  if (tags.natural === 'tree') return { kind: 'tree', source: 'osm:natural:tree' };
  return null;
}

function makeObstacleCandidate(
  target: NavigationDestinationInput,
  element: OsmElementLike,
  point: NavigationDestinationInput,
  tags: Record<string, string>,
  kind: DroneObstacleKind,
  source: string,
): DroneObstacleCandidate {
  const heightM = parseHeightMeters(tags.height || tags['building:height'] || tags['est_height']);
  return {
    id: `${element.type}/${element.id}`,
    lat: point.lat,
    lon: point.lon,
    kind,
    source,
    distanceMeters: roundTo(distanceMeters(target, point), 1),
    ...(heightM !== undefined ? { heightM } : {}),
    tags,
  };
}

export function resolveDroneAltitudeConstraint(
  input: DroneAltitudeConstraintInput,
  elevation: DroneElevationData = null,
): DroneAltitudeResolution {
  const mode = input.mode === 'msl' ? 'msl' : 'agl';
  const stepCm = normalizeDroneStepCm(input.stepCm);
  const minCm = metersToCentimeters(Number.isFinite(input.minAltitudeM) ? Number(input.minAltitudeM) : 0);
  const maxM = Number.isFinite(input.maxAltitudeM) ? Number(input.maxAltitudeM) : DEFAULT_MAX_ALTITUDE_M;
  const maxCm = Math.max(minCm, metersToCentimeters(maxM));
  const requestedM = Number.isFinite(input.requestedAltitudeM) ? Number(input.requestedAltitudeM) : DEFAULT_ALTITUDE_M;
  const requestedCm = metersToCentimeters(requestedM);
  const warnings: string[] = [];
  const sources: string[] = [];
  const groundElevationM = elevation && Number.isFinite(elevation.elevation) ? elevation.elevation : null;
  const groundCm = groundElevationM === null ? null : metersToCentimeters(groundElevationM);

  if (elevation?.source) sources.push(elevation.source);
  if (groundElevationM === null) {
    warnings.push('Ground elevation is unavailable, so MSL/AGL conversion may be incomplete.');
  }

  let altitudeAglCm: number | null = null;
  let altitudeMslCm: number | null = null;
  let snappedRequestedCm = snapCentimetersToStep(requestedCm, stepCm);

  if (snappedRequestedCm < minCm) {
    snappedRequestedCm = minCm;
    warnings.push('Requested altitude was below the configured minimum and was clamped.');
  }
  if (snappedRequestedCm > maxCm) {
    snappedRequestedCm = maxCm;
    warnings.push('Requested altitude was above the configured maximum and was clamped.');
  }

  if (mode === 'agl') {
    altitudeAglCm = snappedRequestedCm;
    altitudeMslCm = groundCm === null ? null : snapCentimetersToStep(groundCm + altitudeAglCm, stepCm);
  } else {
    altitudeMslCm = snappedRequestedCm;
    if (groundCm !== null) {
      altitudeAglCm = snapCentimetersToStep(altitudeMslCm - groundCm, stepCm);
      if (altitudeAglCm < minCm) {
        altitudeAglCm = minCm;
        altitudeMslCm = snapCentimetersToStep(groundCm + altitudeAglCm, stepCm);
        warnings.push('MSL altitude was below ground-relative minimum and was adjusted upward.');
      }
    }
  }

  return {
    mode,
    stepCm,
    requestedAltitudeM: requestedM,
    groundElevationM: groundElevationM === null ? null : roundTo(groundElevationM, 2),
    groundElevationSource: elevation?.source || null,
    altitudeAglCm,
    altitudeMslCm,
    altitudeAglM: altitudeAglCm === null ? null : roundTo(centimetersToMeters(altitudeAglCm), 2),
    altitudeMslM: altitudeMslCm === null ? null : roundTo(centimetersToMeters(altitudeMslCm), 2),
    confidence: groundElevationM === null ? 0.58 : 0.86,
    warnings,
    sources,
  };
}

export function buildDroneObstacleOverpassQuery(input: NavigationDestinationInput, radiusMeters = 250) {
  const radius = Math.min(Math.max(Math.round(radiusMeters), 50), 800);
  const aerowayRadius = Math.min(Math.max(radius * 4, 1000), 3000);
  const { lat, lon } = input;

  return `
    [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})["building"];
      way(around:${radius},${lat},${lon})["building"];
      relation(around:${radius},${lat},${lon})["building"];
      way(around:${radius},${lat},${lon})["power"~"line|minor_line"];
      node(around:${radius},${lat},${lon})["power"~"tower|pole"];
      way(around:${radius},${lat},${lon})["man_made"~"tower|mast|chimney"];
      node(around:${radius},${lat},${lon})["man_made"~"tower|mast|chimney"];
      node(around:${radius},${lat},${lon})["natural"="tree"];
      way(around:${aerowayRadius},${lat},${lon})["aeroway"~"aerodrome|helipad|runway|taxiway|apron"];
      node(around:${aerowayRadius},${lat},${lon})["aeroway"~"aerodrome|helipad|runway|taxiway|apron"];
      relation(around:${aerowayRadius},${lat},${lon})["aeroway"~"aerodrome|helipad|runway|taxiway|apron"];
    );
    out body center;
    >;
    out skel qt;
  `.trim();
}

export function summarizeDroneObstacleRisk(
  input: NavigationDestinationInput,
  elements: OsmElementLike[] = [],
  options: { plannedAltitudeAglM?: number | null; radiusMeters?: number } = {},
): DroneObstacleSummary {
  const nodesById = new Map<string, NavigationDestinationInput>();
  for (const element of elements) {
    if (element.type === 'node' && Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
      nodesById.set(String(element.id), { lat: Number(element.lat), lon: Number(element.lon) });
    }
  }

  const candidates: DroneObstacleCandidate[] = [];
  for (const element of elements) {
    const tags = cleanTags(element.tags);
    const classification = classifyObstacle(tags);
    if (!classification) continue;
    const point = pointForElement(input, element, nodesById);
    if (!point) continue;
    candidates.push(makeObstacleCandidate(input, element, point, tags, classification.kind, classification.source));
  }

  candidates.sort((a, b) => a.distanceMeters - b.distanceMeters);
  const trimmed = candidates.slice(0, 16);
  const warnings: string[] = [];
  let safety: DroneSafetyLevel = 'clear';
  let confidence = 0.68;

  const nearestAeroway = trimmed.find(candidate => (
    candidate.kind === 'airport'
    || candidate.kind === 'heliport'
    || candidate.kind === 'restricted-aeroway'
  ));
  if (nearestAeroway && nearestAeroway.distanceMeters <= 1000) {
    safety = 'restricted';
    confidence = 0.9;
    warnings.push('Aeroway, heliport, runway, or airport-related OSM feature was found nearby.');
  }

  const closeVerticalObstacle = trimmed.find(candidate => (
    candidate.kind === 'building'
    || candidate.kind === 'tower'
    || candidate.kind === 'power-line'
  ) && candidate.distanceMeters <= 80);
  if (closeVerticalObstacle && safety !== 'restricted') {
    safety = 'caution';
    confidence = 0.82;
    warnings.push('Mapped building, tower, or power-line evidence is close to the AGID point.');
  }

  const altitudeM = options.plannedAltitudeAglM;
  const tallerThanPlan = Number.isFinite(altitudeM)
    ? trimmed.find(candidate => candidate.heightM !== undefined && candidate.heightM + 15 > Number(altitudeM) && candidate.distanceMeters <= 120)
    : undefined;
  if (tallerThanPlan) {
    safety = safety === 'restricted' ? 'restricted' : 'caution';
    confidence = Math.max(confidence, 0.84);
    warnings.push('Planned AGL altitude is close to a mapped obstacle height plus safety buffer.');
  }

  if (!trimmed.length) {
    warnings.push('No mapped drone obstacles were found nearby; confirm local rules and visual conditions before flight.');
  }

  const sources = Array.from(new Set(trimmed.map(candidate => candidate.source)));

  return {
    safety,
    confidence,
    warnings,
    sources,
    candidates: trimmed,
  };
}

export function resolveDroneNavigationPoint(
  input: DroneAltitudeConstraintInput,
  elevation: DroneElevationData = null,
  elements: OsmElementLike[] = [],
): ResolvedDroneNavigationPoint {
  const altitude = resolveDroneAltitudeConstraint(input, elevation);
  const obstacle = summarizeDroneObstacleRisk(input, elements, {
    plannedAltitudeAglM: altitude.altitudeAglM,
  });
  const sources = Array.from(new Set([...altitude.sources, ...obstacle.sources, 'osm-overpass']));
  const warnings = [...altitude.warnings, ...obstacle.warnings];

  return {
    inputPoint: { lat: input.lat, lon: input.lon },
    point: {
      lat: input.lat,
      lon: input.lon,
      mode: altitude.mode,
      stepCm: altitude.stepCm,
      altitudeAglCm: altitude.altitudeAglCm,
      altitudeMslCm: altitude.altitudeMslCm,
      altitudeAglM: altitude.altitudeAglM,
      altitudeMslM: altitude.altitudeMslM,
    },
    groundElevationM: altitude.groundElevationM,
    groundElevationSource: altitude.groundElevationSource,
    safety: obstacle.safety,
    confidence: roundTo(Math.min(altitude.confidence, obstacle.confidence), 2),
    warnings,
    sources,
    candidates: obstacle.candidates,
  };
}
