# AGID Data License Policy

Last updated: 2026-06-17

AGID can be open-source and still use many external evidence layers. The key rule is simple: AGID code, AGID specs, and third-party data must keep separate license boundaries.

The top-level data-license index is `../DATA_LICENSES.md`. The repository-wide license split and open-core policy is `../LICENSE_POLICY.md`.

## License Boundaries

| Layer | Owner | AGID handling |
| --- | --- | --- |
| AGID software and documentation | AGID repository | Repository license applies. |
| `agid-spec` and generated SDK code | AGID repository unless a package states otherwise | Use the SDK package license and parity tests before distribution. |
| OpenStreetMap-derived data | OpenStreetMap contributors | Preserve ODbL attribution and share-alike requirements where applicable. |
| Government open data | Source government or agency | Follow the source dataset terms and attribution text. |
| Postal datasets and APIs | Postal authority, public API, or open dataset maintainer | Use only under the source terms; do not imply official deliverability unless the source supports it. |
| Open geographic datasets | Dataset maintainer or foundation | Preserve the dataset license, citation, and redistribution limits. |
| Commercial or restricted providers | Provider | Keep out of open data packs unless redistribution is explicitly allowed. |

## Source Metadata Requirements

Every registered postal, address, or geography source should carry:

- a stable source ID,
- source URL,
- provider kind or source type,
- coverage region,
- license or terms label,
- confidence or quality notes when available.

Source metadata is not mainly a user-interface feature. It is a governance and compliance feature. The app may hide detailed source chips from ordinary users, but the repository and API should retain enough metadata for audits, integration review, and data-pack maintenance.

## What AGID Must Not Do

AGID must not:

- relabel third-party data as AGID-owned data,
- remove required attribution from source-derived data,
- mix incompatible licenses into one redistributable data pack,
- present weak or missing source coverage as strong verification,
- expose private AOID data as public AGID data.

## Recommended Data-Pack Rule

Each generated source pack should include an attribution manifest with:

- source ID,
- source name,
- URL,
- license or terms,
- retrieval date when available,
- transformed fields,
- confidence notes.

When a source license is uncertain, the source may still be listed as a potential evidence source, but it should not be bundled into a redistributable data pack until the license is reviewed.

In code, missing or uncertain metadata should resolve to `License review required before redistribution`. That status is allowed for evidence discovery, but it is not allowed as a claim that the data can be redistributed.
