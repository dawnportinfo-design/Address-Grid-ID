import type { ResolvedNavigationDestination } from '../lib/navigationDestination';

export type AppNavigationPoint = {
  lat: number;
  lng: number;
  name?: string;
};

export type CarNavigationDestination = AppNavigationPoint & {
  original: AppNavigationPoint;
  method: ResolvedNavigationDestination['finalPoint']['method'];
  source: string;
  distanceMeters: number;
  confidence: number;
  warnings: string[];
  sources: string[];
};

export async function resolveCarNavigationDestination(
  destination: AppNavigationPoint,
  radiusMeters = 180,
): Promise<CarNavigationDestination> {
  const params = new URLSearchParams({
    lat: String(destination.lat),
    lon: String(destination.lng),
    radius: String(radiusMeters),
    mode: 'car',
  });

  const response = await fetch(`/api/navigation/resolve-destination?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to resolve car navigation destination');
  const data = await response.json() as ResolvedNavigationDestination & { ok?: boolean };
  const finalPoint = data.finalPoint;

  return {
    lat: finalPoint.lat,
    lng: finalPoint.lon,
    name: destination.name,
    original: destination,
    method: finalPoint.method,
    source: finalPoint.source,
    distanceMeters: finalPoint.distanceMeters,
    confidence: data.confidence,
    warnings: data.warnings || [],
    sources: data.sources || [],
  };
}

export function shouldUseCarNavigationDestination(mode: string) {
  return mode === 'driving';
}
