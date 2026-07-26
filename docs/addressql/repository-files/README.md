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
```

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

Release rule:

```text
Do not publish raw address, recipient, witness, private-key, proof-secret, or
production credential material.
```
