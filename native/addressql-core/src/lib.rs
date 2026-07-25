//! Pure Rust AddressQL core.
//!
//! This crate intentionally avoids PostgreSQL, PostGIS, network, and hosted API
//! dependencies. Adapters are responsible for rendering these structs as JSONB,
//! BSON, protobuf, HTTP, or SDK-native objects.

pub mod fixtures;
pub mod model;

use fixtures::{COUNTRY_PROFILES, POSTAL_AREAS, SOURCE_VERSION};
use model::{
    AddressMatchDecision, CountryProfile, CountryResolution, DeliveryAvailability,
    DistanceEstimate, NormalizedAddress, PostalArea, PostalEquivalent, PostalStatus,
    PostalValidation,
};

pub const ADDRESSQL_CORE_VERSION: &str = "addressql-core-v0.2";

pub fn clean_text(input: &str) -> String {
    input.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn normalize_country(input: &str) -> String {
    clean_text(input).to_ascii_uppercase()
}

pub fn country_address_profile(country_code: &str) -> Option<&'static CountryProfile> {
    let country = normalize_country(country_code);
    COUNTRY_PROFILES
        .iter()
        .find(|profile| profile.country_code == country.as_str())
}

pub fn country_profile(country_code: &str) -> Option<&'static CountryProfile> {
    country_address_profile(country_code)
}

pub fn country_resolve(country_input: &str) -> CountryResolution {
    let input = clean_text(country_input);
    let input_lower = input.to_lowercase();

    if let Some(profile) = COUNTRY_PROFILES.iter().find(|profile| {
        profile.country_code.eq_ignore_ascii_case(&input)
            || profile.country_name.eq_ignore_ascii_case(&input)
            || profile
                .native_name
                .map(|name| name.eq_ignore_ascii_case(&input))
                .unwrap_or(false)
            || profile
                .aliases
                .iter()
                .any(|alias| alias.to_lowercase() == input_lower)
    }) {
        return CountryResolution {
            input,
            country_code: profile.country_code.to_string(),
            confidence: 1.0,
            source_version: SOURCE_VERSION,
            warnings: vec![],
            non_claims: vec!["Country resolution is not sovereignty adjudication."],
        };
    }

    CountryResolution {
        country_code: normalize_country(&input),
        input,
        confidence: 0.2,
        source_version: SOURCE_VERSION,
        warnings: vec!["country_not_found_in_source_version"],
        non_claims: vec!["Country resolution is not sovereignty adjudication."],
    }
}

pub fn postal_status(country_code: &str) -> PostalStatus {
    country_address_profile(country_code)
        .map(|profile| profile.postal_status)
        .unwrap_or(PostalStatus::Unknown)
}

pub fn postal_normalize(postal_code: &str, country_code: &str) -> String {
    let country = normalize_country(country_code);
    let mut normalized = clean_text(postal_code).to_ascii_uppercase();

    if country == "JP" {
        let digits: String = normalized.chars().filter(|ch| ch.is_ascii_digit()).collect();
        if digits.len() == 7 {
            normalized = format!("{}-{}", &digits[0..3], &digits[3..7]);
        }
    }

    normalized
}

pub fn postal_lookup(postal_code: &str, country_code: &str) -> Vec<&'static PostalArea> {
    let country = normalize_country(country_code);
    let postal = postal_normalize(postal_code, &country);
    POSTAL_AREAS
        .iter()
        .filter(|area| area.country_code == country.as_str() && area.postal_code == postal.as_str())
        .collect()
}

pub fn postal_format_validate(postal_code: Option<&str>, country_code: &str) -> bool {
    let country = normalize_country(country_code);
    let profile = country_address_profile(&country);
    let postal = postal_code.map(|code| postal_normalize(code, &country)).unwrap_or_default();

    match profile {
        Some(profile) if profile.postal_status == PostalStatus::None => postal.is_empty(),
        Some(profile) if profile.postal_required_default && postal.is_empty() => false,
        Some(profile) if postal.is_empty() => true,
        Some(profile) => profile
            .postal_pattern
            .map(|pattern| pattern.matches(&postal))
            .unwrap_or(!profile.postal_required_default),
        None => false,
    }
}

pub fn postal_exists(postal_code: &str, country_code: &str) -> Option<bool> {
    let country = normalize_country(country_code);
    let profile = country_address_profile(&country)?;
    if profile.postal_status == PostalStatus::None {
        return None;
    }
    if postal_code.is_empty() {
        return None;
    }
    Some(!postal_lookup(postal_code, &country).is_empty())
}

pub fn postal_validate(postal_code: Option<&str>, country_code: &str) -> PostalValidation {
    let country = normalize_country(country_code);
    let profile = country_address_profile(&country);
    let postal = postal_code.map(|code| postal_normalize(code, &country)).unwrap_or_default();
    let mut warnings = Vec::new();
    let format_valid = postal_format_validate(postal_code, &country);
    let exists = postal_exists(&postal, &country);

    let validation_scope = match profile {
        Some(profile) if profile.postal_status == PostalStatus::None => "postal_equivalent_required",
        Some(profile) if profile.postal_pattern.is_some() && exists.is_some() => "format_and_existence",
        Some(profile) if profile.postal_pattern.is_some() => "format_only",
        Some(_) => "policy_only",
        None => "country_profile_missing",
    };

    let valid = match profile {
        Some(profile) if profile.postal_status == PostalStatus::None && postal.is_empty() => true,
        Some(profile) if profile.postal_status == PostalStatus::None => {
            warnings.push("country_has_no_postal_code_system");
            warnings.push("postal_equivalent_required");
            false
        }
        Some(profile) if profile.postal_required_default && postal.is_empty() => {
            warnings.push("postal_required_but_missing");
            false
        }
        Some(_) if !format_valid => false,
        Some(_) if exists == Some(false) => false,
        Some(_) => true,
        None => {
            warnings.push("country_profile_missing");
            false
        }
    };

    let region_hint = postal_lookup(&postal, &country)
        .first()
        .map(|area| area.region_ref);

    if exists == Some(false) {
        warnings.push("postal_code_not_found_in_fixture");
    } else if region_hint.is_none() && !postal.is_empty() {
        warnings.push("postal_area_not_found_or_not_required");
    }

    PostalValidation {
        valid,
        format_valid,
        exists,
        validation_scope,
        postal_code: postal,
        country,
        region_hint,
        source_version: SOURCE_VERSION,
        warnings,
        non_claims: vec!["Postal validity is not full address identity."],
    }
}

pub fn postal_equivalent(region_ref: Option<&str>, country_code: &str) -> PostalEquivalent {
    let country = normalize_country(country_code);
    let region = region_ref
        .map(clean_text)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| format!("agid-country-{}-postal-equivalent", country.to_lowercase()));

    PostalEquivalent {
        region_ref: region,
        country,
        confidence: 0.6,
        source_version: SOURCE_VERSION,
        non_claims: vec!["Postal-equivalent regions are fallback operational regions, not official postal codes."],
    }
}

pub fn address_normalize(address_text: &str, country_code: &str) -> NormalizedAddress {
    NormalizedAddress {
        normalized_text: clean_text(address_text),
        country: normalize_country(country_code),
        locale: "und",
        source_version: SOURCE_VERSION,
        warnings: vec![],
        non_claims: vec!["Normalization is not referent resolution."],
    }
}

pub fn address_match(
    address_a: &NormalizedAddress,
    address_b: &NormalizedAddress,
    purpose: &str,
) -> AddressMatchDecision {
    let same_text = address_a
        .normalized_text
        .eq_ignore_ascii_case(&address_b.normalized_text);
    let same_country = address_a.country.is_empty()
        || address_b.country.is_empty()
        || address_a.country == address_b.country;
    let is_match = !address_a.normalized_text.is_empty() && same_text && same_country;

    AddressMatchDecision {
        is_match,
        confidence: if is_match { 0.95 } else { 0.25 },
        purpose: clean_text(purpose),
        source_version: SOURCE_VERSION,
        non_claims: vec!["A match decision is purpose-relative and not proof of residence."],
    }
}

pub fn address_distance_km(lat_a: f64, lon_a: f64, lat_b: f64, lon_b: f64) -> DistanceEstimate {
    if !is_valid_lat_lon(lat_a, lon_a) || !is_valid_lat_lon(lat_b, lon_b) {
        return DistanceEstimate {
            distance_km: None,
            metric: "haversine",
            confidence: 0.0,
            source_version: SOURCE_VERSION,
            warnings: vec!["invalid_coordinates"],
            non_claims: vec!["Distance is metric-dependent and not route availability."],
        };
    }

    let lat_a_rad = lat_a.to_radians();
    let lat_b_rad = lat_b.to_radians();
    let delta_lat = (lat_b - lat_a).to_radians();
    let delta_lon = (lon_b - lon_a).to_radians();
    let h = (delta_lat / 2.0).sin().powi(2)
        + lat_a_rad.cos() * lat_b_rad.cos() * (delta_lon / 2.0).sin().powi(2);
    let km = 2.0 * 6371.0088 * h.sqrt().min(1.0).asin();

    DistanceEstimate {
        distance_km: Some(km),
        metric: "haversine",
        confidence: 0.75,
        source_version: SOURCE_VERSION,
        warnings: vec![],
        non_claims: vec!["Distance is metric-dependent and not route availability."],
    }
}

pub fn delivery_available(
    country_code: &str,
    postal_code: Option<&str>,
    carrier: &str,
    service_level: &str,
) -> DeliveryAvailability {
    let country = normalize_country(country_code);
    let profile = country_address_profile(&country);
    let validation = postal_validate(postal_code, &country);
    let mut reasons = Vec::new();
    let mut available = true;

    if profile.is_none() {
        available = false;
        reasons.push("country_profile_missing");
    }

    if profile
        .map(|profile| profile.postal_required_default)
        .unwrap_or(false)
        && !validation.valid
    {
        available = false;
        reasons.push("postal_required_but_invalid_or_missing");
    }

    DeliveryAvailability {
        available,
        carrier: clean_text(carrier),
        service_level: clean_text(service_level),
        reasons,
        source_version: SOURCE_VERSION,
        non_claims: vec!["Deliverability is not proof of residence or identity."],
    }
}

fn is_valid_lat_lon(lat: f64, lon: f64) -> bool {
    lat.is_finite() && lon.is_finite() && (-90.0..=90.0).contains(&lat) && (-180.0..=180.0).contains(&lon)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn country_resolution_handles_aliases_without_postgres() {
        let jp = country_resolve("Nihon");
        assert_eq!(jp.country_code, "JP");
        assert_eq!(jp.confidence, 1.0);

        let unknown = country_resolve("zz");
        assert_eq!(unknown.country_code, "ZZ");
        assert!(unknown.warnings.contains(&"country_not_found_in_source_version"));
    }

    #[test]
    fn postal_functions_support_official_and_no_postal_countries() {
        assert_eq!(postal_status("JP").as_str(), "official");
        assert_eq!(postal_status("HK").as_str(), "none");
        assert_eq!(postal_normalize("1000001", "JP"), "100-0001");

        let jp = postal_validate(Some("1000001"), "JP");
        assert!(jp.valid);
        assert!(jp.format_valid);
        assert_eq!(jp.exists, Some(true));
        assert_eq!(jp.validation_scope, "format_and_existence");
        assert_eq!(jp.region_hint, Some("agid-jp-tokyo-chiyoda-chiyoda"));

        let missing = postal_validate(Some("9999999"), "JP");
        assert!(!missing.valid);
        assert!(missing.format_valid);
        assert_eq!(missing.exists, Some(false));
        assert!(missing.warnings.contains(&"postal_code_not_found_in_fixture"));

        let hk = postal_validate(None, "HK");
        assert!(hk.valid);
        assert_eq!(hk.validation_scope, "postal_equivalent_required");

        let hk_fake = postal_validate(Some("00000"), "HK");
        assert!(!hk_fake.valid);
        assert!(!hk_fake.format_valid);
        assert_eq!(hk_fake.exists, None);
    }

    #[test]
    fn address_functions_are_pure_and_source_versioned() {
        let a = address_normalize(" Synthetic   US Fixture   Street ", "us");
        let b = address_normalize("Synthetic US Fixture Street", "US");
        let decision = address_match(&a, &b, "delivery");

        assert_eq!(a.normalized_text, "Synthetic US Fixture Street");
        assert_eq!(a.country, "US");
        assert!(decision.is_match);
        assert_eq!(decision.source_version, SOURCE_VERSION);
    }

    #[test]
    fn distance_and_delivery_are_advisory_not_identity() {
        let distance = address_distance_km(35.6852, 139.7528, 37.7936, -122.3958);
        assert!(distance.distance_km.unwrap() > 8000.0);
        assert!(distance.non_claims[0].contains("not route availability"));

        let hk = delivery_available("HK", None, "synthetic_carrier", "standard");
        assert!(hk.available);
        assert!(hk.non_claims[0].contains("not proof of residence"));
    }
}
