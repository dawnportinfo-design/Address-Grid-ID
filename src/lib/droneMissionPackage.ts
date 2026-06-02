import type { DroneNavigationPoint } from '../services/DroneNavigationService';
import type { DroneLandingAssessment } from './droneAssessment';
import type { DroneCorridorReport } from './droneCorridor';
import type { DroneMissionPlan,DroneMissionPoint } from './droneMissionPlan';

export type DroneMissionRecord = {
  type: 'DRONE_MISSION';
  version: 1;
  id: string;
  agid?: string;
  origin: DroneMissionPoint;
  target: DroneMissionPoint;
  plan: DroneMissionPlan;
  corridorReport?: DroneCorridorReport | null;
  assessment?: DroneLandingAssessment | null;
  navigationPoint?: Partial<DroneNavigationPoint> | null;
  createdAt: string;
  updatedAt: number;
};

export type SavedDroneMissionQr = {
  id: string;
  lat: number;
  lon: number;
  address: string;
  regionName: string;
  savedAt: string;
  payload: string;
  source: 'drone_mission';
};

const DRONE_QR_PREFIX = 'agid:drone:';

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function compact(parts: Array<string | undefined | null>) {
  return parts.map(part => clean(part)).filter(Boolean);
}

function shortCoord(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : '0.00000';
}

function missionId(input: { agid?: string; target: DroneMissionPoint; now: string }) {
  const agid = clean(input.agid);
  if (agid) return `DRONE-${agid}`;
  const stamp = input.now.replace(/\D/g, '').slice(0, 14) || Date.now().toString();
  return `DRONE-${shortCoord(input.target.lat)}-${shortCoord(input.target.lon)}-${stamp}`;
}

export function buildDroneMissionRecord(input: {
  agid?: string;
  origin: DroneMissionPoint;
  target: DroneMissionPoint;
  plan: DroneMissionPlan;
  corridorReport?: DroneCorridorReport | null;
  assessment?: DroneLandingAssessment | null;
  navigationPoint?: Partial<DroneNavigationPoint> | null;
  now?: string;
}): DroneMissionRecord {
  const createdAt = input.now || new Date().toISOString();
  const agid = clean(input.agid);
  return {
    type: 'DRONE_MISSION',
    version: 1,
    id: missionId({ agid, target: input.target, now: createdAt }),
    ...(agid ? { agid } : {}),
    origin: input.origin,
    target: input.target,
    plan: input.plan,
    corridorReport: input.corridorReport || null,
    assessment: input.assessment || null,
    navigationPoint: input.navigationPoint || null,
    createdAt,
    updatedAt: Date.parse(createdAt),
  };
}

export function buildDroneMissionQrPayload(record: DroneMissionRecord) {
  return `${DRONE_QR_PREFIX}${encodeURIComponent(JSON.stringify({ version: 1, record }))}`;
}

export function parseDroneMissionQrPayload(text: string): DroneMissionRecord | null {
  const value = clean(text);
  if (!value.startsWith(DRONE_QR_PREFIX)) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value.slice(DRONE_QR_PREFIX.length)));
    const record = parsed?.record || parsed;
    if (!record || record.type !== 'DRONE_MISSION' || !record.id || !record.plan || !record.target) {
      return null;
    }
    return record as DroneMissionRecord;
  } catch {
    return null;
  }
}

export function formatDroneMissionAddress(record: DroneMissionRecord) {
  return compact([
    'Drone Mission',
    record.agid || record.target.label,
    `${Math.round(record.plan.distanceMeters)}m`,
    record.plan.status,
    `${shortCoord(record.target.lat)}, ${shortCoord(record.target.lon)}`,
  ]).join(', ');
}

export function buildSavedQrFromDroneMission(
  record: DroneMissionRecord,
  payload: string,
  savedAt = new Date().toISOString(),
): SavedDroneMissionQr {
  return {
    id: record.id,
    lat: record.target.lat,
    lon: record.target.lon,
    address: formatDroneMissionAddress(record),
    regionName: 'Drone Mission Plan',
    savedAt,
    payload,
    source: 'drone_mission',
  };
}
