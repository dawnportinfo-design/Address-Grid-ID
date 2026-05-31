# Refactor Candidate Scan

Last scan: 2026-06-01

## Summary

The repository has three different kinds of files that should be treated differently:

- Generated or catalog data: split by loading boundary, not by hand-editing many tiny objects.
- UI containers: split by workflow and state ownership.
- Service/orchestration files: split by external provider, API route, and domain responsibility.

The next high-value refactor should keep behavior stable and move one responsibility at a time behind tests.

## Largest Files

| Lines | File | Recommendation |
| ---: | --- | --- |
| 13,752 | `src/data/address_hierarchy/europe.json` | Keep generated, add continent/subregion lazy loading and source generator checks. |
| 13,013 | `src/data/address_hierarchy/americas.json` | Keep generated, lazy load by continent tab/search scope. |
| 11,610 | `src/data/address_hierarchy/africa.json` | Keep generated, lazy load by continent tab/search scope. |
| 10,910 | `src/data/address_hierarchy/asia.json` | Keep generated, lazy load by continent tab/search scope. |
| 7,962 | `src/data/countries.json` | Consider splitting registry metadata from UI display metadata. |
| 6,025 | `src/data/seas.json` | Split sea registry from render/search index if runtime cost grows. |
| 4,518 | `src/App.tsx` | Split remaining app shell controllers and QR/search/navigation state. |
| 4,392 | `src/constants/translations.ts` | Split by locale or namespace; keep typed key validation. |
| 2,728 | `server.ts` | Split into Express app, route modules, provider clients, and cache helpers. |
| 2,317 | `src/components/AddressRegistration.tsx` | Split form UI, country picker, territory metadata, postcode automation, QR registration. |
| 2,115 | `src/data/europeOpenGeoSources.ts` | Split by region or convert to generated catalog data. |
| 1,818 | `src/data/asiaOpenGeoSources.ts` | Split by region or convert to generated catalog data. |
| 1,376 | `src/components/SettingsPanel.tsx` | Split help/about, language, map, export, location panels. |
| 1,351 | `src/services/GeocodingService.ts` | Split search, reverse geocode, buildings, regional enrichment, OSM/Overpass clients. |
| 1,257 | `src/lib/addressEnglish.ts` | Split romanization, term normalization, country ordering, and renderers. |

## Priority 1: App Shell

### `src/App.tsx`

Still owns many unrelated concerns:

- Map viewport and location permission state.
- Search state, search history, advanced search.
- QR scanner and saved QR state.
- Navigation and route planning state.
- Drone state.
- Postal lab and territory lab state.
- Quality report state.
- Saved AGID/AOID/address persistence wiring.
- Large render tree.

Recommended split:

- `src/hooks/useLocationPermission.ts`
- `src/hooks/useSearchController.ts`
- `src/hooks/useRoutePlanning.ts`
- `src/hooks/useQrController.ts`
- `src/hooks/useSavedAgids.ts`
- `src/hooks/useQualityReport.ts`
- `src/components/AppMapScene.tsx`
- `src/components/AppPanels.tsx`
- `src/components/AppTopBar.tsx`

Do this after the grid and database hooks already created, using the same pattern: extract one hook, add a small test, run focused App tests.

## Priority 2: Address Registration

### `src/components/AddressRegistration.tsx`

This component includes UI, country/territory grouping data, postcode behavior, language tab logic, address rendering, QR generation, and registration submission.

Recommended split:

- `src/components/address-registration/AddressRegistrationPage.tsx`
- `src/components/address-registration/CountryRegionSelector.tsx`
- `src/components/address-registration/AddressLanguageSelector.tsx`
- `src/components/address-registration/PostalCodeSection.tsx`
- `src/components/address-registration/AddressFieldList.tsx`
- `src/components/address-registration/RegistrationPreview.tsx`
- `src/components/address-registration/RegistrationActions.tsx`
- `src/lib/addressRegistrationTerritories.ts`
- `src/hooks/useAddressRegistrationForm.ts`
- `src/hooks/usePostalCodeAutofill.ts`

The territory arrays around lines 1057-1471 should move out first. They are data, not component behavior.

## Priority 3: Geocoding and Building Name Services

### `src/services/GeocodingService.ts`

This file imports almost every regional service and currently orchestrates:

- Dexie place database.
- Basic address normalization and parsing.
- OSM nearby places.
- Nearest road.
- Smart search.
- Overture and OSM building name lookup.
- Regional reverse geocoding.
- Address format loading and quality enrichment.

Recommended split:

- `src/services/geocoding/PlaceDatabase.ts`
- `src/services/geocoding/OsmPlacesClient.ts`
- `src/services/geocoding/OsmRoadClient.ts`
- `src/services/geocoding/SmartSearchService.ts`
- `src/services/geocoding/BuildingNameService.ts`
- `src/services/geocoding/RegionalReverseGeocoder.ts`
- `src/services/geocoding/RegionalContextRegistry.ts`

The regional imports should be hidden behind a registry so adding countries does not keep expanding one central file.

## Priority 4: English Address Rendering

### `src/lib/addressEnglish.ts`

This file combines:

- Country names.
- Script detection.
- Arabic digit and term normalization.
- Japanese Hepburn romanization.
- Korean Revised Romanization fallback.
- Mongolian Cyrillic romanization.
- General English address part normalization.
- Building name normalization.
- Domestic and international English renderers.

Recommended split:

- `src/lib/address-english/countryNames.ts`
- `src/lib/address-english/scriptLanguage.ts`
- `src/lib/address-english/termNormalization.ts`
- `src/lib/address-english/eastAsiaRomanization.ts`
- `src/lib/address-english/arabicNormalization.ts`
- `src/lib/address-english/mongolianRomanization.ts`
- `src/lib/address-english/buildingNameEnglish.ts`
- `src/lib/address-english/postalRenderer.ts`
- `src/lib/addressEnglish.ts` as a compatibility barrel.

Keep the existing public exports stable while moving internals.

## Priority 5: Server

### `server.ts`

This file has Express setup, Vite setup, rate limiting, libpostal, translation, postal APIs, Nominatim, Overpass, elevation, drone/GIS endpoints, and cache logic in one scope.

Recommended split:

- `src/server/app.ts`
- `src/server/routes/address.ts`
- `src/server/routes/postal.ts`
- `src/server/routes/geocoding.ts`
- `src/server/routes/overpass.ts`
- `src/server/routes/elevation.ts`
- `src/server/routes/drone.ts`
- `src/server/routes/gis.ts`
- `src/server/providers/nominatim.ts`
- `src/server/providers/overpass.ts`
- `src/server/providers/zippopotam.ts`
- `src/server/cache/ttlCache.ts`
- `server.ts` as the thin bootstrap.

This will also make API behavior easier to test without starting the whole Vite dev server.

## Priority 6: Translation Catalog

### `src/constants/translations.ts`

The translation file is now large enough that locale additions are risky.

Recommended split:

- `src/constants/translations/en.ts`
- `src/constants/translations/ja.ts`
- one file per app language.
- `src/constants/translations/index.ts` to merge and export `TRANSLATIONS`.
- A validation test that every locale has the same keys as English.

This directly supports app-language expansion without creating empty fallback-only locales.

## Priority 7: Postal and Open Geo Catalogs

### `src/lib/postalPatterns.ts`

The postal pattern table mixes model types, countries with postal codes, countries without postal codes, examples, and historical text.

Recommended split:

- `src/data/postal/patterns.ts`
- `src/data/postal/noPostalCountries.ts`
- `src/lib/postalPatterns.ts` as API wrapper.

### `src/data/*OpenGeoSources.ts`

These source catalogs should become generated or region-scoped data:

- `src/data/open_geo/europe/*.ts`
- `src/data/open_geo/asia/*.ts`
- `src/data/open_geo/africa/*.ts`
- `src/data/open_geo/americas/*.ts`
- `src/data/open_geo/oceania/*.ts`
- `src/data/open_geo/polar/*.ts`

Add a validation script that checks URL, license, provider type, region, and whether the source is runtime API, reference data, or documentation only.

## Priority 8: Medium UI Components

### `src/components/SettingsPanel.tsx`

Split into:

- `SettingsMainView`
- `LanguageSettingsView`
- `MapSettingsView`
- `LocationSettingsView`
- `OfflineSettingsView`
- `HelpSettingsView`
- `ExportSettingsView`

### `src/components/SearchSidebar.tsx`

Split into:

- `SearchInput`
- `SearchFilters`
- `SearchResultList`
- `RoutePlanner`
- `CoordinateSearch`

### `src/components/GridDetailPanel.tsx`

Split into:

- `AgidCodeHeader`
- `AddressTabPreview`
- `AddressEvidenceBadges`
- `TerritoryClaimSwitcher`
- `GridDetailActions`

## Data Loading Notes

The biggest files are data JSON. Splitting them manually is less important than controlling when they load.

Recommended runtime rule:

- Load only country registry summary at app startup.
- Lazy load continent hierarchy when the country selector tab opens.
- Lazy load address format JSON only for the selected country.
- Lazy load sea/nature catalogs only when search or map context needs them.

## Suggested Order

1. Move AddressRegistration territory arrays into `src/lib/addressRegistrationTerritories.ts`.
2. Extract `useSearchController` from `App.tsx`.
3. Extract `useQrController` from `App.tsx`.
4. Split `server.ts` into route modules without changing endpoint paths.
5. Split `addressEnglish.ts` behind a compatibility barrel.
6. Split translations by locale and add key parity tests.
7. Add lazy loaders for address hierarchy JSON.

## Verification Plan

For each extraction:

- Run focused unit tests for the moved module.
- Run App smoke tests covering grid, search, registration, QR, and address display.
- Run `npm run lint`.
- Run `npm run build` after every 2-3 low-risk moves or after every server split.

