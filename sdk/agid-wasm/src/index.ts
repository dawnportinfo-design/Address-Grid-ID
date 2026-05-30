export type AgidWasmExports = {
  agid_get_quantized_face(lat: number, lon: number): number;
  agid_get_quantized_qx(lat: number, lon: number): number;
  agid_get_quantized_qy(lat: number, lon: number): number;
  agid_get_lat(face: number, qx: number, qy: number): number;
  agid_get_lon(face: number, qx: number, qy: number): number;
};

export async function loadAgidWasm(wasmUrl: string | URL): Promise<AgidWasmExports> {
  const response = await fetch(wasmUrl);
  const bytes = await response.arrayBuffer();
  const instance = await WebAssembly.instantiate(bytes, {});
  return instance.instance.exports as unknown as AgidWasmExports;
}
