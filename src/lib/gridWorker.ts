import { getGridRenderRange } from './gridDisplay';
import { buildRegularMetricGridFeatures } from './gridWorkerWasm';

type AgidGridWasmExports = {
  memory: WebAssembly.Memory;
  agid_generate_grid_cells(lat: number, lon: number, zoom: number, rangeCells: number): number;
  agid_grid_buffer_ptr(): number;
  agid_grid_buffer_len(): number;
  agid_grid_face(): number;
  agid_grid_start_qx(): number;
  agid_grid_start_qy(): number;
  agid_grid_step(): number;
};

let wasmExports: AgidGridWasmExports | null = null;
let wasmLoadStarted = false;

function hasGridWasmExports(exportsObj: WebAssembly.Exports): exportsObj is WebAssembly.Exports & AgidGridWasmExports {
  return !!(
    exportsObj.memory instanceof WebAssembly.Memory &&
    typeof exportsObj.agid_generate_grid_cells === 'function' &&
    typeof exportsObj.agid_grid_buffer_ptr === 'function' &&
    typeof exportsObj.agid_grid_buffer_len === 'function' &&
    typeof exportsObj.agid_grid_face === 'function' &&
    typeof exportsObj.agid_grid_start_qx === 'function' &&
    typeof exportsObj.agid_grid_start_qy === 'function' &&
    typeof exportsObj.agid_grid_step === 'function'
  );
}

async function loadGridWasm() {
  if (wasmExports || wasmLoadStarted || typeof WebAssembly === 'undefined') return;
  wasmLoadStarted = true;

  try {
    const response = await fetch('/wasm/agid_core.wasm', { cache: 'force-cache' });
    if (!response.ok) return;
    const bytes = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {});
    if (hasGridWasmExports(instance.exports)) {
      wasmExports = instance.exports;
    }
  } catch {
    wasmExports = null;
  }
}

void loadGridWasm();

self.onmessage = async (e: MessageEvent) => {
  const { lat, lon, zoom, bounds, requestId } = e.data;

  if (!wasmExports && !wasmLoadStarted) {
    await loadGridWasm();
  }

  const features = wasmExports
    ? getGridFeaturesFromWasm(zoom, bounds, lat, lon)
    : getGridFeaturesWorker(zoom, bounds, lat, lon);
  self.postMessage({ ...features, requestId });
};

function getGridFeaturesFromWasm(zoom: number, bounds: any, lat: number, lon: number) {
  if (!bounds || !wasmExports) return { gridLines: [], gridCells: [] };

  const range = getGridRenderRange(zoom);
  return buildRegularMetricGridFeatures({
    lat,
    lon,
    zoom,
    columns: range,
    rows: range,
    bounds,
    paddingCells: 8,
  });
}

function getGridFeaturesWorker(zoom: number, bounds: any, lat: number, lon: number) {
  if (!bounds) return { gridLines: [], gridCells: [] };
  const range = getGridRenderRange(zoom);
  return buildRegularMetricGridFeatures({
    lat,
    lon,
    zoom,
    columns: range,
    rows: range,
    bounds,
    paddingCells: 8,
  });
}
