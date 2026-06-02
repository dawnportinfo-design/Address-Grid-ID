import { normalizeRegistrationAddressLanguage } from './addressRegistrationState';
import {
getAmericasAddressTranslationProfile,
translateAmericasAddressField,
} from './americasAddressTranslation';
import {
getCentralAfricaAddressTranslationProfile,
translateCentralAfricaAddressField,
} from './centralAfricaAddressTranslation';
import {
getCentralAsiaAddressTranslationProfile,
translateCentralAsiaAddressField,
} from './centralAsiaAddressTranslation';
import {
getCentralEuropeAddressTranslationProfile,
translateCentralEuropeAddressField,
} from './centralEuropeAddressTranslation';
import {
getEastAfricaAddressTranslationProfile,
translateEastAfricaAddressField,
} from './eastAfricaAddressTranslation';
import { getEastAsiaAddressTranslationProfile,translateEastAsiaAddressField } from './eastAsiaAddressTranslation';
import {
getEasternEuropeAddressTranslationProfile,
translateEasternEuropeAddressField,
} from './easternEuropeAddressTranslation';
import { normalizeEnglishAddressModeField } from './englishAddressMode';
import {
getNorthernEuropeAddressTranslationProfile,
translateNorthernEuropeAddressField,
} from './northernEuropeAddressTranslation';
import {
getOceaniaAddressTranslationProfile,
translateOceaniaAddressField,
} from './oceaniaAddressTranslation';
import { shouldUseOpenSourceTranslationBeforeLocalFallback } from './openSourceAddressResolutionStrategy';
import { translateWithOpenSource } from './openSourceTranslation';
import {
getSouthAsiaAddressTranslationProfile,
translateSouthAsiaAddressField,
} from './southAsiaAddressTranslation';
import {
getSoutheastAsiaAddressTranslationProfile,
translateSoutheastAsiaAddressField,
} from './southeastAsiaAddressTranslation';
import {
getSouthernAfricaAddressTranslationProfile,
translateSouthernAfricaAddressField,
} from './southernAfricaAddressTranslation';
import {
getSouthernEuropeAddressTranslationProfile,
translateSouthernEuropeAddressField,
} from './southernEuropeAddressTranslation';
import {
getWestAfricaAddressTranslationProfile,
translateWestAfricaAddressField,
} from './westAfricaAddressTranslation';
import {
getWestAsiaAddressTranslationProfile,
translateWestAsiaAddressField,
} from './westAsiaAddressTranslation';
import {
getWesternEuropeAddressTranslationProfile,
translateWesternEuropeAddressField,
} from './westernEuropeAddressTranslation';

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
  const primaryLocalTab = uniqueTabs.find(tabCode => tabCode && tabCode !== 'local' && tabCode !== 'en') || null;

  await Promise.all(uniqueTabs.map(async (tabCode) => {
    if (!tabCode || tabCode === 'local') return;
    if (tabCode === primaryLocalTab) {
      drafts[tabCode] = localDraft;
      return;
    }
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
  const eastAsiaProfile = getEastAsiaAddressTranslationProfile(countryCode);
  const southeastAsiaProfile = getSoutheastAsiaAddressTranslationProfile(countryCode);
  const southAsiaProfile = getSouthAsiaAddressTranslationProfile(countryCode);
  const centralAsiaProfile = getCentralAsiaAddressTranslationProfile(countryCode);
  const westAsiaProfile = getWestAsiaAddressTranslationProfile(countryCode);
  const americasProfile = getAmericasAddressTranslationProfile(countryCode);
  const oceaniaProfile = getOceaniaAddressTranslationProfile(countryCode);
  const westernEuropeProfile = getWesternEuropeAddressTranslationProfile(countryCode);
  const southernEuropeProfile = getSouthernEuropeAddressTranslationProfile(countryCode);
  const centralEuropeProfile = getCentralEuropeAddressTranslationProfile(countryCode);
  const northernEuropeProfile = getNorthernEuropeAddressTranslationProfile(countryCode);
  const easternEuropeProfile = getEasternEuropeAddressTranslationProfile(countryCode);
  const eastAfricaProfile = getEastAfricaAddressTranslationProfile(countryCode);
  const southernAfricaProfile = getSouthernAfricaAddressTranslationProfile(countryCode);
  const centralAfricaProfile = getCentralAfricaAddressTranslationProfile(countryCode);
  const westAfricaProfile = getWestAfricaAddressTranslationProfile(countryCode);

  if (target === 'local') return translated as T;

  const translator = options.translator || defaultTranslator;
  const hasCustomTranslator = Boolean(options.translator);

  await Promise.all(Object.entries(options.formData).map(async ([key, value]) => {
    if (!shouldTranslateField(key, value)) return;
    const text = clean(value);

    if (shouldUseOpenSourceTranslationBeforeLocalFallback({
      hasCustomTranslator,
      fieldKey: key,
      text,
      sourceLanguage: options.sourceLanguage,
      targetLanguage: target,
    })) {
      const openSourceTranslated = await translator({
        text,
        target,
        source: options.sourceLanguage,
      });
      if (openSourceTranslated?.trim()) {
        translated[key] = openSourceTranslated.trim();
        return;
      }
    }

    if (eastAsiaProfile) {
      const eastAsiaTranslated = await translateEastAsiaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (eastAsiaTranslated?.text.trim()) {
        translated[key] = eastAsiaTranslated.text.trim();
      }
      return;
    }

    if (southeastAsiaProfile) {
      const southeastAsiaTranslated = await translateSoutheastAsiaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (southeastAsiaTranslated?.text.trim()) {
        translated[key] = southeastAsiaTranslated.text.trim();
      }
      return;
    }

    if (southAsiaProfile) {
      const southAsiaTranslated = await translateSouthAsiaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (southAsiaTranslated?.text.trim()) {
        translated[key] = southAsiaTranslated.text.trim();
      }
      return;
    }

    if (centralAsiaProfile) {
      const centralAsiaTranslated = await translateCentralAsiaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (centralAsiaTranslated?.text.trim()) {
        translated[key] = centralAsiaTranslated.text.trim();
      }
      return;
    }

    if (westAsiaProfile) {
      const westAsiaTranslated = await translateWestAsiaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (westAsiaTranslated?.text.trim()) {
        translated[key] = westAsiaTranslated.text.trim();
      }
      return;
    }

    if (americasProfile) {
      const americasTranslated = await translateAmericasAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (americasTranslated?.text.trim()) {
        translated[key] = americasTranslated.text.trim();
      }
      return;
    }

    if (oceaniaProfile) {
      const oceaniaTranslated = await translateOceaniaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (oceaniaTranslated?.text.trim()) {
        translated[key] = oceaniaTranslated.text.trim();
      }
      return;
    }

    if (westernEuropeProfile) {
      const westernEuropeTranslated = await translateWesternEuropeAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (westernEuropeTranslated?.text.trim()) {
        translated[key] = westernEuropeTranslated.text.trim();
      }
      return;
    }

    if (southernEuropeProfile) {
      const southernEuropeTranslated = await translateSouthernEuropeAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (southernEuropeTranslated?.text.trim()) {
        translated[key] = southernEuropeTranslated.text.trim();
      }
      return;
    }

    if (centralEuropeProfile) {
      const centralEuropeTranslated = await translateCentralEuropeAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (centralEuropeTranslated?.text.trim()) {
        translated[key] = centralEuropeTranslated.text.trim();
      }
      return;
    }

    if (northernEuropeProfile) {
      const northernEuropeTranslated = await translateNorthernEuropeAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (northernEuropeTranslated?.text.trim()) {
        translated[key] = northernEuropeTranslated.text.trim();
      }
      return;
    }

    if (easternEuropeProfile) {
      const easternEuropeTranslated = await translateEasternEuropeAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (easternEuropeTranslated?.text.trim()) {
        translated[key] = easternEuropeTranslated.text.trim();
      }
      return;
    }

    if (eastAfricaProfile) {
      const eastAfricaTranslated = await translateEastAfricaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (eastAfricaTranslated?.text.trim()) {
        translated[key] = eastAfricaTranslated.text.trim();
      }
      return;
    }

    if (southernAfricaProfile) {
      const southernAfricaTranslated = await translateSouthernAfricaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (southernAfricaTranslated?.text.trim()) {
        translated[key] = southernAfricaTranslated.text.trim();
      }
      return;
    }

    if (centralAfricaProfile) {
      const centralAfricaTranslated = await translateCentralAfricaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (centralAfricaTranslated?.text.trim()) {
        translated[key] = centralAfricaTranslated.text.trim();
      }
      return;
    }

    if (westAfricaProfile) {
      const westAfricaTranslated = await translateWestAfricaAddressField({
        countryCode,
        fieldKey: key,
        text,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: target,
        translator,
      });
      if (westAfricaTranslated?.text.trim()) {
        translated[key] = westAfricaTranslated.text.trim();
      }
      return;
    }

    if (target === 'en' || target === 'en_domestic') {
      const english = normalizeEnglishAddressModeField({
        countryCode,
        fieldKey: key,
        text,
        mode: target === 'en_domestic' ? 'domestic' : 'international-shipping',
      });
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
