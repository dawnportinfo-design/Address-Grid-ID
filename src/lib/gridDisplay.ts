export const EARTH_METERS_PER_DEGREE = 111_320;
export const AGID_BASE_CELL_METERS = 4.4;
export const W3W_STYLE_GRID_FADE_START_ZOOM = 17.25;
export const W3W_STYLE_GRID_FULL_ZOOM = 18.25;
export const W3W_STYLE_GRID_MIN_ZOOM = W3W_STYLE_GRID_FADE_START_ZOOM;
export const W3W_STYLE_GRID_OPACITY_FLOOR = 3;
export const WEB_MERCATOR_RADIUS_METERS = EARTH_METERS_PER_DEGREE * 180 / Math.PI;
export const MAX_WEB_MERCATOR_LAT = 85.05112878;

export type GridVisibilityState = {
  zoom: number;
  isGridVisible: boolean;
  gridOpacityLevel: number;
};

export type GridFeatureResult = {
  gridLines: number[][][];
  gridCells: any[];
};

export function normalizeLongitude(lon: number) {
  let normalized = lon;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

export function clampWebMercatorLatitude(lat: number) {
  return Math.max(-MAX_WEB_MERCATOR_LAT, Math.min(MAX_WEB_MERCATOR_LAT, lat));
}

export function longitudeToAbsoluteGridX(lon: number) {
  return WEB_MERCATOR_RADIUS_METERS * lon * Math.PI / 180;
}

export function latitudeToAbsoluteGridY(lat: number) {
  const clampedLat = clampWebMercatorLatitude(lat);
  const latRad = clampedLat * Math.PI / 180;
  return WEB_MERCATOR_RADIUS_METERS * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

export function lonLatToAbsoluteGridMeters(lat: number, lon: number) {
  return {
    x: longitudeToAbsoluteGridX(normalizeLongitude(lon)),
    y: latitudeToAbsoluteGridY(lat),
  };
}

export function absoluteGridMetersToLonLat(x: number, y: number): number[] {
  const lon = normalizeLongitude((x / WEB_MERCATOR_RADIUS_METERS) * 180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(y / WEB_MERCATOR_RADIUS_METERS)) - Math.PI / 2) * 180 / Math.PI;
  return [lon, lat];
}

export function getDisplayGridStep(zoom: number): number {
  const idealStep = Math.pow(2, Math.max(0, Math.floor(18.5 - zoom)));
  let step = 1;
  while (step * 2 <= idealStep && step < 131072) step *= 2;
  return step;
}

export function getDisplayCellSizeMeters(zoom: number) {
  return AGID_BASE_CELL_METERS * getDisplayGridStep(zoom);
}

export function getCloseDistanceGridFade(zoom: number) {
  if (zoom <= W3W_STYLE_GRID_FADE_START_ZOOM) return 0;
  if (zoom >= W3W_STYLE_GRID_FULL_ZOOM) return 1;
  return (zoom - W3W_STYLE_GRID_FADE_START_ZOOM) / (W3W_STYLE_GRID_FULL_ZOOM - W3W_STYLE_GRID_FADE_START_ZOOM);
}

export function shouldShowDisplayGrid({ zoom, isGridVisible, gridOpacityLevel }: GridVisibilityState) {
  void isGridVisible;
  void gridOpacityLevel;
  return getCloseDistanceGridFade(zoom) > 0;
}

export function getEffectiveGridOpacityLevel(state: GridVisibilityState) {
  if (!shouldShowDisplayGrid(state)) return 0;
  const requestedOpacity = state.isGridVisible ? state.gridOpacityLevel : 0;
  return Math.max(requestedOpacity, W3W_STYLE_GRID_OPACITY_FLOOR);
}

export type RegularMetricGridMetrics = {
  step: number;
  cellMeters: number;
  latStep: number;
  lonStep: number;
};

export function getRegularMetricGridMetrics(zoom: number, anchorLat: number): RegularMetricGridMetrics {
  const step = getDisplayGridStep(zoom);
  const cellMeters = AGID_BASE_CELL_METERS * step;
  const latStep = cellMeters / EARTH_METERS_PER_DEGREE;
  const lonStep = latStep;

  return { step, cellMeters, latStep, lonStep };
}

export function regularMetricPointAt(col: number, row: number, metrics: RegularMetricGridMetrics): number[] {
  return absoluteGridMetersToLonLat(col * metrics.cellMeters, row * metrics.cellMeters);
}

export function regularMetricCellFromPoint(
  lat: number,
  lon: number,
  zoom: number,
  anchorLat = lat,
): number[][] {
  const metrics = getRegularMetricGridMetrics(zoom, anchorLat);
  const point = lonLatToAbsoluteGridMeters(lat, lon);
  const col = Math.floor(point.x / metrics.cellMeters);
  const row = Math.floor(point.y / metrics.cellMeters);
  const sw = regularMetricPointAt(col, row, metrics);
  const se = regularMetricPointAt(col + 1, row, metrics);
  const ne = regularMetricPointAt(col + 1, row + 1, metrics);
  const nw = regularMetricPointAt(col, row + 1, metrics);

  return [sw, se, ne, nw, sw];
}

export function getGridRenderRange(zoom: number) {
  if (zoom > 18) return 100;
  if (zoom > 15) return 70;
  return 40;
}

export function metricSquareCellFromCenter(lat: number, lon: number, sizeMeters: number): number[][] {
  const halfLat = (sizeMeters / 2) / EARTH_METERS_PER_DEGREE;
  const cosLat = Math.max(0.05, Math.cos(lat * Math.PI / 180));
  const halfLon = (sizeMeters / 2) / (EARTH_METERS_PER_DEGREE * cosLat);

  return [
    [normalizeLongitude(lon - halfLon), lat - halfLat],
    [normalizeLongitude(lon + halfLon), lat - halfLat],
    [normalizeLongitude(lon + halfLon), lat + halfLat],
    [normalizeLongitude(lon - halfLon), lat + halfLat],
    [normalizeLongitude(lon - halfLon), lat - halfLat],
  ];
}

export function toUndirectedSegmentKey(a: number[], b: number[], precision = 10) {
  const forward = `${a[0].toFixed(precision)}_${a[1].toFixed(precision)}_${b[0].toFixed(precision)}_${b[1].toFixed(precision)}`;
  const reverse = `${b[0].toFixed(precision)}_${b[1].toFixed(precision)}_${a[0].toFixed(precision)}_${a[1].toFixed(precision)}`;
  return forward < reverse ? forward : reverse;
}
