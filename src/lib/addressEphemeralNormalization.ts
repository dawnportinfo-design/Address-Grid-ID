import { normalizeEnglishAddressPart } from './addressEnglish';

export const ADDRESS_EPHEMERAL_NORMALIZATION_VERSION = 'address-ephemeral-normalization-v1';

export type AddressEphemeralNormalization = {
  version: string;
  retention: 'ephemeral-caller-controlled-no-persistence';
  normalizedDisplay: string;
  comparisonKey: string;
  englishDisplay: string | null;
  transformations: Array<
    | 'unicode-compatibility'
    | 'whitespace'
    | 'typographic-apostrophe'
    | 'typographic-dash'
    | 'diacritic-folding'
    | 'case-folding'
  >;
  correctionBoundary: 'typographic-only-no-semantic-or-delivery-point-correction';
};

function clean(value: unknown) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u3000\s]+/g, ' ')
    .trim();
}

export function normalizeAddressPartEphemerally(
  value: unknown,
  countryCode = '',
): AddressEphemeralNormalization {
  const normalizedDisplay = clean(value);
  const comparisonKey = normalizedDisplay
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  const englishDisplay = normalizedDisplay && countryCode
    ? normalizeEnglishAddressPart(normalizedDisplay, countryCode)
    : null;

  return {
    version: ADDRESS_EPHEMERAL_NORMALIZATION_VERSION,
    retention: 'ephemeral-caller-controlled-no-persistence',
    normalizedDisplay,
    comparisonKey,
    englishDisplay: englishDisplay || null,
    transformations: [
      'unicode-compatibility',
      'whitespace',
      'typographic-apostrophe',
      'typographic-dash',
      'diacritic-folding',
      'case-folding',
    ],
    correctionBoundary: 'typographic-only-no-semantic-or-delivery-point-correction',
  };
}
