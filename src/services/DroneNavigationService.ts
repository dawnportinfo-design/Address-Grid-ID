import type {
DroneAltitudeMode,
DroneSafetyLevel,
ResolvedDroneNavigationPoint,
} from '../lib/droneNavigation';
import type { AppNavigationPoint } from './NavigationDestinationService';

export type DroneNavigationPoint = AppNavigationPoint & {
  original: AppNavigationPoint;
  mode: DroneAltitudeMode;
  stepCm: number;
  altitudeAglCm: number | null;
  altitudeMslCm: number | null;
  altitudeAglM: number | null;
  altitudeMslM: number | null;
  groundElevationM: number | null;
  groundElevationSource: string | null;
  safety: DroneSafetyLevel;
  confidence: number;
  warnings: string[];
  sources: string[];
  candidates: ResolvedDroneNavigationPoint['candidates'];
};

export type DroneNavigationOptions = {
  altitudeM?: number;
  minAltitudeM?: number;
  maxAltitudeM?: number;
  stepCm?: number;
  mode?: DroneAltitudeMode;
  radiusMeters?: number;
};

export async function resolveDroneNavigationPoint(
  destination: AppNavigationPoint,
  options: DroneNavigationOptions = {},
): Promise<DroneNavigationPoint> {
  const params = new URLSearchParams({
    lat: String(destination.lat),
    lon: String(destination.lng),
    altitudeM: String(options.altitudeM ?? 30),
    minM: String(options.minAltitudeM ?? 0),
    maxM: String(options.maxAltitudeM ?? 120),
    stepCm: String(options.stepCm ?? 10),
    mode: options.mode ?? 'agl',
    radius: String(options.radiusMeters ?? 250),
  });

  const response = await fetch(`/api/drone/resolve-point?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to resolve drone navigation point');
  const data = await response.json() as ResolvedDroneNavigationPoint & { ok?: boolean };

  return {
    lat: data.point.lat,
    lng: data.point.lon,
    name: destination.name,
    original: destination,
    mode: data.point.mode,
    stepCm: data.point.stepCm,
    altitudeAglCm: data.point.altitudeAglCm,
    altitudeMslCm: data.point.altitudeMslCm,
    altitudeAglM: data.point.altitudeAglM,
    altitudeMslM: data.point.altitudeMslM,
    groundElevationM: data.groundElevationM,
    groundElevationSource: data.groundElevationSource,
    safety: data.safety,
    confidence: data.confidence,
    warnings: data.warnings || [],
    sources: data.sources || [],
    candidates: data.candidates || [],
  };
}

export function shouldUseDroneNavigation(mode: string) {
  return mode === 'drone';
}
