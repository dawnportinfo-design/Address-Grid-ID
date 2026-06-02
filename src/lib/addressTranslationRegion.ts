import {
  chooseCommonAddressTranslationRoute,
  translateAddressFieldByRoute,
  type AddressFieldTranslator,
  type AddressTranslationRoute,
} from './addressTranslationRouteCore';
import { normalizeLanguageCode } from './languageCodeRules';

export type AddressTranslationProfile<TTopology extends string, TAlgorithm extends string> = {
  countryCode: string;
  nativeLanguages: readonly string[];
  defaultLanguage: string;
  defaultTopology: TTopology;
  englishAlgorithm: TAlgorithm;
};

type LanguageRole = 'source' | 'target';

export type ConfiguredAddressTranslationOptions<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
> = {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
  profiles: Record<string, TProfile>;
  topologyByLanguage: Record<string, TTopology>;
  englishTopology: TTopology;
  countryCodeAliases?: Record<string, string>;
  normalizeLanguage?: (language: string | undefined | null, profile: TProfile) => string;
  isAllowedLanguage?: (language: string, profile: TProfile, role: LanguageRole) => boolean;
  scriptConversion?: (sourceLanguage: string, targetLanguage: string, profile: TProfile) => boolean;
  directNative?: (sourceLanguage: string, targetLanguage: string, profile: TProfile) => boolean;
};

export type ConfiguredAddressFieldTranslationOptions<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
> = ConfiguredAddressTranslationOptions<TTopology, TAlgorithm, TProfile> & {
  fieldKey: string;
  text: string;
  translator?: AddressFieldTranslator;
  translatorSourceLanguage?: string | ((context: {
    sourceLanguage: string;
    targetLanguage: string;
    profile: TProfile;
  }) => string | undefined);
  normalizeEnglish: (text: string, context: {
    fieldKey: string;
    profile: TProfile;
    sourceLanguage: string;
    targetLanguage: string;
  }) => string;
  normalizeEnglishIdentity?: boolean;
  convertScript?: (text: string, context: {
    fieldKey: string;
    profile: TProfile;
    sourceLanguage: string;
    targetLanguage: string;
  }) => string;
};

const ENGLISH_LANGUAGE_ALIASES = new Set([
  'en',
  'en-domestic',
  'en-international',
  'intl-en',
  'international',
  'carrier',
]);

const BUILDING_FIELD_TERMS = [
  'building',
  'organization',
  'company',
  'poi',
  'amenity',
  'shop',
  'office',
  'tourism',
  'landmark',
];

const NON_BUILDING_FIELD_RE = /(recipient|phone|email|postcode|postal|zip|country|agid|code)/;

export function normalizeAddressTranslationCountryCode(
  countryCode: string,
  aliases: Record<string, string> = {},
) {
  const code = (countryCode || '').trim().toUpperCase();
  return aliases[code] || code;
}

export function getConfiguredAddressTranslationProfile<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(
  countryCode: string,
  profiles: Record<string, TProfile>,
  countryCodeAliases?: Record<string, string>,
) {
  return profiles[normalizeAddressTranslationCountryCode(countryCode, countryCodeAliases)] || null;
}

export function normalizeAddressTranslationLanguage<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(
  language: string | undefined | null,
  profile: TProfile,
  options: {
    mapLanguage?: (rawLanguage: string, profile: TProfile) => string | null | undefined;
  } = {},
) {
  const raw = (language || profile.defaultLanguage).trim().replace('_', '-');
  if (!raw || raw === 'local') return profile.defaultLanguage;
  if (ENGLISH_LANGUAGE_ALIASES.has(raw) || raw.startsWith('en-')) return 'en';
  return options.mapLanguage?.(raw, profile) || normalizeLanguageCode(raw);
}

export function isConfiguredAddressLanguageAllowed<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(language: string, profile: TProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

export function topologyForConfiguredAddressLanguage<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(
  language: string,
  profile: TProfile,
  topologyByLanguage: Record<string, TTopology>,
) {
  return topologyByLanguage[language] || profile.defaultTopology;
}

export function isAddressBuildingField(fieldKey: string) {
  const normalized = fieldKey.toLowerCase();
  if (NON_BUILDING_FIELD_RE.test(normalized)) return false;
  return BUILDING_FIELD_TERMS.some(term => normalized.includes(term));
}

export function replaceAddressTerms(text: string, terms: Record<string, string>) {
  let normalized = text;
  for (const [term, english] of Object.entries(terms)) {
    normalized = normalized.replace(new RegExp(`\\b${term}\\b`, 'giu'), english);
  }
  return normalized;
}

function normalizeSourceAndTarget<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(options: ConfiguredAddressTranslationOptions<TTopology, TAlgorithm, TProfile>, profile: TProfile) {
  const normalizeLanguage = options.normalizeLanguage || normalizeAddressTranslationLanguage;
  return {
    sourceLanguage: normalizeLanguage(options.sourceLanguage, profile),
    targetLanguage: normalizeLanguage(options.targetLanguage, profile),
  };
}

export function chooseConfiguredAddressTranslationRoute<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(
  options: ConfiguredAddressTranslationOptions<TTopology, TAlgorithm, TProfile>,
): AddressTranslationRoute<TTopology, TAlgorithm> | null {
  const profile = getConfiguredAddressTranslationProfile(
    options.countryCode,
    options.profiles,
    options.countryCodeAliases,
  );
  if (!profile) return null;

  const { sourceLanguage, targetLanguage } = normalizeSourceAndTarget(options, profile);
  const allow = options.isAllowedLanguage || ((language: string, current: TProfile) => (
    isConfiguredAddressLanguageAllowed(language, current)
  ));
  if (!allow(sourceLanguage, profile, 'source') || !allow(targetLanguage, profile, 'target')) return null;

  return chooseCommonAddressTranslationRoute({
    sourceLanguage,
    targetLanguage,
    sourceTopology: topologyForConfiguredAddressLanguage(sourceLanguage, profile, options.topologyByLanguage),
    targetTopology: topologyForConfiguredAddressLanguage(targetLanguage, profile, options.topologyByLanguage),
    englishAlgorithm: profile.englishAlgorithm,
    englishTopology: options.englishTopology,
    scriptConversion: options.scriptConversion?.(sourceLanguage, targetLanguage, profile),
    directNative: options.directNative?.(sourceLanguage, targetLanguage, profile),
  });
}

export async function translateConfiguredAddressField<
  TTopology extends string,
  TAlgorithm extends string,
  TProfile extends AddressTranslationProfile<TTopology, TAlgorithm>,
>(
  options: ConfiguredAddressFieldTranslationOptions<TTopology, TAlgorithm, TProfile>,
): Promise<{ text: string; route: AddressTranslationRoute<TTopology, TAlgorithm> } | null> {
  const profile = getConfiguredAddressTranslationProfile(
    options.countryCode,
    options.profiles,
    options.countryCodeAliases,
  );
  if (!profile) return null;

  const text = String(options.text ?? '').trim();
  if (!text) return null;

  const route: AddressTranslationRoute<TTopology, TAlgorithm> | null =
    chooseConfiguredAddressTranslationRoute<TTopology, TAlgorithm, TProfile>(options);
  if (!route) return null;

  const { sourceLanguage, targetLanguage } = normalizeSourceAndTarget(options, profile);
  const translatorSourceLanguage = typeof options.translatorSourceLanguage === 'function'
    ? options.translatorSourceLanguage({ sourceLanguage, targetLanguage, profile })
    : options.translatorSourceLanguage;

  return translateAddressFieldByRoute<AddressTranslationRoute<TTopology, TAlgorithm>>({
    text,
    route,
    fieldKey: options.fieldKey,
    sourceLanguage,
    targetLanguage,
    normalizeEnglish: value => options.normalizeEnglish(value, {
      fieldKey: options.fieldKey,
      profile,
      sourceLanguage,
      targetLanguage,
    }),
    translator: options.translator,
    translatorSourceLanguage,
    normalizeEnglishIdentity: options.normalizeEnglishIdentity,
    convertScript: value => options.convertScript?.(value, {
      fieldKey: options.fieldKey,
      profile,
      sourceLanguage,
      targetLanguage,
    }),
  });
}
