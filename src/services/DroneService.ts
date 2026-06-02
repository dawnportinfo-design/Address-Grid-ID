import { assessDroneLandingZone,type DroneLandingAssessment } from '../lib/droneAssessment';
import { fetchWithRetry } from '../lib/utils';

type DroneAssessmentTarget = {
  lat: number;
  lon: number;
};

async function optionalJson(url: string, timeout = 20000) {
  try {
    const response = await fetchWithRetry(url, { timeout }, 1, timeout);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchDroneLandingAssessment(
  target: DroneAssessmentTarget,
): Promise<DroneLandingAssessment> {
  const { lat, lon } = target;
  const params = `lat=${lat}&lon=${lon}`;
  const weatherParams = `latitude=${lat}&longitude=${lon}`;

  const [
    elevation,
    weather,
    waterRisk,
    geologicalRisk,
    mountain,
  ] = await Promise.all([
    optionalJson(`/api/elevation?${params}`, 15000),
    optionalJson(`/api/weather?${weatherParams}`, 15000),
    optionalJson(`/api/water-risk?${params}`, 25000),
    optionalJson(`/api/geological-risk?${params}`, 25000),
    optionalJson(`/api/mountain/nearby?${params}`, 25000),
  ]);

  return assessDroneLandingZone({
    elevationMeters: typeof elevation?.elevation === 'number' ? elevation.elevation : null,
    windSpeedMs: typeof weather?.current?.wind_speed_10m === 'number' ? weather.current.wind_speed_10m : null,
    waterRisk: waterRisk?.risk_level || null,
    geologicalRisks: geologicalRisk?.risks || null,
    landCover: geologicalRisk?.land_cover || null,
    nearbyPeaks: Array.isArray(mountain?.peaks) ? mountain.peaks : [],
    sources: [
      elevation?.source,
      weather ? 'Open-Meteo weather' : '',
      waterRisk?.source,
      geologicalRisk?.source,
      mountain?.source,
    ].filter(Boolean),
  });
}

