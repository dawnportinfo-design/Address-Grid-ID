export const FLAG_API_BASE_URL = 'https://flagcdn.com';

const FLAG_PARENT_CODES: Record<string, string> = {
  CA_QC: 'CA',
  CL_EA: 'CL',
  ES_BAL: 'ES',
  ES_CAN: 'ES',
  PT_AZO: 'PT',
  PT_MAD: 'PT',
  SBA: 'CY',
  SJ_JAN: 'SJ',
  SJ_SVA: 'SJ',
};

export function normalizeFlagCountryCode(countryCode: string) {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return null;

  const parentCode = FLAG_PARENT_CODES[normalized];
  if (parentCode) return parentCode.toLowerCase();

  if (/^[A-Z]{2}$/.test(normalized)) return normalized.toLowerCase();

  const regionalPrefix = normalized.match(/^([A-Z]{2})[-_][A-Z0-9]+/);
  return regionalPrefix ? regionalPrefix[1].toLowerCase() : null;
}

export function getFlagApiUrl(countryCode: string) {
  const code = normalizeFlagCountryCode(countryCode);
  return code ? `${FLAG_API_BASE_URL}/${code}.svg` : null;
}

export function getFlagPngSrcSet(countryCode: string) {
  const code = normalizeFlagCountryCode(countryCode);
  return code
    ? `${FLAG_API_BASE_URL}/40x30/${code}.png 1x, ${FLAG_API_BASE_URL}/80x60/${code}.png 2x`
    : undefined;
}
