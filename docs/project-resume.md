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

Detailed grid and encoding math is kept in a separate resume: [AGID Mathematical Model Resume](./agid-math-model-resume.md).

## Competitive Landscape and Differentiation

AGID is closest to a mix of coordinate-code systems, postal validation tools, open geocoders, and GIS infrastructure. The important distinction is that AGID is not only a code for a point. It is a deterministic grid ID plus address evidence, multilingual rendering, private registration, QR sharing, and SDK portability.

### Short Positioning

AGID should be positioned as:

- a deterministic location ID that works without central approval,
- an address-quality layer that improves results with postal and open-source evidence,
- a multilingual international-shipping address renderer,
- a private address registration and QR layer,
- a portable SDK/spec for apps, terminals, logistics, drones, and offline tools.

AGID should not be positioned as a replacement for every GIS index, every postal API, or every map search provider. It should consume those tools as evidence and provide a stable user-facing location and address layer above them.

### what3words

what3words is the easiest comparison because it provides a human-facing small-area grid. The difference is product philosophy and extensibility.

AGID advantages:

- Deterministic numeric/alpha grid ID instead of a closed word list.
- SDK-oriented core that can run on-device and offline.
- Visible map grid with selected-cell geometry that can be tested against the same cell polygon.
- Address intelligence: postal codes, local language, international English, building names, confidence, and source labels.
- Better fit for QR, logistics, drones, and developer workflows where machine-readable stability matters more than memorability.

what3words advantages AGID should respect:

- Extremely memorable spoken form.
- Strong consumer UX for simple location sharing.
- Simple mental model for non-technical users.

AGID should not try to copy the word-address model. AGID's wedge is verifiable, open, SDK-friendly, and address-aware.

### Google Plus Codes / Open Location Code

Plus Codes are the strongest open coordinate-code comparison. They are good for compact coordinate references and can work without street addresses.

AGID advantages:

- Adds a region-aware prefix and source-aware address layer instead of only encoding coordinates.
- Separates domestic address language, international-shipping English, and app UI language.
- Handles postal-code strength classes, no-postal-code areas, seas, mountains, natural features, overseas territories, autonomous regions, and disputed areas.
- Provides private registered-address and AOID workflows, not just a public coordinate code.
- Uses a hybrid model: SDK/device for core ID, central services for quality upgrades.

Plus Code advantages AGID should respect:

- Mature open specification.
- Very broad ecosystem recognition.
- Simpler global coordinate-code story.

AGID should interoperate with Plus Codes where useful, but AGID's product value is the evidence and address rendering layer around the grid.

### Geohash

Geohash is simple, compact, and widely understood in software systems. It is useful for indexing and approximate spatial search.

AGID advantages:

- Uses a cubed-sphere style quantization instead of rectangular latitude/longitude bisection.
- Targets more stable global cell size and shape behavior.
- Uses Hilbert ordering per face for locality.
- Includes region, sea, territory, and address-quality semantics outside the raw coordinate hash.
- Provides user-facing grid display rules and selected-cell alignment requirements.

Geohash advantages AGID should respect:

- Very simple implementation.
- Existing database/search ecosystem support.
- Easy prefix matching.

AGID should not replace geohash inside every database query. It can export or bridge to geohash for infrastructure while keeping AGID as the user-facing ID.

### H3 and S2

H3 and S2 are excellent global spatial indexing systems. They are strong for analytics, geofencing, aggregation, and backend spatial operations.

AGID advantages:

- Designed as an address and delivery-facing ID, not only an analytics index.
- Carries address-display policy, language tabs, postal quality, open-source evidence, and QR/private registration workflows.
- Has a human-visible grid and selected-cell UX requirement.
- Can be implemented as SDK packages across many general-purpose languages.

H3/S2 advantages AGID should respect:

- Mature spatial libraries.
- Strong hierarchical indexing and neighbor operations.
- Large production usage in backend GIS and analytics.

AGID should not introduce H3/S2 unless integration requires it. The best strategy is optional interoperability: store AGID as the public/address ID, compute H3/S2 cells for backend analytics when needed.

### Mapcodes and Similar Short Codes

Mapcodes and other short location-code systems aim to make coordinates shorter and easier to communicate.

AGID advantages:

- Richer address and source-confidence model.
- Explicit open-source postal/geographic evidence strategy.
- Multilingual and international-shipping rendering.
- Private registered addresses and QR payloads.
- SDK and data-pack direction.

Their advantage:

- Shorter or more communication-friendly codes in some contexts.

AGID should compete on correctness, evidence, and integration rather than shortest possible string length.

### Postal Address APIs

Examples include national postal APIs, commercial address validation services, and country-specific datasets.

AGID advantages:

- Does not assume every country has reliable postal data.
- Classifies countries and regions into reliable postal API, weak postal API, strong geo OSS without postal code, and weak geo OSS/manual-required.
- Can still produce a useful AGID/coordinate/administrative/natural-feature record when postal code data is missing.
- Shows source, confidence, verified/partial/manual state instead of hiding uncertainty.
- Supports local-language and international-English order conversion.

Postal API advantages AGID should respect:

- Strong authority for countries with official complete postal data.
- Better final-mile validation where the postal system is mature.

AGID should use postal APIs as evidence, not as the only truth source.

### Geocoders and Map Search

Examples include OpenStreetMap Nominatim, Pelias, OpenCage-style formatters, Google Maps, Apple Maps, and regional government geocoders.

AGID advantages:

- Treats geocoders as evidence sources and merges them with postal metadata, address-format rules, country policies, natural features, and user-confirmed data.
- Can show weak confidence instead of pretending a search hit is a complete postal address.
- Adds QR, AOID, registered-address, SDK, and offline behavior around the search result.
- Handles seas, mountains, water, disputed regions, overseas territories, and no-permanent-address places as first-class cases.

Geocoder advantages AGID should respect:

- Large place databases.
- Search ranking, fuzzy matching, and POI discovery.
- Mature consumer map UX.

AGID should not build a closed geocoder from scratch. It should orchestrate open and official sources and preserve provenance.

### Logistics Labels and Delivery Platforms

Delivery platforms focus on getting a parcel, rider, vehicle, or route to a destination.

AGID advantages:

- Works as a neutral address evidence layer before a specific carrier is selected.
- Supports domestic and international-shipping English forms.
- Preserves local script and romanization policy.
- Can encode registered addresses into QR payloads.
- Can expose SDKs for terminals and carrier integrations.

Delivery-platform advantages AGID should respect:

- Operational carrier networks.
- Live routing, pricing, SLA, and customs integrations.

AGID should integrate with logistics systems rather than compete with carrier operations.

### GIS Platforms

Examples include MapLibre GL, OpenLayers, QGIS, PostGIS, GeoServer, GDAL, and similar tools.

AGID advantages:

- Product-level address intelligence and user workflows on top of GIS infrastructure.
- A deterministic global ID and address rendering model.
- A focused validation pipeline for postal/geographic source quality.

GIS platform advantages AGID should respect:

- Mature spatial storage, rendering, editing, and analysis.
- Standards support such as WMS, WFS, GeoJSON, vector tiles, and coordinate transformations.

AGID should use GIS tools for validation, rendering, and backend indexing, not reimplement a whole GIS stack.

### AGID's Defensible Difference

The strongest differentiation is the combination of:

- deterministic global grid identity,
- address-format intelligence by country/territory,
- multilingual native and international-English rendering,
- postal and open-source evidence scoring,
- explicit uncertainty display,
- private registered addresses and QR payloads,
- sea, mountain, water, natural-feature, disputed-region, overseas-territory, and autonomous-region handling,
- central quality upgrades without central dependency,
- SDK portability across many languages.

No single competitor in the landscape fully covers this combination. The risk is scope creep. The product must keep the core simple: deterministic ID first, evidence second, rendering third, registration fourth, integrations fifth.

### Claims AGID Can Make Now

- AGID is designed as a deterministic grid and address-intelligence layer.
- AGID can run core ID logic locally and through SDK packages.
- AGID can use central services to upgrade address quality without making the core ID central-only.
- AGID tracks source labels, confidence, and partial/manual states.
- AGID is built to handle postal-code and no-postal-code regions differently.

### Claims AGID Should Not Make Yet

- Do not claim universal final-mile delivery correctness until carrier and postal authority integrations are proven.
- Do not claim complete global building-name coverage; treat building names as evidence from OSM, OpenFreeMap, Overture, national datasets, and user confirmation.
- Do not claim legal resolution of disputed territories; provide claim-aware display choices and neutral evidence.
- Do not claim H3/S2/PostGIS replacement; AGID can interoperate with those tools.
- Do not claim every SDK is production-complete until each package has encode/decode/cell-bounds parity tests.

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
- Hybrid central/device/SDK architecture policy for deciding which workflows use central quality, local-first private storage, portable SDK logic, or versioned open-data packs.
- Central hybrid quality endpoint and frontend service fallback path for address/postal/geo quality decisions.
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
- Added a hybrid architecture policy layer so central services improve quality without making AGID core, local records, or SDK use dependent on the server.
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
