import { isInternationalShippingEnglishTab } from './languageTabs';

const cleanAddressLine = (line: string) =>
  line
    .normalize('NFKC')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/^[,，、]\s*/g, '')
    .replace(/,\s*$/g, '')
    .trim();

export function shouldPreserveAddressDisplayLines(tab: string) {
  return isInternationalShippingEnglishTab(tab) || tab === 'shipping_label';
}

export function formatAddressDisplayText(address: string, options: { tab: string }) {
  const lines = address
    .split(/\r?\n/)
    .map(cleanAddressLine)
    .filter(Boolean);

  if (shouldPreserveAddressDisplayLines(options.tab)) {
    return lines.join('\n');
  }

  return lines
    .join(', ')
    .replace(/,\s*,/g, ',')
    .replace(/^[,，、]\s*/g, '')
    .replace(/,\s*$/g, '')
    .trim();
}

const meaningfulTextPattern =
  /[A-Za-zÀ-ž\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0370-\u03ff\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u0e00-\u0e7f]/;

const normalizeComparable = (value: unknown) =>
  String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();

function splitAddressParts(address: string) {
  return address
    .split(/\r?\n|,/)
    .map(cleanAddressLine)
    .filter(Boolean);
}

export function assessAddressDisplayQuality(
  address: string,
  options: { country?: string; countryCode?: string; missingRequiredFields?: string[] } = {}
) {
  const parts = splitAddressParts(address);
  const country = normalizeComparable(options.country);
  const countryCode = normalizeComparable(options.countryCode);

  const meaningfulParts = parts.filter(part => {
    const comparable = normalizeComparable(part);
    if (!comparable) return false;
    if (country && comparable === country) return false;
    if (countryCode && comparable === countryCode) return false;
    if (/^\d+[a-z]?$/.test(comparable)) return false;
    return meaningfulTextPattern.test(part);
  });

  const hasStreetLikePart = parts.some(part =>
    /\b(street|st|road|rd|avenue|ave|lane|ln|drive|dr|way|rue|straße|strasse|calle|carrer|via|rua|ulica|prospekt|boulevard)\b/i.test(part) ||
    /[\u3040-\u30ff\u3400-\u9fff](通|町|丁目|番地|号|路|街|道|大街|로|길)/.test(part)
  );

  const missingRequiredCount = options.missingRequiredFields?.length ?? 0;
  const score = Math.max(
    0,
    Math.min(
      1,
      meaningfulParts.length * 0.28 +
        (hasStreetLikePart ? 0.22 : 0) +
        (parts.length >= 2 ? 0.12 : 0) -
        missingRequiredCount * 0.12
    )
  );

  return {
    score: Math.round(score * 100) / 100,
    isWeak: meaningfulParts.length === 0 || (meaningfulParts.length <= 1 && !hasStreetLikePart && missingRequiredCount > 0),
    meaningfulParts,
  };
}
