import {
  AlertTriangle,
  Check,
  Download,
  FileBox,
  Grid2X2,
  Layers3,
  Map,
  Mountain,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';

import {
  AGID_SYNTHETIC_TOPO_SOURCE,
  MAX_TOPOGRAPHIC_EXPORT_AREA_KM2,
  TOPOGRAPHIC_FORMAT_DEFINITIONS,
  TOPOGRAPHIC_LAYER_DEFINITIONS,
  buildTopographicExportPlan,
  createSyntheticTopographicDataset,
  type TopographicBounds,
  type TopographicExportFormat,
  type TopographicLayerId,
} from '../lib/topographicExport';
import { serializeTopographicExport } from '../lib/topographicExportSerializers';
import { cn } from '../lib/utils';

const DEFAULT_BOUNDS: TopographicBounds = {
  south: 35.675,
  west: 139.755,
  north: 35.695,
  east: 139.78,
};

const DEFAULT_LAYERS: TopographicLayerId[] = [
  'buildings',
  'cadastral-parcels',
  'roads',
  'railways',
  'waterways',
  'trees-green-spaces',
  'contour-lines',
];

const MODE_LABELS = {
  '2d-vector': '2D Vector',
  '3d-model': '3D Model',
  raw: 'Raw',
} as const;

function formatBytes(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_024 ** 2) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_024 ** 2).toFixed(1)} MB`;
}

function NumericField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] font-bold text-slate-500">{label}</span>
      <input
        type="number"
        step="0.001"
        value={Number.isFinite(value) ? value : ''}
        onChange={event => onChange(Number(event.target.value))}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span className={cn(
      'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[10px] font-black uppercase',
      ready
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-800',
    )}>
      {ready ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      {ready ? 'Ready' : 'Blocked'}
    </span>
  );
}

export function TopographicExportStudioScreen() {
  const [bounds, setBounds] = React.useState(DEFAULT_BOUNDS);
  const [countryCode, setCountryCode] = React.useState('JP');
  const [crs, setCrs] = React.useState('EPSG:4326');
  const [format, setFormat] = React.useState<TopographicExportFormat>('svg');
  const [layerIds, setLayerIds] = React.useState<TopographicLayerId[]>(DEFAULT_LAYERS);
  const [dataMode, setDataMode] = React.useState<'synthetic' | 'source-backed'>('synthetic');
  const [contourIntervalMeters, setContourIntervalMeters] = React.useState(5);
  const [terrainResolutionMeters, setTerrainResolutionMeters] = React.useState(20);
  const [downloadSummary, setDownloadSummary] = React.useState<string | null>(null);

  const formatDefinition = TOPOGRAPHIC_FORMAT_DEFINITIONS.find(item => item.id === format)!;
  const plan = React.useMemo(() => buildTopographicExportPlan({
    bounds,
    countryCode,
    crs,
    format,
    layerIds,
    sourceRecords: [AGID_SYNTHETIC_TOPO_SOURCE],
    dataMode,
    contourIntervalMeters,
    terrainResolutionMeters,
  }), [
    bounds,
    countryCode,
    crs,
    format,
    layerIds,
    dataMode,
    contourIntervalMeters,
    terrainResolutionMeters,
  ]);

  const dataset = React.useMemo(() => {
    try {
      return createSyntheticTopographicDataset(bounds);
    } catch {
      return createSyntheticTopographicDataset(DEFAULT_BOUNDS);
    }
  }, [bounds]);

  const previewUrl = React.useMemo(() => {
    const previewPlan = buildTopographicExportPlan({
      bounds: dataset.bounds,
      countryCode,
      crs: 'EPSG:4326',
      format: 'svg',
      layerIds: DEFAULT_LAYERS,
      sourceRecords: [AGID_SYNTHETIC_TOPO_SOURCE],
      dataMode: 'synthetic',
      contourIntervalMeters: 5,
      terrainResolutionMeters: 20,
      now: dataset.generatedAt,
    });
    const preview = serializeTopographicExport(dataset, previewPlan);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(String(preview.data))}`;
  }, [countryCode, dataset]);

  const setBound = (key: keyof TopographicBounds, value: number) => {
    setBounds(current => ({ ...current, [key]: value }));
    setDownloadSummary(null);
  };

  const selectFormat = (nextFormat: TopographicExportFormat) => {
    const nextDefinition = TOPOGRAPHIC_FORMAT_DEFINITIONS.find(item => item.id === nextFormat)!;
    const compatible = layerIds.filter(layerId => nextDefinition.supportedLayers.includes(layerId));
    setFormat(nextFormat);
    setLayerIds(compatible.length > 0 ? compatible : [nextDefinition.supportedLayers[0]]);
    setDownloadSummary(null);
  };

  const toggleLayer = (layerId: TopographicLayerId) => {
    if (!formatDefinition.supportedLayers.includes(layerId)) return;
    setLayerIds(current => current.includes(layerId)
      ? current.filter(item => item !== layerId)
      : [...current, layerId]);
    setDownloadSummary(null);
  };

  const download = () => {
    if (plan.status !== 'ready') return;
    const output = serializeTopographicExport(dataset, plan);
    const blobPart: BlobPart = typeof output.data === 'string'
      ? output.data
      : Uint8Array.from(output.data);
    const objectUrl = URL.createObjectURL(new Blob([blobPart], { type: output.mediaType }));
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = output.fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setDownloadSummary(`${output.fileName} · ${formatBytes(output.byteLength)}`);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href="/"
            aria-label="AGID map"
            title="AGID map"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800"
          >
            <Grid2X2 className="h-4 w-4" />
          </a>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black">Topographic Export Studio</h1>
            <p className="truncate text-[11px] font-semibold text-slate-500">AGID terrain, vector, BIM, CAD and raw export</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[10px] font-bold text-slate-500 sm:block">{plan.areaKm2.toFixed(2)} / {MAX_TOPOGRAPHIC_EXPORT_AREA_KM2} km²</span>
          <StatusBadge ready={plan.status === 'ready'} />
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Map className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase text-slate-700">Selection</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumericField label="North" value={bounds.north} onChange={value => setBound('north', value)} />
              <NumericField label="East" value={bounds.east} onChange={value => setBound('east', value)} />
              <NumericField label="South" value={bounds.south} onChange={value => setBound('south', value)} />
              <NumericField label="West" value={bounds.west} onChange={value => setBound('west', value)} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label>
                <span className="mb-1 block text-[10px] font-bold text-slate-500">Country</span>
                <input
                  value={countryCode}
                  maxLength={3}
                  onChange={event => setCountryCode(event.target.value.toUpperCase())}
                  className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs font-bold uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label>
                <span className="mb-1 block text-[10px] font-bold text-slate-500">Projection</span>
                <input
                  value={crs}
                  onChange={event => setCrs(event.target.value.toUpperCase())}
                  className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs font-bold uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>

          <div className="border-b border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileBox className="h-4 w-4 text-violet-600" />
              <h2 className="text-xs font-black uppercase text-slate-700">Output</h2>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {TOPOGRAPHIC_FORMAT_DEFINITIONS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.label} · ${MODE_LABELS[item.mode]}`}
                  onClick={() => selectFormat(item.id)}
                  className={cn(
                    'h-9 rounded-md border text-[10px] font-black transition',
                    item.id === format
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400',
                  )}
                >
                  {item.id.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <span>{MODE_LABELS[formatDefinition.mode]}</span>
              <span>{formatDefinition.fidelity.replaceAll('-', ' ')}</span>
            </div>
          </div>

          <div className="border-b border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-emerald-600" />
                <h2 className="text-xs font-black uppercase text-slate-700">Layers</h2>
              </span>
              <span className="text-[10px] font-bold text-slate-400">{layerIds.length} selected</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TOPOGRAPHIC_LAYER_DEFINITIONS.map(layer => {
                const compatible = formatDefinition.supportedLayers.includes(layer.id);
                const selected = layerIds.includes(layer.id);
                return (
                  <label
                    key={layer.id}
                    className={cn(
                      'flex min-h-10 items-center gap-2 rounded-md border px-2 py-1.5 text-[10px] font-bold',
                      selected && compatible
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600',
                      !compatible && 'cursor-not-allowed opacity-35',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!compatible}
                      onChange={() => toggleLayer(layer.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-600"
                    />
                    <span className="leading-tight">{layer.label}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <NumericField label="Contours (m)" value={contourIntervalMeters} onChange={setContourIntervalMeters} />
              <NumericField label="Terrain mesh (m)" value={terrainResolutionMeters} onChange={setTerrainResolutionMeters} />
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-700" />
              <h2 className="text-xs font-black uppercase text-slate-700">Evidence mode</h2>
            </div>
            <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-1">
              {(['synthetic', 'source-backed'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setDataMode(mode);
                    setDownloadSummary(null);
                  }}
                  className={cn(
                    'h-8 rounded text-[10px] font-black capitalize transition',
                    dataMode === mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500',
                  )}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={plan.status !== 'ready'}
              onClick={download}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Download className="h-4 w-4" />
              Export {format.toUpperCase()}
            </button>
            {downloadSummary && <p className="mt-2 truncate text-center text-[10px] font-bold text-emerald-700">{downloadSummary}</p>}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="grid border-b border-slate-200 bg-slate-950 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden border-b border-white/10 bg-[#e6edf3] p-5 lg:min-h-[580px] lg:border-b-0 lg:border-r">
              <img
                src={previewUrl}
                alt="Synthetic topographic export preview"
                className="h-auto max-h-[540px] w-full max-w-[900px] object-contain"
              />
              <span className="absolute left-3 top-3 rounded-md border border-slate-300 bg-white/95 px-2 py-1 text-[10px] font-black text-slate-700 shadow-sm">
                SYNTHETIC PREVIEW
              </span>
              <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/85 px-2 py-1 text-[10px] font-bold text-white">
                {bounds.west.toFixed(4)}, {bounds.south.toFixed(4)} · {bounds.east.toFixed(4)}, {bounds.north.toFixed(4)}
              </span>
            </div>

            <div className="bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4 text-cyan-300" />
                <h2 className="text-xs font-black uppercase">Export gate</h2>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
                <div>
                  <dt className="text-[9px] font-bold uppercase text-slate-500">Area</dt>
                  <dd className="mt-0.5 text-sm font-black">{plan.areaKm2.toFixed(2)} km²</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase text-slate-500">Format</dt>
                  <dd className="mt-0.5 text-sm font-black">{formatDefinition.label}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase text-slate-500">CRS</dt>
                  <dd className="mt-0.5 text-sm font-black">{crs}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase text-slate-500">Sources</dt>
                  <dd className="mt-0.5 text-sm font-black">{plan.selectedSources.length}</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-white/10 pt-4">
                <h3 className="text-[9px] font-black uppercase text-slate-400">Checks</h3>
                <div className="mt-2 space-y-2">
                  {plan.issues.length === 0 && (
                    <p className="flex items-center gap-2 text-[10px] font-bold text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                      All gates passed
                    </p>
                  )}
                  {plan.issues.map(issue => (
                    <p
                      key={`${issue.code}-${issue.layerId ?? ''}-${issue.sourceId ?? ''}`}
                      className={cn(
                        'flex gap-2 text-[10px] font-semibold leading-relaxed',
                        issue.severity === 'error' ? 'text-amber-300' : 'text-slate-300',
                      )}
                    >
                      {issue.severity === 'error'
                        ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                      {issue.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid bg-white md:grid-cols-2">
            <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r">
              <h2 className="text-xs font-black uppercase text-slate-700">Source record</h2>
              <dl className="mt-3 grid grid-cols-[100px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[10px]">
                <dt className="font-bold text-slate-400">Publisher</dt>
                <dd className="font-bold text-slate-800">{AGID_SYNTHETIC_TOPO_SOURCE.publisher}</dd>
                <dt className="font-bold text-slate-400">Product</dt>
                <dd className="font-bold text-slate-800">{AGID_SYNTHETIC_TOPO_SOURCE.product}</dd>
                <dt className="font-bold text-slate-400">Version</dt>
                <dd className="break-all font-mono text-slate-700">{AGID_SYNTHETIC_TOPO_SOURCE.version}</dd>
                <dt className="font-bold text-slate-400">License</dt>
                <dd className="font-bold text-slate-800">{AGID_SYNTHETIC_TOPO_SOURCE.licenseId}</dd>
                <dt className="font-bold text-slate-400">Correction</dt>
                <dd className="truncate">
                  <a className="font-bold text-blue-700 hover:underline" href={AGID_SYNTHETIC_TOPO_SOURCE.correctionUrl}>Issue tracker</a>
                </dd>
              </dl>
            </div>
            <div className="p-5">
              <h2 className="text-xs font-black uppercase text-slate-700">Safety boundary</h2>
              <ul className="mt-3 space-y-2">
                {plan.nonClaims.map(item => (
                  <li key={item} className="flex gap-2 text-[10px] font-semibold leading-relaxed text-slate-600">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TopographicExportStudioScreen;
