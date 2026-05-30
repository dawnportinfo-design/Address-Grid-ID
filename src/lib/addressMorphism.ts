import type { CanonicalAddressParts } from './addressIntelligence';
import type { NaturalAddressContext } from './addressMorphismSources';
import { expandSearchQuery, normalizeSearchText, scoreSearchCandidate } from './searchQuery';

export type AddressMorphismStatus = 'verified' | 'partial' | 'ambiguous' | 'unresolved';

export type AddressMorphismCandidate = {
  id?: string;
  label: string;
  canonical: CanonicalAddressParts;
  lat?: number;
  lon?: number;
  sources?: string[];
  confidence?: number;
  validationScore?: number;
  deliverySuccesses?: number;
  deliveryFailures?: number;
  naturalContext?: NaturalAddressContext;
};

export type AddressMorphismContext = {
  lat?: number;
  lon?: number;
  countryCode?: string;
  postcode?: string;
  state?: string;
  purpose?: 'search' | 'shipping' | 'registration' | 'emergency';
};

export type AddressMorphismCluster = {
  id: string;
  canonical: CanonicalAddressParts;
  label: string;
  candidates: AddressMorphismCandidate[];
  centroid?: { lat: number; lon: number };
  sources: string[];
  confidence: number;
  energy: number;
  pid: string;
};

export type AddressMorphismResult = {
  status: AddressMorphismStatus;
  pid: string | null;
  selected: AddressMorphismCluster | null;
  clusters: AddressMorphismCluster[];
  energySummary: {
    best: number;
    secondBest: number | null;
    min: number;
    max: number;
    average: number;
  };
  unresolvedReason?: string;
};

const SOURCE_RELIABILITY: Record<string, number> = {
  'official-regional-api': 0.98,
  'regional-open-data': 0.95,
  'openaddresses': 0.94,
  'google-libaddressinput': 0.96,
  'google-open-location-code': 0.9,
  'zipcloud-jp': 0.96,
  'geonames-gazetteer': 0.9,
  'geonames-postal': 0.88,
  'zippopotam': 0.86,
  'osm-overpass': 0.84,
  'marine-regions': 0.82,
  'libpostal': 0.84,
  'osm_nominatim': 0.8,
  'nominatim': 0.8,
  'parser': 0.62,
  'local_db': 0.74,
};

const FIELD_WEIGHTS: Array<[keyof CanonicalAddressParts, number]> = [
  ['country_code', 0.14],
  ['postcode', 0.18],
  ['state', 0.12],
  ['city', 0.14],
  ['district', 0.08],
  ['subdistrict', 0.08],
  ['road', 0.16],
  ['house_number', 0.1],
];

function clean(value: unknown) {
  return normalizeSearchText(String(value ?? ''));
}

function fieldSimilarity(left: unknown, right: unknown) {
  const a = clean(left);
  const b = clean(right);
  if (!a && !b) return 1;
  if (!a || !b) return 0.45;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.78;
  return scoreSearchCandidate(a, [b]);
}

function country(value?: string) {
  return String(value ?? '').trim().toLowerCase();
}

function postcode(value?: string) {
  return clean(value).replace(/\s|-/g, '');
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function geoDistancePenalty(left: AddressMorphismCandidate, right: AddressMorphismCandidate) {
  if (
    left.lat === undefined || left.lon === undefined ||
    right.lat === undefined || right.lon === undefined
  ) return 0.18;
  return Math.min(1, haversineKm(left.lat, left.lon, right.lat, right.lon) / 2);
}

export function structuralDistance(left: AddressMorphismCandidate, right: AddressMorphismCandidate) {
  const fieldDistance = FIELD_WEIGHTS.reduce((sum, [field, weight]) => {
    return sum + (1 - fieldSimilarity(left.canonical[field], right.canonical[field])) * weight;
  }, 0);
  const adminConflict =
    country(left.canonical.country_code) && country(right.canonical.country_code) && country(left.canonical.country_code) !== country(right.canonical.country_code)
      ? 0.5
      : postcode(left.canonical.postcode) && postcode(right.canonical.postcode) && postcode(left.canonical.postcode) !== postcode(right.canonical.postcode)
        ? 0.35
        : clean(left.canonical.state) && clean(right.canonical.state) && fieldSimilarity(left.canonical.state, right.canonical.state) < 0.6
          ? 0.3
          : 0;
  const geoPenalty = geoDistancePenalty(left, right) * 0.25;
  return Math.max(0, Math.min(1, fieldDistance + adminConflict + geoPenalty));
}

function mergeCanonical(candidates: AddressMorphismCandidate[]) {
  const merged: CanonicalAddressParts = {};
  const keys = FIELD_WEIGHTS.map(([key]) => key);
  for (const key of keys) {
    const values = candidates
      .map(candidate => candidate.canonical[key])
      .filter(Boolean) as string[];
    if (values.length) {
      merged[key] = values.sort((a, b) => String(b).length - String(a).length)[0];
    }
  }
  const countryName = candidates.map(candidate => candidate.canonical.country).find(Boolean);
  if (countryName) merged.country = countryName;
  const building = candidates.map(candidate => candidate.canonical.building).find(Boolean);
  if (building) merged.building = building;
  const poi = candidates.map(candidate => candidate.canonical.poi).find(Boolean);
  if (poi) merged.poi = poi;
  if (merged.country_code) merged.country_code = merged.country_code.toLowerCase();
  return merged;
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function centroid(candidates: AddressMorphismCandidate[]) {
  const positioned = candidates.filter(candidate =>
    Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon)
  );
  if (!positioned.length) return undefined;
  return {
    lat: average(positioned.map(candidate => Number(candidate.lat))),
    lon: average(positioned.map(candidate => Number(candidate.lon))),
  };
}

function sourceReliability(sources: string[]) {
  if (!sources.length) return 0.25;
  return Math.max(...sources.map(source => SOURCE_RELIABILITY[source] ?? 0.7));
}

function stableHash(value: string) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (const char of value.normalize('NFKC')) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(36).toUpperCase().padStart(13, '0');
}

function canonicalString(canonical: CanonicalAddressParts) {
  return [
    canonical.country_code,
    canonical.postcode,
    canonical.state,
    canonical.city,
    canonical.district,
    canonical.subdistrict || canonical.suburb,
    canonical.road,
    canonical.house_number,
    canonical.building,
    canonical.poi,
  ].map(value => clean(value)).filter(Boolean).join('|');
}

function tokenOverlapScore(label: string, input: string) {
  const labelTokens = new Set(clean(label).split(/\s+/).filter(Boolean));
  const inputTokens = clean(input).split(/\s+/).filter(Boolean);
  if (!labelTokens.size || !inputTokens.length) return 0;
  const hits = inputTokens.filter(token => labelTokens.has(token)).length;
  return hits / inputTokens.length;
}

export function buildAddressPid(canonical: CanonicalAddressParts) {
  const key = canonicalString(canonical);
  return `AMT-${stableHash(key || 'unresolved')}`;
}

function clusterId(candidates: AddressMorphismCandidate[]) {
  return stableHash(candidates.map(candidate => candidate.id || candidate.label).sort().join('|')).slice(0, 10);
}

export function clusterAddressCandidates(
  candidates: AddressMorphismCandidate[],
  threshold = 0.34,
): AddressMorphismCluster[] {
  const clusters: AddressMorphismCandidate[][] = [];

  for (const candidate of candidates) {
    const cluster = clusters.find(existing =>
      existing.some(member => structuralDistance(member, candidate) <= threshold)
    );
    if (cluster) cluster.push(candidate);
    else clusters.push([candidate]);
  }

  return clusters.map(group => {
    const canonical = mergeCanonical(group);
    const center = centroid(group);
    const sources = Array.from(new Set(group.flatMap(candidate => candidate.sources || [])));
    const confidence = Math.max(...group.map(candidate => candidate.confidence ?? 0), 0);
    return {
      id: clusterId(group),
      canonical,
      label: group[0].label,
      candidates: group,
      centroid: center,
      sources,
      confidence,
      energy: Number.POSITIVE_INFINITY,
      pid: buildAddressPid(canonical),
    };
  });
}

function contextPenalty(cluster: AddressMorphismCluster, context: AddressMorphismContext) {
  let penalty = 0;
  if (context.countryCode && country(cluster.canonical.country_code) && country(context.countryCode) !== country(cluster.canonical.country_code)) {
    penalty += 0.35;
  }
  if (context.postcode && postcode(cluster.canonical.postcode) && postcode(context.postcode) !== postcode(cluster.canonical.postcode)) {
    penalty += 0.22;
  }
  if (context.state && clean(cluster.canonical.state) && clean(context.state) !== clean(cluster.canonical.state)) {
    penalty += 0.16;
  }
  if (context.lat !== undefined && context.lon !== undefined && cluster.centroid) {
    penalty += Math.min(0.45, haversineKm(context.lat, context.lon, cluster.centroid.lat, cluster.centroid.lon) / 20);
  }
  return penalty;
}

function evidenceScore(cluster: AddressMorphismCluster) {
  const coreFields = ['country_code', 'postcode', 'state', 'city', 'road', 'house_number'] as const;
  const fieldScore = coreFields.filter(key => clean(cluster.canonical[key])).length / coreFields.length;
  const reliability = sourceReliability(cluster.sources);
  const candidateSupport = Math.min(1, cluster.candidates.length / 3);
  const naturalSupport = cluster.candidates.some(candidate => candidate.naturalContext) ? 0.16 : 0;
  return Math.min(1, fieldScore * 0.45 + reliability * 0.35 + cluster.confidence * 0.15 + candidateSupport * 0.05 + naturalSupport);
}

function deliveryPenalty(cluster: AddressMorphismCluster) {
  const successes = cluster.candidates.reduce((sum, candidate) => sum + (candidate.deliverySuccesses || 0), 0);
  const failures = cluster.candidates.reduce((sum, candidate) => sum + (candidate.deliveryFailures || 0), 0);
  if (!successes && !failures) return 0.08;
  return Math.max(0, Math.min(0.45, failures / Math.max(1, successes + failures)));
}

export function energyForCluster(
  cluster: AddressMorphismCluster,
  input: string,
  context: AddressMorphismContext = {},
) {
  const queryCandidates = expandSearchQuery(input);
  const textScore = Math.max(
    scoreSearchCandidate(cluster.label, queryCandidates),
    scoreSearchCandidate(canonicalString(cluster.canonical), queryCandidates),
    tokenOverlapScore(`${cluster.label} ${canonicalString(cluster.canonical)}`, input),
  );
  const validationScore = Math.max(...cluster.candidates.map(candidate => candidate.validationScore ?? 0), 0);
  const evidence = evidenceScore(cluster);

  return Math.max(0, Math.min(2,
    (1 - textScore) * 0.34 +
    contextPenalty(cluster, context) +
    (1 - evidence) * 0.28 +
    (1 - validationScore) * 0.08 +
    deliveryPenalty(cluster)
  ));
}

function statusFor(best: AddressMorphismCluster | null, second: AddressMorphismCluster | null) {
  if (!best) return { status: 'unresolved' as const, reason: 'no candidates' };
  const evidence = evidenceScore(best);
  const isNaturalAddress = best.candidates.some(candidate => candidate.naturalContext);
  const lacksPostalStreet = !clean(best.canonical.postcode) || (!clean(best.canonical.road) && !clean(best.canonical.house_number));
  if (evidence < 0.25) return { status: 'unresolved' as const, reason: 'best candidate evidence is too weak' };
  if (best.energy > 0.72) return { status: 'unresolved' as const, reason: 'best candidate energy is too high' };
  if (second && second.energy - best.energy < 0.08) return { status: 'ambiguous' as const, reason: 'top candidates are too close' };
  if (isNaturalAddress && lacksPostalStreet) return { status: 'partial' as const };
  if (best.energy < 0.58 && evidence >= 0.72) return { status: 'verified' as const };
  return { status: 'partial' as const };
}

export function resolveAddressMorphism({
  input,
  candidates,
  context = {},
}: {
  input: string;
  candidates: AddressMorphismCandidate[];
  context?: AddressMorphismContext;
}): AddressMorphismResult {
  const clusters = clusterAddressCandidates(candidates)
    .map(cluster => ({
      ...cluster,
      energy: energyForCluster(cluster, input, context),
    }))
    .sort((a, b) => a.energy - b.energy || a.pid.localeCompare(b.pid));

  const selected = clusters[0] || null;
  const second = clusters[1] || null;
  const status = statusFor(selected, second);
  const energies = clusters.map(cluster => cluster.energy);

  return {
    status: status.status,
    pid: status.status === 'verified' || status.status === 'partial' ? selected?.pid ?? null : null,
    selected: status.status === 'unresolved' ? null : selected,
    clusters,
    unresolvedReason: status.reason,
    energySummary: {
      best: energies[0] ?? Number.POSITIVE_INFINITY,
      secondBest: energies[1] ?? null,
      min: energies.length ? Math.min(...energies) : Number.POSITIVE_INFINITY,
      max: energies.length ? Math.max(...energies) : Number.POSITIVE_INFINITY,
      average: energies.length ? average(energies) : Number.POSITIVE_INFINITY,
    },
  };
}

export function rankAddressCandidatesByMorphism(
  input: string,
  candidates: AddressMorphismCandidate[],
  context: AddressMorphismContext = {},
) {
  const result = resolveAddressMorphism({ input, candidates, context });
  const energyByLabel = new Map<string, number>();
  result.clusters.forEach(cluster => {
    cluster.candidates.forEach(candidate => {
      energyByLabel.set(candidate.id || candidate.label, cluster.energy);
    });
  });
  return candidates
    .map(candidate => ({
      ...candidate,
      morphism_energy: energyByLabel.get(candidate.id || candidate.label) ?? Number.POSITIVE_INFINITY,
      morphism_status: result.status,
      morphism_pid: result.pid,
    }))
    .sort((a, b) => a.morphism_energy - b.morphism_energy);
}
