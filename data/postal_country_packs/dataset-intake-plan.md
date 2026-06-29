# AGID Country Pack Address Dataset Intake

Schema: agid-country-pack-dataset-intake-v0.1
Generated at: 2026-06-29T00:00:00.000Z

This file tracks the address-dataset work needed for AGID country packs. It is
not a raw address database. It is a source, license, fixture, and readiness plan
for safe country-pack production.

## Summary

- Total countries: 67
- P0 countries: 17
- Generated pack countries: 55
- Valid pack countries: 55
- Source-catalog-only countries: 12
- Countries needing normalized official municipality datasets: 48

## P0 Dataset Batch

| Code | Country | Class | Stage | Source readiness | Pack repo |
| --- | --- | --- | --- | --- | --- |
| AE | United Arab Emirates | no-postcode | open-geodata-ready | official-or-open-source-linked | agid-postal-pack-ae |
| AQ | Antarctica | polar | source-catalog-only | official-or-open-source-linked | - |
| AU | Australia | strong-postcode | source-catalog-only | official-or-open-source-linked | - |
| DE | Germany | strong-postcode | source-catalog-only | official-or-open-source-linked | - |
| FJ | Fiji | island | synthetic-planning-fixture | global-fallback-only | agid-postal-pack-fj |
| FR | France | strong-postcode | source-catalog-only | official-or-open-source-linked | - |
| GB | United Kingdom | strong-postcode | source-catalog-only | license-review-required | - |
| GH | Ghana | weak-postcode | source-catalog-only | official-or-open-source-linked | - |
| HK | Hong Kong | no-postcode | open-geodata-ready | official-or-open-source-linked | agid-postal-pack-hk |
| JP | Japan | strong-postcode | source-catalog-only | official-or-open-source-linked | - |
| KE | Kenya | weak-postcode | source-catalog-only | official-or-open-source-linked | - |
| NL | Netherlands | strong-postcode | source-catalog-only | license-review-required | - |
| NZ | New Zealand | strong-postcode | source-catalog-only | license-review-required | - |
| QA | Qatar | no-postcode | open-geodata-ready | official-or-open-source-linked | agid-postal-pack-qa |
| TZ | Tanzania | weak-postcode | source-catalog-only | official-or-open-source-linked | - |
| US | United States | strong-postcode | source-catalog-only | license-review-required | - |
| VU | Vanuatu | island | synthetic-planning-fixture | global-fallback-only | agid-postal-pack-vu |

## Safety Rules

- Do not bundle personal addresses.
- Do not bundle recipient names, phone numbers, AGID-S payloads, proof codes, or
  private AOID bodies.
- Do not bundle raw third-party datasets until redistribution rights are
  recorded in the country pack license ledger.
- Strong-postcode countries use country packs as supplemental validation, not
  replacements for official postal authorities.
- No-postcode countries prioritize AGID planning cells, postal-equivalent
  candidates, and route evidence slots.
