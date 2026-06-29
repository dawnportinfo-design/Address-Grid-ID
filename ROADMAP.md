# AGID Roadmap

This roadmap is intentionally public and conservative. AGID should become useful
as open infrastructure before it becomes broad as a platform.

## Phase 0: Public OSS Baseline

Goal: make the repository understandable, runnable, and safe for outside review.

- Keep local-only map, resolver, address registration, QR, and basic POS flows
  usable without hosted services.
- Publish spec, SDK parity vectors, conformance checks, and safe downloads.
- Keep no-raw-address, secret scan, security, and privacy gates green.
- Provide clear issue templates, pull request rules, governance, support, and
  roadmap documents.

## Phase 1: Specification And SDK Stabilization

Goal: make AGID implementable outside this app.

- Move AGID/AOID schemas, OpenAPI, and conformance vectors toward `agid-spec`.
- Keep SDKs generated from the spec and parity-tested across supported
  languages.
- Publish checksums for SDK and spec/conformance download packs.
- Separate app UI changes from protocol compatibility changes in pull requests.

## Phase 2: Country Packs And Data Provenance

Goal: make address rendering and postal/geography evidence maintainable.

- Treat YAML as editable source and JSON as generated distribution output.
- Move heavy country/postal/geography packs out of the app bundle.
- Add country-pack manifests with source, license, generatedAt, confidence, and
  test vectors.
- Keep disputed territories, overseas territories, and autonomous regions
  explicit and source-labeled.

## Phase 3: Privacy-Preserving Operations

Goal: support real field workflows without exposing private address material.

- Strengthen Secure Address QR, alias, commitment, receipt, and revocation flows.
- Keep POS, field, hotel, locker, and drone handoff surfaces role-specific and
  no-raw by default.
- Add connector-specific auth, no-cache fetch, audit logs, rate limits, retry
  rules, and dead-letter queues before production integrations.

## Phase 4: ZK And Web3 Readiness

Goal: make ZK/Ethereum optional verification layers, not required dependencies.

- Publish public-signal allowlists and witness hygiene checks.
- Keep blockchain-free local use fully supported.
- Treat real prover/verifier claims as audit-gated.
- Separate circuits/contracts into a dedicated repo when the proof interfaces are
  stable enough for external review.

## Phase 5: Open Governance And Ecosystem

Goal: make contribution paths obvious for developers, GIS/data maintainers,
researchers, humanitarian users, and security reviewers.

- Add maintainer areas for spec, SDK, address data, geodata, security, docs, and
  UI accessibility.
- Publish release notes with compatibility, data provenance, and security-gate
  results.
- Prepare funding/grant applications only after the public-good baseline is
  reproducible by external contributors.
