const EARTH_RADIUS_METERS = 6378137;
const MAX_MERCATOR_LAT = 85.05112878;

export type LonLat = [number, number];

export interface MercatorCellBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  polygon: LonLat[];
}

export function clampMercatorLatitude(lat: number): number {
  return Math.max(-MAX_MERCATOR_LAT, Math.min(MAX_MERCATOR_LAT, lat));
}

export function lonLatToMercator(lon: number, lat: number): { x: number; y: number } {
  const clampedLat = clampMercatorLatitude(lat);
  return {
    x: EARTH_RADIUS_METERS * lon * Math.PI / 180,
    y: EARTH_RADIUS_METERS * Math.log(Math.tan(Math.PI / 4 + clampedLat * Math.PI / 360))
  };
}

export function mercatorToLonLat(x: number, y: number): LonLat {
  return [
    (x / EARTH_RADIUS_METERS) * 180 / Math.PI,
    (Math.atan(Math.exp(y / EARTH_RADIUS_METERS)) * 360 / Math.PI) - 90
  ];
}

export function getMercatorCellBounds(lon: number, lat: number, cellSizeMeters: number): MercatorCellBounds {
  const { x, y } = lonLatToMercator(lon, lat);
  const minX = Math.floor(x / cellSizeMeters) * cellSizeMeters;
  const minY = Math.floor(y / cellSizeMeters) * cellSizeMeters;
  const maxX = minX + cellSizeMeters;
  const maxY = minY + cellSizeMeters;

  const sw = mercatorToLonLat(minX, minY);
  const se = mercatorToLonLat(maxX, minY);
  const ne = mercatorToLonLat(maxX, maxY);
  const nw = mercatorToLonLat(minX, maxY);

  return {
    minLon: sw[0],
    minLat: sw[1],
    maxLon: ne[0],
    maxLat: ne[1],
    polygon: [sw, se, ne, nw, sw]
  };
}

export function getMercatorGridPolygons(bounds: [[number, number], [number, number]], cellSizeMeters: number): LonLat[][] {
  const [[southWestLon, southWestLat], [northEastLon, northEastLat]] = bounds;
  const sw = lonLatToMercator(southWestLon, southWestLat);
  const ne = lonLatToMercator(northEastLon, northEastLat);

  const minX = Math.floor(Math.min(sw.x, ne.x) / cellSizeMeters) * cellSizeMeters;
  const maxX = Math.ceil(Math.max(sw.x, ne.x) / cellSizeMeters) * cellSizeMeters;
  const minY = Math.floor(Math.min(sw.y, ne.y) / cellSizeMeters) * cellSizeMeters;
  const maxY = Math.ceil(Math.max(sw.y, ne.y) / cellSizeMeters) * cellSizeMeters;

  const cells: LonLat[][] = [];

  for (let y = minY; y < maxY; y += cellSizeMeters) {
    for (let x = minX; x < maxX; x += cellSizeMeters) {
      const swCell = mercatorToLonLat(x, y);
      const seCell = mercatorToLonLat(x + cellSizeMeters, y);
      const neCell = mercatorToLonLat(x + cellSizeMeters, y + cellSizeMeters);
      const nwCell = mercatorToLonLat(x, y + cellSizeMeters);
      cells.push([swCell, seCell, neCell, nwCell, swCell]);
    }
  }

  return cells;
}