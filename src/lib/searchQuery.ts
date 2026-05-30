import { normalizeEnglishAddressPart } from './addressEnglish';
import { getIndianEnglishAddressAliases } from './indiaAddressEnglish';
import { getSouthAfricanEnglishAddressAliases } from './southAfricaAddressEnglish';

const ABBREVIATIONS: Record<string, string> = {
  st: 'street',
  rd: 'road',
  ave: 'avenue',
  av: 'avenida',
  blvd: 'boulevard',
  dr: 'drive',
  ln: 'lane',
  apt: 'apartment',
  ste: 'suite',
  cl: 'calle',
  cra: 'carrera',
  pza: 'plaza',
  col: 'colonia',
  no: 'numero',
  nro: 'numero',
};

const DIRECT_ALIASES: Record<string, string[]> = {
  '東京都': ['Tokyo'],
  '東京': ['Tokyo'],
  '大阪': ['Osaka'],
  '京都': ['Kyoto'],
  '서울': ['Seoul'],
  '서울특별시': ['Seoul'],
  '北京': ['Beijing'],
  '北京市': ['Beijing'],
  '上海': ['Shanghai'],
  'Москва': ['Moscow'],
  'กรุงเทพมหานคร': ['Bangkok'],
  'Ciudad de México': ['Mexico City'],
  'Ciudad De Mexico': ['Mexico City'],
  CDMX: ['Mexico City'],
  'Estado de México': ['State of Mexico'],
  Bogotá: ['Bogota'],
  'São Paulo': ['Sao Paulo'],
  Panamá: ['Panama'],
  'República Dominicana': ['Dominican Republic'],
  'La Habana': ['Havana'],
  Perú: ['Peru'],
  Asunción: ['Asuncion'],
  ...Object.fromEntries(
    Object.entries(getIndianEnglishAddressAliases()).map(([local, english]) => [local, [english]]),
  ),
  ...Object.fromEntries(
    Object.entries(getSouthAfricanEnglishAddressAliases()).map(([local, english]) => [local, [english]]),
  ),
};

const COMMON_PLACE_NAMES = [
  'Tokyo',
  'Kyoto',
  'Osaka',
  'Seoul',
  'Beijing',
  'Shanghai',
  'Bangkok',
  'Singapore',
  'New York',
  'New York City',
  'Los Angeles',
  'London',
  'Paris',
  'Mexico City',
  'Bogota',
  'Sao Paulo',
  'San Jose',
  'Panama',
  'Havana',
  'Dominican Republic',
  'Buenos Aires',
  'Santiago',
  'Lima',
  'Quito',
  'Asuncion',
  'Montevideo',
  'Caracas',
  'Rio de Janeiro',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
  'Amritsar',
  'Kochi',
  'Kozhikode',
  'Varanasi',
  'Lucknow',
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Port Elizabeth',
  'Grahamstown',
  'Polokwane',
  'Mbombela',
];

const TYPO_ALIASES: Record<string, string> = {
  tokio: 'Tokyo',
  mexcio: 'Mexico',
  'mexcio city': 'Mexico City',
  bogtoa: 'Bogota',
  'sao paolo': 'Sao Paulo',
  'sna jose': 'San Jose',
  panamae: 'Panama',
  banaras: 'Varanasi',
  calicut: 'Kozhikode',
  bangalore: 'Bengaluru',
  bombay: 'Mumbai',
  madras: 'Chennai',
  egoli: 'Johannesburg',
  ikapa: 'Cape Town',
  ethekwini: 'Durban',
  tshwane: 'Pretoria',
  gqeberha: 'Port Elizabeth',
  pietersburg: 'Polokwane',
};

const SCRIPT_COUNTRY_GUESSES = [
  'JP',
  'CN',
  'TW',
  'HK',
  'MO',
  'KR',
  'KP',
  'RU',
  'UA',
  'TH',
  'IN',
  'PK',
  'BD',
  'NP',
  'LK',
  'BT',
  'MV',
  'AF',
  'EG',
  'IL',
  'TR',
  'IR',
  'MN',
  'MX',
  'CO',
  'BR',
  'AR',
  'CL',
  'PE',
  'EC',
  'PY',
  'UY',
  'VE',
];

function unique(values: string[]) {
  const seen = new Set<string>();
  return values
    .map(value => value.trim())
    .filter(Boolean)
    .filter(value => {
      const key = value.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function deaccent(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSearchText(value: string) {
  return deaccent(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=_`~()[\]"'¿?¡]/g, ' ')
    .replace(/[-–—]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ABBREVIATIONS[word] || word)
    .join(' ')
    .trim();
}

function levenshtein(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let col = 1; col <= b.length; col += 1) rows[0][col] = col;

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      rows[row][col] = Math.min(
        rows[row - 1][col] + 1,
        rows[row][col - 1] + 1,
        rows[row - 1][col - 1] + cost,
      );
    }
  }

  return rows[a.length][b.length];
}

function typoCandidates(normalizedQuery: string) {
  const explicit = TYPO_ALIASES[normalizedQuery];
  if (explicit) return [explicit];

  return COMMON_PLACE_NAMES.filter(placeName => {
    const normalizedPlace = normalizeSearchText(placeName);
    const maxDistance = normalizedPlace.length <= 6 ? 1 : 2;
    return levenshtein(normalizedQuery, normalizedPlace) <= maxDistance;
  });
}

export function expandSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normalized = normalizeSearchText(trimmed);
  const candidates = [
    trimmed,
    ...(DIRECT_ALIASES[trimmed] ?? []),
    normalizeEnglishAddressPart(trimmed),
    ...SCRIPT_COUNTRY_GUESSES.map(countryCode => normalizeEnglishAddressPart(trimmed, countryCode)),
    deaccent(trimmed),
    normalized,
    ...typoCandidates(normalized),
  ];

  return unique(candidates);
}

export function scoreSearchCandidate(label: string, queryCandidates: string[]) {
  const normalizedLabel = normalizeSearchText(label);
  let bestScore = 0;

  for (const candidate of queryCandidates) {
    const normalizedCandidate = normalizeSearchText(candidate);
    if (!normalizedCandidate) continue;

    if (normalizedLabel === normalizedCandidate) bestScore = Math.max(bestScore, 1);
    else if (normalizedLabel.startsWith(normalizedCandidate)) bestScore = Math.max(bestScore, 0.9);
    else if (normalizedLabel.includes(normalizedCandidate)) bestScore = Math.max(bestScore, 0.75);
    else {
      const distance = levenshtein(normalizedLabel.slice(0, normalizedCandidate.length), normalizedCandidate);
      const tolerance = normalizedCandidate.length <= 6 ? 1 : 2;
      if (distance <= tolerance) bestScore = Math.max(bestScore, 0.6);
    }
  }

  return bestScore;
}
