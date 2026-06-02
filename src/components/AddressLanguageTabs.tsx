import { MapPin,Truck } from 'lucide-react';
import React from 'react';
import { LANGUAGES } from '../lib/addressUtils';
import { getAddressLanguageTabLabel } from '../lib/languageLabels';
import {
getEnglishAddressCircle,
isEnglishAddressCountry,
isInternationalShippingEnglishTab,
} from '../lib/languageTabs';
import { cn } from '../lib/utils';

type AddressLanguageTabsProps = {
  tabs: string[];
  activeTab: string;
  countryCode: string;
  onSelect: (tab: string) => void;
};

function getTabLabel(langCode: string, countryCode: string) {
  const lang = LANGUAGES.find(l => l.code === langCode);
  const englishCircle =
    langCode === 'en_domestic' && isEnglishAddressCountry(countryCode)
      ? getEnglishAddressCircle(countryCode)
      : undefined;
  const isInternationalEnglish = langCode === 'en' || isInternationalShippingEnglishTab(langCode);

  return getAddressLanguageTabLabel(langCode, lang?.name, {
    englishMode: isInternationalEnglish
      ? 'international'
      : langCode === 'en_domestic'
        ? 'domestic'
        : 'plain',
    englishCircle,
  });
}

export const AddressLanguageTabs: React.FC<AddressLanguageTabsProps> = ({
  tabs,
  activeTab,
  countryCode,
  onSelect,
}) => (
  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
    {tabs.map(langCode => {
      const isIntlEn = langCode === 'en' || isInternationalShippingEnglishTab(langCode);
      const isActive = activeTab === langCode;
      const Icon = isIntlEn ? Truck : MapPin;

      return (
        <button
          key={langCode}
          onClick={() => onSelect(langCode)}
          className={cn(
            'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[8px] font-black tracking-normal transition-all',
            isActive
              ? 'bg-white text-slate-900 shadow-lg'
              : 'bg-white/5 text-slate-500 hover:bg-white/10',
          )}
        >
          <Icon className="h-2.5 w-2.5" />
          <span>{getTabLabel(langCode, countryCode)}</span>
        </button>
      );
    })}
  </div>
);
