# agid-rs

Rust SDK package scaffold for AGID.

This package is generated from `agid-spec/agid-spec.json` so every language binding follows the same coordinate model, ID format, and public API.

## API

- `encode(latitude, longitude)`
- `decode(agid)`
- `cellBounds(agid)`
- `cellPolygon(agid)`

## Status

This scaffold is ready for packaging and CI wiring. The canonical implementation is the existing TypeScript/Rust core in this repository; language implementations should use the shared spec and vectors in `agid-spec`.
