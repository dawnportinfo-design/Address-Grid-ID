# AGID Hybrid Architecture

Last updated: 2026-06-01

## Decision

AGID should use a hybrid model:

- **Central quality layer** improves address evidence, postal lookup, source scoring, building/place-name enrichment, and conflict handling.
- **Device layer** keeps private address records, QR payloads, settings, and offline workflows usable without server access.
- **SDK layer** owns deterministic AGID encoding/decoding so apps, drones, terminals, and external systems can use AGID freely.
- **Open-data-pack layer** carries versioned open-source geography and postal metadata for offline or low-connectivity environments.

This avoids making the central server a hard dependency for AGID itself, while still letting the product become much better when online.

## Rules

1. AGID core math must work in SDKs and on-device without central approval.
2. Central services may upgrade quality, confidence, and autofill, but should not be required to create or decode an AGID.
3. Registered addresses, AOIDs, and user settings are private records. They can sync only through explicit private sync paths.
4. Personal address records must never be pushed into a public or distributed data layer.
5. Postal APIs, OSM/OpenFreeMap/Overture, national GIS sources, and generated data packs are evidence sources, not a replacement for manual confirmation in weak-data regions.
6. SDK packages should consume the same AGID core model and optional source packs, not web-app-only behavior.

## Runtime Modes

- `sdk-portable`: deterministic grid and SDK functions run anywhere.
- `local-first`: local DB, local cache, QR, and manual entry stay usable offline.
- `central-assisted`: central service improves the local result when online.
- `central-verified`: central evidence and confidence can earn a verified/stronger badge.
- `read-through-cache`: postal or place lookup checks central/open APIs, then caches locally.
- `manual-required`: the app can display a result, but the confidence is not strong enough to pretend it is verified.

## Implementation Touchpoints

- `src/lib/hybridArchitecture.ts` defines workflow policies and runtime decisions.
- `src/services/HybridQualityService.ts` calls central quality when it improves a workflow, and falls back to local policy when unavailable.
- `POST /api/hybrid/quality` returns the same policy/decision envelope through the standard AGID server result.
- `src/lib/syncQueue.ts` exposes the hybrid policy for each sync entity type.
- IndexedDB/localStorage remain the local-first storage path.
- Server APIs can be attached later to the workflows that already declare `quality-upgrade`, `verification-source`, or `optional-private-sync`.

## Next Steps

- Add a central quality endpoint that accepts an address evidence object and returns confidence, source labels, warnings, and normalized fields.
- Add SDK smoke tests that prove AGID encode/decode works with no network.
- Add data-pack version metadata for postal and GIS source bundles.
- Add UI confidence labels that distinguish local, partial, and verified without exposing unnecessary technical wording.
