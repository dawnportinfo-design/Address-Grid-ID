import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

type AddressFormat = {
  countryCode: string;
  name: string;
  [key: string]: unknown;
};

type RegionEntry = {
  code: string;
  name: string;
};

type Placement = {
  continent: ContinentId;
  subregion: string;
  type?: EntityType;
};

type EntityType = 'country' | 'territory' | 'autonomous' | 'disputed' | 'special';

type ContinentId = 'africa' | 'americas' | 'antarctica' | 'asia' | 'europe' | 'oceania' | 'special';

type ContinentBucket = {
  continent: ContinentId;
  name: string;
  subregions: Record<string, { id: string; name: string; countries: unknown[] }>;
  coverage: Record<'total' | EntityType, number>;
};

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'src', 'data');
const ADDRESS_FORMAT_DIR = join(DATA_DIR, 'address_formats');
const OUTPUT_DIR = join(DATA_DIR, 'address_hierarchy');

const CONTINENT_NAMES: Record<ContinentId, string> = {
  africa: 'Africa',
  americas: 'Americas',
  antarctica: 'Antarctica',
  asia: 'Asia',
  europe: 'Europe',
  oceania: 'Oceania',
  special: 'Special Regions',
};

const REGION_FILE_PLACEMENTS: Record<string, ContinentId> = {
  'africa_regions.json': 'africa',
  'americas_regions.json': 'americas',
  'caribbean_regions.json': 'americas',
  'south_america_regions.json': 'americas',
  'asia_regions.json': 'asia',
  'europe_regions.json': 'europe',
  'oceania_regions.json': 'oceania',
};

const MANUAL_PLACEMENTS: Record<string, Placement> = {
  AC: { continent: 'africa', subregion: 'south_atlantic_territories', type: 'territory' },
  AM: { continent: 'asia', subregion: 'caucasus', type: 'country' },
  AQ: { continent: 'antarctica', subregion: 'antarctica', type: 'special' },
  AZ: { continent: 'asia', subregion: 'caucasus', type: 'country' },
  BM: { continent: 'americas', subregion: 'north_atlantic_territories', type: 'territory' },
  BV: { continent: 'antarctica', subregion: 'subantarctic_territories', type: 'territory' },
  CC: { continent: 'oceania', subregion: 'australian_external_territories', type: 'territory' },
  CP: { continent: 'americas', subregion: 'french_overseas_territories', type: 'territory' },
  CV: { continent: 'africa', subregion: 'western_africa', type: 'country' },
  CX: { continent: 'oceania', subregion: 'australian_external_territories', type: 'territory' },
  CY: { continent: 'europe', subregion: 'southern_europe', type: 'country' },
  EA: { continent: 'europe', subregion: 'spanish_autonomous_regions', type: 'autonomous' },
  EE: { continent: 'europe', subregion: 'northern_europe', type: 'country' },
  ES_BAL: { continent: 'europe', subregion: 'spanish_autonomous_regions', type: 'autonomous' },
  ES_CAN: { continent: 'europe', subregion: 'spanish_autonomous_regions', type: 'autonomous' },
  GE: { continent: 'asia', subregion: 'caucasus', type: 'country' },
  IO: { continent: 'africa', subregion: 'indian_ocean_territories', type: 'territory' },
  KM: { continent: 'africa', subregion: 'eastern_africa', type: 'country' },
  LT: { continent: 'europe', subregion: 'northern_europe', type: 'country' },
  LV: { continent: 'europe', subregion: 'northern_europe', type: 'country' },
  MK: { continent: 'europe', subregion: 'eastern_europe', type: 'country' },
  MW: { continent: 'africa', subregion: 'eastern_africa', type: 'country' },
  NF: { continent: 'oceania', subregion: 'australian_external_territories', type: 'territory' },
  NU: { continent: 'oceania', subregion: 'polynesia', type: 'territory' },
  PN: { continent: 'oceania', subregion: 'polynesia', type: 'territory' },
  PS: { continent: 'asia', subregion: 'middle_east', type: 'country' },
  PT_AZO: { continent: 'europe', subregion: 'portuguese_autonomous_regions', type: 'autonomous' },
  PT_MAD: { continent: 'europe', subregion: 'portuguese_autonomous_regions', type: 'autonomous' },
  RE: { continent: 'africa', subregion: 'indian_ocean_territories', type: 'territory' },
  RU: { continent: 'europe', subregion: 'eastern_europe', type: 'country' },
  SBA: { continent: 'europe', subregion: 'southern_europe_territories', type: 'territory' },
  SD: { continent: 'africa', subregion: 'northern_africa', type: 'country' },
  SJ: { continent: 'europe', subregion: 'northern_europe', type: 'territory' },
  SI: { continent: 'europe', subregion: 'central_europe', type: 'country' },
  SS: { continent: 'africa', subregion: 'eastern_africa', type: 'country' },
  ST: { continent: 'africa', subregion: 'central_africa', type: 'country' },
  TF: { continent: 'antarctica', subregion: 'french_southern_territories', type: 'territory' },
  TK: { continent: 'oceania', subregion: 'polynesia', type: 'territory' },
  WF: { continent: 'oceania', subregion: 'polynesia', type: 'territory' },
  XD: { continent: 'europe', subregion: 'southern_europe_territories', type: 'territory' },
  XU: { continent: 'europe', subregion: 'southern_europe_territories', type: 'territory' },
  YT: { continent: 'africa', subregion: 'indian_ocean_territories', type: 'territory' },
};

const TYPE_OVERRIDES: Record<string, EntityType> = {
  AX: 'autonomous',
  BQ: 'territory',
  FO: 'territory',
  GG: 'territory',
  GI: 'territory',
  GL: 'autonomous',
  IM: 'territory',
  JE: 'territory',
  PM: 'territory',
  SH: 'territory',
  TA: 'territory',
  XK: 'country',
  BT_T: 'disputed',
  CRIM: 'disputed',
  DONB: 'disputed',
  KASH: 'disputed',
  SCSD: 'disputed',
  EEBD: 'disputed',
  TRNC: 'disputed',
  SLND: 'disputed',
  PMR: 'disputed',
  PHIS: 'special',
  BAAR: 'special',
  CYGL: 'disputed',
  JP_NT: 'disputed',
  JP_TK: 'disputed',
  JP_SK: 'disputed',
};

const DISPUTED_PLACEMENTS: Record<string, Placement> = {
  BT_T: { continent: 'africa', subregion: 'disputed_territories', type: 'disputed' },
  CRIM: { continent: 'europe', subregion: 'disputed_territories', type: 'disputed' },
  DONB: { continent: 'europe', subregion: 'disputed_territories', type: 'disputed' },
  KASH: { continent: 'asia', subregion: 'disputed_territories', type: 'disputed' },
  SCSD: { continent: 'asia', subregion: 'disputed_territories', type: 'disputed' },
  EEBD: { continent: 'africa', subregion: 'disputed_territories', type: 'disputed' },
  JP_NT: { continent: 'asia', subregion: 'disputed_territories', type: 'disputed' },
  TRNC: { continent: 'europe', subregion: 'disputed_territories', type: 'disputed' },
  SLND: { continent: 'africa', subregion: 'disputed_territories', type: 'disputed' },
  PMR: { continent: 'europe', subregion: 'disputed_territories', type: 'disputed' },
  PHIS: { continent: 'europe', subregion: 'special_condominiums_and_enclaves', type: 'special' },
  BAAR: { continent: 'europe', subregion: 'special_condominiums_and_enclaves', type: 'special' },
  CYGL: { continent: 'europe', subregion: 'disputed_territories', type: 'disputed' },
  JP_TK: { continent: 'asia', subregion: 'disputed_territories', type: 'disputed' },
  JP_SK: { continent: 'asia', subregion: 'disputed_territories', type: 'disputed' },
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, relativePath), 'utf8')) as T;
}

function titleFromId(id: string) {
  return id
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildRegionPlacementMap() {
  const placements = new Map<string, Placement>();

  for (const [fileName, continent] of Object.entries(REGION_FILE_PLACEMENTS)) {
    const data = readJson<Record<string, RegionEntry[]>>(fileName);
    for (const [subregion, entries] of Object.entries(data)) {
      for (const entry of entries) {
        if (!placements.has(entry.code)) placements.set(entry.code, { continent, subregion });
      }
    }
  }

  for (const entry of readJson<RegionEntry[]>('disputed_territories.json')) {
    placements.set(entry.code, DISPUTED_PLACEMENTS[entry.code] ?? {
      continent: 'special',
      subregion: 'disputed_territories',
      type: 'disputed',
    });
  }

  for (const [code, placement] of Object.entries(MANUAL_PLACEMENTS)) {
    placements.set(code, placement);
  }

  return placements;
}

function entityTypeFor(code: string, placement?: Placement): EntityType {
  if (placement?.type) return placement.type;
  if (TYPE_OVERRIDES[code]) return TYPE_OVERRIDES[code];
  if (code.includes('_')) return 'special';
  return 'country';
}

function collectAddressFormatFiles(dir = ADDRESS_FORMAT_DIR): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectAddressFormatFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(relative(ADDRESS_FORMAT_DIR, fullPath).replace(/\\/g, '/'));
    }
  }
  return files.sort();
}

function main() {
  const placements = buildRegionPlacementMap();
  const addressFiles = collectAddressFormatFiles();

  const hierarchy = {} as Record<ContinentId, ContinentBucket>;
  for (const continent of Object.keys(CONTINENT_NAMES) as ContinentId[]) {
    hierarchy[continent] = {
      continent,
      name: CONTINENT_NAMES[continent],
      subregions: {},
      coverage: { total: 0, country: 0, territory: 0, autonomous: 0, disputed: 0, special: 0 },
    };
  }

  const unplaced: string[] = [];

  for (const fileName of addressFiles) {
    const code = basename(fileName, '.json');
    const addressFormat = JSON.parse(readFileSync(join(ADDRESS_FORMAT_DIR, fileName), 'utf8')) as AddressFormat;
    const placement = placements.get(code);

    if (!placement) {
      unplaced.push(code);
      continue;
    }

    const type = entityTypeFor(code, placement);
    const continentBucket = hierarchy[placement.continent];
    continentBucket.subregions[placement.subregion] ??= {
      id: placement.subregion,
      name: titleFromId(placement.subregion),
      countries: [],
    };
    continentBucket.subregions[placement.subregion].countries.push({
      code,
      name: addressFormat.name,
      type,
      addressFormatPath: `src/data/address_formats/${fileName}`,
      addressFormat,
    });
    continentBucket.coverage.total += 1;
    continentBucket.coverage[type] += 1;
  }

  if (unplaced.length) {
    throw new Error(`Address formats missing continent/subregion placement: ${unplaced.join(', ')}`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const index = {
    description: 'Generated AGID address metadata hierarchy. Canonical address_formats are stored by continent and subregion.',
    continents: [] as { id: ContinentId; name: string; file: string; total: number }[],
  };

  for (const continent of Object.keys(CONTINENT_NAMES) as ContinentId[]) {
    const bucket = hierarchy[continent];
    for (const subregion of Object.values(bucket.subregions)) {
      subregion.countries.sort((a: any, b: any) => a.code.localeCompare(b.code));
    }
    bucket.subregions = Object.fromEntries(
      Object.entries(bucket.subregions).sort(([a], [b]) => a.localeCompare(b)),
    );

    const file = `${continent}.json`;
    writeFileSync(join(OUTPUT_DIR, file), JSON.stringify(bucket, null, 2) + '\n');
    index.continents.push({ id: continent, name: bucket.name, file: `src/data/address_hierarchy/${file}`, total: bucket.coverage.total });
  }

  writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n');
}

main();
