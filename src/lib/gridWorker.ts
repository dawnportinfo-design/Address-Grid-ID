import { getR16GridFeatures } from './agidR16';

self.onmessage = (e: MessageEvent) => {
  const { lat, lon, zoom } = e.data;
  const step = 1;
  const range = zoom >= 19 ? 64 : zoom >= 17 ? 96 : zoom >= 16 ? 72 : 48;
  self.postMessage(getR16GridFeatures(lat, lon, range, step));
};
