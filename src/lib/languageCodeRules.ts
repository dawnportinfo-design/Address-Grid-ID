const EXACT_LANGUAGE_ALIASES: Record<string, string> = {
  local: 'local',
  'zh-CN': 'zh-Hans',
  'zh-SG': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
  fil: 'tl',
  nb: 'no',
  nn: 'no',
};

const PREFIX_LANGUAGE_ALIASES = [
  ['zh-Hans', 'zh-Hans'],
  ['zh-Hant', 'zh-Hant'],
  ['en', 'en'],
  ['pt', 'pt'],
  ['es', 'es'],
  ['fr', 'fr'],
  ['de', 'de'],
  ['ar', 'ar'],
  ['fa', 'fa'],
] as const;

type NormalizeLanguageCodeOptions = {
  emptyFallback?: string;
  preserveExact?: ReadonlySet<string>;
};

export function normalizeLanguageCode(
  code: string | undefined | null,
  { emptyFallback = '', preserveExact }: NormalizeLanguageCodeOptions = {},
) {
  const value = (code || '').trim();
  const preserved = value && preserveExact?.has(value) ? value : undefined;
  const exact = value ? EXACT_LANGUAGE_ALIASES[value] : emptyFallback;
  const prefixed = PREFIX_LANGUAGE_ALIASES.find(([prefix]) => value.startsWith(prefix))?.[1];

  return preserved ?? exact ?? prefixed ?? value.split('-')[0].toLowerCase();
}
