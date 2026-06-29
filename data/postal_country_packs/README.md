# AGID Postal Country Packs

Version: agid-postal-country-pack-v0.1
Country pack count: 49

This directory contains draft AGID Postal Country Packs for target countries
where postal codes are absent, not required, weak, or suitable for supplemental
AGID postal-zone design. These packs are safe OSS planning artifacts, not
official postal authority datasets.

## Countries

- AE: United Arab Emirates (agid-postal-pack-ae)
- AG: Antigua and Barbuda (agid-postal-pack-ag)
- AO: Angola (agid-postal-pack-ao)
- AW: Aruba (agid-postal-pack-aw)
- BF: Burkina Faso (agid-postal-pack-bf)
- BI: Burundi (agid-postal-pack-bi)
- BJ: Benin (agid-postal-pack-bj)
- BO: Bolivia (agid-postal-pack-bo)
- BS: Bahamas (agid-postal-pack-bs)
- BW: Botswana (agid-postal-pack-bw)
- BZ: Belize (agid-postal-pack-bz)
- CF: Central African Republic (agid-postal-pack-cf)
- CG: Congo (Republic) (agid-postal-pack-cg)
- CI: Cote d'Ivoire (agid-postal-pack-ci)
- CK: Cook Islands (agid-postal-pack-ck)
- CM: Cameroon (agid-postal-pack-cm)
- CW: Curacao (agid-postal-pack-cw)
- DM: Dominica (agid-postal-pack-dm)
- ER: Eritrea (agid-postal-pack-er)
- FJ: Fiji (agid-postal-pack-fj)
- GA: Gabon (agid-postal-pack-ga)
- GD: Grenada (agid-postal-pack-gd)
- GM: Gambia (agid-postal-pack-gm)
- GQ: Equatorial Guinea (agid-postal-pack-gq)
- JM: Jamaica (agid-postal-pack-jm)
- KM: Comoros (agid-postal-pack-km)
- KP: Korea (Democratic People's Republic) (agid-postal-pack-kp)
- LY: Libya (agid-postal-pack-ly)
- ML: Mali (agid-postal-pack-ml)
- MR: Mauritania (agid-postal-pack-mr)
- QA: Qatar (agid-postal-pack-qa)
- RW: Rwanda (agid-postal-pack-rw)
- SB: Solomon Islands (agid-postal-pack-sb)
- SC: Seychelles (agid-postal-pack-sc)
- SL: Sierra Leone (agid-postal-pack-sl)
- SO: Somalia (agid-postal-pack-so)
- SR: Suriname (agid-postal-pack-sr)
- SS: South Sudan (agid-postal-pack-ss)
- ST: Sao Tome and Principe (agid-postal-pack-st)
- SX: Sint Maarten (agid-postal-pack-sx)
- SY: Syria (agid-postal-pack-sy)
- TD: Chad (agid-postal-pack-td)
- TG: Togo (agid-postal-pack-tg)
- TK: Tokelau (agid-postal-pack-tk)
- TO: Tonga (agid-postal-pack-to)
- TV: Tuvalu (agid-postal-pack-tv)
- VU: Vanuatu (agid-postal-pack-vu)
- YE: Yemen (agid-postal-pack-ye)
- ZW: Zimbabwe (agid-postal-pack-zw)

## Safety Contract

- Packs contain generated metadata, source slots, stable locality IDs, VPL
  seeds, and conformance vectors.
- Packs do not contain personal addresses, recipient names, phone numbers,
  private AOID bodies, AGID-S payloads, proof codes, or raw third-party data.
- Generated codes remain simulation or draft until official authority, carrier
  pilot, privacy, data-trust, and transition gates are satisfied.

## Regenerate

```bash
npm run export:postal-country-pack -- --all
```
