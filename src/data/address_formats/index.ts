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
  format: string;
  regex: string | null;
  api: string | null;
  source: string;
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
}

// Vite handles dynamic imports with variables using glob patterns
const formatModules = (import.meta as any).glob('./**/*.json');
const addressFormatCache = new Map<string, Promise<AddressFormat | null>>();

function findAddressFormatPath(code: string): string | null {
  const exactSuffix = `/${code}.json`;
  const baseCode = code.split(/[-_]/)[0];
  const baseSuffix = `/${baseCode}.json`;

  const exactMatch = Object.keys(formatModules).find((path) => path.endsWith(exactSuffix));
  if (exactMatch) return exactMatch;

  const baseMatch = Object.keys(formatModules).find((path) => path.endsWith(baseSuffix));
  return baseMatch || null;
}

/**
 * Dynamically loads the address format for a given country code.
 * This improves initial loading speed by not bundling all formats at once.
 */
export async function getAddressFormat(countryCode: string): Promise<AddressFormat | null> {
  let code = countryCode.toUpperCase();
  let path = findAddressFormatPath(code);

  if (!path) {
    console.warn(`Address format for ${code} not found.`);
    return null;
  }

  const cached = addressFormatCache.get(path);
  if (cached) {
    return cached;
  }

  const loader = (async () => {
    try {
      const module = await formatModules[path]() as any;
      return module.default as AddressFormat;
    } catch (error) {
      console.warn(`Address format for ${code} failed to load:`, error);
      addressFormatCache.delete(path);
      return null;
    }
  })();

  addressFormatCache.set(path, loader);
  return loader;
}
