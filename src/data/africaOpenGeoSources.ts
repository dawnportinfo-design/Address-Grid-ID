export type AfricaOpenGeoSourceId =
  | 'osm-nominatim'
  | 'osm-overpass'
  | 'openaddresses'
  | 'geonames-postal'
  | 'geonames-gazetteer'
  | 'geoboundaries'
  | 'upu-addressing'
  | 'hot-osm-africa'
  | 'hot-osm-west-africa'
  | 'hot-osm-east-southern-africa'
  | 'openstreetmap-wiki-africa'
  | 'humdata-africa'
  | 'openaerialmap'
  | 'digital-earth-africa-dem'
  | 'digital-earth-africa-coastlines'
  | 'digital-earth-africa-waterbodies'
  | 'digital-earth-africa-wofs'
  | 'digital-earth-africa-fractional-cover'
  | 'digital-earth-africa-geomad'
  | 'fao-wapor'
  | 'esa-worldcover'
  | 'gebco-bathymetry'
  | 'gmrt-topography'
  | 'global-mangrove-watch'
  | 'allen-coral-atlas'
  | 'protected-planet-wdpa'
  | 'gbif-occurrence'
  | 'rcmrd-gmes-africa-geoportal'
  | 'rcmrd-geoportal'
  | 'kenya-open-data'
  | 'nipost-postcode'
  | 'algerie-poste'
  | 'libya-post-services'
  | 'poste-maroc-codepostal'
  | 'mauripost'
  | 'la-poste-tunisienne-codes'
  | 'sudapost'
  | 'ngi-south-africa'
  | 'datahub-postal'
  | 'egy-list'
  | 'sapo-postcodes'
  | 'postafind-za'
  | 'british-overseas-postal-reference'
  | 'saint-helena-postal'
  | 'ascension-post-office'
  | 'tristan-post-office'
  | 'biot-gov';

export interface AfricaOpenGeoSource {
  id: AfricaOpenGeoSourceId;
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
    | 'coastline'
    | 'hydrology'
    | 'land-cover'
    | 'marine'
    | 'protected-area'
    | 'biodiversity'
    | 'imagery';
  coverage: 'global' | 'africa' | 'country' | 'territory';
  usage: 'primary' | 'fallback' | 'validation' | 'reference';
  license?: string;
  notes: string;
}

export const AFRICA_OPEN_GEO_SOURCES: Record<AfricaOpenGeoSourceId, AfricaOpenGeoSource> = {
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
    notes: 'Queryable OSM address tags, roads, settlements, and administrative relations.',
  },
  openaddresses: {
    id: 'openaddresses',
    name: 'OpenAddresses',
    url: 'https://openaddresses.io/',
    kind: 'address',
    coverage: 'global',
    usage: 'validation',
    license: 'Varies by source dataset',
    notes: 'Open address point/reference data where country or city coverage is available.',
  },
  'geonames-postal': {
    id: 'geonames-postal',
    name: 'GeoNames Postal Code Data',
    url: 'https://download.geonames.org/export/zip/',
    kind: 'postal-code',
    coverage: 'global',
    usage: 'validation',
    license: 'CC BY 4.0',
    notes: 'Postal-code place matching for countries with downloadable GeoNames ZIP datasets.',
  },
  'geonames-gazetteer': {
    id: 'geonames-gazetteer',
    name: 'GeoNames Gazetteer',
    url: 'https://download.geonames.org/export/dump/',
    kind: 'gazetteer',
    coverage: 'global',
    usage: 'reference',
    license: 'CC BY 4.0',
    notes: 'Settlement names, alternate names, coordinates, and administrative hierarchy reference.',
  },
  geoboundaries: {
    id: 'geoboundaries',
    name: 'geoBoundaries',
    url: 'https://www.geoboundaries.org/',
    kind: 'admin-boundary',
    coverage: 'global',
    usage: 'reference',
    license: 'CC BY 4.0',
    notes: 'Open administrative boundary data for country, province, district, and local hierarchy checks.',
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
  'hot-osm-africa': {
    id: 'hot-osm-africa',
    name: 'Humanitarian OpenStreetMap Team Africa',
    url: 'https://www.hotosm.org/',
    kind: 'address',
    coverage: 'africa',
    usage: 'reference',
    license: 'ODbL',
    notes: 'OpenStreetMap humanitarian mapping reference for roads, buildings, settlements, and low-address-density areas across Africa.',
  },
  'hot-osm-west-africa': {
    id: 'hot-osm-west-africa',
    name: 'HOT Open Mapping Hub West and Northern Africa',
    url: 'https://www.hotosm.org/en/open-mapping-hubs/west-northern-africa/',
    kind: 'address',
    coverage: 'africa',
    usage: 'reference',
    license: 'ODbL',
    notes: 'Regional HOT/OSM mapping support for West and Northern Africa, useful for settlement and delivery-location fallback.',
  },
  'hot-osm-east-southern-africa': {
    id: 'hot-osm-east-southern-africa',
    name: 'HOT Open Mapping Hub Eastern and Southern Africa',
    url: 'https://www.hotosm.org/en/open-mapping-hubs/eastern-southern-africa/',
    kind: 'address',
    coverage: 'africa',
    usage: 'reference',
    license: 'ODbL',
    notes: 'Regional HOT/OSM mapping support for Eastern and Southern Africa, including disaster, rural road, and building datasets.',
  },
  'openstreetmap-wiki-africa': {
    id: 'openstreetmap-wiki-africa',
    name: 'OpenStreetMap Africa Project Pages',
    url: 'https://wiki.openstreetmap.org/wiki/Africa',
    kind: 'gazetteer',
    coverage: 'africa',
    usage: 'reference',
    license: 'ODbL',
    notes: 'OSM country and community project index for African tagging conventions, local names, roads, and settlement coverage.',
  },
  'humdata-africa': {
    id: 'humdata-africa',
    name: 'Humanitarian Data Exchange Africa',
    url: 'https://data.humdata.org/group/africa',
    kind: 'admin-boundary',
    coverage: 'africa',
    usage: 'reference',
    license: 'Varies by dataset',
    notes: 'HDX open humanitarian datasets for administrative boundaries, settlements, roads, health sites, and crisis geography.',
  },
  openaerialmap: {
    id: 'openaerialmap',
    name: 'OpenAerialMap',
    url: 'https://map.openaerialmap.org/',
    kind: 'gazetteer',
    coverage: 'global',
    usage: 'fallback',
    license: 'Varies by imagery',
    notes: 'Openly licensed aerial and UAV imagery useful for validating roads, settlements, coastlines, and rural delivery points.',
  },
  'digital-earth-africa-dem': {
    id: 'digital-earth-africa-dem',
    name: 'Digital Earth Africa SRTM DEM and derivatives',
    url: 'https://docs.digitalearthafrica.org/en/latest/data_specs/SRTM_DEM_specs.html',
    kind: 'elevation',
    coverage: 'africa',
    usage: 'reference',
    license: 'Open data via Digital Earth Africa / NASA SRTM terms',
    notes: 'Africa-wide elevation and terrain derivatives for mountain, escarpment, slope, and highland address context.',
  },
  'digital-earth-africa-coastlines': {
    id: 'digital-earth-africa-coastlines',
    name: 'Digital Earth Africa Coastlines',
    url: 'https://docs.digitalearthafrica.org/en/latest/data_specs/Coastlines_specs.html',
    kind: 'coastline',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Annual African shoreline and coastal-change vectors for sea, island, beach, port, estuary, and waterfront address context.',
  },
  'digital-earth-africa-waterbodies': {
    id: 'digital-earth-africa-waterbodies',
    name: 'Digital Earth Africa Waterbodies',
    url: 'https://docs.digitalearthafrica.org/en/latest/sandbox/notebooks/Datasets/Waterbodies.html',
    kind: 'hydrology',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Continental waterbody monitoring for lakes, reservoirs, wetlands, river-adjacent settlements, and natural water address display.',
  },
  'digital-earth-africa-wofs': {
    id: 'digital-earth-africa-wofs',
    name: 'Digital Earth Africa Water Observations from Space',
    url: 'https://digitalearthafrica.org/en_za/water-observations-from-space/',
    kind: 'hydrology',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Continental satellite water observation layers for surface water recurrence, floodplains, deltas, wetlands, and seasonal water address context.',
  },
  'digital-earth-africa-fractional-cover': {
    id: 'digital-earth-africa-fractional-cover',
    name: 'Digital Earth Africa Fractional Cover',
    url: 'https://docs.digitalearthafrica.org/en/latest/data_specs/Fractional_Cover_specs.html',
    kind: 'land-cover',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Africa vegetation, bare ground, and non-photosynthetic cover layers for savanna, desert, mountain foothill, cropland, and natural landscape context.',
  },
  'digital-earth-africa-geomad': {
    id: 'digital-earth-africa-geomad',
    name: 'Digital Earth Africa GeoMAD Cloud-Free Composites',
    url: 'https://docs.digitalearthafrica.org/en/latest/data_specs/GeoMAD_specs.html',
    kind: 'imagery',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Cloud-free satellite composites for validating natural features, coastlines, mountain terrain, water edges, vegetation, and rural settlements.',
  },
  'fao-wapor': {
    id: 'fao-wapor',
    name: 'FAO WaPOR',
    url: 'https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en',
    kind: 'hydrology',
    coverage: 'africa',
    usage: 'reference',
    license: 'FAO WaPOR data terms',
    notes: 'Open remote-sensing water productivity data for Africa and the Near East, useful for irrigated areas, river basins, oases, wetlands, and agricultural water context.',
  },
  'esa-worldcover': {
    id: 'esa-worldcover',
    name: 'ESA WorldCover',
    url: 'https://esa-worldcover.org/en/data-access',
    kind: 'land-cover',
    coverage: 'global',
    usage: 'reference',
    license: 'Free and open data access',
    notes: '10 m global land cover for African forest, grassland, desert, wetland, cropland, mangrove, and other natural landscape labels.',
  },
  'gebco-bathymetry': {
    id: 'gebco-bathymetry',
    name: 'GEBCO Gridded Bathymetry',
    url: 'https://www.gebco.net/data_and_products/gridded_bathymetry_data/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    license: 'GEBCO terms of use',
    notes: 'Global bathymetry and land elevation grid for African seas, channels, continental shelf, trench, and offshore island context.',
  },
  'gmrt-topography': {
    id: 'gmrt-topography',
    name: 'Global Multi-Resolution Topography',
    url: 'https://www.gmrt.org/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    notes: 'Multi-resolution topography and bathymetry synthesis for coastal Africa, offshore ridges, seamounts, and marine terrain context.',
  },
  'global-mangrove-watch': {
    id: 'global-mangrove-watch',
    name: 'Global Mangrove Watch',
    url: 'https://www.wetlands.org/coasts-and-deltas/global-mangrove-watch/',
    kind: 'land-cover',
    coverage: 'global',
    usage: 'reference',
    notes: 'Mangrove distribution and change monitoring for African coasts, deltas, estuaries, lagoons, protected wetlands, and coastal natural address context.',
  },
  'allen-coral-atlas': {
    id: 'allen-coral-atlas',
    name: 'Allen Coral Atlas',
    url: 'https://www.allencoralatlas.org/atlas/',
    kind: 'marine',
    coverage: 'global',
    usage: 'reference',
    notes: 'Shallow coral reef habitat and geomorphic-zone mapping for Red Sea, Indian Ocean, island, lagoon, reef, and marine protected area context.',
  },
  'protected-planet-wdpa': {
    id: 'protected-planet-wdpa',
    name: 'Protected Planet WDPA / WDPCA',
    url: 'https://www.protectedplanet.net/en/thematic-areas/wdpa',
    kind: 'protected-area',
    coverage: 'global',
    usage: 'reference',
    license: 'UNEP-WCMC and IUCN terms',
    notes: 'Protected terrestrial and marine areas for national parks, reserves, conservation areas, habitats, and natural address context.',
  },
  'gbif-occurrence': {
    id: 'gbif-occurrence',
    name: 'GBIF Occurrence API',
    url: 'https://techdocs.gbif.org/en/openapi/v1/occurrence',
    kind: 'biodiversity',
    coverage: 'global',
    usage: 'reference',
    license: 'Varies by dataset record',
    notes: 'Open biodiversity occurrence data for African habitat, ecosystem, protected-area, and natural feature enrichment.',
  },
  'rcmrd-gmes-africa-geoportal': {
    id: 'rcmrd-gmes-africa-geoportal',
    name: 'RCMRD GMES and Africa Geoportal',
    url: 'https://geoportal.rcmrd.org/',
    kind: 'admin-boundary',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Regional open geospatial portal for environmental monitoring, land, water, coastal, disaster, and natural resource layers across Eastern and Southern Africa.',
  },
  'rcmrd-geoportal': {
    id: 'rcmrd-geoportal',
    name: 'RCMRD Geoportal',
    url: 'https://rcmrd.org/en/resources/apps-data',
    kind: 'admin-boundary',
    coverage: 'africa',
    usage: 'reference',
    notes: 'Regional Centre for Mapping of Resources for Development geospatial datasets and maps for Eastern and Southern Africa.',
  },
  'kenya-open-data': {
    id: 'kenya-open-data',
    name: 'Kenya Open Data',
    url: 'https://www.opendata.go.ke/',
    kind: 'gazetteer',
    coverage: 'country',
    usage: 'validation',
    notes: 'Kenya open-data reference for counties, administrative datasets, and public geospatial context where available.',
  },
  'nipost-postcode': {
    id: 'nipost-postcode',
    name: 'Nigerian Postal Service Postcode Finder',
    url: 'https://nipost.gov.ng/postcode-finder/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'NIPOST postcode finder and national addressing reference for Nigerian state, city, street, and postcode validation.',
  },
  'algerie-poste': {
    id: 'algerie-poste',
    name: 'Algerie Poste postal office directory',
    url: 'https://www.poste.dz/customer/bureaux_postaux',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Official Algeria Post postal-office and postcode lookup by wilaya for code and locality confirmation.',
  },
  'poste-maroc-codepostal': {
    id: 'poste-maroc-codepostal',
    name: 'Poste Maroc postcode directory',
    url: 'https://codepostal.ma/default.aspx',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'Official Poste Maroc postcode search and directory for city, district, street, and postal-code validation.',
  },
  'la-poste-tunisienne-codes': {
    id: 'la-poste-tunisienne-codes',
    name: 'La Poste Tunisienne postcode search',
    url: 'https://www.laposte.tn/codes.php',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'Official Tunisian Post postcode search for locality and four-digit postal-code lookup.',
  },
  'libya-post-services': {
    id: 'libya-post-services',
    name: 'Libya Post services portal',
    url: 'https://libyapost.ly/en/services/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Official Libya Post service portal covering postal boxes, mail, parcels, and postal-network service information for postcode/address validation fallback.',
  },
  mauripost: {
    id: 'mauripost',
    name: 'MAURIPOST official portal',
    url: 'https://www.mauripost.mr/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Official MAURIPOST portal for postal-network, service, and customer-information reference where public postcode tooling is limited.',
  },
  sudapost: {
    id: 'sudapost',
    name: 'Sudapost official site',
    url: 'https://sudapost.sd/wp/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'reference',
    notes: 'Official Sudan Post site with operator, service, and network information used as current postal-reference evidence.',
  },
  'ngi-south-africa': {
    id: 'ngi-south-africa',
    name: 'National Geospatial Information South Africa',
    url: 'https://www.ngi.gov.za/',
    kind: 'admin-boundary',
    coverage: 'country',
    usage: 'reference',
    notes: 'South African national mapping authority reference for geodetic control, aerial imagery, topographic mapping, and SDI context.',
  },
  'datahub-postal': {
    id: 'datahub-postal',
    name: 'DataHub Logistics Postal Codes',
    url: 'https://datahub.io/logistics',
    kind: 'postal-code',
    coverage: 'global',
    usage: 'validation',
    license: 'Varies by dataset',
    notes: 'Reusable postal-code CSV datasets for countries where maintained open packages exist.',
  },
  'egy-list': {
    id: 'egy-list',
    name: 'Egy.List',
    url: 'https://github.com/Badawy403/Egy.List',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'Egypt governorate, city, district, and postal-code reference data.',
  },
  'sapo-postcodes': {
    id: 'sapo-postcodes',
    name: 'South African Post Office Postal Codes',
    url: 'https://www.postoffice.co.za/',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'primary',
    notes: 'Official South African postal-code lookup reference for suburb, street, PO Box, city, and province validation.',
  },
  'postafind-za': {
    id: 'postafind-za',
    name: 'PostaFind South Africa Postal Code Search',
    url: 'https://pcf.postafind.co.za/search',
    kind: 'postal-code',
    coverage: 'country',
    usage: 'fallback',
    notes: 'Public South African postal-code search useful as a fallback/reference alongside SAPO and open geodata.',
  },
  'british-overseas-postal-reference': {
    id: 'british-overseas-postal-reference',
    name: 'British Overseas Territories Postal Reference',
    url: 'https://www.royalmail.com/sending/international/country-guides',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Royal Mail destination guide reference for UK overseas territories using assigned territory postcodes.',
  },
  'saint-helena-postal': {
    id: 'saint-helena-postal',
    name: 'St Helena Government Postal Service',
    url: 'https://www.sainthelena.gov.sh/public-services/postal/',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Official St Helena postal-service reference for Jamestown routing, postal operations, and STHL 1ZZ delivery conventions.',
  },
  'ascension-post-office': {
    id: 'ascension-post-office',
    name: 'Ascension Island Government Post Office',
    url: 'https://www.ascension.gov.ac/postal-service/post-office',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Official Ascension Island Post Office reference for ASCN 1ZZ routing, mail services, and settlement delivery handling.',
  },
  'tristan-post-office': {
    id: 'tristan-post-office',
    name: 'Tristan da Cunha Post Office',
    url: 'https://www.tristandc.com/postoffice.php',
    kind: 'postal-code',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Official Tristan da Cunha Post Office reference for TDCU 1ZZ routing, postage, and island mail handling.',
  },
  'biot-gov': {
    id: 'biot-gov',
    name: 'British Indian Ocean Territory Administration',
    url: 'https://biot.gov.io/',
    kind: 'gazetteer',
    coverage: 'territory',
    usage: 'reference',
    notes: 'Territory reference for Diego Garcia, BIOT place names, and restricted delivery handling.',
  },
};

export const AFRICA_COUNTRY_CODES = [
  'AO',
  'BF',
  'BI',
  'BJ',
  'BW',
  'CD',
  'CF',
  'CG',
  'CI',
  'CM',
  'CV',
  'DJ',
  'DZ',
  'EG',
  'EH',
  'ER',
  'ET',
  'GA',
  'GH',
  'GM',
  'GN',
  'GQ',
  'GW',
  'KE',
  'KM',
  'LR',
  'LS',
  'LY',
  'MA',
  'MG',
  'ML',
  'MR',
  'MU',
  'MW',
  'MZ',
  'NA',
  'NE',
  'NG',
  'RW',
  'SC',
  'SD',
  'SL',
  'SN',
  'SO',
  'SS',
  'ST',
  'SZ',
  'TD',
  'TG',
  'TN',
  'TZ',
  'UG',
  'ZA',
  'ZM',
  'ZW',
] as const;

export type AfricaCountryCode = (typeof AFRICA_COUNTRY_CODES)[number];

const BASE_OPEN_SOURCE_IDS: AfricaOpenGeoSourceId[] = [
  'osm-nominatim',
  'osm-overpass',
  'openaddresses',
  'geonames-postal',
  'geonames-gazetteer',
  'geoboundaries',
  'upu-addressing',
  'hot-osm-africa',
  'openstreetmap-wiki-africa',
  'humdata-africa',
  'openaerialmap',
  'digital-earth-africa-dem',
  'digital-earth-africa-coastlines',
  'digital-earth-africa-waterbodies',
  'digital-earth-africa-wofs',
  'digital-earth-africa-fractional-cover',
  'digital-earth-africa-geomad',
  'fao-wapor',
  'esa-worldcover',
  'gebco-bathymetry',
  'gmrt-topography',
  'global-mangrove-watch',
  'allen-coral-atlas',
  'protected-planet-wdpa',
  'gbif-occurrence',
  'rcmrd-gmes-africa-geoportal',
];

const COUNTRY_POSTAL_SOURCE_IDS: Partial<Record<AfricaCountryCode, AfricaOpenGeoSourceId[]>> = {
  DZ: ['algerie-poste'],
  EG: ['egy-list', 'datahub-postal'],
  LY: ['libya-post-services'],
  MA: ['poste-maroc-codepostal', 'datahub-postal'],
  MR: ['mauripost'],
  NG: ['nipost-postcode', 'hot-osm-west-africa'],
  SD: ['sudapost'],
  TN: ['la-poste-tunisienne-codes'],
  GH: ['hot-osm-west-africa'],
  CI: ['hot-osm-west-africa'],
  SN: ['hot-osm-west-africa'],
  BF: ['hot-osm-west-africa'],
  ML: ['hot-osm-west-africa'],
  NE: ['hot-osm-west-africa'],
  TG: ['hot-osm-west-africa'],
  BJ: ['hot-osm-west-africa'],
  LR: ['hot-osm-west-africa'],
  SL: ['hot-osm-west-africa'],
  GM: ['hot-osm-west-africa'],
  GN: ['hot-osm-west-africa'],
  GW: ['hot-osm-west-africa'],
  CV: ['hot-osm-west-africa'],
  KE: ['rcmrd-geoportal', 'kenya-open-data', 'hot-osm-east-southern-africa'],
  TZ: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  UG: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  RW: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  SS: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  ET: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  DJ: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  MZ: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  MW: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  ZM: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  ZW: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  BW: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  NA: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  LS: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  SZ: ['rcmrd-geoportal', 'hot-osm-east-southern-africa'],
  ZA: ['sapo-postcodes', 'postafind-za', 'ngi-south-africa', 'hot-osm-east-southern-africa'],
};

export function getAfricaOpenSourceIds(countryCode: string): AfricaOpenGeoSourceId[] {
  const code = countryCode.toUpperCase() as AfricaCountryCode;
  return [...new Set([...(COUNTRY_POSTAL_SOURCE_IDS[code] ?? []), ...BASE_OPEN_SOURCE_IDS])];
}

export const AFRICA_COUNTRY_OPEN_SOURCE_IDS = AFRICA_COUNTRY_CODES.reduce(
  (sourcesByCountry, countryCode) => ({
    ...sourcesByCountry,
    [countryCode]: getAfricaOpenSourceIds(countryCode),
  }),
  {} as Record<AfricaCountryCode, AfricaOpenGeoSourceId[]>,
);
