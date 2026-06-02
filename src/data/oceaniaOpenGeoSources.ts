import {
POLAR_OPEN_GEO_SOURCES,
getPolarOpenSourceIds,
type PolarOpenGeoSourceId,
} from './polarOpenGeoSources';

export type OceaniaOpenGeoSourceId =
  | PolarOpenGeoSourceId
  | 'osm-nominatim'
  | 'osm-overpass'
  | 'openaddresses'
  | 'geonames-postal'
  | 'geonames-gazetteer'
  | 'geoboundaries'
  | 'upu-addressing'
  | 'zippopotam'
  | 'jaxa-aw3d30'
  | 'gebco-bathymetry'
  | 'gmrt-topography'
  | 'hydrosheds'
  | 'esa-worldcover'
  | 'protected-planet-wdpa'
  | 'gbif-occurrence'
  | 'global-mangrove-watch'
  | 'allen-coral-atlas'
  | 'pacific-data-hub'
  | 'digital-earth-pacific'
  | 'pacioos'
  | 'digital-earth-australia-coastlines'
  | 'digital-earth-australia-wofs'
  | 'digital-earth-australia-fractional-cover'
  | 'geoscience-australia-elvis'
  | 'linz-data-service'
  | 'linz-elevation'
  | 'la-poste-fr-overseas'
  | 'data-gouv-fr-postcodes'
  | 'copernicus-dem'
  | 'copernicus-corine-land-cover'
  | 'emodnet-bathymetry'
  | 'emodnet-seabed-habitats'
  | 'eea-natura-2000'
  | 'eea-eunis-habitats'
  | 'jrc-esdac-soils'
  | 'auspost-postcode'
  | 'auspost-territories'
  | 'linz-nz-addresses'
  | 'nz-post-territories'
  | 'post-fiji'
  | 'post-png'
  | 'samoa-post'
  | 'tonga-post'
  | 'vanuatu-post'
  | 'solomon-post'
  | 'usps-pacific-territories'
  | 'kiribati-post'
  | 'tuvalu-post'
  | 'nauru-post'
  | 'british-overseas-postal-reference'
  | 'pitcairn-post';

export interface OceaniaOpenGeoSource {
  id: OceaniaOpenGeoSourceId;
  name: string;
  url: string;
  kind:
    | 'postal-code'
    | 'address'
    | 'geocoding'
    | 'admin-boundary'
    | 'gazetteer'
    | 'standard'
    | 'elevation'
    | 'marine'
    | 'hydrology'
    | 'land-cover'
    | 'protected-area'
    | 'biodiversity'
    | 'coastline'
    | 'imagery'
    | 'oceanography'
    | 'data-catalog'
    | 'bathymetry'
    | 'cryosphere'
    | 'topography';
  coverage: 'global' | 'oceania' | 'country' | 'territory' | 'polar' | 'antarctic' | 'arctic' | 'greenland';
  usage: 'primary' | 'fallback' | 'validation' | 'reference';
  license?: string;
  notes: string;
}

export const OCEANIA_OPEN_GEO_SOURCES: Record<OceaniaOpenGeoSourceId, OceaniaOpenGeoSource> = {
  ...POLAR_OPEN_GEO_SOURCES,
  'osm-nominatim': {
    id: 'osm-nominatim',
    name: 'OpenStreetMap Nominatim',
    url: 'https://nominatim.org/release-docs/latest/api/Overview/',
    kind: 'geocoding',
    coverage: 'global',
    usage: 'fallback',
    license: 'ODbL',
    notes: 'Open geocoding and reverse geocoding for address display and fallback lookup.',
  },
  'osm-overpass': {
    id: 'osm-overpass',
    name: 'OpenStreetMap Overpass API',
    url: 'https://overpass-api.de/',
    kind: 'address',
    coverage: 'global',
    usage: 'reference',
    license: 'ODbL',
    notes: 'Queryable OSM address tags, roads, settlements, islands, and administrative relations.',
  },
  openaddresses: {
    id: 'openaddresses',
    name: 'OpenAddresses',
    url: 'https://openaddresses.io/',
    kind: 'address',
    coverage: 'global',
    usage: 'validation',
    license: 'Varies by source dataset',
    notes: 'Open address point and street-address reference data where country or city coverage is available.',
  },
  'geonames-postal': {
    id: 'geonames-postal',
    name: 'GeoNames Postal Code Data',
    url: 'https://download.geonames.org/export/zip/',
    kind: 'postal-code',
    coverage: 'global',
    usage: 'validation',
    license: 'CC BY 4.0',
    notes: 'Postal-code to locality matching for countries with downloadable GeoNames ZIP datasets.',
  },
  'geonames-gazetteer': {
    id: 'geonames-gazetteer',
    name: 'GeoNames Gazetteer',
    url: 'https://download.geonames.org/export/dump/',
    kind: 'gazetteer',
    coverage: 'global',
    usage: 'reference',
    license: 'CC BY 4.0',
    notes: 'Settlement names, alternate names, coordinates, island names, and administrative hierarchy reference.',
  },
  geoboundaries: {
    id: 'geoboundaries',
    name: 'geoBoundaries',
    url: 'https://www.geoboundaries.org/',
    kind: 'admin-boundary',
    coverage: 'global',
    usage: 'reference',
    license: 'CC BY 4.0',
    notes: 'Open administrative boundaries for states, provinces, districts, islands, and territories.',
  },
  'upu-addressing': {
    id: 'upu-addressing',
    name: 'UPU Addressing Solutions',
    url: 'https://www.upu.int/en/Postal-Solutions/Programmes-Services/Addressing-Solutions',
    kind: 'standard',
    coverage: 'global',
    usage: 'reference',
    notes: 'Postal addressing-system reference for country-level delivery conventions.',
  },
  zippopotam: {
    id: 'zippopotam',
    name: 'Zippopotam.us',
    url: 'https://api.zippopotam.us/',
    kind: 'postal-code',
    coverage: 'global',
    usage: 'fallback',
    notes: 'Free postal-code lookup API useful for countries and territories with public coverage.',
  },
  'jaxa-aw3d30': {
    id: 'jaxa-aw3d30',
    name: 'JAXA ALOS World 3D - 30m',
    url: 'https://www.eorc.jaxa.jp/ALOS/en/dataset/aw3d30/index.htm',
    kind: 'elevation',
    coverage: 'global',
    usage: 'reference',
    license: 'JAXA AW3D30 terms of use',
    notes: 'Open 30m elevation and surface model for Pacific mountains, volcanic islands, ridges, valleys, and coastal terrain context.',
  },
  'gebco-bathymetry': {
    id: 'gebco-bathymetry',
    name: 'GEBCO Gridded Bathymetry',
    url: 'https://www.gebco.net/data_and_products/gridded_bathymetry_data/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    license: 'GEBCO terms of use',
    notes: 'Global bathymetry and land elevation grid for Pacific seas, island shelves, trenches, channels, reefs, and offshore delivery context.',
  },
  'gmrt-topography': {
    id: 'gmrt-topography',
    name: 'Global Multi-Resolution Topography',
    url: 'https://www.gmrt.org/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    license: 'GMRT terms of use',
    notes: 'Marine and coastal topography synthesis for Pacific ridges, seamounts, trenches, volcanic island arcs, and ocean floor context.',
  },
  hydrosheds: {
    id: 'hydrosheds',
    name: 'HydroSHEDS',
    url: 'https://www.hydrosheds.org/',
    kind: 'hydrology',
    coverage: 'global',
    usage: 'reference',
    license: 'Free for non-commercial use; check HydroSHEDS license for redistribution',
    notes: 'Hydrographic basins, streams, drainage, lakes, wetlands, and natural water context for Oceania islands and continental Australia.',
  },
  'esa-worldcover': {
    id: 'esa-worldcover',
    name: 'ESA WorldCover',
    url: 'https://esa-worldcover.org/en/data-access',
    kind: 'land-cover',
    coverage: 'global',
    usage: 'reference',
    license: 'Free and open data access',
    notes: '10 m land cover for Pacific forest, grassland, wetland, mangrove, cropland, bare ground, reef-island, and natural landscape labels.',
  },
  'protected-planet-wdpa': {
    id: 'protected-planet-wdpa',
    name: 'Protected Planet WDPA',
    url: 'https://www.protectedplanet.net/en/thematic-areas/wdpa',
    kind: 'protected-area',
    coverage: 'global',
    usage: 'reference',
    license: 'UNEP-WCMC and IUCN terms',
    notes: 'Protected terrestrial and marine areas for Pacific reserves, national parks, marine protected areas, lagoons, reefs, and conservation context.',
  },
  'gbif-occurrence': {
    id: 'gbif-occurrence',
    name: 'GBIF Occurrence API',
    url: 'https://techdocs.gbif.org/en/openapi/v1/occurrence',
    kind: 'biodiversity',
    coverage: 'global',
    usage: 'reference',
    license: 'Varies by dataset record',
    notes: 'Biodiversity occurrence evidence for Pacific habitats, endemic species, reefs, forests, wetlands, islands, and protected natural areas.',
  },
  'global-mangrove-watch': {
    id: 'global-mangrove-watch',
    name: 'Global Mangrove Watch',
    url: 'https://www.wetlands.org/coasts-and-deltas/global-mangrove-watch/',
    kind: 'land-cover',
    coverage: 'global',
    usage: 'reference',
    notes: 'Mangrove distribution and change monitoring for Pacific coasts, lagoons, estuaries, deltas, wetlands, and natural shoreline context.',
  },
  'allen-coral-atlas': {
    id: 'allen-coral-atlas',
    name: 'Allen Coral Atlas',
    url: 'https://www.allencoralatlas.org/atlas/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    notes: 'Shallow coral reef habitat and geomorphic-zone mapping for Pacific reefs, lagoons, atolls, reef islands, and marine protected areas.',
  },
  'pacific-data-hub': {
    id: 'pacific-data-hub',
    name: 'Pacific Data Hub',
    url: 'https://pacificdata.org/',
    kind: 'gazetteer',
    coverage: 'oceania',
    usage: 'reference',
    notes: 'Official Pacific regional data hub with geospatial, environment, ocean, island, social, and natural resource datasets for Pacific Island countries.',
  },
  'digital-earth-pacific': {
    id: 'digital-earth-pacific',
    name: 'Digital Earth Pacific Data Access',
    url: 'https://digitalearthpacific.github.io/data-access/',
    kind: 'imagery',
    coverage: 'oceania',
    usage: 'reference',
    notes: 'Open Digital Earth Pacific data access for satellite-derived Pacific coastline, water, land, island, and natural hazard monitoring workflows.',
  },
  pacioos: {
    id: 'pacioos',
    name: 'Pacific Islands Ocean Observing System',
    url: 'https://www.pacioos.hawaii.edu/',
    kind: 'oceanography',
    coverage: 'oceania',
    usage: 'reference',
    notes: 'Pacific ocean data services for waves, currents, bathymetry, coastal waters, reefs, hazards, and marine natural context.',
  },
  'digital-earth-australia-coastlines': {
    id: 'digital-earth-australia-coastlines',
    name: 'Digital Earth Australia Coastlines',
    url: 'https://www.ga.gov.au/scientific-topics/dea/dea-data-and-products/dea-coastlines/faqs',
    kind: 'coastline',
    coverage: 'country',
    usage: 'reference',
    notes: 'Annual Australian coastline and coastal-change product for beaches, ports, islands, erosion, estuaries, and shoreline address context.',
  },
  'digital-earth-australia-wofs': {
    id: 'digital-earth-australia-wofs',
    name: 'Digital Earth Australia Water Observations',
    url: 'https://data.gov.au/data/dataset/dea-water-observations',
    kind: 'hydrology',
    coverage: 'country',
    usage: 'reference',
    notes: 'Surface water observations for floodplains, lakes, wetlands, rivers, reservoirs, coastal water edges, and Australian water-adjacent addresses.',
  },
  'digital-earth-australia-fractional-cover': {
    id: 'digital-earth-australia-fractional-cover',
    name: 'Digital Earth Australia Fractional Cover',
    url: 'https://www.ga.gov.au/scientific-topics/dea/dea-data-and-products/dea-fractional-cover',
    kind: 'land-cover',
    coverage: 'country',
    usage: 'reference',
    notes: 'Australian green vegetation, dry vegetation, and bare-ground cover for bushland, desert, grassland, farms, mountain foothills, and natural landscape context.',
  },
  'geoscience-australia-elvis': {
    id: 'geoscience-australia-elvis',
    name: 'Geoscience Australia ELVIS Elevation and Depth',
    url: 'https://www.ga.gov.au/scientific-topics/national-location-information/digital-elevation-data',
    kind: 'elevation',
    coverage: 'country',
    usage: 'reference',
    notes: 'Australian elevation and depth foundation data for mountain terrain, escarpments, coastal elevation, flood risk, and natural-address precision.',
  },
  'linz-data-service': {
    id: 'linz-data-service',
    name: 'LINZ Data Service',
    url: 'https://www.linz.govt.nz/products-services/data/linz-data-service',
    kind: 'gazetteer',
    coverage: 'country',
    usage: 'reference',
    license: 'CC BY 4.0 for many datasets; check dataset metadata',
    notes: 'New Zealand official land, seabed, topographic, hydrographic, address, imagery, and natural geography data service.',
  },
  'linz-elevation': {
    id: 'linz-elevation',
    name: 'LINZ Elevation Data',
    url: 'https://www.linz.govt.nz/products-services/data/types-linz-data/elevation-data/access-elevation-data',
    kind: 'elevation',
    coverage: 'country',
    usage: 'reference',
    license: 'CC BY 4.0 for many datasets; check dataset metadata',
    notes: 'New Zealand elevation datasets for mountains, volcanic terrain, valleys, coastal cliffs, islands, and natural route/address context.',
  },
  'la-poste-fr-overseas': {
    id: 'la-poste-fr-overseas',
    name: 'La Poste French Overseas Postal Reference',
    url: 'https://www.laposte.fr/outils/trouver-un-code-postal',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'primary',
    notes: 'French postal-code lookup for Pacific French overseas territories represented in Oceania metadata.',
  },
  'data-gouv-fr-postcodes': {
    id: 'data-gouv-fr-postcodes',
    name: 'France API Codes Postaux',
    url: 'https://www.data.gouv.fr/datasets/api-codes-postaux',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'primary',
    notes: 'French official open-data postal-code API and dataset for French Pacific territory validation where covered.',
  },
  'copernicus-dem': {
    id: 'copernicus-dem',
    name: 'Copernicus DEM',
    url: 'https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM.html',
    kind: 'elevation',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European elevation reference retained for French Pacific territory metadata compatibility.',
  },
  'copernicus-corine-land-cover': {
    id: 'copernicus-corine-land-cover',
    name: 'Copernicus CORINE Land Cover',
    url: 'https://land.copernicus.eu/en/products/corine-land-cover',
    kind: 'land-cover',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European land-cover reference retained for French overseas territory metadata compatibility.',
  },
  'emodnet-bathymetry': {
    id: 'emodnet-bathymetry',
    name: 'EMODnet Bathymetry',
    url: 'https://emodnet.ec.europa.eu/en/bathymetry',
    kind: 'marine',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European marine bathymetry reference retained for overseas coastal and island metadata compatibility.',
  },
  'emodnet-seabed-habitats': {
    id: 'emodnet-seabed-habitats',
    name: 'EMODnet Seabed Habitats',
    url: 'https://emodnet.ec.europa.eu/en/seabed-habitats',
    kind: 'marine',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European seabed habitat reference retained for overseas marine natural context compatibility.',
  },
  'eea-natura-2000': {
    id: 'eea-natura-2000',
    name: 'EEA Natura 2000 Protected Areas',
    url: 'https://www.eea.europa.eu/data-and-maps/data/natura-2',
    kind: 'protected-area',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European protected-area reference retained for French overseas metadata validation.',
  },
  'eea-eunis-habitats': {
    id: 'eea-eunis-habitats',
    name: 'EEA EUNIS Habitat Classification',
    url: 'https://eunis.eea.europa.eu/habitats',
    kind: 'biodiversity',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European habitat classification retained for overseas terrestrial, freshwater, and marine habitat context.',
  },
  'jrc-esdac-soils': {
    id: 'jrc-esdac-soils',
    name: 'JRC European Soil Data Centre',
    url: 'https://data.jrc.ec.europa.eu/collection/ESDAC',
    kind: 'land-cover',
    coverage: 'territory',
    usage: 'reference',
    notes: 'European soil and terrain source retained for overlapping French Pacific metadata validation.',
  },
  'auspost-postcode': {
    id: 'auspost-postcode',
    name: 'Australia Post Postcode Search',
    url: 'https://auspost.com.au/postcode',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'Official Australian postcode search.',
  },
  'auspost-territories': {
    id: 'auspost-territories',
    name: 'Australia Post Territory Postal Reference',
    url: 'https://auspost.com.au/postcode',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'primary',
    notes: 'Australian external territory postcode reference for Norfolk Island, Christmas Island, Cocos Islands, and Antarctic routing.',
  },
  'linz-nz-addresses': {
    id: 'linz-nz-addresses',
    name: 'LINZ New Zealand Address Data',
    url: 'https://data.linz.govt.nz/',
    kind: 'address',
    coverage: 'country',
    usage: 'validation',
    license: 'CC BY 4.0',
    notes: 'New Zealand official address and geospatial data from LINZ.',
  },
  'nz-post-territories': {
    id: 'nz-post-territories',
    name: 'New Zealand Post Territory Postal Reference',
    url: 'https://www.nzpost.co.nz/',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Postal handling reference for Cook Islands, Tokelau, Niue, and New Zealand-associated territories.',
  },
  'post-fiji': {
    id: 'post-fiji',
    name: 'Post Fiji',
    url: 'https://www.postfiji.com.fj/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Fiji postal addressing and delivery reference.',
  },
  'post-png': {
    id: 'post-png',
    name: 'Post PNG',
    url: 'https://postpng.com.pg/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Papua New Guinea postal addressing and postcode reference.',
  },
  'samoa-post': {
    id: 'samoa-post',
    name: 'Samoa Post',
    url: 'https://www.samoapost.ws/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Samoa postal addressing reference.',
  },
  'tonga-post': {
    id: 'tonga-post',
    name: 'Tonga Post',
    url: 'https://www.tongapost.to/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Tonga postal addressing reference.',
  },
  'vanuatu-post': {
    id: 'vanuatu-post',
    name: 'Vanuatu Post',
    url: 'https://www.vanuatupost.vu/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Vanuatu postal addressing reference.',
  },
  'solomon-post': {
    id: 'solomon-post',
    name: 'Solomon Post',
    url: 'https://solomonpost.com.sb/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Solomon Islands postal addressing reference.',
  },
  'usps-pacific-territories': {
    id: 'usps-pacific-territories',
    name: 'USPS Pacific Island ZIP Code Reference',
    url: 'https://tools.usps.com/go/ZipLookupAction_input',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'primary',
    notes: 'USPS ZIP Code lookup for freely associated Pacific states and US-handled Pacific mail routes.',
  },
  'kiribati-post': {
    id: 'kiribati-post',
    name: 'Kiribati Post',
    url: 'https://www.micttd.gov.ki/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Kiribati postal addressing reference.',
  },
  'tuvalu-post': {
    id: 'tuvalu-post',
    name: 'Tuvalu Post',
    url: 'https://www.gov.tv/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Tuvalu postal addressing reference.',
  },
  'nauru-post': {
    id: 'nauru-post',
    name: 'Nauru Post',
    url: 'https://www.naurupost.com/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Nauru postal addressing reference.',
  },
  'british-overseas-postal-reference': {
    id: 'british-overseas-postal-reference',
    name: 'British Overseas Territories Postal Reference',
    url: 'https://www.royalmail.com/',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Fallback postal reference for UK overseas territories using assigned territory postcodes.',
  },
  'pitcairn-post': {
    id: 'pitcairn-post',
    name: 'Pitcairn Islands Post Office',
    url: 'https://www.visitpitcairn.pn/',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Pitcairn Islands postal addressing and postcode reference.',
  },
};

export const OCEANIA_COUNTRY_AND_TERRITORY_CODES = [
  'AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB', 'FM', 'PW',
  'MH', 'KI', 'TV', 'NR', 'NF', 'CX', 'CC', 'AQ', 'CK', 'TK',
  'NU', 'PN', 'NC', 'PF', 'WF',
] as const;

export type OceaniaCountryOrTerritoryCode = (typeof OCEANIA_COUNTRY_AND_TERRITORY_CODES)[number];

const BASE_OPEN_SOURCE_IDS: OceaniaOpenGeoSourceId[] = [
  'osm-nominatim',
  'osm-overpass',
  'openaddresses',
  'geonames-postal',
  'geonames-gazetteer',
  'geoboundaries',
  'upu-addressing',
  'zippopotam',
  'jaxa-aw3d30',
  'gebco-bathymetry',
  'gmrt-topography',
  'hydrosheds',
  'esa-worldcover',
  'protected-planet-wdpa',
  'gbif-occurrence',
  'global-mangrove-watch',
  'allen-coral-atlas',
  'pacific-data-hub',
  'digital-earth-pacific',
  'pacioos',
];

const COUNTRY_SOURCE_IDS: Partial<Record<OceaniaCountryOrTerritoryCode, OceaniaOpenGeoSourceId[]>> = {
  AU: [
    'auspost-postcode',
    'digital-earth-australia-coastlines',
    'digital-earth-australia-wofs',
    'digital-earth-australia-fractional-cover',
    'geoscience-australia-elvis',
  ],
  NZ: ['linz-nz-addresses', 'linz-data-service', 'linz-elevation'],
  FJ: ['post-fiji'],
  PG: ['post-png'],
  WS: ['samoa-post'],
  TO: ['tonga-post'],
  VU: ['vanuatu-post'],
  SB: ['solomon-post'],
  FM: ['usps-pacific-territories'],
  PW: ['usps-pacific-territories'],
  MH: ['usps-pacific-territories'],
  KI: ['kiribati-post'],
  TV: ['tuvalu-post'],
  NR: ['nauru-post'],
  NF: ['auspost-territories'],
  CX: ['auspost-territories'],
  CC: ['auspost-territories'],
  AQ: ['auspost-territories', ...getPolarOpenSourceIds('AQ')],
  CK: ['nz-post-territories'],
  TK: ['nz-post-territories'],
  NU: ['nz-post-territories'],
  PN: ['british-overseas-postal-reference', 'pitcairn-post'],
  NC: ['la-poste-fr-overseas', 'data-gouv-fr-postcodes'],
  PF: ['la-poste-fr-overseas', 'data-gouv-fr-postcodes'],
  WF: ['la-poste-fr-overseas', 'data-gouv-fr-postcodes'],
};

export function getOceaniaOpenSourceIds(countryCode: string): OceaniaOpenGeoSourceId[] {
  const code = countryCode.toUpperCase() as OceaniaCountryOrTerritoryCode;
  return [...new Set([...(COUNTRY_SOURCE_IDS[code] ?? []), ...BASE_OPEN_SOURCE_IDS])];
}

export const OCEANIA_COUNTRY_OPEN_SOURCE_IDS = OCEANIA_COUNTRY_AND_TERRITORY_CODES.reduce(
  (sourcesByCountry, countryCode) => ({
    ...sourcesByCountry,
    [countryCode]: getOceaniaOpenSourceIds(countryCode),
  }),
  {} as Record<OceaniaCountryOrTerritoryCode, OceaniaOpenGeoSourceId[]>,
);
