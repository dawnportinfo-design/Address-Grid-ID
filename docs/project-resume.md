# AGID Project Resume

Last updated: 2026-06-01

## One-Line Summary

AGID is a deterministic global grid and address intelligence platform for displaying, validating, registering, sharing, and integrating locations across countries, territories, seas, natural features, disputed regions, and building-level places.

## Problem

Addresses are not globally uniform. Some countries have reliable postal APIs, some have weak or partial postal datasets, some do not use postal codes at all, and many areas need coordinates, administrative hierarchy, local scripts, romanization, or geographic feature names to be understandable.

AGID treats an address as a layered evidence object:

- coordinate and grid identity,
- administrative and postal metadata,
- local-language display,
- international-English display,
- source quality,
- confidence,
- manual confirmation when data is weak.

## Product Direction

The product should work as a practical location layer between maps, addresses, QR codes, logistics, drones, emergency response, and SDK users.

The current direction is:

1. **Stable grid first**: black grid lines and selected red cells must align exactly and remain deterministic across viewport changes.
2. **Address quality second**: address display must show what is verified, what is partial, and which source supports it.
3. **Language correctness third**: address-language tabs are not app-language settings; they are the languages actually used for addresses in the selected country or region.
4. **Open-source evidence fourth**: use official or open-source postal/geographic data where available; fall back gracefully where not.
5. **Integration fifth**: make the AGID core portable through generated SDKs and typed service boundaries.

## Current Capabilities

### AGID Grid

- Deterministic latitude/longitude encoding and decoding.
- Cubed-sphere style quantization path with optional WASM acceleration.
- Stable viewport grid rendering work in progress.
- Tests for stale partial grids, full-viewport grid coverage, selected-cell alignment, and user-facing grid display behavior.

### Address Registration

- Full-screen registration flow.
- Country, territory, autonomous-region, and overseas-region selection.
- Country address-language tabs separated from app UI language.
- Domestic English and international-shipping English rendering for English-address countries.
- Postal-code-aware field rendering.
- QR payload generation and reading for registered addresses.
- Building name prefill path from reverse geocode details and open-source place data.

### Address Rendering

- Country-specific address ordering.
- Native language display and international-English display.
- Multilingual-country handling.
- East Asia romanization groundwork, including Japanese Hepburn, Chinese Pinyin, Korea Revised Romanization direction, Taiwan/Hong Kong/Macau differentiated policy, and Mongolian support.
- Arabic, Portuguese, Spanish, French, German, Italian, Traditional Chinese, Simplified Chinese, and other major language workflows.

### Data Coverage

- Address format data organized by continent and subregion.
- JSON and YAML address-format variants.
- Generated continent-level address hierarchy files.
- Special support paths for overseas territories, autonomous territories, disputed territories, and no-permanent-address locations.
- Postal source verification scripts.
- Address coverage policy classification:
  - Postal Code Available + Reliable API,
  - Postal Code Available + Weak API,
  - No Postal Code + Strong Geo OSS,
  - No Postal Code + Weak Geo OSS.

### Open-Source Geography

- MapLibre GL frontend.
- OpenStreetMap/OpenFreeMap-compatible search and rendering paths.
- Overpass proxy path.
- OpenLayers dependency for GIS-oriented workflows.
- Turf geometry utilities.
- Overture Maps-ready building-name candidate logic.
- Optional GIS validation output for GDAL and QGIS.

### Persistence and Communication

- Dexie-backed local application database.
- localStorage fallback compatibility.
- Saved AGIDs, saved QR records, registered addresses, AOIDs, and sync queue models.
- Communication health endpoint.
- Server-Sent Events path for job updates.
- Typed HTTP client with request IDs, retries, timeout handling, source labels, warnings, and confidence fields.

### Drone and Navigation Groundwork

- Internal drone landing assessment model.
- Drone corridor and mission package models.
- Navigation destination service.
- Drone UI intentionally not exposed by default.

### SDK Direction

SDK folders exist for many language targets, including:

- C, C++, Rust, WASM,
- JavaScript/TypeScript,
- Python, Go, Swift, Kotlin, Java, PHP,
- .NET, Ruby target direction, Dart, R, Julia, Elixir, Lua, Zig, Nim.

The SDK strategy is to keep the AGID encoding/decoding core portable while the web app handles rich address intelligence.

## Recent Engineering Improvements

- Moved address-registration territory datasets out of the large UI component.
- Added frontend API endpoint builders.
- Added a typed GeoAdmin service for country stats, city lists, boundaries, data-quality reports, and OSM region search.
- Added refactor guard tests to keep direct country-admin URL construction out of UI components.
- Kept DB synchronization isolated in a dedicated hook.
- Verified focused grid, QR, address-registration, grid-detail, endpoint, service, and persistence tests.

## Validation Commands

Focused refactor tests:

```bash
node --import tsx --test src/App.gridUi.test.ts src/App.registrationQr.test.ts src/components/GridDetailPanel.test.ts src/components/AddressRegistration.test.ts src/lib/refactorGuard.test.ts src/lib/apiEndpoints.test.ts src/services/GeoAdminService.test.ts src/hooks/useAppDatabasePersistence.test.ts
```

Type check:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

GIS validation:

```bash
npm run verify:gis
npm run verify:gis:changed
npm run verify:gis:strict
```

Postal source validation:

```bash
npm run verify:postal-sources
npm run verify:postal-sources:live
```

## Quality Risks

### Main Bundle Size

The production build still warns about a large main chunk. The highest-value fix is to split geocoding, address rendering, and app-shell workflows into lazily loaded domain modules.

### Geocoding Service Coupling

`GeocodingService.ts` still mixes search, reverse geocoding, OSM place lookup, Overture/OpenFreeMap building names, regional enrichment, and address format loading.

Recommended split:

- place database,
- OSM/Overpass clients,
- smart search,
- building-name service,
- regional reverse geocoder,
- regional context registry.

### App Shell Size

`App.tsx` still owns too many workflows. Continue extracting:

- location permission,
- search controller,
- route planning,
- QR controller,
- saved-location controller,
- quality report controller,
- app panels.

### Translation Catalog Size

The app-language translation file is large enough that locale additions can accidentally become fallback-only. Split by locale and add key-completeness tests.

### Postal and Geo Source Quality

Some countries have reliable official APIs, while others only have weak postal metadata or strong non-postal geographic data. The app should keep showing this difference clearly instead of forcing every country into the same validation behavior.

## Roadmap

### Phase A: Stabilize Core UX

- Finish grid full-coverage behavior and selected-cell alignment.
- Make grid visibility all-or-nothing when the viewport is outside the display threshold.
- Keep address registration full-screen, clear, and country-first.

### Phase B: Strengthen Address Intelligence

- Expand multilingual-country address tab policies.
- Improve native-to-English building name conversion.
- Improve country-specific international-English ordering.
- Add more source and confidence signals to address cards.

### Phase C: Harden Data Pipelines

- Keep address formats in continent/subregion/country files.
- Generate hierarchy files from stable source metadata.
- Add changed-file fast paths for postal and GIS validation.
- Make every source label traceable.

### Phase D: Split Runtime Architecture

- Split app shell hooks.
- Split geocoding services.
- Split server routes.
- Split translation catalogs.
- Keep compatibility barrels where public imports already exist.

### Phase E: Integration and SDKs

- Keep SDKs generated from a single AGID core model.
- Add language-specific smoke tests.
- Publish packages only after test and documentation parity is stable.

## GitHub Publishing Strategy

Because the current working tree is large, publish in a way that preserves reviewability:

1. Create a named branch from the current detached worktree.
2. Commit the current AGID feature/refactor batch with a clear message.
3. Push the branch to GitHub.
4. Open a draft PR with:
   - summary,
   - test commands,
   - known warnings,
   - follow-up refactor targets.
5. Avoid mixing generated cache/build folders into the commit.

If GitHub authentication is unavailable, keep the branch and commit local and report the exact re-authentication command needed.
