import type { DroneNavigationPoint } from '../services/DroneNavigationService';
import type { DroneLandingAssessment } from './droneAssessment';

export type DroneMissionStatus = 'field-check' | 'hold' | 'avoid';

export type DroneMissionPoint = {
  lat: number;
  lon: number;
  label?: string;
};

export type DroneMissionPlan = {
  status: DroneMissionStatus;
  distanceMeters: number;
  bearingDegrees: number;
  estimatedFlightMinutes: number;
  recommendedAltitudeAglM: number;
  recommendedAltitudeMslM: number | null;
  riskSummary: string;
  risks: string[];
  checklist: string[];
  routeSamples: DroneRouteSample[];
  sources: string[];
};

export type DroneRouteSample = DroneMissionPoint & {
  index: number;
  progress: number;
  distanceFromStartMeters: number;
};

type BuildDroneMissionPlanInput = {
  origin: DroneMissionPoint | null;
  target: DroneMissionPoint;
  landingAssessment: DroneLandingAssessment | null;
  navigationPoint?: Pick<
    DroneNavigationPoint,
    'altitudeAglM' | 'altitudeMslM' | 'safety' | 'confidence' | 'warnings' | 'sources' | 'candidates'
  > | null;
  cruiseSpeedMps?: number;
  reserveRatio?: number;
};

const EARTH_RADIUS_METERS = 6371000;

function toRad(value: number) {
  return value * Math.PI / 180;
}

function toDeg(value: number) {
  return value * 180 / Math.PI;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
}

export function buildDroneRouteSamples(input: {
  origin: DroneMissionPoint;
  target: DroneMissionPoint;
  sampleCount?: number;
}): DroneRouteSample[] {
  const count = Math.max(2, Math.min(9, Math.round(input.sampleCount || 5)));
  const totalDistance = droneDistanceMeters(input.origin, input.target);
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0 : index / (count - 1);
    const lat = input.origin.lat + (input.target.lat - input.origin.lat) * progress;
    const lon = input.origin.lon + (input.target.lon - input.origin.lon) * progress;
    return {
      lat: roundTo(lat, 6),
      lon: roundTo(lon, 6),
      index,
      progress: roundTo(progress, 2),
      distanceFromStartMeters: roundTo(totalDistance * progress, 1),
    };
  });
}

export function droneDistanceMeters(a: DroneMissionPoint, b: DroneMissionPoint) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function droneBearingDegrees(a: DroneMissionPoint, b: DroneMissionPoint) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2)
    - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function statusFromSignals(assessment: DroneLandingAssessment | null, navigationPoint: BuildDroneMissionPlanInput['navigationPoint']): DroneMissionStatus {
  if (navigationPoint?.safety === 'restricted') return 'avoid';
  if (assessment?.label === 'Avoid') return 'avoid';
  if (assessment?.label === 'High caution') return 'hold';
  if (navigationPoint?.safety === 'caution') return 'hold';
  if ((assessment?.confidence ?? 0) < 0.5) return 'hold';
  return 'field-check';
}

function recommendedAltitudeAglM(navigationPoint: BuildDroneMissionPlanInput['navigationPoint']) {
  const base = navigationPoint?.altitudeAglM ?? 30;
  const tallestCloseObstacle = (navigationPoint?.candidates || [])
    .filter(candidate => candidate.distanceMeters <= 120 && typeof candidate.heightM === 'number')
    .reduce<number | null>((max, candidate) => {
      const height = candidate.heightM as number;
      return max === null ? height : Math.max(max, height);
    }, null);

  const obstacleAwareAltitude = tallestCloseObstacle === null ? base : Math.max(base, tallestCloseObstacle + 15);
  return roundTo(clamp(obstacleAwareAltitude, 20, 120), 1);
}

function buildRisks(assessment: DroneLandingAssessment | null, navigationPoint: BuildDroneMissionPlanInput['navigationPoint']) {
  const risks: string[] = [];
  if (navigationPoint?.safety === 'restricted') {
    risks.push('OpenStreetMap evidence indicates restricted aeroway or airport-related features nearby.');
  }
  if (navigationPoint?.safety === 'caution') {
    risks.push('Mapped obstacle evidence is close to the target; verify clearance on site.');
  }
  if ((navigationPoint?.candidates || []).some(candidate => candidate.heightM !== undefined && candidate.distanceMeters <= 120)) {
    risks.push('Nearby mapped obstacle height affects the recommended altitude.');
  }
  risks.push(...(assessment?.warnings || []));
  risks.push(...(navigationPoint?.warnings || []));
  return unique(risks).slice(0, 8);
}

function riskSummary(status: DroneMissionStatus) {
  if (status === 'avoid') return 'Avoid automatic use. Choose another AGID or confirm legal authorization and site safety.';
  if (status === 'hold') return 'Hold for manual field check before flight. Open data found caution signals or missing confidence.';
  return 'Ready for field check. Open data does not show a strong blocker, but this is not flight authorization.';
}

export function buildDroneMissionPlan(input: BuildDroneMissionPlanInput): DroneMissionPlan {
  const origin = input.origin || input.target;
  const distanceMeters = droneDistanceMeters(origin, input.target);
  const cruiseSpeedMps = clamp(input.cruiseSpeedMps || 8, 2, 20);
  const reserveRatio = clamp(input.reserveRatio || 1.25, 1, 2);
  const estimatedFlightMinutes = distanceMeters === 0
    ? 0
    : (distanceMeters / cruiseSpeedMps / 60) * reserveRatio;
  const status = statusFromSignals(input.landingAssessment, input.navigationPoint);
  const recommendedAgl = recommendedAltitudeAglM(input.navigationPoint);
  const routeSamples = buildDroneRouteSamples({ origin, target: input.target, sampleCount: 5 });
  const recommendedMsl = typeof input.navigationPoint?.altitudeMslM === 'number'
    ? roundTo(input.navigationPoint.altitudeMslM + Math.max(0, recommendedAgl - (input.navigationPoint.altitudeAglM || recommendedAgl)), 1)
    : null;

  return {
    status,
    distanceMeters: roundTo(distanceMeters, 1),
    bearingDegrees: roundTo(droneBearingDegrees(origin, input.target), 0),
    estimatedFlightMinutes: roundTo(estimatedFlightMinutes, 1),
    recommendedAltitudeAglM: recommendedAgl,
    recommendedAltitudeMslM: recommendedMsl,
    riskSummary: riskSummary(status),
    risks: buildRisks(input.landingAssessment, input.navigationPoint),
    checklist: [
      'Confirm local drone law, no-fly zones, and property permission.',
      'Keep visual line of sight and verify wind at the actual launch point.',
      'Check people, roads, railways, wires, trees, buildings, birds, and emergency activity.',
      'Use AGID as a location aid, not as an autopilot command.',
    ],
    routeSamples,
    sources: unique([
      ...(input.landingAssessment?.sources || []),
      ...(input.navigationPoint?.sources || []),
      'Open-Meteo',
      'OpenStreetMap/Overpass',
      'open elevation',
    ]),
  };
}
