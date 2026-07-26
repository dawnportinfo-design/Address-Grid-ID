# AGID Topographic Export v0.1

Status: executable foundation, not a worldwide data-coverage claim.

## Purpose

AGID Topographic Export provides a source-gated workflow for rectangular 2D,
3D, CAD, BIM, raster, and raw geographic exports. The browser workspace is
available at `/topographic-export`.

The feature inventory was checked against the public TopoExport surfaces on
2026-07-26:

- <https://topoexport.com/>
- <https://app.topoexport.com/>

This document describes AGID behavior only. It does not claim commercial
parity, equivalent data coverage, identical accuracy, or access to proprietary
TopoExport datasets.

## Executable surface

| Capability | AGID v0.1 |
| --- | --- |
| Rectangle selection | WGS84 bounds, including antimeridian crossing |
| Area limit | Hard block above 50 km2 |
| Projection | Explicit `EPSG:<code>` required |
| 2D layers | Buildings, parcels, roads, rail, water, shadows, vegetation, contours |
| 3D layers | Buildings, LoD2 roof geometry, parcels, transport, water, vegetation, contours, terrain mesh |
| Raster layers | Satellite/terrain raster contract |
| Formats | DXF, PDF, SVG, IFC4, OBJ, glTF 2.0, STL, GeoJSON, GeoTIFF, TXT |
| Source evidence | Publisher, product, URL, terms, license, version, dates, attribution, coverage, correction route |
| Privacy boundary | No recipient, raw address, query-log, credential, or private coordinate fields |
| Safe demo | Synthetic geometry and elevation fixture only |

## Export gates

`buildTopographicExportPlan()` blocks an export when any required condition is
missing:

1. Valid finite WGS84 bounds and area no greater than 50 km2.
2. Explicit EPSG identifier.
3. At least one selected layer.
4. Format/layer compatibility.
5. A source that covers the selected scope, layer, and output format.
6. Approved reuse status.
7. Source URL, terms URL, license, version, publication/retrieval dates,
   attribution, and correction route.
8. A current freshness deadline when the source declares one.
9. Non-synthetic evidence for `source-backed` mode.

LoD2 roof geometry always carries an additional country/scope warning. A valid
serializer result does not imply cadastral authority, legal boundary accuracy,
delivery reachability, or worldwide availability.

## Format implementation

The conformance suite creates and checks a real artifact for every listed
format:

- DXF uses POLYLINE, POINT, and 3DFACE entities.
- PDF is a vector PDF 1.4 document.
- SVG preserves vector layer identity in element attributes.
- IFC uses IFC4 `IFCTRIANGULATEDFACESET`.
- OBJ preserves points, lines, and triangle faces.
- glTF uses glTF 2.0 point, line, and triangle primitives with an embedded
  binary buffer.
- STL is an ASCII triangle surface.
- GeoJSON is a feature collection with source IDs and AGID layer IDs.
- GeoTIFF is a little-endian WGS84 grayscale raster with pixel scale, tiepoint,
  and GeoKey directory tags.
- TXT is a deterministic feature/mesh interchange fixture.

Run:

```powershell
npm run verify:topographic-export
```

## Source promotion

The built-in source record is synthetic and cannot satisfy a source-backed
request. Real-world sources must be promoted country by country after their
reuse terms and geographic scope are verified. Raw source snapshots stay
separate from derived artifacts.

The next promotion layer should adapt AGID's existing official and reusable OSS
source catalogs into `TopographicSourceRecord`, then add ingestion fixtures for
each layer. Satellite imagery, cadastral data, vegetation classification, and
LoD2 roofs remain blocked where no approved source exists.
