
import { transliterate } from './transliteration';
import { applyShippingAbbreviations } from './addressUtils';
import {
  normalizeEnglishAddressBuildingName,
  normalizeEnglishAddressPart,
  renderDomesticEnglishPostalAddress,
  renderEnglishPostalAddress,
  renderStreetAddressLine,
  uniqueAddressParts,
  countryName,
} from './addressEnglish';
import { mergeOpenSourceAddressEvidence } from './addressEvidence';
import { isEnglishAddressCountry, isInternationalShippingEnglishTab } from './languageTabs';
import { 
  renderDomesticCN, 
  renderInternationalCN, 
  renderTW, 
  renderHK, 
  renderMO,
  toSimplified, 
  toTraditional 
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
  plus_code?: string;
}

/**
 * Unicode Normalization for Addresses
 */
export function normalizeUnicode(text: string): string {
  if (!text) return "";
  return text
    .normalize('NFKC') // Compatibility Decomposition, then Canonical Composition (handles fullwidth etc)
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[\u3000\s]+/g, " ")
    .trim();
}

/**
 * Creates a Canonical Address object from raw API details
 */
export function createCanonicalAddress(details: any): CanonicalAddress {
  const safeDetails = details && typeof details === 'object' ? details : {};
  const source = safeDetails?.address_analysis?.canonical
    ? { ...safeDetails, ...safeDetails.address_analysis.canonical }
    : safeDetails;
  const parts = {
    poi: source.amenity || source.shop || source.office || source.tourism || source.leisure || source.railway || source.aeroway || source.historic || source.station || source.healthcare || source.poi || "",
    country: source.country || "",
    country_code: (source.country_code || "").toUpperCase(),
    postcode: source.postcode || source.postal_code || source.zip || "",
    state: source.state || source.province || source.region || source.department || source.governorate || source.emirate || "",
    city: source.city || source.town || source.village || source.municipality || "",
    district: source.city_district || source.district || source.county || source.subdivision || "",
    subdistrict: source.subdistrict || source.suburb || source.neighbourhood || source.quarter || source.colonia || source.bairro || source.hamlet || "",
    suburb: source.suburb || source.hamlet || source.colonia || source.bairro || "",
    road: source.road || source.street || source.square || source.avenue || source.place || "",
    house_number: source.house_number || source.houseNumber || "",
    building: source.building || source.building_name || source.organization || source.flats || "",
    plus_code: source.plus_code?.global_code || source.plus_code?.plus_code || source.plus_code || "",
  };
  const { address: mergedParts } = mergeOpenSourceAddressEvidence(parts, details);

  return {
    country_code: mergedParts.country_code,
    country: mergedParts.country,
    state: mergedParts.state,
    city: mergedParts.city,
    district: mergedParts.district,
    subdistrict: mergedParts.subdistrict,
    suburb: mergedParts.suburb,
    road: mergedParts.road,
    house_number: mergedParts.house_number,
    building: mergedParts.building,
    postcode: mergedParts.postcode,
    poi: mergedParts.poi,
    plus_code: mergedParts.plus_code,
  };
}

const meaningfulAddressTextPattern =
  /[A-Za-zÀ-ž\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0370-\u03ff\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u0e00-\u0e7f]/;

const comparableAddressPart = (value: string) =>
  normalizeUnicode(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();

function meaningfulAddressContextPart(value: string, country: string) {
  const cleaned = normalizeUnicode(value).replace(/^[,，、]\s*|,\s*$/g, '').trim();
  if (!cleaned) return '';

  const comparable = comparableAddressPart(cleaned);
  const comparableCountry = comparableAddressPart(country);
  if (comparableCountry && comparable === comparableCountry) return cleaned;
  if (/^\d+[a-z]?$/.test(comparable)) return '';
  return meaningfulAddressTextPattern.test(cleaned) ? cleaned : '';
}

/**
 * Address Rendering Engine for International Shipping
 */
export class AddressRenderer {
  
  /**
   * Main entry point for rendering an address based on specific tab/context
   */
  static render(tab: string, data: CanonicalAddress): string {
    const canonical = this.normalizeCanonical(data);
    
    // Check if it's the specialized International English tab
    if (tab === 'intl_en') {
      return this.renderInternationalEnglish(canonical);
    }
    
    // Otherwise render by language code
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

  /**
   * Renders address based on the specified language code
   */
  private static renderByLanguage(lang: string, data: CanonicalAddress): string {
    const isEnglish = lang.startsWith('en') || lang === 'international' || lang === 'romaji';
    const c = data.country_code;

    // Specialized Logic for Greater China (as requested)
    if (c === 'CN') {
      if (isEnglish) return renderInternationalCN(data);
      return renderDomesticCN(data);
    }
    
    if (c === 'TW') {
      return renderTW(data, lang);
    }
    
    if (c === 'HK' && isEnglish && lang === 'en_domestic') {
      return this.renderDomesticEnglish(data);
    }

    if (c === 'HK') {
      return renderHK(data, lang);
    }

    if (c === 'MO') {
      return renderMO(data, lang);
    }

    // Specialized Logic for Latin America (Hispanosphere / Lusosphere)
    if (c === 'CO' || c === 'MX' || c === 'AR' || c === 'CL' || c === 'BR') {
      return this.renderLATAM(c, data, lang);
    }

    if (isEnglish && !isEnglishAddressCountry(c)) {
      return this.renderInternationalEnglish(data);
    }

    const isEastAsian = ['JP', 'KR', 'KP', 'VN', 'HU'].includes(c);
    
    // If it's English domestic inside an Inner/Outer Circle English address market.
    if (isEnglish && isEnglishAddressCountry(c)) {
      return this.renderDomesticEnglish(data);
    }

    if (isEastAsian && !isEnglish) {
      // Big-to-Small for East Asian languages
      const parts = [
        data.postcode ? `〒${data.postcode}` : "",
        data.state,
        data.city,
        data.district,
        data.subdistrict,
        data.road,
        data.house_number,
        data.building
      ].filter(Boolean);
      return parts.join(data.country_code === 'JP' ? "" : " ");
    } else {
      // Small-to-Big for others
      const isRoadFirst = [
        'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI',
        'CH', 'LU', 'CY', 'BA',
      ].includes(data.country_code);
      const t = (val: string) => isEnglish ? normalizeEnglishAddressPart(val, data.country_code) : val;
      const tb = (val: string) => isEnglish ? normalizeEnglishAddressBuildingName(val, data.country_code) : val;

      const line1 = isRoadFirst 
        ? `${t(data.road)} ${t(data.house_number)}`.trim()
        : `${t(data.house_number)} ${t(data.road)}`.trim();

      const parts = [
        tb(data.building),
        line1,
        t(data.subdistrict),
        t(data.city),
        t(data.state),
        data.postcode
      ].filter(Boolean);
      
      // Don't include country name in domestic view (except maybe for English intl)
      return parts.join(", ");
    }
  }

  /**
   * Specialized Rendering for Latin American countries
   */
  private static renderLATAM(country: string, data: CanonicalAddress, lang: string): string {
    const isEnglish = lang.startsWith('en') || lang === 'international' || lang === 'romaji';
    const t = (val: string) => isEnglish ? normalizeEnglishAddressPart(val, country) : val;
    const tb = (val: string) => isEnglish ? normalizeEnglishAddressBuildingName(val, country) : val;

    let housePart = t(data.house_number);
    let roadPart = t(data.road);
    
    // Colombia specific: Add # separator if it's a grid coordinate pattern
    if (country === 'CO' && housePart && !housePart.includes('#') && /^\d/.test(housePart)) {
      housePart = `# ${housePart}`;
    }

    const line1 = `${roadPart} ${housePart}`.trim();
    
    // Neighborhood is very important in MX (Colonia) and BR (Bairro)
    const neighborhood = t(data.subdistrict || data.suburb);
    
    const parts = [
      tb(data.building),
      line1,
      neighborhood,
      t(data.city),
      t(data.state),
      data.postcode,
      isEnglish ? country.toUpperCase() : ""
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Standard English formatting for domestic use
   */
  private static renderDomesticEnglish(data: CanonicalAddress): string {
    return renderDomesticEnglishPostalAddress(data);
  }

  /**
   * International standard English (Small-to-Big, ASCII, Capitalized Country)
   */
  private static renderInternationalEnglish(data: CanonicalAddress): string {
    return renderEnglishPostalAddress(data);
  }

  static renderInternationalShippingEnglish(data: CanonicalAddress): string {
    const canonical = this.normalizeCanonical(data);
    let text = this.renderInternationalEnglish(canonical);
    text = applyShippingAbbreviations(text);
    return text.toUpperCase();
  }

  static renderPartialAddress(tab: string, data: CanonicalAddress): string {
    const canonical = this.normalizeCanonical(data);
    const isEnglish = tab.startsWith('en') || tab === 'international' || isInternationalShippingEnglishTab(tab);
    const preserveLines = tab === 'shipping_label' || isInternationalShippingEnglishTab(tab);
    const c = canonical.country_code.toUpperCase();
    const t = (value: string) => isEnglish ? normalizeEnglishAddressPart(value, c) : value;
    const tb = (value: string) => isEnglish ? normalizeEnglishAddressBuildingName(value, c) : value;
    const country = isEnglish
      ? countryName(c, t(canonical.country))
      : canonical.country;
    const organization = tb(canonical.building || canonical.poi);
    const street = canonical.road
      ? renderStreetAddressLine(c, t(canonical.road), t(canonical.house_number))
      : '';
    const areaParts = uniqueAddressParts([
      t(canonical.subdistrict || canonical.suburb),
      t(canonical.district),
      t(canonical.city),
      t(canonical.state),
      canonical.postcode,
      country,
    ].map(part => meaningfulAddressContextPart(part, country)));

    const areaLine = areaParts.join(', ');
    const fallbackLines = uniqueAddressParts([
      organization,
      street,
      areaLine,
      !areaLine && canonical.plus_code ? `Plus Code: ${canonical.plus_code}` : '',
    ]);

    if (preserveLines) {
      return fallbackLines
        .map(line => isInternationalShippingEnglishTab(tab) ? line.toUpperCase() : line)
        .join('\n');
    }

    return fallbackLines.join('\n');
  }

  static renderCarrier(data: CanonicalAddress): string {
    return this.renderInternationalShippingEnglish(data);
  }
}
