# AddressQL Practical API v1

Status: P1 executable self-hosted API

## Run

```bash
npm run serve:addressql-api
```

The default listener is `http://127.0.0.1:8787`. Set
`ADDRESSQL_API_HOST` or `ADDRESSQL_API_PORT` explicitly when a self-hosted
deployment needs another binding.

The reference adapter does not log request bodies and does not persist
requests. It accepts country identifiers and postal codes only. Raw address,
recipient, street, premise, coordinate, credential, and proof-secret fields
are rejected by the strict request contract.

## Endpoints

```text
GET  /v1/health
GET  /v1/countries
GET  /v1/countries/{countryCode}/capabilities
GET  /v1/promotions
GET  /v1/countries/{countryCode}/promotions
GET  /v1/multilingual
GET  /v1/countries/{countryCode}/languages
POST /v1/multilingual/assess
POST /v1/postal/validate
POST /v1/postal/validate/batch
```

OpenAPI:

```text
docs/specs/openapi/addressql-practical-api-v1.openapi.json
```

## Example

```bash
curl http://127.0.0.1:8787/v1/postal/validate \
  -H "content-type: application/json" \
  -H "x-request-id: example.jp-format-1" \
  -d '{"countryCode":"JP","postalCode":"1000001","purpose":"format"}'
```

The response deliberately does not repeat the submitted postal code. It
returns field status, the country's highest enabled capability level, the
requested capability state, and missing evidence.

P2 promotion endpoints return country-specific review candidacy and exact
blockers. `review_candidate` is never equivalent to `enabled`.

P3 multilingual endpoints expose country language, script, adapter, and
M0-M4 gate metadata. The assessment endpoint accepts language metadata only;
it rejects address text. Same-language normalization can be `ready`, while
cross-language routes remain `review_required` until source-backed aliases,
country holdouts, independent signatures, and runtime adapters are approved.
No automatic place-name translation is enabled.

## Capability Semantics

| purpose | level | current behavior |
| --- | --- | --- |
| `format` | L1 | Executes when the country profile has an approved local regex. |
| `existence` | L2 | Returns `unknown` while source, rights, dataset digest, version, freshness, coverage, correction, holdout, signature, or runtime-adapter evidence is missing; independently attested adapters can enable it. |
| `delivery` | L4 | Returns `unknown` until an independently attested delivery-area source and its evidence chain are available. |

An HTTP `200` means the request was evaluated. The validation status can still
be `unknown`, `fail`, or `not_applicable`. Callers must inspect
`validation.status`; they must not treat HTTP success as address existence or
delivery success.

AU, GT, NZ, and PA are currently L3 review candidates in the bundled metadata.
No P2 target is enabled by default.

## Runtime Evidence Adapters

L2 postal-existence and L4 delivery-area decisions can be supplied by an
explicit local runtime adapter. An adapter is not discovered from the network
and cannot become live merely by being registered. Live execution requires:

- a complete source, reuse-rights, coverage, correction, version, freshness,
  dataset digest, holdout, and report evidence envelope;
- a non-expired evidence window;
- an independently supplied attestation verifier;
- an `approved` adapter mode.

`conformance` adapters are opt-in test fixtures. Their decisions remain
`unknown` in the practical API and use the
`synthetic_conformance` evidence level. Approved adapters expose
`independently_attested`; conflicting adapters return `conflict` instead of
silently selecting one result. Responses list technical adapter and source
references but never repeat the submitted postal code.

`createAddressQlPostalSetAdapter` provides a local, reproducible loader for
postcode and delivery-area sets. A set declared `complete` may return a
negative decision for a missing code. A `partial` set must return `unknown`
for misses, preventing incomplete open data from becoming false rejection
evidence. Capability, promotion, and health endpoints use the same live
adapter gate as validation requests.

## Limits

- request body: 64 KiB;
- batch size: 100;
- postal code: 32 characters after NFKC normalization;
- country or neutral-scope identifier: 16 ASCII characters;
- BCP 47 language tag: 35 ASCII characters;
- request identifier: 64 ASCII technical-identifier characters;
- HTTP request timeout: 10 seconds;
- SDK default timeout: 5 seconds.

## Verification

```bash
npm run verify:addressql-api
npm run verify:addressql-multilingual-quality
npm run verify:addressql
```

The tests execute the framework-independent handler and the real loopback HTTP
adapter. They use synthetic postal strings only and do not send production
traffic.

## Non-Claims

- Format validation does not prove postal-code existence.
- Postal-code existence does not prove address existence.
- Delivery-area status does not prove delivery-point reachability.
- No result proves residence, identity, recipient authorization, or a carrier
  service-level agreement.
