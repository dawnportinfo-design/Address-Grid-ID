import {
buildDroneCorridorReport,
type DroneCorridorReport,
type DroneCorridorSampleAssessment,
} from '../lib/droneCorridor';
import { buildDroneRouteSamples,type DroneMissionPoint } from '../lib/droneMissionPlan';
import { fetchDroneLandingAssessment } from './DroneService';

export async function fetchDroneCorridorReport(input: {
  origin: DroneMissionPoint;
  target: DroneMissionPoint;
  sampleCount?: number;
}): Promise<DroneCorridorReport> {
  const samples = buildDroneRouteSamples({
    origin: input.origin,
    target: input.target,
    sampleCount: input.sampleCount || 5,
  });

  const settled = await Promise.allSettled(samples.map(async (sample): Promise<DroneCorridorSampleAssessment> => {
    const assessment = await fetchDroneLandingAssessment({ lat: sample.lat, lon: sample.lon });
    return {
      sampleIndex: sample.index,
      label: assessment.label,
      score: assessment.score,
      confidence: assessment.confidence,
      warnings: assessment.warnings,
    };
  }));

  return buildDroneCorridorReport({
    samples,
    sampleAssessments: settled
      .filter((result): result is PromiseFulfilledResult<DroneCorridorSampleAssessment> => result.status === 'fulfilled')
      .map(result => result.value),
  });
}
