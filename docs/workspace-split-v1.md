# AGID Six-Workspace Split

AGID uses six local npm workspaces while the root repository remains the thin
integration and compatibility layer.

| Workspace | Ownership |
| --- | --- |
| `@agid/contracts` | Versioned contracts, schemas, and conformance gates |
| `@agid/core` | AGID encoding, grid geometry, neighborhood, and building references |
| `@agid/country-data` | Country formats, source evidence, quality gates, and child-pack inputs |
| `@agid/addressql` | AddressQL API, adapters, multilingual policy, and SDK surface |
| `@agid/topography` | Topographic source policy, export planning, and serializers |
| `@agid/studio` | React application shell and integration surfaces |

## Dependency Direction

```text
contracts
  -> core
    -> country-data
      -> addressql
    -> topography
addressql + core + country-data + topography
  -> studio
```

Dependencies may point only toward a lower layer. AddressQL and topography must
not depend on each other. Studio is the only workspace allowed to own React
runtime dependencies.

## Compatibility Migration

All packages begin as private compatibility bridges. Existing root imports
remain valid while package consumers adopt the new entrypoints. The first
completed ownership move is `@agid/contracts`: its implementation now lives in
`packages/contracts/src`, while the legacy root paths re-export package
subpaths.

A legacy module may move into its owning workspace only after:

1. its public exports have contract or snapshot coverage;
2. old root imports re-export the workspace implementation;
3. package and root consumer tests pass together;
4. generated SDK and OpenAPI changes are checked;
5. the move introduces no raw address, recipient, credential, or secret data.

Country child repositories remain generated outputs rather than permanent npm
workspaces. Heavy geometry and source snapshots remain external and are linked
by version, digest, rights, scope, attribution, freshness, and correction
metadata.

## Repository Promotion Plan

The workspace layout is also the future repository boundary, but a planned name
is not a claim that a physical GitHub repository already exists.

| Package | Suggested repository | Current state |
| --- | --- | --- |
| `@agid/contracts` | `agid-contracts` | Source-owned; release-gated until release evidence is complete |
| `@agid/core` | `agid-core` | Compatibility bridge; defer until core source moves |
| `@agid/country-data` | `agid-country-data` | Defer while source evidence and generated pack provenance are stabilized |
| `@agid/addressql` | `addressql` | Defer until the SDK and API have standalone release contracts |
| `@agid/topography` | `agid-topography` | Defer until export tooling and source-backed artifacts have stable package boundaries |
| `@agid/studio` | `agid-studio` | Keep as the integration application until deployment contracts are independent |

Each extraction needs a package manifest, passing contract tests, a no-raw-
address gate, provenance and license metadata, and a stable version. The root
repository continues to host compatibility facades until downstream import
migration is complete. This avoids breaking existing imports or creating empty
repositories merely to mirror the folder layout.

`packages/contracts` now includes its staged `manifest.json`, `sources.json`,
`quality-gates.json`, and license notice. These files describe a release-gated
candidate; they do not authorize or represent a published standalone repository.
