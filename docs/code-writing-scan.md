# Code Writing Scan

Last scan: 2026-06-01

This scan looks for code style and maintainability patterns that should change across the repository. It is separate from file-size refactoring: the focus here is how code is written.

## Summary

The main writing issues are:

- Too much `any` around app state, geocoding payloads, map features, API responses, and server cache data.
- Direct side effects in UI files, especially `fetch`, `localStorage`, `console`, and map source mutation.
- Repeated provider client code with the same try/fetch/return-null pattern.
- Server route handlers written as one long procedural file instead of small typed route modules.
- Repeated fallback error handling that hides why address data is partial.
- Translation and address rendering functions accepting weakly typed free-form objects.

## Pattern Counts

| Pattern | Highest files |
| --- | --- |
| `any` / `as any` / `Record<string, any>` | `src/App.tsx` 81, `server.ts` 66, `src/services/GeocodingService.ts` 64, `src/services/EuropePostalService.ts` 26 |
| Direct `fetch(` | `src/services/EuropePostalService.ts` 26, `src/App.tsx` 14, `src/services/SouthAmericaService.ts` 7 |
| Direct `localStorage.` | `src/App.tsx` 82, `src/hooks/useAppDatabasePersistence.ts` 5 |
| Direct `console.*` | `server.ts` 91, `src/App.tsx` 40, `src/services/EuropePostalService.ts` 26 |
| `/api/` or external URL strings | open geo data catalogs, `server.ts`, `src/App.tsx`, regional services |
| Large branch count | `src/App.tsx` 506 branches, `server.ts` 413, `src/services/GeocodingService.ts` 268 |

## Priority 1: Replace `any` With Domain Types

### Problem

`any` appears in the highest-risk files and removes type protection exactly where the app needs it most: address confidence, geocoding, grid geometry, saved records, route results, and server API payloads.

Examples:

- `src/App.tsx`: `routeData`, search results, clicked address details, saved AGIDs, AOIDs, country boundaries, map layer GeoJSON, and API results.
- `server.ts`: cache data, Nominatim responses, Overpass elements, elevation sources, country stats, city lists.
- `src/services/GeocodingService.ts`: regional payloads, OSM elements, Overture features, address format enrichment.
- `src/components/SearchSidebar.tsx`: route/search props use `any`.
- `src/components/GridDetailPanel.tsx`: clicked AGID, map ref, destination/origin callbacks use `any`.

### Recommended writing style

Create shared narrow types:

- `src/types/agid.ts`: `AgidResult`, `AgidGridCell`, `AgidRegistryItem`.
- `src/types/geocoding.ts`: `NominatimResult`, `OsmElement`, `OverpassResponse`, `PhotonResult`, `GeoFeature`.
- `src/types/address.ts`: `AddressDetails`, `AddressEvidence`, `AddressQualityReport`.
- `src/types/navigation.ts`: `RouteData`, `RoutePoint`, `SearchResultFeature`.
- `src/types/server.ts`: `ApiResult<T>`, `ProviderResult<T>`, `TimedCacheEntry<T>`.

Use `unknown` at external API boundaries, parse it once, then pass typed objects internally.

## Priority 2: Move Direct I/O Out Of UI Components

### Problem

UI files still perform direct side effects:

- `src/App.tsx` has direct calls to `/api/country-stats`, `/api/osrm/route`, `/api/photon`, `/api/nominatim/reverse`, `/api/overpass`, `/api/country-cities`, `/api/country-boundary`, `/api/data-quality/report`, `/api/terrain`.
- `src/components/PostalCodeLab.tsx` directly fetches country stats, cities, and boundaries.
- `src/components/GeoArchitectPanel.tsx` directly fetches OSM search.
- `src/App.tsx` directly reads or writes `localStorage` in many state initializers and effects.

### Recommended writing style

Use one of these patterns:

- HTTP: `src/lib/agidHttpClient.ts` or typed service functions.
- Persistent settings: a `usePersistentSetting` hook or `src/lib/appPreferences.ts`.
- Large workflows: controller hooks such as `useSearchController`, `useRoutePlanning`, `useQrController`, `useLocationPermission`.

UI should call named intent functions like `loadCountryStats(cc)` instead of building URLs inline.

## Priority 3: Standardize Provider Client Code

### Problem

Many regional services repeat this shape:

```ts
try {
  const response = await fetch(url);
  if (!response.ok) return null;
  return await response.json();
} catch (error) {
  console.error("Error fetching ...", error);
  return null;
}
```

This is repeated heavily in:

- `src/services/EuropePostalService.ts`
- `src/services/NordicService.ts`
- `src/services/EastAsiaService.ts`
- `src/services/SouthAmericaService.ts`
- `src/services/NorthAmericaService.ts`
- `src/services/AsiaOceaniaService.ts`

### Recommended writing style

Create a typed helper:

```ts
type OptionalProviderOptions<T> = {
  url: string;
  source: string;
  timeoutMs?: number;
  parse: (json: unknown) => T | null;
};
```

Then each provider function becomes a small mapping function. This removes copy-paste, centralizes timeout behavior, and makes confidence/source reporting easier.

## Priority 4: Replace Direct `console.*` With Logger Boundaries

### Problem

Direct logs are scattered through server, App, and services.

- `server.ts`: 91 `console.*`
- `src/App.tsx`: 40
- `src/services/EuropePostalService.ts`: 26

### Recommended writing style

Create:

- `src/lib/logger.ts` for frontend warnings and development-only logs.
- `src/server/logger.ts` for structured server logs.

Use stable event names:

- `geocode.reverse.failed`
- `postal.lookup.failed`
- `grid.worker.failed`
- `provider.timeout`
- `address.partial`

Keep `console.log` in CLI scripts acceptable, but not in runtime modules unless routed through the logger.

## Priority 5: Use Result Objects Instead Of Silent `null`

### Problem

Many service functions return `null` or `[]` after errors. That is safe for UI crashes, but weak for address quality because the caller cannot distinguish:

- no data exists,
- provider timed out,
- response format changed,
- postal code invalid,
- rate limited,
- source unavailable.

Examples:

- regional address services often `return null`.
- `GeocodingService.ts` falls back in many places.
- server endpoints frequently catch and return empty fallback data.

### Recommended writing style

Use a result shape for provider and address evidence code:

```ts
type ProviderStatus = 'verified' | 'partial' | 'not_found' | 'timeout' | 'rate_limited' | 'provider_error';

type ProviderResult<T> = {
  ok: boolean;
  status: ProviderStatus;
  source: string;
  data?: T;
  message?: string;
};
```

The UI can still display a calm fallback, but confidence badges become truthful.

## Priority 6: Move API URLs To Endpoint Builders

### Problem

`/api/...` strings are repeated in many places. This makes endpoint changes fragile and makes it harder to attach consistent timeout, retry, and tracing behavior.

### Recommended writing style

Add:

- `src/lib/apiEndpoints.ts` for frontend endpoint builders.
- `src/server/routes/*` for server route ownership.

Example:

```ts
apiEndpoints.reverseGeocode({ lat, lon, lang, countryCode })
apiEndpoints.countryStats(countryCode)
apiEndpoints.overpass()
```

Do not build query strings inline in UI components.

## Priority 7: Replace Large Switches And Literal Category Maps With Tables

### Problem

Some files encode business rules in long switch/case or repeated literal arrays. These are hard to extend safely when countries and languages grow.

Examples:

- `src/components/AddressRegistration.tsx`: territory and language-region arrays belong in data modules.
- `src/components/SettingsPanel.tsx`: tab label switch should use a typed map.
- `src/lib/addressEnglish.ts`: language/script normalization should be rule tables by script or region.

### Recommended writing style

Prefer typed maps:

```ts
const SETTINGS_TAB_LABELS: Record<SettingsTab, TranslationKey> = {
  main: 'settings',
  help: 'help',
};
```

For address rules, use country/region profile objects instead of chained conditions.

## Priority 8: Keep Data And Runtime Logic Separate

### Problem

Open geo source catalogs and postal/address rules are mostly data, but they live as TypeScript modules. That is fine for typing, but not ideal when the catalog becomes large and needs daily updates.

Examples:

- `src/data/europeOpenGeoSources.ts`
- `src/data/asiaOpenGeoSources.ts`
- `src/data/americasOpenGeoSources.ts`
- `src/data/oceaniaOpenGeoSources.ts`
- `src/data/africaOpenGeoSources.ts`

### Recommended writing style

Use generated JSON/YAML for source catalogs and keep TypeScript for validation and loading:

- `src/data/open_geo/**/*.json`
- `scripts/verify-open-geo-sources.ts`
- `src/lib/openGeoSources.ts`

This matches the address format direction and keeps future source updates mechanical.

## Priority 9: Improve Tests For Style Rules

Add tests or lint rules for:

- No direct `fetch(` in React components.
- No direct `localStorage.` outside preference/database modules.
- No new `any` in `src/App.tsx`, `src/services/GeocodingService.ts`, `server.ts`.
- Every provider client returns a typed provider result or explicitly documented optional null.
- Translation keys are complete by locale.

These guardrails matter more than one-time cleanup because this app is growing by country and region.

## Suggested Fix Order

1. Introduce shared types for AGID, geocoding, address, navigation, and provider results.
2. Add `apiEndpoints.ts` and move URL construction out of UI.
3. Add `usePersistentSetting` and replace direct `localStorage` in `App.tsx`.
4. Add `optionalJsonProvider` helper and refactor one regional service first.
5. Add runtime logger wrappers and move server/App logs behind them.
6. Replace `null` provider failures with typed `ProviderResult` in address-quality paths.
7. Add style guard tests so new direct `any`, fetch, and localStorage do not creep back.

## What Not To Change First

- Do not rewrite generated address hierarchy JSON by hand.
- Do not remove CLI script `console.log`; script output is useful.
- Do not replace every `any` in one large edit. Start at module boundaries and public props.
- Do not make UI code wait for perfect provider typing before shipping small behavior fixes.

