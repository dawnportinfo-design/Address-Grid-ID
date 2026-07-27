# AddressQL Repository Root File Templates

These files are intended to be copied to the root of the standalone public
repository:

```text
dawnportinfo-design/addressql
```

They keep the first public release consistent with the AddressQL split-license,
security, contribution, and data-boundary policy.

Recommended copy map:

| source | standalone repository target |
| --- | --- |
| `docs/addressql/README.md` | `README.md` |
| `docs/addressql/repository-files/package.json` | `package.json` |
| `docs/addressql/repository-files/LICENSE` | `LICENSE` |
| `docs/addressql/repository-files/LICENSES-DATA.md` | `LICENSES-DATA.md` |
| `docs/addressql/repository-files/CONTRIBUTING.md` | `CONTRIBUTING.md` |
| `docs/addressql/repository-files/SECURITY.md` | `SECURITY.md` |
| `docs/addressql/repository-files/CODE_OF_CONDUCT.md` | `CODE_OF_CONDUCT.md` |

Run the exported country-core conformance checks with:

```bash
npm install
npm run verify:addressql-country-core
npm run verify:addressql-country-data-promotion
npm run verify:addressql-multilingual-quality
npm run verify:addressql-api
npm run verify:addressql-runtime-config
npm run verify:addressql-runtime-release
```

The `prepare:addressql-runtime-attestation` and
`finalize:addressql-runtime-attestation` commands provide the offline
independent-signature workflow documented in `docs/practical-api-v1.md`.
Reviewer-key lifecycle, quorum releases, and rollback prevention are
documented in `docs/runtime-release-security-v1.md`.

The exported address-format profiles and postal country packs are bounded
format metadata, source catalogs, and synthetic-test assets. They are not
complete postal-existence or delivery-point databases. L2 and higher remain
blocked until every required evidence gate is approved.

P2 publishes an all-profile promotion index. AU, GT, NZ, and PA are L3 review
candidates only; no L2-L5 country capability is enabled.

P3 publishes M0-M4 country language-quality gates. Native and international
templates are independently testable, while transliteration and place-name
translation remain review candidates until their source, holdout, signature,
and runtime evidence is approved.

Start the P1 API on loopback with:

```bash
npm run serve:addressql-api
```

The server optionally loads signed local postcode datasets through
`ADDRESSQL_RUNTIME_CONFIG` and `ADDRESSQL_TRUST_STORE`. The checked-in
conformance fixture can be enabled explicitly with
`ADDRESSQL_ALLOW_CONFORMANCE=1`; conformance decisions never become live
postal-existence evidence.

Create the local JP official-plus-OSS runtime with:

```bash
npm run sync:addressql-public-postal-data
```

It combines the reusable Japan Post UTF-8 CSV with a GeoNames CC BY 4.0
cross-check, retains postcodes only, and writes source/version/terms/correction
evidence under ignored `.agid-runtime/`. An empty generated trust store trusts
nobody. Add only an independently supplied Ed25519 public key with
`scripts/register-addressql-trusted-public-key.ts`; private keys are rejected.

Release rule:

```text
Do not publish raw address, recipient, witness, private-key, proof-secret, or
production credential material.
```
