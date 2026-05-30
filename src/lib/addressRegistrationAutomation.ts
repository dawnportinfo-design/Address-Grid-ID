import { normalizeEnglishAddressBuildingName, normalizeEnglishAddressPart } from './addressEnglish';
import { normalizeRegistrationAddressLanguage } from './addressRegistrationState';
import { translateWithOpenSource } from './openSourceTranslation';

export type RegistrationFormRecord = Record<string, unknown> & {
  country?: string;
  postcode?: string;
};

export type PostcodeAutofillPatch = Partial<Record<string, string>>;

type AddressFormatLike = {
  postalCode?: {
    regex?: string;
    format?: string;
  } | null;
};

type Translator = (input: { text: string; target: string; source?: string }) => Promise<string | null>;

const NON_TRANSLATABLE_FIELDS = new Set([
  'country',
  'postcode',
  'postalCode',
  'zip',
  'phone',
  'agid',
  'aoid',
  'houseNumber',
  'house_number',
  'unit',
  'floor',
  'room',
]);

function compactPostcode(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

function clean(value: unknown) {
  return String(value ?? '').trim();
}

function hasValue(value: unknown) {
  return clean(value).length > 0;
}

export function isPostcodeReadyForAutofill(format: AddressFormatLike | null | undefined, postcode: string) {
  const value = postcode.trim();
  if (!format?.postalCode || !value) return false;

  if (format.postalCode.regex) {
    try {
      const regex = new RegExp(format.postalCode.regex);
      if (regex.test(value) || regex.test(compactPostcode(value))) return true;
    } catch {
      // Fall back to format-length checks below.
    }
  }

  const editableLength = (format.postalCode.format || '').replace(/[^NA?]/g, '').length;
  if (!editableLength) return false;
  return compactPostcode(value).replace(/[^A-Z0-9]/g, '').length >= editableLength;
}

export function mapPostcodeLookupResponse(countryCode: string, data: any): PostcodeAutofillPatch | null {
  const country = countryCode.toUpperCase();
  if (!data) return null;

  if (country === 'JP' && Array.isArray(data.results) && data.results[0]) {
    const result = data.results[0];
    return {
      postcode: clean(result.zipcode),
      state: clean(result.address1),
      city: clean(result.address2),
      suburb: clean(result.address3),
    };
  }

  if ((country === 'GB' || country === 'UK') && data.result) {
    const result = data.result;
    return {
      postcode: clean(result.postcode),
      state: clean(result.region || result.country),
      city: clean(result.admin_district || result.parish || result.admin_county),
      suburb: clean(result.admin_ward),
    };
  }

  if (country === 'CN' && (data.province || data.postcode)) {
    return {
      postcode: clean(data.postcode),
      state: clean(data.province),
    };
  }

  if (Array.isArray(data.places) && data.places[0]) {
    const place = data.places[0];
    return {
      postcode: clean(data['post code'] || data.postcode || data.postalCode),
      city: clean(place['place name'] || place.placeName || place.city),
      state: clean(place.state || place['state abbreviation'] || place.region),
    };
  }

  const address = data.address || data;
  const patch = {
    postcode: clean(address.postcode || address.postalcode || address.zip),
    state: clean(address.state || address.province || address.region || address.country),
    city: clean(address.city || address.town || address.village || address.municipality),
    suburb: clean(address.suburb || address.neighbourhood || address.district || address.county),
    street: clean(address.road || address.street),
    houseNumber: clean(address.house_number || address.houseNumber),
  };

  return Object.values(patch).some(Boolean) ? patch : null;
}

export async function lookupPostcodeAutofill(
  countryCode: string,
  postcode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PostcodeAutofillPatch | null> {
  const country = countryCode.toUpperCase();
  const compact = compactPostcode(postcode);
  if (!country || !compact) return null;

  const endpoints = country === 'JP'
    ? [`/api/jp-postcode?zipcode=${encodeURIComponent(compact)}`]
    : country === 'GB' || country === 'UK'
      ? [`/api/uk-postcode/${encodeURIComponent(compact)}`, `/api/zippopotam/GB/${encodeURIComponent(compact)}`]
      : country === 'CN'
        ? [`/api/cn-postcode?pc=${encodeURIComponent(compact)}`, `/api/zippopotam/CN/${encodeURIComponent(compact)}`]
        : [`/api/zippopotam/${encodeURIComponent(country)}/${encodeURIComponent(compact)}`];

  for (const endpoint of endpoints) {
    try {
      const response = await fetchImpl(endpoint);
      if (!response.ok) continue;
      const data = await response.json();
      const patch = mapPostcodeLookupResponse(country, data);
      if (patch && Object.values(patch).some(Boolean)) return patch;
    } catch {
      // Try the next open-source/postal endpoint.
    }
  }

  return null;
}

export function mergePostcodeAutofill<T extends RegistrationFormRecord>(formData: T, patch: PostcodeAutofillPatch): T {
  const merged: RegistrationFormRecord = { ...formData };
  for (const [key, value] of Object.entries(patch)) {
    if (!value) continue;
    if (key === 'postcode' || !hasValue(merged[key])) {
      merged[key] = value;
    }
  }
  return merged as T;
}

export async function buildPostcodeAutofillLanguageDrafts<T extends RegistrationFormRecord>(options: {
  formData: T;
  patch: PostcodeAutofillPatch;
  countryCode?: string;
  languageTabs: readonly string[];
  translator?: Translator;
}): Promise<Record<string, T>> {
  const countryCode = (options.countryCode || options.formData.country || '').toUpperCase();
  const localDraft = mergePostcodeAutofill(options.formData, options.patch);
  const drafts: Record<string, T> = { local: localDraft };
  const uniqueTabs = Array.from(new Set(options.languageTabs.map(normalizeRegistrationAddressLanguage)));

  await Promise.all(uniqueTabs.map(async (tabCode) => {
    if (!tabCode || tabCode === 'local') return;
    drafts[tabCode] = await translateRegistrationFormFields({
      formData: localDraft,
      targetLanguage: tabCode,
      countryCode,
      sourceLanguage: 'local',
      translator: options.translator,
    });
  }));

  return drafts;
}

async function defaultTranslator(input: { text: string; target: string; source?: string }) {
  const result = await translateWithOpenSource({
    text: input.text,
    target: input.target,
    source: input.source,
    timeoutMs: 1800,
  });
  return result?.translatedText || null;
}

function shouldTranslateField(key: string, value: unknown) {
  if (NON_TRANSLATABLE_FIELDS.has(key)) return false;
  const text = clean(value);
  if (!text) return false;
  if (/^[\d\s\-+/.,#]+$/.test(text)) return false;
  return true;
}

function shouldUseBuildingNameEnglish(key: string) {
  return ['building', 'organization', 'company', 'poi', 'amenity', 'shop', 'office', 'tourism'].includes(key);
}

export async function translateRegistrationFormFields<T extends RegistrationFormRecord>(options: {
  formData: T;
  targetLanguage: string;
  countryCode?: string;
  sourceLanguage?: string;
  translator?: Translator;
}): Promise<T> {
  const target = normalizeRegistrationAddressLanguage(options.targetLanguage);
  const countryCode = (options.countryCode || options.formData.country || '').toUpperCase();
  const translated: RegistrationFormRecord = { ...options.formData };

  if (target === 'local') return translated as T;

  const translator = options.translator || defaultTranslator;

  await Promise.all(Object.entries(options.formData).map(async ([key, value]) => {
    if (!shouldTranslateField(key, value)) return;
    const text = clean(value);

    if (target === 'en' || target === 'en_domestic') {
      const english = shouldUseBuildingNameEnglish(key)
        ? normalizeEnglishAddressBuildingName(text, countryCode)
        : normalizeEnglishAddressPart(text, countryCode);
      if (english) translated[key] = english;
      return;
    }

    const machineTranslated = await translator({
      text,
      target,
      source: options.sourceLanguage,
    });
    if (machineTranslated?.trim()) {
      translated[key] = machineTranslated.trim();
    }
  }));

  return translated as T;
}
