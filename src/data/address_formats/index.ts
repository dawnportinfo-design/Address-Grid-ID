/// <reference types="vite/client" />

import { hydrateAddressFormat } from './addressFormatCommon';

export interface AddressField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export interface LanguageFormat {
  name?: string;
  addressFormat: string;
  ordering: 'big-to-small' | 'small-to-big';
  fields: AddressField[];
}

export interface PostalCodeInfo {
  format: string | null;
  regex: string | null;
  api: string | null;
  source: string;
}

export interface AddressRuleMetadata {
  languages: { code: string; name: string }[];
  deliveryLanguages?: { code: string; name: string }[];
  nativeOrder: string[];
  englishOrder: string[];
  russianOrder?: string[];
  regionalHierarchy: string[];
  openSourceIds?: string[];
  postalCode: { label: string; required: boolean; usage: 'required' | 'recommended' | 'used' | 'partial' | 'optional' } | null;
}

export interface AddressFormat {
  countryCode: string;
  name: string;
  native?: LanguageFormat;
  english?: LanguageFormat;
  domestic?: Record<string, LanguageFormat>;
  international?: Record<string, LanguageFormat>;
  postalCode?: PostalCodeInfo;
  nativeName?: string;
  addressFormat?: string;
  fields?: (AddressField & { labelEn?: string })[];
  ordering?: 'big-to-small' | 'small-to-big';
  postalCodeRegex?: string;
  openSourceIds?: string[];
  addressRules?: AddressRuleMetadata;
}

// Vite handles dynamic imports with variables using glob patterns.
// Node-based unit tests do not provide import.meta.glob, so keep the module
// importable even when dynamic address-format loading is unavailable.
let formatModules: Record<string, () => Promise<unknown>> = {};
try {
  formatModules = import.meta.glob('./**/*.json');
} catch {
  // Node-based unit tests do not provide Vite's import.meta.glob.
}
const formatModuleByCode = Object.fromEntries(
  Object.keys(formatModules).map(path => {
    const fileName = path.split('/').pop() || '';
    return [fileName.replace(/\.json$/, '').toUpperCase(), path];
  }),
) as Record<string, string>;

/**
 * Dynamically loads the address format for a given country code.
 * This improves initial loading speed by not bundling all formats at once.
 */
export async function getAddressFormat(countryCode: string): Promise<AddressFormat | null> {
  let code = countryCode.toUpperCase();
  let path = formatModuleByCode[code];
  
  if (!path) {
    // Try base code fallback for sub-regions (e.g. DE-BY -> DE, ES_BAL -> ES)
    const baseCode = code.split(/[-_]/)[0];
    const basePath = formatModuleByCode[baseCode];
    if (basePath) {
      path = basePath;
    } else {
      console.warn(`Address format for ${code} not found.`);
      return null;
    }
  }

  try {
    const module = await formatModules[path]() as any;
    return hydrateAddressFormat(module.default as AddressFormat);
  } catch (error) {
    console.warn(`Address format for ${code} failed to load:`, error);
    return null;
  }
}
