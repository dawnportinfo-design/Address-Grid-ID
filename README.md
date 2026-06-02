# AGID

AGID is an address and location intelligence system built around a deterministic global grid ID. It combines a MapLibre-based map UI, country-aware address registration, multilingual address rendering, open-source postal/geographic evidence, QR registration, and SDK generation for multiple programming languages.

The goal is practical: make land, sea, mountain, waterfront, disputed-area, and building-level locations easier to identify, display, validate, share, and integrate without depending on a single proprietary map provider.

## Project Resume

For a deeper project summary, architecture map, validation strategy, and roadmap, see [Project Resume](docs/project-resume.md).
For the address translation theory behind the native and international-English address tabs, see [Verified Address Translation Theory](docs/verified-address-translation-theory.md).

## Core Capabilities

- **Deterministic AGID grid**: absolute grid positioning based on latitude/longitude, designed to stay stable while panning and zooming.
- **Address registration**: full-screen address registration flow with country/region selection, address-language tabs, postal-code fields, QR generation, and registered-address persistence.
- **Multilingual address rendering**: native-language and international-English address display with country-specific ordering, romanization, and multilingual-country support.
- **Postal and open-source evidence**: postal-code metadata, source classification, confidence display, and fallback behavior for countries with weak or unavailable postal APIs.
- **Building and place names**: OpenStreetMap/OpenFreeMap/Overture-ready building-name lookup and ranking paths for stronger address labels.
- **Sea, natural, and special geography**: support paths for sea names, mountains, waterfronts, natural features, territories, autonomous regions, and disputed regions.
- **GIS validation**: optional open-source validation path using generated GeoJSON, GDAL when available, and QGIS review projects.
- **Drone and navigation planning groundwork**: internal drone landing, corridor, mission package, and navigation services without exposing drone UI by default.
- **Multi-language SDK output**: generated SDK packages under `sdk/` for C, C++, Dart, .NET, Elixir, Go, Java, JavaScript/TypeScript, Julia, Kotlin, Lua, Nim, PHP, Python, R, Rust, Swift, WASM, Zig, and related runtimes.

## Architecture

```text
Map UI / Address UI
        |
        v
Typed frontend services
        |
        v
Express API proxy and validation endpoints
        |
        v
Open-source providers, local metadata, postal datasets, GIS validation
```

Important areas:

- `src/App.tsx`: application shell, map orchestration, QR/search/navigation wiring.
- `src/components/`: focused UI surfaces such as address registration, grid detail, search, saved locations, postal lab, and geo architect panels.
- `src/lib/`: AGID math, address rendering, validation policies, HTTP client, endpoint builders, grid logic, QR payloads, and data-quality helpers.
- `src/services/`: geocoding, routing, communication, drone, navigation, and geo-admin service boundaries.
- `src/data/address_formats/`: country, territory, autonomous-region, disputed-region, and special-location address metadata organized by continent and subregion.
- `src/data/address_hierarchy/`: generated continent-level address hierarchy files.
- `scripts/`: metadata sync, address hierarchy generation, SDK generation, postal-source verification, and GIS validation.
- `docs/`: project resume, GIS validation notes, and refactor/code-quality scans.

## Address Quality Model

AGID separates address accuracy into several layers instead of presenting every result as equally certain:

- **Postal Code Available + Reliable API**: postal-code lookup and strong validation are allowed.
- **Postal Code Available + Weak API**: format validation and candidate suggestions are used, but manual confirmation remains important.
- **No Postal Code + Strong Geo OSS**: AGID, coordinates, administrative hierarchy, and open geographic sources drive a Geo Verified result.
- **No Postal Code + Weak Geo OSS**: AGID and coordinates become the primary identifier and manual confirmation is required.

This policy is implemented in `src/lib/addressCoveragePolicy.ts` and surfaced through address quality summaries and tests.

## Open-Source Data Strategy

AGID uses open-source data as evidence layers:

- Map rendering: MapLibre GL, OpenFreeMap/OpenStreetMap-compatible tiles, PMTiles-ready paths.
- Geometry and analysis: Turf, OpenLayers, generated GeoJSON, optional GDAL/QGIS/PostGIS review paths.
- Geocoding and place labels: OSM/Nominatim-style data, Photon-compatible search, Overpass, OpenFreeMap/Overture-ready building name candidates.
- Postal/address rules: local address-format metadata, libaddressinput/OpenCage-style formatting concepts, official postal APIs when available, and open postal datasets where quality is sufficient.
- Language data: CLDR-based language/country display data, native scripts, and country-specific international-English rendering rules.

The app should treat each source as evidence with a source label, confidence, warnings, and fallback behavior.

## Development

### Requirements

- Node.js 18 or newer
- npm
- Optional: Rust toolchain for the WASM AGID core
- Optional: GDAL and QGIS for GIS validation review

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

The app runs at:

```text
http://localhost:3000
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run lint
```

### GIS Validation

```bash
npm run verify:gis
```

Fast changed-file preflight:

```bash
npm run verify:gis:changed
```

Strict validation:

```bash
npm run verify:gis:strict
```

See [GIS validation](docs/gis-validation.md).

### Postal Source Verification

```bash
npm run verify:postal-sources
```

Live provider checks can be run when network access is available:

```bash
npm run verify:postal-sources:live
```

### Address Metadata Generation

```bash
npm run sync:address-metadata
npm run organize:address-formats
npm run generate:address-format-yaml
npm run generate:address-hierarchy
```

### SDK Generation

```bash
npm run generate:agid-sdks
```

Optional Rust WASM build:

```bash
npm run build:rust-wasm
```

## Current Engineering Strategy

1. Keep AGID grid math deterministic and viewport rendering stable.
2. Keep address registration separate from app language settings and country selection.
3. Prefer typed service boundaries over direct `fetch` calls in UI components.
4. Classify postal/geographic source quality instead of hiding uncertainty.
5. Keep large generated country/address data out of UI components.
6. Split heavy app-shell responsibilities into hooks and service modules one slice at a time.
7. Use tests to prevent regressions in grid rendering, QR registration, address-language compatibility, and data-source policy.

## Validation Snapshot

Recent local checks used during the current refactor pass:

```bash
node --import tsx --test src/App.gridUi.test.ts src/App.registrationQr.test.ts src/components/GridDetailPanel.test.ts src/components/AddressRegistration.test.ts src/lib/refactorGuard.test.ts src/lib/apiEndpoints.test.ts src/services/GeoAdminService.test.ts src/hooks/useAppDatabasePersistence.test.ts
npm run lint
npm run build
```

Build warnings currently remain around large chunks and mixed static/dynamic imports in geocoding services. They are known refactor targets, not runtime blockers.

## License

MIT

## Acknowledgements

AGID builds on open-source geography and web tooling, including MapLibre GL, OpenStreetMap, OpenFreeMap-compatible map delivery, Turf, OpenLayers, CLDR data, PMTiles, Open Location Code, and the broader open GIS ecosystem.
