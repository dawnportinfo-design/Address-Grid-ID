import type { DroneRiskLabel } from './droneAssessment';
import type { DroneMissionStatus,DroneRouteSample } from './droneMissionPlan';

export type DroneCorridorSampleAssessment = {
  sampleIndex: number;
  label: DroneRiskLabel;
  score: number;
  confidence: number;
  warnings: string[];
};

export type DroneCorridorSampleResult = {
  sample: DroneRouteSample;
  assessment: DroneCorridorSampleAssessment | null;
};

export type DroneCorridorReport = {
  status: DroneMissionStatus;
  minScore: number | null;
  worstLabel: DroneRiskLabel | 'Unknown';
  worstSample: DroneCorridorSampleResult | null;
  confidence: number;
  summary: string;
  warnings: string[];
  samples: DroneCorridorSampleResult[];
};

const RISK_RANK: Record<DroneRiskLabel, number> = {
  'Low risk': 0,
  Caution: 1,
  'High caution': 2,
  Avoid: 3,
};

function unique(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
}

function statusForWorstLabel(label: DroneRiskLabel | 'Unknown'): DroneMissionStatus {
  if (label === 'Avoid') return 'avoid';
  if (label === 'High caution' || label === 'Unknown') return 'hold';
  return 'field-check';
}

function summaryForStatus(status: DroneMissionStatus) {
  if (status === 'avoid') return 'Do not use this corridor without choosing a different route or confirming legal and field safety.';
  if (status === 'hold') return 'Hold for route-level field check. One or more corridor samples need manual review.';
  return 'Corridor is ready for field check. Open data found no strong route-level blocker.';
}

export function buildDroneCorridorReport(input: {
  samples: DroneRouteSample[];
  sampleAssessments: DroneCorridorSampleAssessment[];
}): DroneCorridorReport {
  const assessmentsBySample = new Map(input.sampleAssessments.map(assessment => [assessment.sampleIndex, assessment]));
  const samples = input.samples.map(sample => ({
    sample,
    assessment: assessmentsBySample.get(sample.index) || null,
  }));

  const assessedSamples = samples.filter((sample): sample is DroneCorridorSampleResult & { assessment: DroneCorridorSampleAssessment } => (
    sample.assessment !== null
  ));

  const worstSample = assessedSamples.reduce<typeof assessedSamples[number] | null>((worst, current) => {
    if (!worst) return current;
    const currentRank = RISK_RANK[current.assessment.label];
    const worstRank = RISK_RANK[worst.assessment.label];
    if (currentRank > worstRank) return current;
    if (currentRank === worstRank && current.assessment.score < worst.assessment.score) return current;
    return worst;
  }, null);

  const missingCount = samples.length - assessedSamples.length;
  const worstLabel = missingCount > 0 && !worstSample ? 'Unknown' : worstSample?.assessment.label || 'Unknown';
  const status = missingCount > 0 && worstLabel === 'Low risk' ? 'hold' : statusForWorstLabel(worstLabel);
  const warnings = unique([
    ...assessedSamples.flatMap(sample => sample.assessment.warnings),
    ...(missingCount > 0 ? [`${missingCount} corridor sample(s) could not be checked.`] : []),
  ]).slice(0, 8);
  const minScore = assessedSamples.length
    ? Math.min(...assessedSamples.map(sample => sample.assessment.score))
    : null;
  const confidence = assessedSamples.length
    ? Math.min(0.95, Math.max(0.25, assessedSamples.reduce((sum, sample) => sum + sample.assessment.confidence, 0) / samples.length))
    : 0.25;

  return {
    status,
    minScore,
    worstLabel,
    worstSample,
    confidence,
    summary: summaryForStatus(status),
    warnings,
    samples,
  };
}
