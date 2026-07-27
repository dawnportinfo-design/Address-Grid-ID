# Regional and Ocean Topographic Open Data Stack v0.1

## Purpose

This stack turns a bounded area of interest into a reproducible acquisition and
conversion plan for 2D vectors and 3D terrain. It combines the existing AGID
global building, road, water, imagery, and land-cover fusion stack with
continent-specific elevation, bathymetry, and coastline sources.

The source catalog is not a data snapshot. Source-backed export stays blocked
until an immutable version, content digest, exact reuse evidence, coverage,
adapter version, horizontal CRS, and vertical datum are verified.

## Source roles

| Region | Preferred high-detail source | Corroboration or fallback |
| --- | --- | --- |
| Africa | Digital Earth Africa SRTM and Coastlines | Copernicus DEM, JAXA AW3D30, GEBCO, ETOPO |
| Asia | National sources such as GSI Japan where available | Copernicus DEM and JAXA AW3D30 |
| Europe | Copernicus DEM and EMODnet Bathymetry | GEBCO and ETOPO |
| North America | USGS 3DEP or NRCan HRDEM | Copernicus DEM, JAXA AW3D30, ETOPO |
| South America | Copernicus DEM | JAXA AW3D30, GEBCO, ETOPO |
| Oceania | Geoscience Australia ELVIS or LINZ elevation | Copernicus DEM, GEBCO, ETOPO |
| Antarctica | REMA | Copernicus DEM, GEBCO, ETOPO |
| Arctic | ArcticDEM and applicable national data | Copernicus DEM, GEBCO, ETOPO |
| Ocean | GEBCO_2025 | NOAA ETOPO 2022 |

## Conversion contract

Elevation and bathymetry remain raster provenance roots. AGID clips the source
window, applies source quality masks, normalizes horizontal and vertical
references, and then derives:

- contour vectors with interval and topology checks;
- a triangulated irregular network for the terrain mesh;
- geometric-error levels of detail for glTF or other 3D formats;
- coastline breaklines that prevent independent land and sea interpolation.

For coastal areas, export is blocked until the elevation model, bathymetry,
shoreline epoch, and vertical references are reconciled. The generated
bathymetry is not a navigational chart.

## Acquisition boundary

`buildRegionalTopographicOpenSourcePlan` produces deterministic tasks and
expected evidence paths. It does not download data. Raw source snapshots belong
under a content-addressed path:

`raw/topography/{source-id}/{immutable-version}/{sha256}`

`promoteRegionalTopographicSnapshot` is the only route from catalog metadata to
an approved `TopographicSourceRecord`. The existing topographic export gate then
checks AOI coverage, freshness, format rights, and requested layers.

## Executable elevation vectorizer

`vectorizeNormalizedElevationGrid` is the first executable conversion stage. It
accepts a bounded, finite, no-data-resolved EPSG:4326 elevation grid linked to
an approved `TopographicSourceRecord`. It then:

- applies the existing rights, freshness, coverage, layer, and AOI gates;
- generates a deterministic alternating-diagonal TIN;
- derives bounded contour levels with Turf isolines;
- emits the existing `TopographicDataset` contract for glTF, GeoJSON, OBJ,
  IFC, STL, DXF, or text serialization.

The v0.1 execution stage is limited to one million grid cells and 512 contour
levels. Antimeridian grids and unresolved no-data cells fail closed. Projected
local-metre coordinates, GeoTIFF/COG decoding, quality-mask resolution, and
antimeridian splitting remain separate adapter stages for later loops.

`decodeGeoTiffElevationGrid` provides the first local GeoTIFF/COG byte adapter.
It does not accept a URL or perform a network request. The adapter verifies the
actual SHA-256 against the promoted source record, accepts only an unrotated
north-up EPSG:4326 grid, converts PixelIsArea extents to pixel-centre bounds,
and reads one explicitly selected elevation band. Files with unresolved NoData,
unsupported CRS, affine rotation, excessive cells, stale rights evidence, or a
digest mismatch fail closed.

The v0.2 adapter can resolve a narrowly bounded set of isolated NoData cells.
Resolution is opt-in and requires a byte-for-byte quality mask whose SHA-256 is
bound to the same promoted source record as the GeoTIFF. The mask must match
the GeoTIFF NoData cells exactly, cover no more than five percent of the grid,
and each missing cell must have an observed left/right or up/down pair. Values
are derived from the original cardinal observations only, so filled cells
cannot propagate into another fill. The output records the method, mask digest,
resolved cell count, and fraction.

Projected-grid reprojection, continuous-gap or edge-gap reconstruction, and
remote COG range acquisition remain separate future stages. Callers must not
infer that catalog registration means the corresponding bytes have been
acquired.

`serializeCoastalSeamManifest` emits a deterministic JSON evidence sidecar for
reconciled coastal grids. It rechecks all three source gates and binds the land,
bathymetry, and coastline source versions, snapshot hashes, reuse terms,
correction routes, coverage, CRS, vertical datum, shoreline epoch, and
classification hash. Elevation arrays are intentionally excluded. The sidecar
can accompany geometry formats that cannot carry complete multi-source
provenance, but it is not independently signed and does not yet make the
reconciled grid directly exportable as a `TopographicDataset`.

`serializeCoastalTerrainGltfBundle` is the first geometry bridge for that
sidecar. It generates a deterministic LOD0 TIN with the existing glTF
serializer and binds the manifest digest plus the three source IDs into glTF
asset metadata. The function refuses mixed synthetic/source-backed evidence.
It currently emits glTF only; additional LOD selection and sidecars for formats
without embedded metadata remain future stages.

## Privacy and non-claims

The plan accepts only a bounded AOI and optional country code. It does not
accept or retain recipients, unit numbers, delivery instructions, query logs,
or private AOID material. Terrain and map context do not prove an address,
entrance, recipient, or delivery point.
