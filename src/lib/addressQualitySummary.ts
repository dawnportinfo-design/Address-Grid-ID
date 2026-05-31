import type { AddressValidationResult } from './addressValidation';

export type AddressQualitySummary = {
  label: string;
  confidenceLabel: string;
  explanation: string;
  modeDescription: string;
  sources: string[];
  warning?: string;
  postalLabel?: string;
};

const MODE_DESCRIPTIONS: Record<AddressValidationResult['quality']['mode'], string> = {
  'postal-verified': 'Postal rules and open-source metadata agree.',
  'partial-postal': 'Postal metadata exists, but the address still needs confirmation.',
  'geo-verified': 'Postal code is unavailable or secondary, so geography sources carry the check.',
  'manual-required': 'Open-source coverage is weak here; keep user confirmation in control.',
  'no-postal-code': 'This area does not use normal postal codes.',
};

export function getAddressQualitySummary(validation: AddressValidationResult): AddressQualitySummary {
  const confidencePercent = Math.round(validation.score * 100);
  const sources = validation.checkedWith
    .filter(Boolean)
    .slice(0, 4);
  const warning = validation.warnings.find(Boolean);
  const postalLabel =
    validation.postalCodeValid === true
      ? 'Postcode OK'
      : validation.postalCodeValid === false
        ? 'Postcode needs review'
        : undefined;

  return {
    label: validation.quality.label,
    confidenceLabel: `Confidence ${confidencePercent}%`,
    explanation: validation.quality.reason,
    modeDescription: MODE_DESCRIPTIONS[validation.quality.mode],
    sources,
    warning,
    postalLabel,
  };
}
