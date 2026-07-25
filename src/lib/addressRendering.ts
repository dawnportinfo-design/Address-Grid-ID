
import { transliterate } from './transliteration';
import { applyShippingAbbreviations } from './addressUtils';
import { AMERICAS_COUNTRY_CODES, OCEANIA_COUNTRY_CODES } from './regions';
import {
  renderDomesticCN,
  renderInternationalCN,
  renderTW,
  renderHK,
  renderMO
} from './chineseAddressUtils';

export interface CanonicalAddress {
  country_code: string;
  country: string;
  state: string;
  city: string;
  district: string;
  subdistrict: string;
  suburb: string;
  road: string;
  house_number: string;
  building: string;
  postcode: string;
  poi: string;
}

export function normalizeUnicode(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[\u3000\s]+/g, ' ')
    .trim();
}

export function createCanonicalAddress(details: any): CanonicalAddress {
  const cleanOsm = (v: string) => v ? v.split(';')[0].trim() : '';
  const hasJaChars = (s: string) => /[\u3040-\u30ff\u4e00-\u9faf]/.test(s);

  const rawCity = details.city || details.town || details.village || details.municipality || '';
  const rawDistrict = details.city_district || details.district || details.county || details.subdivision || '';
  const cc = (details.country_code || '').toUpperCase();

  let effectiveCity = rawCity;
  let effectiveDistrict = rawDistrict;
  if (cc === 'JP' && rawDistrict && hasJaChars(rawDistrict) && (!rawCity || !hasJaChars(rawCity))) {
    effectiveCity = rawDistrict;
    effectiveDistrict = '';
  }

  const parts = {
    poi: cleanOsm(details.amenity || details.shop || details.office || details.tourism || details.leisure || details.railway || details.aeroway || details.historic || details.station || details.healthcare || ''),
    country: details.country || '',
    country_code: cc,
    postcode: details.postcode || '',
    state: details.state || details.province || details.region || details.department || details.governorate || details.emirate || '',
    city: effectiveCity,
    district: effectiveDistrict,
    subdistrict: details.subdistrict || details.suburb || details.neighbourhood || details.quarter || details.colonia || details.bairro || details.hamlet || '',
    suburb: details.suburb || details.hamlet || details.colonia || details.bairro || '',
    road: details.road || details.street || details.square || details.avenue || details.place || '',
    house_number: details.house_number || details.houseNumber || '',
    building: cleanOsm(details.building || details.organization || details.flats || '')
  };

  return {
    country_code: parts.country_code,
    country: parts.country,
    state: parts.state,
    city: parts.city,
    district: parts.district,
    subdistrict: parts.subdistrict,
    suburb: parts.suburb,
    road: parts.road,
    house_number: parts.house_number,
    building: parts.building,
    postcode: parts.postcode,
    poi: parts.poi
  };
}

export class AddressRenderer {
  static render(tab: string, data: CanonicalAddress): string {
    const canonical = this.normalizeCanonical(data);
    if (tab === 'intl_en') {
      return this.renderInternationalEnglish(canonical);
    }
    return this.renderByLanguage(tab, canonical);
  }

  private static normalizeCanonical(data: CanonicalAddress): CanonicalAddress {
    const result = { ...data };
    Object.keys(result).forEach(key => {
      const k = key as keyof CanonicalAddress;
      if (typeof result[k] === 'string') {
        result[k] = normalizeUnicode(result[k] as string);
      }
    });
    return result;
  }

  private static renderByLanguage(lang: string, data: CanonicalAddress): string {
    const isEnglish = lang.startsWith('en') || lang === 'international' || lang === 'romaji';
    const c = data.country_code;

    if (c === 'CN') {
      return isEnglish ? renderInternationalCN(data) : renderDomesticCN(data);
    }
    if (c === 'TW') return renderTW(data, lang);
    if (c === 'HK') return renderHK(data, lang);
    if (c === 'MO') return renderMO(data, lang);

    if (c === 'JP' && isEnglish) {
      return this.renderJapanEnglish(data);
    }

    if (c === 'US' && (lang === 'international' || lang === 'intl_en')) {
      return this.renderUSInternationalEnglish(data);
    }

    if (c === 'CA' && (lang === 'international' || lang === 'intl_en' || isEnglish)) {
      return this.renderCanadaEnglish(data);
    }

    if (c === 'MX' && (lang === 'international' || lang === 'intl_en' || isEnglish)) {
      return this.renderMexicoEnglish(data);
    }

    if (c === 'GB' && (lang === 'international' || lang === 'intl_en' || isEnglish)) {
      return this.renderUKEnglish(data);
    }

    if (['FR', 'DE', 'IT', 'ES'].includes(c) && (lang === 'international' || lang === 'intl_en' || isEnglish)) {
      return this.renderEuropeanMajorEnglish(c, data);
    }

    if (['AT', 'BE', 'CH', 'FI', 'IE', 'PL', 'RU', 'UA'].includes(c) && (lang === 'international' || lang === 'intl_en' || isEnglish)) {
      return this.renderEuropeanExtendedEnglish(c, data);
    }

    if (AMERICAS_COUNTRY_CODES.has(c)) {
      return this.renderAmericas(c, data, lang);
    }

    if (OCEANIA_COUNTRY_CODES.has(c)) {
      return this.renderOceania(c, data, lang);
    }

    const isEastAsian = ['JP', 'KR', 'KP', 'VN', 'HU'].includes(c);
    const anglosphere = [
      'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'PH',
      'JM', 'BS', 'BB', 'GY', 'TT', 'NG', 'GH', 'KE', 'BZ', 'MY',
      'PK', 'BD', 'LK', 'NP', 'MV', 'AG', 'KN', 'LC', 'VC', 'GD'
    ];

    if (isEastAsian && !isEnglish) {
      const parts = [
        data.postcode ? `〒${data.postcode}` : '',
        data.state,
        data.city,
        data.district,
        data.subdistrict,
        data.road,
        data.house_number,
        data.building
      ].filter(Boolean);
      return parts.join(c === 'JP' ? '' : ' ');
    }

    if (isEnglish && anglosphere.includes(c)) {
      return this.renderDomesticEnglish(data);
    }

    const roadFirst = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI'].includes(c);
    const t = (val: string) => isEnglish ? (val ? transliterate(val, c.toLowerCase()) : '') : val;

    const line1 = roadFirst
      ? `${t(data.road)} ${t(data.house_number)}`.trim()
      : `${t(data.house_number)} ${t(data.road)}`.trim();

    const parts = [
      t(data.poi),
      t(data.building),
      line1,
      t(data.subdistrict),
      t(data.city),
      t(data.state),
      data.postcode
    ].filter(Boolean);

    return parts.join(', ');
  }

  private static renderAmericas(country: string, data: CanonicalAddress, lang: string): string {
    const isEnglish = lang.startsWith('en') || lang === 'international' || lang === 'romaji';
    const t = (val: string) => isEnglish ? (val ? transliterate(val, country.toLowerCase()) : '') : val;

    const englishDomesticStyle = new Set([
      'US', 'CA', 'BZ', 'JM', 'BS', 'BB', 'GY', 'TT', 'AG', 'KN', 'LC', 'VC', 'GD', 'AI', 'BM', 'KY', 'VG', 'TC', 'MS', 'PR'
    ]);
    const spanishStyle = new Set(['MX', 'CO', 'AR', 'CL', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'PA', 'CR', 'NI', 'HN', 'SV', 'GT', 'DO', 'CU', 'PR', 'GQ']);
    const portugueseStyle = new Set(['BR']);
    const frenchStyle = new Set(['GF', 'GP', 'MQ', 'BL', 'MF', 'PM', 'HT']);

    if (country === 'US' && (lang === 'international' || lang === 'intl_en')) {
      return this.renderUSInternationalEnglish(data);
    }

    if (country === 'CA' && isEnglish) {
      return this.renderCanadaEnglish(data);
    }

    if (country === 'MX' && isEnglish) {
      return this.renderMexicoEnglish(data);
    }

    if (country === 'GB' && isEnglish) {
      return this.renderUKEnglish(data);
    }

    if (['FR', 'DE', 'IT', 'ES'].includes(country) && isEnglish) {
      return this.renderEuropeanMajorEnglish(country, data);
    }

    if (['AT', 'BE', 'CH', 'FI', 'IE', 'PL', 'RU', 'UA'].includes(country) && isEnglish) {
      return this.renderEuropeanExtendedEnglish(country, data);
    }

    if (isEnglish && englishDomesticStyle.has(country)) {
      return this.renderDomesticEnglish(data);
    }

    let housePart = t(data.house_number);
    const roadPart = t(data.road);

    if (country === 'CO' && housePart && !housePart.includes('#') && /^\d/.test(housePart)) {
      housePart = `# ${housePart}`;
    }

    const line1 = spanishStyle.has(country) || portugueseStyle.has(country)
      ? `${roadPart} ${housePart}`.trim()
      : `${housePart} ${roadPart}`.trim();

    const neighborhood = t(data.subdistrict || data.suburb || data.district);
    const cityLine = frenchStyle.has(country)
      ? [t(data.postcode), t(data.city)].filter(Boolean).join(' ')
      : t(data.city);

    const parts = [
      t(data.poi),
      t(data.building),
      line1,
      neighborhood,
      cityLine,
      t(data.state),
      data.postcode,
      isEnglish && !englishDomesticStyle.has(country) ? country.toUpperCase() : ''
    ].filter(Boolean);

    return parts.join(', ');
  }

  private static renderUSInternationalEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, 'us') : '';
    const streetLine = [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();
    const cityLine = [t(data.city), t(data.state), data.postcode].filter(Boolean).join(' ');

    const parts = [
      t(data.poi),
      t(data.building),
      streetLine,
      t(data.subdistrict || data.suburb || data.district),
      cityLine,
      'UNITED STATES OF AMERICA'
    ].filter(Boolean);

    return parts.join('\n');
  }

  private static renderCanadaEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, 'ca') : '';
    const streetLine = [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();
    const cityLine = [t(data.city), t(data.state), data.postcode].filter(Boolean).join(' ');

    const parts = [
      t(data.poi),
      t(data.building),
      streetLine,
      cityLine,
      'CANADA'
    ].filter(Boolean);

    return parts.join('\n');
  }

  private static renderMexicoEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, 'mx') : '';
    const streetLine = [t(data.road), t(data.house_number)].filter(Boolean).join(' ').trim();
    const cityLine = [data.postcode, t(data.city), t(data.state)].filter(Boolean).join(' ');

    const parts = [
      t(data.poi),
      t(data.building),
      streetLine,
      t(data.subdistrict || data.suburb || data.district),
      cityLine,
      'MEXICO'
    ].filter(Boolean);

    return parts.join('\n');
  }

  private static renderUKEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, 'gb') : '';
    const line1 = [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();

    const parts = [
      t(data.poi),
      t(data.building),
      line1,
      t(data.subdistrict || data.suburb),
      t(data.city),
      data.postcode,
      'UNITED KINGDOM'
    ].filter(Boolean);

    return parts.join('\n');
  }

  private static renderEuropeanMajorEnglish(country: string, data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, country.toLowerCase()) : '';
    const streetFirstCountries = new Set(['DE', 'IT', 'ES']);
    const line1 = streetFirstCountries.has(country)
      ? [t(data.road), t(data.house_number)].filter(Boolean).join(' ').trim()
      : [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();

    const line2 = country === 'FR'
      ? [data.postcode, t(data.city)].filter(Boolean).join(' ')
      : [data.postcode, t(data.city), country === 'IT' || country === 'ES' ? t(data.state) : ''].filter(Boolean).join(' ');

    const countryName = country === 'FR' ? 'FRANCE' : country === 'DE' ? 'GERMANY' : country === 'IT' ? 'ITALY' : 'SPAIN';

    const parts = [
      t(data.poi),
      t(data.building),
      line1,
      line2,
      countryName
    ].filter(Boolean);

    return parts.join('\n');
  }

  private static renderEuropeanExtendedEnglish(country: string, data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, country.toLowerCase()) : '';

    const line1 = ['AT', 'BE', 'CH', 'FI'].includes(country)
      ? [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim()
      : [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();

    const line2 = ['AT', 'BE', 'CH', 'FI'].includes(country)
      ? [data.postcode, t(data.city)].filter(Boolean).join(' ')
      : country === 'IE'
        ? t(data.city)
        : ['PL', 'RU', 'UA'].includes(country)
          ? t(data.city)
          : t(data.city);

    const countryName = country === 'AT' ? 'AUSTRIA'
      : country === 'BE' ? 'BELGIUM'
      : country === 'CH' ? 'SWITZERLAND'
      : country === 'FI' ? 'FINLAND'
      : country === 'IE' ? 'IRELAND'
      : country === 'PL' ? 'POLAND'
      : country === 'RU' ? 'RUSSIA'
      : 'UKRAINE';

    const parts = country === 'IE'
      ? [
          t(data.poi),
          t(data.building),
          line1,
          t(data.city),
          t(data.state),
          data.postcode,
          countryName
        ]
      : ['PL', 'RU', 'UA'].includes(country)
        ? [
            t(data.poi),
            t(data.building),
            line1,
            t(data.city),
            t(data.state),
            data.postcode,
            countryName
          ]
        : [
            t(data.poi),
            t(data.building),
            line1,
            line2,
            countryName
          ];

    return parts.filter(Boolean).join('\n');
  }

  private static renderOceania(country: string, data: CanonicalAddress, lang: string): string {
    const isEnglish = lang.startsWith('en') || lang === 'international' || lang === 'romaji';
    const t = (val: string) => isEnglish ? (val ? transliterate(val, country.toLowerCase()) : '') : val;

    const englishDomesticStyle = new Set(['AU', 'NZ']);
    const usStyle = new Set(['AS', 'GU', 'MP']);
    const frenchStyle = new Set(['NC', 'PF', 'WF']);
    const islandNoPostal = new Set(['FJ', 'PG', 'SB', 'VU', 'WS', 'TO', 'TV', 'KI', 'MH', 'FM', 'PW', 'NR', 'CK', 'NU', 'TK', 'NF', 'CX', 'CC', 'PN']);

    const organization = t(data.poi || data.building);
    const streetLine = [t(data.house_number), t(data.road)].filter(Boolean).join(' ').trim();
    const locality = t(data.subdistrict || data.suburb || data.city);
    const city = t(data.city);
    const state = t(data.state);
    const postcode = t(data.postcode);

    if (isEnglish && englishDomesticStyle.has(country)) {
      const parts = [
        organization,
        streetLine,
        country === 'AU' ? locality : t(data.suburb),
        country === 'AU' ? [state, postcode].filter(Boolean).join(' ') : [city, postcode].filter(Boolean).join(' ')
      ].filter(Boolean);
      return parts.join(', ');
    }

    if (isEnglish && usStyle.has(country)) {
      const parts = [
        organization,
        streetLine,
        t(data.suburb),
        city,
        state,
        postcode,
        country.toUpperCase()
      ].filter(Boolean);
      return parts.join(', ');
    }

    if (frenchStyle.has(country)) {
      const countryName = country === 'NC' ? 'New Caledonia' : country === 'PF' ? 'French Polynesia' : 'Wallis and Futuna';
      const parts = [
        organization,
        streetLine,
        [postcode, city].filter(Boolean).join(' '),
        t(data.state),
        isEnglish ? countryName : t(countryName)
      ].filter(Boolean);
      return parts.join(', ');
    }

    if (islandNoPostal.has(country)) {
      const parts = [
        organization,
        streetLine,
        locality,
        city,
        state,
        postcode,
        isEnglish ? country.toUpperCase() : t(data.country)
      ].filter(Boolean);
      return parts.join(', ');
    }

    const parts = [
      organization,
      streetLine,
      locality,
      city,
      state,
      postcode,
      isEnglish ? country.toUpperCase() : t(data.country)
    ].filter(Boolean);

    return parts.join(', ');
  }

  private static renderDomesticEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, data.country_code.toLowerCase()) : '';
    const parts = [
      t(data.poi),
      t(data.building),
      `${t(data.house_number)} ${t(data.road)}`.trim(),
      t(data.subdistrict || data.suburb),
      t(data.city),
      t(data.state),
      data.postcode
    ].filter(Boolean);
    return parts.join(', ');
  }

  private static renderInternationalEnglish(data: CanonicalAddress): string {
    if (data.country_code === 'JP') {
      return this.renderJapanEnglish(data);
    }

    const t = (val: string) => val ? transliterate(val, data.country_code.toLowerCase()) : '';
    const parts = [
      t(data.building),
      `${t(data.house_number)} ${t(data.road)}`.trim(),
      t(data.subdistrict),
      t(data.city),
      t(data.state),
      data.postcode,
      data.country.toUpperCase()
    ].filter(Boolean);

    const text = parts.join(', ').replace(/,\s*,/g, ',');
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');
  }

  private static renderJapanEnglish(data: CanonicalAddress): string {
    const t = (val: string) => val ? transliterate(val, 'jp') : '';
    const addressLine = [t(data.subdistrict), t(data.road), t(data.house_number)].filter(Boolean).join(' ');
    const cityLine = [t(data.city), t(data.state), data.postcode].filter(Boolean).join(' ');

    const parts = [
      t(data.poi),
      t(data.building),
      addressLine,
      cityLine,
      'JAPAN'
    ].filter(Boolean);

    return parts.join('\n');
  }

  static renderCarrier(data: CanonicalAddress): string {
    const canonical = this.normalizeCanonical(data);
    let text = this.renderInternationalEnglish(canonical);
    text = applyShippingAbbreviations(text);
    return text.toUpperCase();
  }
}
