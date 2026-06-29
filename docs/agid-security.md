# AGID Security Policy

Last updated: 2026-06-03

AGID is a public location, public address, public building, and public map-feature identity layer. Its security model is therefore not based on keeping AGID values secret. The model is based on making public values verifiable, non-personal, hard to tamper with, and safe for independent open-source implementation.

## Security Position

```text
AGID = public, verifiable, tamper-resistant location/address/building/map-feature layer
AOID = private, owner-controlled, encrypted delivery/recipient layer
```

AGID can be open source when the repository, generated SDKs, public APIs, QR payloads, and data packs preserve these boundaries.

## Primary Assets

| Asset | Security goal |
| --- | --- |
| AGID string format | Reject malformed, over-range, or ambiguous identifiers. |
| AGID encode/decode behavior | Keep deterministic parity across SDKs and devices. |
| Public address/building/map-feature evidence | Preserve source attribution, confidence, and license boundaries. |
| Public QR payloads | Exclude recipient, phone, unit, room, access, delivery, owner, and encrypted AOID fields. |
| OpenAPI contract | Make public/private payload boundaries visible to integrators. |
| Spec, vectors, SDKs, and data packs | Publish checksums or detached signatures for release integrity. |

## Required Controls

AGID implementations must:

1. Accept only canonical 12-character AGID values after trim and uppercase normalization.
2. Validate the 10-character hash against the AGID Base32 alphabet.
3. Reject decoded packed values outside the 45-bit AGID range.
4. Reject decoded face values outside `0..5`.
5. Reject decoded coordinates that are not finite numbers.
6. Treat AGID as public and non-personal by design.
7. Keep private AOID data out of public AGID QR payloads, OpenAPI examples, SDK parity vectors, and data packs.
8. Keep third-party source data under its own license and attribution.

## Public QR Boundary

Public AGID QR payloads may include:

- AGID,
- country or sea code,
- public address label,
- public building, road, bridge, park, water, natural-feature, heritage/world-heritage, ruins, landmark, or place label,
- source and confidence metadata.

Public AGID QR payloads must not include:

- recipient,
- phone,
- unit or room,
- private delivery instruction,
- access code,
- private ownership proof,
- owner key id,
- device key id,
- opaque encrypted AOID payload.

Readers must sanitize public QR payloads again when parsing them. A malicious QR that marks itself public but includes private fields must not be allowed to reintroduce those fields.

## Open-Source Release Gate

Before AGID is released as an open-source standard or SDK package:

1. Run AGID core tests, QR security tests, OpenAPI tests, and SDK parity tests.
2. Confirm `sdk/agid-spec/agid-spec.json` and `sdk/agid-spec/test-vectors.json` are in sync.
3. Confirm `/api/v1/openapi.json` exposes `x-agid-standard`, `x-agid-security`, `x-agid-identity`, and `x-agid-communication`.
4. Confirm no AOID private payloads appear in public data packs, examples, parity vectors, or release fixtures.
5. Confirm no secrets, API keys, private tokens, or owner keys are committed.
6. Publish checksums or detached signatures for the spec, vectors, OpenAPI artifact, SDK packages, and data packs.
7. Document third-party data licenses and attribution.

## Implementation Mapping

- `src/lib/agidSecurity.ts` defines the public AGID security profile, ID format validation, packed-value range validation, and public payload private-field checks.
- `src/lib/agid.ts` rejects malformed or over-range AGID decode input.
- `src/lib/registeredAddressQr.ts` sanitizes public QR payloads during build and parse.
- `src/lib/openApiSpec.ts` exposes AGID security requirements through `x-agid-security`.
- `docs/data-licenses.md` defines third-party data license boundaries.
- `docs/privacy-design.md` defines private address and AOID handling.
