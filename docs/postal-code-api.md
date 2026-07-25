# Postal Code API

The public Postal Code API is a format-validation surface, not a postal lookup
or delivery service.

```text
GET  /api/v1/postal-codes/capabilities
POST /api/v1/postal-codes/validate
```

`POST /postal-codes/validate` accepts exactly two fields:

```json
{
  "jurisdictionId": "PT",
  "postalCode": "0000-000"
}
```

The response does not echo the supplied postal code. A `valid-format` result
has `validationLevel: "syntax-only"` and only means that the entire submitted
value matches locally bundled format metadata. It does not establish that the
code exists, belongs to a locality, is in service, or can receive delivery.

## Publication Boundary

- Mature systems are format-only. The service does not copy official postal
  datasets, issue external lookup requests, or make delivery claims.
- `CN`, `IQ`, `IR`, `RU`, `UA`, and `BY` remain format-only and retain source
  and update-review warnings.
- `CL-EA` and `CL-JF` are metadata-only. No parent postal format is inherited
  until parent-authority and publication scope are reviewed.
- `EH`, `SLND`, `CRIM`, `DONB`, `PMR`, `TRNC`, `XD`, `XU`, and `XK` are
  withheld. The API returns a guard response until neutral boundary language,
  non-recognition, source scope, and publication checks are complete.

The API rejects address, recipient, contact, and other unexpected payload
fields. It has no persistence layer, provider connector, or official-data
replication path. Test coverage uses only synthetic format vectors.
