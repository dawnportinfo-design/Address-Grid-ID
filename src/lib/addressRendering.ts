
import { transliterate } from './transliteration';
import { applyShippingAbbreviations } from './addressUtils';
import {
  normalizeEnglishAddressBuildingName,
  normalizeEnglishAddressPart,
  renderDomesticEnglishPostalAddress,
  renderEnglishPostalAddress,
} from './addressEnglish';
import { isEnglishAddressCountry } from './languageTabs';
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
  const source = details?.address_analysis?.canonical
    ? { ...details, ...details.address_analysis.canonical }
    : details;
  const parts = {
    poi: source.amenity || source.shop || source.office || source.tourism || source.leisure || source.railway || source.aeroway || source.historic || source.station || source.healthcare || source.poi || "",
    country: source.country || "",
    country_code: (source.country_code || "").toUpperCase(),
    postcode: source.postcode || "",
    state: source.state || source.province || source.region || source.department || source.governorate || source.emirate || "",
    city: source.city || source.town || source.village || source.municipality || "",
    district: source.city_district || source.district || source.county || source.subdivision || "",
    subdistrict: source.subdistrict || source.suburb || source.neighbourhood || source.quarter || source.colonia || source.bairro || source.hamlet || "",
    suburb: source.suburb || source.hamlet || source.colonia || source.bairro || "",
    road: source.road || source.street || source.square || source.avenue || source.place || "",
    house_number: source.house_number || source.houseNumber || "",
    building: source.building || source.organization || source.flats || ""
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
      const isRoadFirst = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI'].includes(data.country_code);
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

  static renderCarrier(data: CanonicalAddress): string {
    return this.renderInternationalShippingEnglish(data);
  }
}
