# AGID GIS Validation

AGID uses open-source GIS tooling as a validation layer, not as a frontend dependency.

## Tools

- GDAL: command-line geometry conversion and read validation.
- QGIS: human review of generated GeoJSON, borders, sea areas, territories, and disputed regions.
- PostGIS: recommended later for server-side spatial search and polygon containment.
- JOSM: recommended later for OpenStreetMap tag and building/road name QA.

## Commands

```bash
npm run verify:gis
```

For local preflight checks, use the changed-file fast path:

```bash
npm run verify:gis:changed
```

This checks git changed files first. If no boundary JSON, open-source GIS registry, or validator file changed, it writes a small skipped report and avoids full geometry export, GDAL work, and QGIS project regeneration.

Generates:

- `test-results/gis-validation/agid-boundary-validation.geojson`
- `test-results/gis-validation/agid-boundary-validation.gdal.geojson`
- `test-results/gis-validation/AGID-gis-validation.qgs`
- `test-results/gis-validation/gis-validation-report.json`

Use strict mode when reviewing data migrations:

```bash
npm run verify:gis:strict
```

Strict mode fails on warnings as well as errors. Normal mode fails only when GDAL cannot read the generated GeoJSON or when there are hard geometry errors.

## Review Flow

1. Run `npm run verify:gis`.
2. Open `test-results/gis-validation/AGID-gis-validation.qgs` in QGIS.
3. Check warnings in `gis-validation-report.json`.
4. Fix source JSON for bounds, ring closure, coordinate order, or source metadata.

Coordinates in source JSON are stored as `[lat, lon]`. The validator exports GeoJSON as `[lon, lat]` for GIS tools.
