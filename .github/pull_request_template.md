## Summary

Describe the smallest useful change.

## Type

- [ ] App/UI
- [ ] Spec / conformance
- [ ] SDK
- [ ] Address format / country pack
- [ ] Postal / geo data
- [ ] Security / privacy
- [ ] Docs
- [ ] Other

## Privacy And Security

- [ ] No raw address, AOID plaintext, recipient, phone, room/unit, proof code, private key, witness, or secret material is added to public fixtures, examples, logs, docs, or downloads.
- [ ] Local-only and self-hosted behavior still work or the limitation is documented.
- [ ] External connectors, if touched, keep auth, no-cache, retry, audit, and redaction boundaries intact.

## Verification

List commands run:

```text
npm run ...
```

## Data And License

- [ ] No new external data source.
- [ ] New external data source is documented with license, attribution, source URL, generatedAt/sourceVersion, and confidence/limitations.

## Compatibility

- [ ] Does not change public AGID/AOID semantics.
- [ ] Changes public contract/spec and includes migration notes.
- [ ] Updates SDK parity vectors or conformance tests if needed.
