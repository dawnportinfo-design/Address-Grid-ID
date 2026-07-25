export type ShipmentMode = 'postal' | 'parcel' | 'air' | 'ocean' | 'road' | 'rail' | 'multimodal';

export type TradeSourceKind = 'open-data' | 'open-api-standard' | 'official-reference';

export interface TradeOpenSource {
  id: string;
  name: string;
  kind: TradeSourceKind;
  license: string;
  url: string;
  useFor: string[];
  notes: string;
}

export interface TradeRouteContext {
  originCountryCode?: string;
  destinationCountryCode?: string;
  mode?: ShipmentMode;
  incoterm?: string;
}

export interface TradeShipmentItem {
  description: string;
  hsCode?: string;
  value?: number;
  currency?: string;
  weightKg?: number;
  quantity?: number;
  containsBattery?: boolean;
  isLiquid?: boolean;
  isFood?: boolean;
  isMedical?: boolean;
}

export interface TradeReadinessInput extends TradeRouteContext {
  items: TradeShipmentItem[];
}

export interface TradeReadinessReport {
  normalizedIncoterm?: string;
  sources: TradeOpenSource[];
  requiredData: string[];
  documentHints: string[];
  warnings: string[];
  itemChecks: Array<{
    description: string;
    normalizedHsCode?: string;
    hsCodeScope?: 'chapter' | 'heading' | 'subheading' | 'tariff-line';
    warnings: string[];
  }>;
}

export const TRADE_OPEN_SOURCES: TradeOpenSource[] = [
  {
    id: 'un-locode',
    name: 'UNECE UN/LOCODE',
    kind: 'open-data',
    license: 'ODC Public Domain Dedication and License (PDDL) via the public UN/LOCODE dataset package',
    url: 'https://unece.org/trade/cefact/UNLOCODE-Download',
    useFor: ['ports', 'airports', 'rail terminals', 'inland depots', 'trade transport locations'],
    notes: 'Use as the location-code bridge between AGID addresses and transport nodes.',
  },
  {
    id: 'dcsa-openapi',
    name: 'DCSA OpenAPI specifications',
    kind: 'open-api-standard',
    license: 'Apache-2.0 for DCSA public repositories',
    url: 'https://github.com/dcsaorg/DCSA-OpenAPI',
    useFor: ['ocean booking', 'track and trace', 'transport documents', 'container events'],
    notes: 'Use for carrier-neutral container-shipping API compatibility, especially ocean and multimodal flows.',
  },
  {
    id: 'wco-hs-reference',
    name: 'WCO Harmonized System reference',
    kind: 'official-reference',
    license: 'Official reference; verify redistribution terms before bundling full nomenclature text',
    url: 'https://www.wcoomd.org/en/topics/nomenclature/overview.aspx',
    useFor: ['six-digit commodity classification', 'customs declaration preparation'],
    notes: 'Use as the conceptual source for HS code validation. Country tariff schedules extend the first six digits.',
  },
  {
    id: 'usitc-hts',
    name: 'USITC Harmonized Tariff Schedule open data',
    kind: 'open-data',
    license: 'U.S. government open data',
    url: 'https://www.usitc.gov/data/index.htm',
    useFor: ['United States HTS lookup', 'duty-rate reference', '10-digit U.S. tariff-line checks'],
    notes: 'Use when either side of the movement involves the United States and tariff-line detail is needed.',
  },
];

const INCOTERMS_2020 = new Set([
  'EXW',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
]);

const unique = <T>(values: T[]) => Array.from(new Set(values));

export function normalizeHsCode(value: string | undefined) {
  const code = String(value ?? '').replace(/\D/g, '');
  if (!code) return undefined;
  return code;
}

export function classifyHsCodeScope(value: string | undefined) {
  const code = normalizeHsCode(value);
  if (!code) return undefined;
  if (code.length === 2) return 'chapter' as const;
  if (code.length === 4) return 'heading' as const;
  if (code.length === 6) return 'subheading' as const;
  if (code.length > 6) return 'tariff-line' as const;
  return undefined;
}

export function normalizeIncoterm(value: string | undefined) {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (!normalized) return undefined;
  return INCOTERMS_2020.has(normalized) ? normalized : undefined;
}

export function selectTradeOpenSources(context: TradeRouteContext) {
  const origin = context.originCountryCode?.toUpperCase();
  const destination = context.destinationCountryCode?.toUpperCase();
  const mode = context.mode ?? 'parcel';
  const sourceIds = new Set(['wco-hs-reference']);

  if (['air', 'ocean', 'rail', 'road', 'multimodal'].includes(mode)) {
    sourceIds.add('un-locode');
  }

  if (mode === 'ocean' || mode === 'multimodal') {
    sourceIds.add('dcsa-openapi');
  }

  if (origin === 'US' || destination === 'US') {
    sourceIds.add('usitc-hts');
  }

  return TRADE_OPEN_SOURCES.filter(source => sourceIds.has(source.id));
}

export function buildTradeReadinessReport(input: TradeReadinessInput): TradeReadinessReport {
  const normalizedIncoterm = normalizeIncoterm(input.incoterm);
  const warnings: string[] = [];
  const requiredData = [
    'origin country',
    'destination country',
    'recipient address in international-shipping English',
    'item description',
    'item value and currency',
    'item weight',
    'HS code at least to six digits when available',
  ];
  const documentHints = ['commercial invoice', 'packing list'];

  if (input.incoterm && !normalizedIncoterm) {
    warnings.push(`Unsupported Incoterms 2020 code: ${input.incoterm}`);
  }

  if (!input.originCountryCode || !input.destinationCountryCode) {
    warnings.push('Origin and destination country codes are required for trade source selection.');
  }

  if (input.originCountryCode && input.destinationCountryCode && input.originCountryCode.toUpperCase() !== input.destinationCountryCode.toUpperCase()) {
    documentHints.push('customs declaration');
  }

  if (input.mode === 'ocean' || input.mode === 'multimodal') {
    documentHints.push('bill of lading or sea waybill');
    requiredData.push('UN/LOCODE for origin and destination transport nodes when available');
  }

  const itemChecks = input.items.map(item => {
    const itemWarnings: string[] = [];
    const normalizedHsCode = normalizeHsCode(item.hsCode);
    const hsCodeScope = classifyHsCodeScope(item.hsCode);

    if (!item.description.trim()) itemWarnings.push('Item description is required.');
    if (!normalizedHsCode) itemWarnings.push('HS code is missing; request classification before customs filing.');
    if (normalizedHsCode && normalizedHsCode.length < 6) itemWarnings.push('HS code should usually be at least six digits for cross-border shipment screening.');
    if (item.value === undefined || item.value < 0) itemWarnings.push('Item value is required and must be non-negative.');
    if (!item.currency) itemWarnings.push('Currency is required for declared value.');
    if (item.weightKg === undefined || item.weightKg <= 0) itemWarnings.push('Weight must be greater than zero.');
    if (item.containsBattery) itemWarnings.push('Battery shipment may require dangerous-goods review and carrier-specific handling.');
    if (item.isLiquid || item.isFood || item.isMedical) itemWarnings.push('Commodity may require import permits, sanitary checks, or carrier restrictions.');

    return {
      description: item.description,
      normalizedHsCode,
      hsCodeScope,
      warnings: itemWarnings,
    };
  });

  return {
    normalizedIncoterm,
    sources: selectTradeOpenSources(input),
    requiredData: unique(requiredData),
    documentHints: unique(documentHints),
    warnings,
    itemChecks,
  };
}
