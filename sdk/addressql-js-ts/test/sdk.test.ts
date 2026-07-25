import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  addressMatch,
  countryAddressProfile,
  countryResolve,
  countryValidationReadiness,
  deliveryAvailable,
  normalizeAddress,
  postalExists,
  postalFormatValidate,
  postalNormalize,
  postalStatus,
  postalValidate,
} from "../src/index";

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

test("AddressQL TypeScript SDK resolves country and postal metadata", () => {
  assert.equal(countryResolve("Nihon").countryCode, "JP");
  assert.equal(postalStatus("HK"), "none");
  assert.equal(countryValidationReadiness("HK"), "postal_equivalent_required");
  assert.equal(countryAddressProfile("JP")?.addressFormatCoverage, "native_and_english_preloaded");
  assert.equal(postalNormalize("1000001", "JP"), "100-0001");
});

test("AddressQL TypeScript SDK validates postal and delivery non-claims", () => {
  const postal = postalValidate("1000001", "JP");
  const missing = postalValidate("9999999", "JP");
  const noPostal = postalValidate("00000", "HK");
  const delivery = deliveryAvailable("HK", "", "synthetic_carrier");

  assert.equal(postal.valid, true);
  assert.equal(postal.formatValid, true);
  assert.equal(postal.exists, true);
  assert.equal(postal.validationScope, "format_and_existence");
  assert.match(postal.nonClaims.join(" "), /not full address identity/);
  assert.equal(missing.valid, false);
  assert.equal(missing.formatValid, true);
  assert.equal(missing.exists, false);
  assert.ok(missing.warnings.includes("postal_code_not_found_in_fixture"));
  assert.equal(noPostal.valid, false);
  assert.equal(noPostal.formatValid, false);
  assert.equal(noPostal.exists, null);
  assert.equal(noPostal.validationScope, "postal_equivalent_required");
  assert.ok(noPostal.warnings.includes("postal_equivalent_required"));
  assert.match(noPostal.nonClaims.join(" "), /Do not invent an official postal code/);
  assert.equal(delivery.available, true);
  assert.match(delivery.nonClaims.join(" "), /not proof of residence/);
});

test("AddressQL TypeScript SDK separates format and existence using CSV fixtures", () => {
  const countryRows = parseCsv(readFileSync("extensions/addressql-duckdb/fixtures/synthetic_country_profiles.csv", "utf8"));
  const postalRows = parseCsv(readFileSync("extensions/addressql-duckdb/fixtures/synthetic_postal_areas.csv", "utf8"));
  const jp = countryRows.find(row => row.country_code === "JP");
  const hk = countryRows.find(row => row.country_code === "HK");
  const jpPostal = postalRows.find(row => row.country_code === "JP" && row.postal_code === "100-0001");

  assert.equal(jp?.validation_readiness, "format_and_postal");
  assert.equal(hk?.validation_readiness, "postal_equivalent_required");
  assert.ok(jpPostal);
  assert.equal(postalFormatValidate(jpPostal?.postal_code, "JP"), true);
  assert.equal(postalExists(jpPostal?.postal_code, "JP"), true);
  assert.equal(postalFormatValidate("999-9999", "JP"), true);
  assert.equal(postalExists("999-9999", "JP"), false);
});

test("AddressQL TypeScript SDK can consume AGID postal pack JSON as no-postcode evidence", () => {
  const hkPack = JSON.parse(readFileSync("data/postal_country_packs/hk/agid-postal-country-pack.json", "utf8"));
  const validation = postalValidate("", hkPack.manifest.countryCode);

  assert.equal(hkPack.manifest.containsPersonalData, false);
  assert.equal(hkPack.manifest.containsRawThirdPartyData, false);
  assert.equal(hkPack.recommendation.tier, "no-or-not-required-postal-code");
  assert.equal(validation.valid, true);
  assert.equal(validation.validationScope, "postal_equivalent_required");
});

test("AddressQL TypeScript SDK keeps matching purpose-relative", () => {
  const a = normalizeAddress("Synthetic US Fixture Street", "US");
  const b = normalizeAddress(" Synthetic   US Fixture   Street ", "US");
  const decision = addressMatch(a, b, "delivery");

  assert.equal(decision.match, true);
  assert.equal(decision.purpose, "delivery");
  assert.match(decision.nonClaims.join(" "), /not proof of residence/);
});
