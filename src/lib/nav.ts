/**
 * Navigation utilities for maritime and aviation.
 */

/**
 * Calculates the distance between two points using the Haversine formula.
 * @returns Distance in kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the initial bearing from one point to another.
 * @returns Bearing in degrees (0-360).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;
  return bearing;
}

/**
 * Converts kilometers to nautical miles.
 */
export function kmToNm(km: number): number {
  return km / 1.852;
}

/**
 * Formats distance based on unit system.
 */
export function formatDistance(km: number, unit: 'metric' | 'nautical' | 'automatic' | 'kilometers' | 'miles'): string {
  const formatters: Record<typeof unit, (value: number) => string> = {
    metric: value => value.toFixed(2) + ' km',
    automatic: value => value.toFixed(2) + ' km',
    kilometers: value => value.toFixed(2) + ' km',
    nautical: value => kmToNm(value).toFixed(2) + ' NM',
    miles: value => (value * 0.621371).toFixed(2) + ' mi',
  };

  return formatters[unit](km);
}
