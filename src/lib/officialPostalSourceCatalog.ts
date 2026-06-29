export const OFFICIAL_POSTAL_SOURCE_CATALOG_VERSION = 'official-postal-source-catalog-v1';

export type PostalSourceAuthority =
  | 'postal-operator'
  | 'government'
  | 'intergovernmental-postal-standard'
  | 'official-open-data'
  | 'official-derived-open-source'
  | 'open-source'
  | 'community'
  | 'commercial-or-restricted'
  | 'unknown';

export type PostalSourceTrustTier =
  | 'authoritative'
  | 'official'
  | 'official-derived'
  | 'open-reference'
  | 'community'
  | 'weak';

export type PostalSourceAvailability =
  | 'public-api'
  | 'auth-required-api'
  | 'bulk-open-data'
  | 'licensed-bulk-data'
  | 'commercial-or-restricted'
  | 'web-search'
  | 'no-normal-postcode'
  | 'unknown';

export type PostalSourceDepth =
  | 'postcode'
  | 'locality'
  | 'street'
  | 'address'
  | 'building'
  | 'delivery-point'
  | 'geo-only';

export type OfficialPostalSourceProfile = {
  id: string;
  countryCodes: string[];
  label: string;
  authority: PostalSourceAuthority;
  trustTier: PostalSourceTrustTier;
  availability: PostalSourceAvailability;
  depth: PostalSourceDepth;
  url: string;
  sourceNames: string[];
  openSourceIds: string[];
  requiresCredential: boolean;
  notes: string[];
};

export type PostalSourceClassification = {
  tier: PostalSourceTrustTier;
  strength: 'strong' | 'weak';
  reason: string;
  matches: OfficialPostalSourceProfile[];
};

const GLOBAL_OFFICIAL_POSTAL_SOURCES: OfficialPostalSourceProfile[] = [
  {
    id: 'upu-universal-postcode-database',
    countryCodes: ['*'],
    label: 'UPU Universal POST*CODE Database and Addressing Solutions',
    authority: 'intergovernmental-postal-standard',
    trustTier: 'official',
    availability: 'licensed-bulk-data',
    depth: 'postcode',
    url: 'https://www.upu.int/en/postal-solutions/programmes-services/addressing-solutions?cid=28&csid=20',
    sourceNames: [
      'upu',
      'universal postcode',
      'universal post*code',
      'postal addressing systems',
      'upu addressing solutions',
    ],
    openSourceIds: ['upu-addressing'],
    requiresCredential: true,
    notes: [
      'Official intergovernmental postal addressing and postcode source; use as licensed fallback and prefer national postal-operator APIs or bulk data when available.',
    ],
  },
];

const GLOBAL_OPEN_REFERENCE_SOURCES: OfficialPostalSourceProfile[] = [
  {
    id: 'openaddresses',
    countryCodes: ['*'],
    label: 'OpenAddresses',
    authority: 'open-source',
    trustTier: 'open-reference',
    availability: 'bulk-open-data',
    depth: 'address',
    url: 'https://openaddresses.io/',
    sourceNames: ['openaddresses', 'open addresses'],
    openSourceIds: ['openaddresses'],
    requiresCredential: false,
    notes: ['Open address reference records; coverage and licenses vary by source dataset.'],
  },
  {
    id: 'osm-nominatim',
    countryCodes: ['*'],
    label: 'OpenStreetMap Nominatim',
    authority: 'open-source',
    trustTier: 'open-reference',
    availability: 'public-api',
    depth: 'geo-only',
    url: 'https://nominatim.org/release-docs/latest/api/Overview/',
    sourceNames: ['osm-nominatim', 'nominatim', 'openstreetmap'],
    openSourceIds: ['osm-nominatim', 'osm-overpass'],
    requiresCredential: false,
    notes: ['Use as geocoding/gazetteer fallback, not as postal deliverability proof.'],
  },
  {
    id: 'geonames-postal',
    countryCodes: ['*'],
    label: 'GeoNames postal data',
    authority: 'open-source',
    trustTier: 'community',
    availability: 'public-api',
    depth: 'locality',
    url: 'https://www.geonames.org/',
    sourceNames: ['geonames', 'geonames-postal'],
    openSourceIds: ['geonames-postal'],
    requiresCredential: false,
    notes: ['Useful fallback, but keep postal verification partial unless another strong source agrees.'],
  },
  {
    id: 'zippopotam',
    countryCodes: ['*'],
    label: 'Zippopotam',
    authority: 'community',
    trustTier: 'community',
    availability: 'public-api',
    depth: 'locality',
    url: 'https://api.zippopotam.us/',
    sourceNames: ['zippopotam'],
    openSourceIds: ['zippopotam'],
    requiresCredential: false,
    notes: ['Community fallback for postal-code locality candidates.'],
  },
];

export const OFFICIAL_POSTAL_SOURCE_CATALOG: OfficialPostalSourceProfile[] = [
  {
    id: 'japan-post-digital-address-api',
    countryCodes: ['JP'],
    label: 'Japan Post Postal Code and Digital Address API',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://lp-api.da.pf.japanpost.jp/',
    sourceNames: ['japan post digital address api', 'japan-post-digital-address-api', 'postal code digital address api'],
    openSourceIds: ['japan-post-digital-address-api'],
    requiresCredential: false,
    notes: ['Official Japan Post API announced as free from May 2025 for postal-code and digital-address lookup.'],
  },
  {
    id: 'japan-post-csv',
    countryCodes: ['JP'],
    label: 'Japan Post postal-code CSV',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'bulk-open-data',
    depth: 'locality',
    url: 'https://www.post.japanpost.jp/zipcode/download.html',
    sourceNames: ['japan post', 'japan-post', 'japan postcode', 'japan post csv'],
    openSourceIds: ['japan-post-csv'],
    requiresCredential: false,
    notes: ['Official postal-code CSV and change notices from Japan Post.'],
  },
  {
    id: 'zipcloud-jp',
    countryCodes: ['JP'],
    label: 'zipcloud Japan postcode API',
    authority: 'official-derived-open-source',
    trustTier: 'official-derived',
    availability: 'public-api',
    depth: 'locality',
    url: 'https://zipcloud.ibsnet.co.jp/',
    sourceNames: ['zipcloud'],
    openSourceIds: ['zipcloud-jp', 'japan-postcode-api'],
    requiresCredential: false,
    notes: ['Community API derived from Japan Post postal-code data; strong for postcode-to-locality, not delivery-point proof.'],
  },
  {
    id: 'usps-web-tools',
    countryCodes: ['US'],
    label: 'USPS APIs Addresses 3.0 and ZIP lookup APIs',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'auth-required-api',
    depth: 'delivery-point',
    url: 'https://developers.usps.com/apis',
    sourceNames: [
      'usps',
      'usps web tools',
      'usps addresses api',
      'addresses 3.0',
      'zip code lookup api',
      'city state lookup',
      'address standardization api',
      'address information api',
    ],
    openSourceIds: ['usps-web-tools', 'usps-addresses-api'],
    requiresCredential: true,
    notes: [
      'Official USPS API path for domestic address standardization, City/State lookup, ZIP Code lookup, and ZIP+4 delivery-point indicators; credentials and terms are required.',
      'AGID country packs record this as source metadata only and must not store ZIP+4 delivery-point payloads or raw address responses.',
    ],
  },
  {
    id: 'us-census-tiger-line',
    countryCodes: ['US'],
    label: 'U.S. Census Bureau TIGER/Line and TIGERweb geography products',
    authority: 'official-open-data',
    trustTier: 'official',
    availability: 'bulk-open-data',
    depth: 'geo-only',
    url: 'https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html',
    sourceNames: ['tiger line', 'tigerweb', 'census tiger', 'tiger/line shapefiles', 'zcta'],
    openSourceIds: ['us-census-tiger-line', 'tigerweb'],
    requiresCredential: false,
    notes: [
      'Official U.S. Census geographic products for state, county, place, road, address-range, water, and ZCTA-style geography references.',
      'ZCTAs are Census statistical approximations and must not be treated as USPS ZIP delivery areas.',
    ],
  },
  {
    id: 'us-census-geocoder',
    countryCodes: ['US'],
    label: 'U.S. Census Geocoding Services API',
    authority: 'government',
    trustTier: 'official',
    availability: 'public-api',
    depth: 'address',
    url: 'https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html',
    sourceNames: ['census geocoder', 'u.s. census geocoder', 'maf tiger geocoder', 'geocoding services'],
    openSourceIds: ['us-census-geocoder'],
    requiresCredential: false,
    notes: [
      'Official Census geocoder for address-to-coordinate and geography lookup based on MAF/TIGER benchmarks.',
      'Use as geospatial/geography evidence, not as USPS delivery-point validation.',
    ],
  },
  {
    id: 'hud-usps-zip-crosswalk',
    countryCodes: ['US'],
    label: 'HUD USPS ZIP Code Crosswalk API',
    authority: 'government',
    trustTier: 'official',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.huduser.gov/portal/dataset/uspszip-api.html',
    sourceNames: ['hud usps zip', 'usps zip crosswalk'],
    openSourceIds: ['hud-usps-zip-crosswalk'],
    requiresCredential: false,
    notes: ['Government crosswalk for ZIP Code analysis; not delivery-point validation.'],
  },
  {
    id: 'ons-postcode-directory',
    countryCodes: ['GB'],
    label: 'ONS Postcode Directory',
    authority: 'government',
    trustTier: 'official',
    availability: 'bulk-open-data',
    depth: 'postcode',
    url: 'https://geoportal.statistics.gov.uk/',
    sourceNames: ['ons postcode directory', 'ons-pd', 'onspd'],
    openSourceIds: ['ons-postcode-directory'],
    requiresCredential: false,
    notes: ['Official UK statistical postcode reference; not Royal Mail delivery-point proof.'],
  },
  {
    id: 'royal-mail-paf',
    countryCodes: ['GB'],
    label: 'Royal Mail Postcode Address File',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'licensed-bulk-data',
    depth: 'delivery-point',
    url: 'https://www.royalmail.com/business/data-quality/address-data',
    sourceNames: ['royal mail', 'paf', 'postcode address file'],
    openSourceIds: ['royal-mail-paf'],
    requiresCredential: true,
    notes: ['Official UK delivery-point reference, licensed rather than open.'],
  },
  {
    id: 'postcodes-io',
    countryCodes: ['GB'],
    label: 'postcodes.io',
    authority: 'official-derived-open-source',
    trustTier: 'official-derived',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://postcodes.io/',
    sourceNames: ['postcodes-io', 'postcodes.io'],
    openSourceIds: ['postcodes-io'],
    requiresCredential: false,
    notes: ['Open API based on UK open postcode datasets; strong postcode reference, not delivery-point proof.'],
  },
  {
    id: 'canada-post-addresscomplete',
    countryCodes: ['CA'],
    label: 'Canada Post AddressComplete',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'auth-required-api',
    depth: 'delivery-point',
    url: 'https://www.canadapost-postescanada.ca/ac/',
    sourceNames: ['canada post', 'addresscomplete'],
    openSourceIds: ['canada-post-addresscomplete'],
    requiresCredential: true,
    notes: ['Official postal operator address lookup product; credentials or commercial terms may apply.'],
  },
  {
    id: 'correios-cep-api',
    countryCodes: ['BR'],
    label: 'Correios CEP API',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'auth-required-api',
    depth: 'address',
    url: 'https://www.correios.com.br/atendimento/developers',
    sourceNames: ['correios', 'correios cep api'],
    openSourceIds: ['correios-cep-api'],
    requiresCredential: true,
    notes: ['Official Correios API path for contract clients; public use may require credentials.'],
  },
  {
    id: 'viacep',
    countryCodes: ['BR'],
    label: 'ViaCEP',
    authority: 'community',
    trustTier: 'official-derived',
    availability: 'public-api',
    depth: 'street',
    url: 'https://viacep.com.br/',
    sourceNames: ['viacep'],
    openSourceIds: ['viacep'],
    requiresCredential: false,
    notes: ['Public CEP API commonly used as open fallback; treat as strong candidate evidence, not postal-operator proof.'],
  },
  {
    id: 'brasilapi-cep',
    countryCodes: ['BR'],
    label: 'BrasilAPI CEP',
    authority: 'community',
    trustTier: 'official-derived',
    availability: 'public-api',
    depth: 'street',
    url: 'https://brasilapi.com.br/',
    sourceNames: ['brasilapi'],
    openSourceIds: ['brasilapi'],
    requiresCredential: false,
    notes: ['Open API fallback for Brazilian CEP lookup.'],
  },
  {
    id: 'onemap-sg',
    countryCodes: ['SG'],
    label: 'Singapore OneMap',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'auth-required-api',
    depth: 'building',
    url: 'https://www.onemap.gov.sg/docs/',
    sourceNames: ['onemap', 'one map', 'one-map', 'sla onemap'],
    openSourceIds: ['onemap-sg', 'one-map'],
    requiresCredential: true,
    notes: ['Official Singapore Land Authority national map and address search API; token required for Search API.'],
  },
  {
    id: 'api-adresse-data-gouv-fr',
    countryCodes: ['FR'],
    label: 'API Adresse - Base Adresse Nationale',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://www.data.gouv.fr/fr/dataservices/api-adresse-base-adresse-nationale-ban//',
    sourceNames: ['api adresse', 'api-adresse', 'ban', 'base adresse nationale', 'data.gouv', 'data.gouv.fr'],
    openSourceIds: ['api-adresse-data-gouv-fr', 'data-gouv-fr-postcodes'],
    requiresCredential: false,
    notes: ['Official French address API for autocomplete, address verification, geocoding, and reverse geocoding.'],
  },
  {
    id: 'openplzapi',
    countryCodes: ['DE', 'AT', 'CH', 'LI'],
    label: 'OpenPLZ API',
    authority: 'open-source',
    trustTier: 'open-reference',
    availability: 'public-api',
    depth: 'locality',
    url: 'https://www.openplzapi.org/en/',
    sourceNames: ['openplz', 'openplzapi'],
    openSourceIds: ['openplzapi'],
    requiresCredential: false,
    notes: ['Open postal-code API for German-speaking countries; use as open reference evidence.'],
  },
  {
    id: 'pdok-bag',
    countryCodes: ['NL'],
    label: 'PDOK BAG API',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://api.pdok.nl/kadaster/bag/ogc/v2',
    sourceNames: ['pdok', 'bag', 'basisregistratie adressen en gebouwen'],
    openSourceIds: ['pdok', 'bag'],
    requiresCredential: false,
    notes: ['Official Dutch base registration for addresses and buildings; combine postcode with house number.'],
  },
  {
    id: 'gnaf-au',
    countryCodes: ['AU'],
    label: 'Geocoded National Address File (G-NAF)',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'bulk-open-data',
    depth: 'address',
    url: 'https://data.gov.au/data/dataset/geocoded-national-address-file-g-naf',
    sourceNames: ['g-naf', 'gnaf', 'geocoded national address file'],
    openSourceIds: ['gnaf-au'],
    requiresCredential: false,
    notes: ['Official Australian open address index; postal deliverability needs secondary evidence.'],
  },
  {
    id: 'nz-post',
    countryCodes: ['NZ'],
    label: 'New Zealand Post address and postcode reference',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'commercial-or-restricted',
    depth: 'delivery-point',
    url: 'https://www.nzpost.co.nz/business/developer-centre',
    sourceNames: ['nz post', 'new zealand post'],
    openSourceIds: ['nz-post'],
    requiresCredential: true,
    notes: ['Official postal operator path; use open geodata when credentials are unavailable.'],
  },
  {
    id: 'linz-nz-address-data',
    countryCodes: ['NZ'],
    label: 'LINZ New Zealand Address Data',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'bulk-open-data',
    depth: 'address',
    url: 'https://data.linz.govt.nz/',
    sourceNames: ['linz', 'linz address', 'new zealand address data', 'linz data service'],
    openSourceIds: ['linz-nz-addresses', 'linz-data-service'],
    requiresCredential: false,
    notes: ['Official New Zealand address and geospatial reference data; use NZ Post where delivery-point postal proof is required.'],
  },
  {
    id: 'dawa-denmark',
    countryCodes: ['DK'],
    label: 'Danish Address Web API (DAWA)',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://api.dataforsyningen.dk/postnumre',
    sourceNames: ['dawa', 'dataforsyningen', 'danish address web api', 'postnumre'],
    openSourceIds: ['dataforsyningen-denmark', 'danish-address-register-dar'],
    requiresCredential: false,
    notes: ['Official Danish address and postcode API.'],
  },
  {
    id: 'hk-csdi',
    countryCodes: ['HK'],
    label: 'Hong Kong CSDI / LandsD address and geodata',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'geo-only',
    url: 'https://portal.csdi.gov.hk/',
    sourceNames: ['hk-csdi', 'csdi', 'landsd', 'hk-als'],
    openSourceIds: ['csdi-hk', 'landsd-hk', 'hk-csdi', 'hk-als'],
    requiresCredential: false,
    notes: ['Hong Kong does not use normal postcodes; verify with official address/geodata evidence.'],
  },
  {
    id: 'macao-geoguide',
    countryCodes: ['MO'],
    label: 'Macao DSCC / GeoGuide',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'geo-only',
    url: 'https://www.dscc.gov.mo/',
    sourceNames: ['dscc', 'geoguide', 'macao geoguide'],
    openSourceIds: ['dscc-macao', 'geoguide-macao'],
    requiresCredential: false,
    notes: ['Macau does not use normal postcodes; verify with official geodata and building/street evidence.'],
  },
  {
    id: 'qatar-gis',
    countryCodes: ['QA'],
    label: 'Qatar GIS / official geodata',
    authority: 'government',
    trustTier: 'official',
    availability: 'public-api',
    depth: 'geo-only',
    url: 'https://geoportal.gisqatar.org.qa/',
    sourceNames: ['qatar gis', 'qatar-gis-geoportal'],
    openSourceIds: ['qatar-gis-geoportal'],
    requiresCredential: false,
    notes: ['Use official geodata for building-zone-street style addressing.'],
  },
  {
    id: 'makani-dubai',
    countryCodes: ['AE'],
    label: 'Dubai Makani / UAE official geodata',
    authority: 'government',
    trustTier: 'official',
    availability: 'public-api',
    depth: 'geo-only',
    url: 'https://www.makani.ae/',
    sourceNames: ['makani', 'dubai makani'],
    openSourceIds: ['makani-dubai-open-data'],
    requiresCredential: false,
    notes: ['Use official geodata and local address systems where no normal postcode is used.'],
  },
  {
    id: 'antarctic-research-stations',
    countryCodes: ['AQ'],
    label: 'Antarctic research station and open geodata references',
    authority: 'official-open-data',
    trustTier: 'official',
    availability: 'bulk-open-data',
    depth: 'geo-only',
    url: 'https://github.com/SCAR/antimeridian',
    sourceNames: ['antarctic-research-stations', 'scar', 'antarctic station'],
    openSourceIds: ['antarctic-research-stations'],
    requiresCredential: false,
    notes: ['Use station/operator and coordinate evidence rather than normal postal-code validation.'],
  },
  {
    id: 'correios-angola',
    countryCodes: ['AO'],
    label: 'Correios de Angola',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://www.correiosdeangola.ao/',
    sourceNames: ['correios de angola', 'encta'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Angolan postal operator; use for postal-network evidence until a machine-readable postcode file is connected.'],
  },
  {
    id: 'algerie-poste',
    countryCodes: ['DZ'],
    label: 'Algerie Poste postal offices and postcodes',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'postcode',
    url: 'https://www.poste.dz/customer/bureaux_postaux',
    sourceNames: ['algerie poste', 'algerie-poste', 'poste.dz', 'bureaux postaux'],
    openSourceIds: ['algerie-poste'],
    requiresCredential: false,
    notes: ['Official Algeria Post office lookup; use as official web evidence for code/locality checks.'],
  },
  {
    id: 'egypt-post',
    countryCodes: ['EG'],
    label: 'Egypt Post',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://www.egyptpost.org/',
    sourceNames: ['egypt post', 'egyptpost'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Egyptian postal operator; connect a postal-code lookup endpoint when confirmed.'],
  },
  {
    id: 'ghanapostgps',
    countryCodes: ['GH'],
    label: 'GhanaPostGPS National Digital Address System',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://nas.ghanapostgps.com/',
    sourceNames: ['ghanapostgps', 'ghana post gps', 'ghana digital address', 'national digital address system'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Ghana digital property addressing system by Ghana Post/Government of Ghana.'],
  },
  {
    id: 'posta-kenya',
    countryCodes: ['KE'],
    label: 'Postal Corporation of Kenya post offices',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'postcode',
    url: 'https://posta.co.ke/post-offices/',
    sourceNames: ['postal corporation of kenya', 'posta kenya', 'posta.co.ke'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Kenya postal operator post-office directory; use for postcode/post-office confirmation.'],
  },
  {
    id: 'poste-maroc-codepostal',
    countryCodes: ['MA'],
    label: 'Poste Maroc postcode directory',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://codepostal.ma/default.aspx',
    sourceNames: ['poste maroc', 'codepostal.ma', 'barid al-maghrib'],
    openSourceIds: ['poste-maroc-codepostal'],
    requiresCredential: false,
    notes: ['Official Poste Maroc postcode search/directory.'],
  },
  {
    id: 'libya-post-services',
    countryCodes: ['LY'],
    label: 'Libya Post services portal',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://libyapost.ly/en/services/',
    sourceNames: ['libya post', 'libyapost', 'libyapost.ly'],
    openSourceIds: ['libya-post-services'],
    requiresCredential: false,
    notes: ['Official Libya Post services reference; use as postal-network evidence until a direct public postcode lookup is confirmed.'],
  },
  {
    id: 'mauripost',
    countryCodes: ['MR'],
    label: 'MAURIPOST official portal',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://www.mauripost.mr/',
    sourceNames: ['mauripost', 'mauri post', 'mauripost.mr'],
    openSourceIds: ['mauripost'],
    requiresCredential: false,
    notes: ['Official Mauritania postal operator portal; use as postal-network evidence while public postcode tooling remains limited.'],
  },
  {
    id: 'la-poste-tunisienne-codes',
    countryCodes: ['TN'],
    label: 'La Poste Tunisienne postcode search',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.laposte.tn/codes.php',
    sourceNames: ['la poste tunisienne', 'laposte.tn', 'poste tunisienne'],
    openSourceIds: ['la-poste-tunisienne-codes'],
    requiresCredential: false,
    notes: ['Official Tunisian Post postcode search.'],
  },
  {
    id: 'sudapost',
    countryCodes: ['SD'],
    label: 'Sudapost official site',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://sudapost.sd/wp/',
    sourceNames: ['sudapost', 'sudan post', 'sudapost.sd'],
    openSourceIds: ['sudapost'],
    requiresCredential: false,
    notes: ['Official Sudan Post site; use as current postal-operator evidence until a stable public postcode search endpoint is confirmed.'],
  },
  {
    id: 'tcra-tanzania-postcode',
    countryCodes: ['TZ'],
    label: 'Tanzania postcode service',
    authority: 'government',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.tcra.go.tz/services/postcode',
    sourceNames: ['tcra postcode', 'tanzania postcode', 'posta tanzania', 'tanzania posts corporation'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Tanzania Communications Regulatory Authority postcode service.'],
  },
  {
    id: 'rwanda-national-post-office',
    countryCodes: ['RW'],
    label: 'National Post Office of Rwanda',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://i-posita.rw/',
    sourceNames: ['national post office of rwanda', 'i-posita', 'iposita'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Rwandan postal operator; use as official postal-network source where postcodes are limited.'],
  },
  {
    id: 'zampost',
    countryCodes: ['ZM'],
    label: 'Zambia Postal Services Corporation',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'postcode',
    url: 'https://www.zampost.com.zm/',
    sourceNames: ['zampost', 'zambia postal services corporation'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Zambia postal operator; pair with UPU postcode data when machine-readable local data is not available.'],
  },
  {
    id: 'paositra-malagasy',
    countryCodes: ['MG'],
    label: 'Paositra Malagasy',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'postcode',
    url: 'https://www.paositramalagasy.mg/cds',
    sourceNames: ['paositra malagasy', 'madagascar post'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Madagascar postal operator; use for postal-network evidence until postcode bulk data is connected.'],
  },
  {
    id: 'mauritius-post-postcode',
    countryCodes: ['MU'],
    label: 'Mauritius Post postcode finder',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.mauritiuspost.mu/',
    sourceNames: ['mauritius post', 'postcode finder'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Mauritius Post website exposes a postcode finder.'],
  },
  {
    id: 'botswanapost',
    countryCodes: ['BW'],
    label: 'BotswanaPost',
    authority: 'postal-operator',
    trustTier: 'official',
    availability: 'web-search',
    depth: 'locality',
    url: 'https://www.botswanapost.co.bw/',
    sourceNames: ['botswanapost', 'botswana post'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Botswana postal operator; connect a confirmed postcode lookup when available.'],
  },
  {
    id: 'austrian-post-postcode',
    countryCodes: ['AT'],
    label: 'Austrian Post postal encyclopedia',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.post.at/en/g/c/postal-encyclopedia',
    sourceNames: ['austrian post', 'oesterreichische post', 'post.at', 'postal encyclopedia'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Austrian Post postcode and destination-location directory.'],
  },
  {
    id: 'swiss-post-postcodes',
    countryCodes: ['CH', 'LI'],
    label: 'Swiss Post postcode search',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'postcode',
    url: 'https://www.post.ch/en/customer-center/online-services/plz-suche/info',
    sourceNames: ['swiss post', 'post.ch', 'swiss postcodes', 'plz suche'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official Swiss Post postcode/place lookup for Switzerland and Liechtenstein.'],
  },
  {
    id: 'postnl-postcode-finder',
    countryCodes: ['NL'],
    label: 'PostNL postcode finder',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'public-api',
    depth: 'address',
    url: 'https://www.postnl.nl/en/find-a-postcode/',
    sourceNames: ['postnl', 'postcode finder', 'find a postcode'],
    openSourceIds: [],
    requiresCredential: false,
    notes: ['Official PostNL postcode/address finder.'],
  },
  {
    id: 'postnl-postcode-table',
    countryCodes: ['NL'],
    label: 'PostNL postcode table',
    authority: 'postal-operator',
    trustTier: 'authoritative',
    availability: 'licensed-bulk-data',
    depth: 'address',
    url: 'https://www.postnl.nl/api/assets/blt43aa441bfc1e29f2/bltfcd225acf8c54b1e/69aad68afa2e53eeaaf76e79/postcode-table-file-structure.pdf',
    sourceNames: ['postnl postcode table', 'pct-h'],
    openSourceIds: [],
    requiresCredential: true,
    notes: ['Official PostNL postcode table documentation for address-level Dutch postcode data.'],
  },
  ...GLOBAL_OPEN_REFERENCE_SOURCES,
  ...GLOBAL_OFFICIAL_POSTAL_SOURCES,
];

const TRUST_ORDER: Record<PostalSourceTrustTier, number> = {
  authoritative: 6,
  official: 5,
  'official-derived': 4,
  'open-reference': 3,
  community: 2,
  weak: 1,
};

const AVAILABILITY_ORDER: Record<PostalSourceAvailability, number> = {
  'public-api': 8,
  'auth-required-api': 7,
  'bulk-open-data': 6,
  'licensed-bulk-data': 5,
  'commercial-or-restricted': 4,
  'web-search': 3,
  'no-normal-postcode': 2,
  unknown: 1,
};

const STRONG_TIERS = new Set<PostalSourceTrustTier>([
  'authoritative',
  'official',
  'official-derived',
  'open-reference',
]);

const WEAK_SOURCE_PATTERNS = [
  /datahub/i,
  /postal-codes-json/i,
  /postalcodes\.info/i,
  /spotzi/i,
  /scrape4u/i,
  /regional table/i,
  /candidate/i,
];

const POSTAL_OPERATOR_PATTERNS = [
  /\bposte\b/i,
  /\bposten\b/i,
  /\bpostnord\b/i,
  /\bcorreos\b/i,
  /\bcorreios\b/i,
  /\bpoczta\b/i,
  /\bposta\b/i,
  /\bptt\b/i,
  /\busps\b/i,
  /\broyal mail\b/i,
  /\b4-72\b/i,
  /\bcanada post\b/i,
  /\baustralia post\b/i,
  /\bauspost\b/i,
  /\bjapan post\b/i,
  /\bindia post\b/i,
  /\bqazpost\b/i,
  /\bkazpost\b/i,
  /\bhaypost\b/i,
  /\bepost\b/i,
  /\bphlpost\b/i,
  /\blibanpost\b/i,
  /\bslpost\b/i,
  /\bmaldives post\b/i,
  /\bbhutan post\b/i,
  /\bpakistan post\b/i,
  /\bnepal post\b/i,
  /\bpos malaysia\b/i,
  /\bsingapore post\b/i,
  /\bthailand post\b/i,
  /\bvietnam post\b/i,
  /\bsaudi post\b/i,
  /\boman post\b/i,
];

const clean = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/[\u3000\s]+/g, ' ').trim();

function normalizeCountryCode(value: unknown) {
  const normalized = clean(value).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  return normalized === 'UK' ? 'GB' : normalized;
}

function normalizeTextKey(value: unknown) {
  return clean(value).toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function sourceAppliesToCountry(profile: OfficialPostalSourceProfile, countryCode: string) {
  if (!countryCode || profile.countryCodes.includes('*')) return true;
  return profile.countryCodes.map(normalizeCountryCode).includes(countryCode);
}

function profileMatchesText(profile: OfficialPostalSourceProfile, textKeys: string[]) {
  const profileKeys = [
    profile.id,
    profile.label,
    profile.url,
    ...profile.sourceNames,
    ...profile.openSourceIds,
  ].map(normalizeTextKey).filter(Boolean);

  return textKeys.some(textKey => profileKeys.some(profileKey => (
    textKey.includes(profileKey) || profileKey.includes(textKey)
  )));
}

function sortProfiles(profiles: OfficialPostalSourceProfile[]) {
  return [...profiles].sort((left, right) => {
    const tierDelta = TRUST_ORDER[right.trustTier] - TRUST_ORDER[left.trustTier];
    if (tierDelta) return tierDelta;
    const globalDelta = Number(left.countryCodes.includes('*')) - Number(right.countryCodes.includes('*'));
    if (globalDelta) return globalDelta;
    const availabilityDelta = AVAILABILITY_ORDER[right.availability] - AVAILABILITY_ORDER[left.availability];
    if (availabilityDelta) return availabilityDelta;
    const credentialDelta = Number(left.requiresCredential) - Number(right.requiresCredential);
    if (credentialDelta) return credentialDelta;
    return left.id.localeCompare(right.id);
  });
}

export function getOfficialPostalSourcesForCountry(countryCode: string) {
  const code = normalizeCountryCode(countryCode);
  return sortProfiles(OFFICIAL_POSTAL_SOURCE_CATALOG.filter(profile => sourceAppliesToCountry(profile, code)));
}

export function classifyPostalSourceTrust(input: {
  countryCode?: string;
  source?: string | null;
  url?: string | null;
  sourceIds?: string[];
}): PostalSourceClassification {
  const countryCode = normalizeCountryCode(input.countryCode);
  const textKeys = [
    input.source,
    input.url,
    ...(input.sourceIds || []),
  ].map(normalizeTextKey).filter(Boolean);
  const raw = clean([input.source, input.url, ...(input.sourceIds || [])].filter(Boolean).join(' '));

  if (!textKeys.length) {
    return {
      tier: 'weak',
      strength: 'weak',
      reason: 'No postal source identity was supplied.',
      matches: [],
    };
  }

  const matches = sortProfiles(OFFICIAL_POSTAL_SOURCE_CATALOG.filter(profile => (
    sourceAppliesToCountry(profile, countryCode) && profileMatchesText(profile, textKeys)
  )));

  if (matches.length) {
    const best = matches[0];
    if (!STRONG_TIERS.has(best.trustTier) &&
      !WEAK_SOURCE_PATTERNS.some(pattern => pattern.test(raw)) &&
      (/official|government|postal operator|national address|national-address/i.test(raw) ||
        POSTAL_OPERATOR_PATTERNS.some(pattern => pattern.test(raw)))
    ) {
      return {
        tier: 'official',
        strength: 'strong',
        reason: 'Source text includes an official/government or postal-operator signal in addition to weaker fallback references.',
        matches,
      };
    }

    return {
      tier: best.trustTier,
      strength: STRONG_TIERS.has(best.trustTier) ? 'strong' : 'weak',
      reason: `${best.label} matched as ${best.trustTier} (${best.availability}).`,
      matches,
    };
  }

  if (WEAK_SOURCE_PATTERNS.some(pattern => pattern.test(raw))) {
    return {
      tier: 'weak',
      strength: 'weak',
      reason: 'Source matches a weak or community-only postal dataset pattern.',
      matches: [],
    };
  }

  if (/official|government|postal operator|national address|national-address/i.test(raw)) {
    return {
      tier: 'official',
      strength: 'strong',
      reason: 'Source text declares official or government authority but is not yet cataloged.',
      matches: [],
    };
  }

  if (POSTAL_OPERATOR_PATTERNS.some(pattern => pattern.test(raw))) {
    return {
      tier: 'official',
      strength: 'strong',
      reason: 'Source text appears to be a national postal operator or postal-office source but is not yet individually cataloged.',
      matches: [],
    };
  }

  return {
    tier: 'community',
    strength: 'weak',
    reason: 'Source is not in the official postal source catalog yet.',
    matches: [],
  };
}

export function isStrongPostalTrustTier(tier: PostalSourceTrustTier) {
  return STRONG_TIERS.has(tier);
}

export function getPreferredPostalSourceIdsForCountry(countryCode: string) {
  return getOfficialPostalSourcesForCountry(countryCode)
    .filter(source => source.trustTier !== 'weak')
    .map(source => source.id);
}
