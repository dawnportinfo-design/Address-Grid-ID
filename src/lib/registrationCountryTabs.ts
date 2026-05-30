import type { CountryInfo } from '../constants/countries';

export type RegistrationCountryTabId = 'asia' | 'europe' | 'africa' | 'americas' | 'oceania' | 'polar';

export type RegistrationCountryTab = {
  id: RegistrationCountryTabId;
  label: string;
};

export const REGISTRATION_COUNTRY_TABS: RegistrationCountryTab[] = [
  { id: 'asia', label: 'Asia' },
  { id: 'europe', label: 'Europe' },
  { id: 'africa', label: 'Africa' },
  { id: 'americas', label: 'Americas' },
  { id: 'oceania', label: 'Oceania' },
  { id: 'polar', label: 'Polar' },
];

const REGION_TO_COUNTRY_TAB: Record<string, RegistrationCountryTabId> = {
  'East Asia': 'asia',
  'Southeast Asia': 'asia',
  'South Asia': 'asia',
  'Central Asia': 'asia',
  'Middle East': 'asia',
  Caucasus: 'europe',
  Europe: 'europe',
  Africa: 'africa',
  'North America': 'americas',
  'Central America': 'americas',
  Caribbean: 'americas',
  'South America': 'americas',
  Oceania: 'oceania',
  Antarctica: 'polar',
};

export function getRegistrationCountryTabId(country: Pick<CountryInfo, 'region'>): RegistrationCountryTabId {
  return REGION_TO_COUNTRY_TAB[country.region] || 'asia';
}

export function groupRegistrationCountriesByTab(countries: readonly CountryInfo[]) {
  const groups = Object.fromEntries(
    REGISTRATION_COUNTRY_TABS.map(tab => [tab.id, [] as CountryInfo[]])
  ) as Record<RegistrationCountryTabId, CountryInfo[]>;

  for (const country of countries) {
    groups[getRegistrationCountryTabId(country)].push(country);
  }

  return groups;
}
