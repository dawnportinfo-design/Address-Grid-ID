# @agid/contracts

Versioned AGID constants, schemas, capability contracts, and conformance gates.

This workspace owns its source. The legacy root modules remain as compatibility
facades so existing `src/lib/agidContract` and
`src/address/postalSourcePromotionGate` consumers continue to work unchanged.

The package remains private until its release metadata, provenance, and
standalone verification are prepared. It must remain dependency-free and must
not contain raw addresses, recipient data, credentials, or production secrets.
