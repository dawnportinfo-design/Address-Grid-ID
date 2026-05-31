export type DroneRiskLabel = 'Low risk' | 'Caution' | 'High caution' | 'Avoid';

export type DroneAssessmentInput = {
  elevationMeters?: number | null;
  windSpeedMs?: number | null;
  waterRisk?: string | null;
  geologicalRisks?: {
    landslide?: string;
    flood?: string;
    seismic?: string;
  } | null;
  landCover?: string | null;
  nearbyPeaks?: Array<{
    name: string;
    elevation?: number | null;
    lat?: number;
    lon?: number;
  }>;
  sources?: string[];
};

export type DroneLandingAssessment = {
  score: number;
  label: DroneRiskLabel;
  confidence: number;
  elevationMeters: number | null;
  windSpeedMs: number | null;
  waterRisk: string;
  highestNearbyPeak?: {
    name: string;
    elevation: number | null;
  };
  warnings: string[];
  strengths: string[];
  sources: string[];
};

function includesAny(value: string, patterns: string[]) {
  const normalized = value.toLowerCase();
  return patterns.some(pattern => normalized.includes(pattern));
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
}

function labelForScore(score: number): DroneRiskLabel {
  if (score >= 80) return 'Low risk';
  if (score >= 60) return 'Caution';
  if (score >= 40) return 'High caution';
  return 'Avoid';
}

export function assessDroneLandingZone(input: DroneAssessmentInput): DroneLandingAssessment {
  let score = 100;
  const warnings: string[] = [];
  const strengths: string[] = [];
  const sources = unique(input.sources || []);
  const waterRisk = input.waterRisk || 'Unknown';
  const landCover = input.landCover || 'Unknown';

  if (typeof input.windSpeedMs === 'number') {
    if (input.windSpeedMs >= 12) {
      score -= 35;
      warnings.push('Strong wind for small drone operations');
    } else if (input.windSpeedMs >= 8) {
      score -= 18;
      warnings.push('Moderate wind requires pilot caution');
    } else if (input.windSpeedMs <= 5) {
      strengths.push('Wind is within a favorable planning range');
    }
  } else {
    score -= 8;
    warnings.push('Wind data is unavailable');
  }

  if (includesAny(waterRisk, ['high'])) {
    score -= 25;
    warnings.push('Water or wetland risk is high near the target');
  } else if (includesAny(waterRisk, ['moderate', 'near water'])) {
    score -= 12;
    warnings.push('Target is near water or flood-prone terrain');
  } else if (waterRisk !== 'Unknown') {
    strengths.push('No strong water-risk signal from open data');
  }

  const landslide = input.geologicalRisks?.landslide || '';
  const flood = input.geologicalRisks?.flood || '';
  if (includesAny(landslide, ['high'])) {
    score -= 25;
    warnings.push('Landslide or steep terrain risk is high');
  } else if (includesAny(landslide, ['moderate'])) {
    score -= 12;
    warnings.push('Terrain risk is moderate');
  }

  if (includesAny(flood, ['high'])) {
    score -= 15;
    warnings.push('Flood risk is high');
  } else if (includesAny(flood, ['moderate'])) {
    score -= 8;
    warnings.push('Flood risk is moderate');
  }

  if (includesAny(landCover, ['urban', 'industrial', 'residential'])) {
    score -= 12;
    warnings.push('Urban or industrial land cover may limit safe landing space');
  } else if (landCover !== 'Unknown') {
    strengths.push(`Land cover: ${landCover}`);
  }

  const highestNearbyPeak = (input.nearbyPeaks || [])
    .filter(peak => peak && peak.name)
    .reduce<DroneLandingAssessment['highestNearbyPeak']>((best, peak) => {
      const elevation = typeof peak.elevation === 'number' ? peak.elevation : null;
      if (!best) return { name: peak.name, elevation };
      if (elevation !== null && (best.elevation === null || elevation > best.elevation)) {
        return { name: peak.name, elevation };
      }
      return best;
    }, undefined);

  if (highestNearbyPeak) {
    score -= highestNearbyPeak.elevation && highestNearbyPeak.elevation >= 1000 ? 12 : 6;
    warnings.push(`Nearby peak: ${highestNearbyPeak.name}`);
  }

  if (typeof input.elevationMeters !== 'number') {
    score -= 8;
    warnings.push('Ground elevation is unavailable');
  } else {
    strengths.push(`Ground elevation: ${Math.round(input.elevationMeters)} m`);
  }

  const availableSignals = [
    typeof input.elevationMeters === 'number',
    typeof input.windSpeedMs === 'number',
    waterRisk !== 'Unknown',
    Boolean(input.geologicalRisks),
    Boolean(input.nearbyPeaks?.length),
  ].filter(Boolean).length;

  const confidence = Math.min(0.95, Math.max(0.35, availableSignals / 5));
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: boundedScore,
    label: labelForScore(boundedScore),
    confidence,
    elevationMeters: typeof input.elevationMeters === 'number' ? input.elevationMeters : null,
    windSpeedMs: typeof input.windSpeedMs === 'number' ? input.windSpeedMs : null,
    waterRisk,
    highestNearbyPeak,
    warnings: unique(warnings),
    strengths: unique(strengths),
    sources: unique([
      ...sources,
      'Open-Meteo',
      'OpenStreetMap/Overpass',
      'open elevation',
    ]),
  };
}

