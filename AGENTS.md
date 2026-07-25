# AGID Agent Instructions

## What This Repo Is
This is a React + Vite + Express workspace for GeoGrid Explorer. The main surfaces are [src/App.tsx](src/App.tsx), [server.ts](server.ts), [src/lib/agid.ts](src/lib/agid.ts), [src/services/](src/services/), and the optional Rust/WASM core under [native/agid-core/](native/agid-core/).

## Working Rules
- Prefer small, focused changes that preserve the existing React/TypeScript style.
- Use functional React components and TypeScript throughout the UI.
- Keep regional logic in the relevant service/module instead of adding monolithic branching.
- Do not duplicate documentation that already exists; link to it instead.
- For UI work, follow the existing Tailwind and MapLibre patterns rather than introducing a new design system.

## Common Commands
- `npm run dev` starts the Express server through `tsx server.ts` and the server auto-falls back from port 3000 to the next free port if needed.
- `npm run build` runs the Vite production build.
- `npm run lint` runs the TypeScript no-emit check and is the main verification command for code changes.
- `npm run build:rust-wasm` rebuilds the optional AGID WASM core.

## Important Boundaries
- [server.ts](server.ts) is the backend entry point and initializes the postal code database early in startup.
- [src/App.tsx](src/App.tsx) is the main UI shell and orchestrates most feature wiring.
- Regional and country-specific behavior belongs in [src/services/](src/services/) or nearby helpers under [src/lib/](src/lib/).
- If you touch grid rendering, search, or geocoding behavior, inspect the nearest module first instead of changing the top-level app shell.

## Docs To Check First
- [README.md](README.md) for the product overview and startup flow.
- [CONTRIBUTING.md](CONTRIBUTING.md) for style and pull request expectations.
- [README_AGID_MODEL.md](README_AGID_MODEL.md) for the AGID math and encoding model.

## Validation
When changing TypeScript or React code, run `npm run lint` before finishing.