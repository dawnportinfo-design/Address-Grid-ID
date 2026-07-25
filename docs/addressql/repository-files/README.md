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
| `docs/addressql/repository-files/LICENSE` | `LICENSE` |
| `docs/addressql/repository-files/LICENSES-DATA.md` | `LICENSES-DATA.md` |
| `docs/addressql/repository-files/CONTRIBUTING.md` | `CONTRIBUTING.md` |
| `docs/addressql/repository-files/SECURITY.md` | `SECURITY.md` |
| `docs/addressql/repository-files/CODE_OF_CONDUCT.md` | `CODE_OF_CONDUCT.md` |

Release rule:

```text
Do not publish raw address, recipient, witness, private-key, proof-secret, or
production credential material.
```
