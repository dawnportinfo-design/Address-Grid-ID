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
