export type NavigationDestinationInput = {
  lat: number;
  lon: number;
};

export type NavigationCandidateKind =
  | 'parking-entrance'
  | 'parking'
  | 'loading'
  | 'entrance'
  | 'driveway'
  | 'parking-aisle'
  | 'service-road'
  | 'road';

export type NavigationCandidate = NavigationDestinationInput & {
  id: string;
  kind: NavigationCandidateKind;
  source: string;
  distanceMeters: number;
  tags?: Record<string, string>;
};

export type ResolvedNavigationDestination = {
  inputPoint: NavigationDestinationInput;
  finalPoint: NavigationDestinationInput & {
    method: 'parking-entrance' | 'parking' | 'driveway' | 'service-road' | 'nearest-road' | 'original';
    source: string;
    distanceMeters: number;
  };
  confidence: number;
  warnings: string[];
  sources: string[];
  candidates: NavigationCandidate[];
};

type OsmTags = Record<string, string | undefined>;

export type OsmElementLike = {
  type: 'node' | 'way' | 'relation';
  id: number | string;
  lat?: number;
  lon?: number;
  nodes?: Array<number | string>;
  center?: { lat?: number; lon?: number };
  tags?: OsmTags;
};

type ProjectedRoadCandidate = NavigationCandidate & {
  roadRank: number;
};

const EARTH_RADIUS_METERS = 6371000;

const DRIVABLE_HIGHWAYS = new Set([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'living_street',
  'service',
  'road',
]);

const BLOCKED_ACCESS_VALUES = new Set(['no', 'private', 'customers', 'permit']);

function toRad(value: number) {
  return value * Math.PI / 180;
}

export function distanceMeters(a: NavigationDestinationInput, b: NavigationDestinationInput) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
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

function cleanTags(tags?: OsmTags): Record<string, string> {
  const result: Record<string, string> = {};
  if (!tags) return result;
  for (const [key, value] of Object.entries(tags)) {
    if (typeof value === 'string' && value.trim()) result[key] = value;
  }
  return result;
}

function hasBlockedVehicleAccess(tags: Record<string, string>) {
  return ['access', 'vehicle', 'motor_vehicle', 'motorcar'].some(key => BLOCKED_ACCESS_VALUES.has(tags[key]));
}

function isDrivableWay(tags: Record<string, string>) {
  const highway = tags.highway;
  if (!highway || !DRIVABLE_HIGHWAYS.has(highway)) return false;
  return !hasBlockedVehicleAccess(tags);
}

function roadRank(tags: Record<string, string>) {
  if (tags.amenity === 'parking_entrance') return 0;
  if (tags.service === 'driveway') return 1;
  if (tags.service === 'parking_aisle') return 2;
  if (tags.highway === 'service') return 3;
  if (tags.highway === 'living_street' || tags.highway === 'residential') return 5;
  return 8;
}

function candidateKindForRoad(tags: Record<string, string>): NavigationCandidateKind {
  if (tags.service === 'driveway') return 'driveway';
  if (tags.service === 'parking_aisle') return 'parking-aisle';
  if (tags.highway === 'service') return 'service-road';
  return 'road';
}

function pointForElement(element: OsmElementLike, nodesById: Map<string, NavigationDestinationInput>) {
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
  const sum = nodePoints.reduce((acc, point) => ({ lat: acc.lat + point.lat, lon: acc.lon + point.lon }), { lat: 0, lon: 0 });
  return { lat: sum.lat / nodePoints.length, lon: sum.lon / nodePoints.length };
}

function findBestProjectedRoadPoint(
  target: NavigationDestinationInput,
  way: OsmElementLike,
  nodesById: Map<string, NavigationDestinationInput>,
): NavigationDestinationInput | null {
  const points = (way.nodes || [])
    .map(id => nodesById.get(String(id)))
    .filter(Boolean) as NavigationDestinationInput[];

  if (points.length === 1) return points[0];
  if (points.length < 2) return pointForElement(way, nodesById);

  let best: NavigationDestinationInput | null = null;
  let bestDistance = Infinity;

  for (let index = 0; index < points.length - 1; index += 1) {
    const projected = nearestPointOnSegment(target, points[index], points[index + 1]);
    const dist = distanceMeters(target, projected);
    if (dist < bestDistance) {
      best = projected;
      bestDistance = dist;
    }
  }

  return best;
}

function makeCandidate(
  input: NavigationDestinationInput,
  element: OsmElementLike,
  point: NavigationDestinationInput,
  kind: NavigationCandidateKind,
  source: string,
): NavigationCandidate {
  return {
    id: `${element.type}/${element.id}`,
    lat: point.lat,
    lon: point.lon,
    kind,
    source,
    distanceMeters: Math.round(distanceMeters(input, point) * 10) / 10,
    tags: cleanTags(element.tags),
  };
}

function scoreCandidate(candidate: ProjectedRoadCandidate) {
  return candidate.distanceMeters + candidate.roadRank * 12;
}

function confidenceForDistance(distance: number, method: ResolvedNavigationDestination['finalPoint']['method']) {
  const methodBoost = method === 'parking-entrance'
    ? 0.12
    : method === 'driveway'
      ? 0.08
      : method === 'service-road'
        ? 0.04
        : 0;

  if (distance <= 15) return Math.min(0.96, 0.88 + methodBoost);
  if (distance <= 35) return Math.min(0.9, 0.78 + methodBoost);
  if (distance <= 80) return Math.min(0.78, 0.62 + methodBoost);
  if (distance <= 150) return Math.min(0.58, 0.42 + methodBoost);
  return 0.26;
}

function methodForCandidate(candidate?: NavigationCandidate | null): ResolvedNavigationDestination['finalPoint']['method'] {
  if (!candidate) return 'original';
  if (candidate.kind === 'parking-entrance') return 'parking-entrance';
  if (candidate.kind === 'parking') return 'parking';
  if (candidate.kind === 'driveway' || candidate.kind === 'parking-aisle') return 'driveway';
  if (candidate.kind === 'service-road') return 'service-road';
  return 'nearest-road';
}

export function buildCarStoppableOverpassQuery(input: NavigationDestinationInput, radiusMeters = 180) {
  const radius = Math.min(Math.max(Math.round(radiusMeters), 40), 600);
  const { lat, lon } = input;

  return `
    [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})["amenity"~"parking|parking_entrance|loading_dock"]["access"!="private"]["access"!="no"];
      way(around:${radius},${lat},${lon})["amenity"="parking"]["access"!="private"]["access"!="no"];
      node(around:${radius},${lat},${lon})["entrance"]["access"!="private"]["access"!="no"];
      way(around:${radius},${lat},${lon})["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|road"]["access"!="private"]["access"!="no"]["vehicle"!="no"]["motor_vehicle"!="no"];
    );
    out body center;
    >;
    out skel qt;
  `.trim();
}

export function resolveCarStoppableDestination(
  input: NavigationDestinationInput,
  elements: OsmElementLike[] = [],
): ResolvedNavigationDestination {
  const nodesById = new Map<string, NavigationDestinationInput>();
  for (const element of elements) {
    if (element.type === 'node' && Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
      nodesById.set(String(element.id), { lat: Number(element.lat), lon: Number(element.lon) });
    }
  }

  const stopCandidates: NavigationCandidate[] = [];
  const roadCandidates: ProjectedRoadCandidate[] = [];

  for (const element of elements) {
    const tags = cleanTags(element.tags);
    if (!Object.keys(tags).length) continue;

    const elementPoint = pointForElement(element, nodesById);
    if (!elementPoint) continue;

    if (tags.amenity === 'parking_entrance') {
      stopCandidates.push(makeCandidate(input, element, elementPoint, 'parking-entrance', 'osm:parking_entrance'));
      continue;
    }

    if (tags.amenity === 'loading_dock') {
      stopCandidates.push(makeCandidate(input, element, elementPoint, 'loading', 'osm:loading_dock'));
      continue;
    }

    if (tags.amenity === 'parking') {
      stopCandidates.push(makeCandidate(input, element, elementPoint, 'parking', 'osm:parking'));
    }

    if (tags.entrance) {
      stopCandidates.push(makeCandidate(input, element, elementPoint, 'entrance', 'osm:entrance'));
    }

    if (element.type === 'way' && isDrivableWay(tags)) {
      const projected = findBestProjectedRoadPoint(input, element, nodesById);
      if (!projected) continue;
      roadCandidates.push({
        ...makeCandidate(input, element, projected, candidateKindForRoad(tags), tags.highway === 'service' ? 'osm:service-road' : 'osm:road'),
        roadRank: roadRank(tags),
      });
    }
  }

  roadCandidates.sort((a, b) => scoreCandidate(a) - scoreCandidate(b));
  stopCandidates.sort((a, b) => {
    const kindRank = (candidate: NavigationCandidate) => (
      candidate.kind === 'parking-entrance' ? 0
        : candidate.kind === 'loading' ? 1
          : candidate.kind === 'parking' ? 2
            : 3
    );
    return kindRank(a) - kindRank(b) || a.distanceMeters - b.distanceMeters;
  });

  const bestStop = stopCandidates[0] || null;
  let bestRoad = roadCandidates[0] || null;

  if (bestStop && roadCandidates.length > 1) {
    const nearStopRoads = roadCandidates
      .map(candidate => ({
        candidate,
        distanceToStop: distanceMeters(bestStop, candidate),
      }))
      .filter(entry => entry.distanceToStop <= 45)
      .sort((a, b) => a.distanceToStop + a.candidate.roadRank * 8 - (b.distanceToStop + b.candidate.roadRank * 8));
    if (nearStopRoads[0]) bestRoad = nearStopRoads[0].candidate;
  }

  const selected = bestStop?.kind === 'parking-entrance' && bestStop.distanceMeters <= 80
    ? bestStop
    : bestRoad;
  const method = methodForCandidate(selected);
  const finalPoint = selected
    ? {
      lat: selected.lat,
      lon: selected.lon,
      method,
      source: selected.source,
      distanceMeters: selected.distanceMeters,
    }
    : {
      lat: input.lat,
      lon: input.lon,
      method: 'original' as const,
      source: 'agid-original',
      distanceMeters: 0,
    };

  const warnings: string[] = [];
  if (!selected) {
    warnings.push('No drivable OSM road, parking entrance, or loading candidate was found nearby.');
  } else if (finalPoint.distanceMeters > 150) {
    warnings.push('The nearest car-stoppable point is far from the requested AGID point.');
  } else if (finalPoint.distanceMeters > 80) {
    warnings.push('A short walk may be required from the car-stoppable point.');
  }
  if (bestStop?.kind === 'entrance' && selected && distanceMeters(bestStop, selected) > 45) {
    warnings.push('Building entrance was detected, but no very close vehicle access point was found.');
  }

  const candidates = [...stopCandidates, ...roadCandidates]
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 12);
  const sources = Array.from(new Set(candidates.map(candidate => candidate.source)));

  return {
    inputPoint: input,
    finalPoint,
    confidence: selected ? confidenceForDistance(finalPoint.distanceMeters, finalPoint.method) : 0.22,
    warnings,
    sources,
    candidates,
  };
}
