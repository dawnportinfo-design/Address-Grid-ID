import { getMercatorGridPolygons } from './mercatorGrid';

const K = 2097152;
const M = 2097151;

function normalizeLongitude(lon: number): number {
  let value = lon;
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371008.8;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;
  const sinHalfLat = Math.sin(deltaPhi / 2);
  const sinHalfLon = Math.sin(deltaLambda / 2);
  const a = sinHalfLat * sinHalfLat + Math.cos(phi1) * Math.cos(phi2) * sinHalfLon * sinHalfLon;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

function buildSquarePolygonFromCorners(corners: { lat: number; lon: number }[], scale: number = 1): [number, number][] {
  if (corners.length !== 4) {
    return corners.map(c => [c.lon, c.lat]) as [number, number][];
  }

  const refLon = corners[0].lon;
  const unwrappedCorners = corners.map((corner) => {
    let lon = corner.lon;
    if (lon - refLon > 180) lon -= 360;
    else if (lon - refLon < -180) lon += 360;
    return { lat: corner.lat, lon };
  });

  const centerLat = unwrappedCorners.reduce((sum, corner) => sum + corner.lat, 0) / unwrappedCorners.length;
  const centerLon = unwrappedCorners.reduce((sum, corner) => sum + corner.lon, 0) / unwrappedCorners.length;

  const topWidth = haversineMeters(unwrappedCorners[0].lat, unwrappedCorners[0].lon, unwrappedCorners[1].lat, unwrappedCorners[1].lon);
  const bottomWidth = haversineMeters(unwrappedCorners[3].lat, unwrappedCorners[3].lon, unwrappedCorners[2].lat, unwrappedCorners[2].lon);
  const leftHeight = haversineMeters(unwrappedCorners[0].lat, unwrappedCorners[0].lon, unwrappedCorners[3].lat, unwrappedCorners[3].lon);
  const rightHeight = haversineMeters(unwrappedCorners[1].lat, unwrappedCorners[1].lon, unwrappedCorners[2].lat, unwrappedCorners[2].lon);

  const sideMeters = Math.max((topWidth + bottomWidth) / 2, (leftHeight + rightHeight) / 2);
  const halfSideMeters = sideMeters / 2;

  const latDelta = (halfSideMeters / 111320) * scale;
  const cosLat = Math.max(0.0001, Math.cos(centerLat * Math.PI / 180));
  const lonDelta = (halfSideMeters / (111320 * cosLat)) * scale;

  return [
    [normalizeLongitude(centerLon - lonDelta), centerLat - latDelta],
    [normalizeLongitude(centerLon + lonDelta), centerLat - latDelta],
    [normalizeLongitude(centerLon + lonDelta), centerLat + latDelta],
    [normalizeLongitude(centerLon - lonDelta), centerLat + latDelta],
    [normalizeLongitude(centerLon - lonDelta), centerLat - latDelta]
  ];
}

function getGridStepForZoom(zoom: number): number {
  const zoomLevel = Math.max(0, Math.min(17, Math.floor(zoom)));
  const exponent = Math.max(0, 17 - zoomLevel);
  return Math.pow(2, exponent);
}

self.onmessage = (e: MessageEvent) => {
  const { lat, lon, zoom, bounds } = e.data;
  
  const features = getGridFeaturesWorker(zoom, bounds, lat, lon);
  self.postMessage(features);
};

function getGridFeaturesWorker(zoom: number, bounds: any, lat: number, lon: number) {
  if (!bounds) return { gridLines: [], gridCells: [] };
  const finalStep = getGridStepForZoom(zoom);
  const gridCells: any[] = [];
  const gridPolygons = getMercatorGridPolygons(bounds, finalStep);

  gridPolygons.forEach((poly, index) => {
    gridCells.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [poly] },
      properties: { id: `cell_${finalStep}_${index}`, step: finalStep, isFocus: finalStep === 1 }
    });
  });

  if (gridCells.length === 0) {
    return { gridLines: [], gridCells: [] };
  }

  return { gridLines: [], gridCells };
}

// Re-implementing projection logic inside worker for speed and independence
(self as any).getQuantizedInternal = function(lat: number, lon: number) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  const x = Math.cos(phi) * Math.cos(theta);
  const y = Math.cos(phi) * Math.sin(theta);
  const z = Math.sin(phi);
  const absX = Math.abs(x), absY = Math.abs(y), absZ = Math.abs(z);
  let face = 0, uc = 0, vc = 0;
  if (absX >= absY && absX >= absZ) {
    if (x > 0) { face = 0; uc = y; vc = z; } else { face = 1; uc = -y; vc = z; }
  } else if (absY >= absX && absY >= absZ) {
    if (y > 0) { face = 2; uc = -x; vc = z; } else { face = 3; uc = x; vc = z; }
  } else {
    if (z > 0) { face = 4; uc = -x; vc = -y; } else { face = 5; uc = -x; vc = y; }
  }
  const maxVal = Math.max(absX, absY, absZ);
  const xi = uc / maxVal;
  const eta = vc / maxVal;
  
  // Tangent Inverse Map (Equal-Area)
  const u = 0.5 * (Math.atan(xi) * 4 / Math.PI + 1.0);
  const v = 0.5 * (Math.atan(eta) * 4 / Math.PI + 1.0);
  
  return { face, qx: Math.floor(u * 2097152), qy: Math.floor(v * 2097152) };
};

(self as any).getFromQuantizedInternal = function(face: number, qx: number, qy: number) {
  const u = (qx / 2097152) * 2.0 - 1.0;
  const v = (qy / 2097152) * 2.0 - 1.0;
  
  // Tangent Map (Equal-Area)
  const xi = Math.tan(u * Math.PI / 4);
  const eta = Math.tan(v * Math.PI / 4);
  
  let x = 0, y = 0, z = 0;
  switch (face) {
    case 0: x = 1; y = xi; z = eta; break;
    case 1: x = -1; y = -xi; z = eta; break;
    case 2: x = -xi; y = 1; z = eta; break;
    case 3: x = xi; y = -1; z = eta; break;
    case 4: x = -xi; y = -eta; z = 1; break;
    case 5: x = -xi; y = eta; z = -1; break;
  }
  const length = Math.sqrt(x * x + y * y + z * z);
  x /= length; y /= length; z /= length;
  return {
    lat: (Math.asin(z) * 180) / Math.PI,
    lon: (Math.atan2(y, x) * 180) / Math.PI
  };
};
