const DOMAIN_COUNT = 16;
const BX = 23;
const BY = 22;
const KX = 2 ** BX;
const KY = 2 ** BY;
const MX = KX - 1;
const MY = KY - 1;
const POSITION_MASK = (1n << 45n) - 1n;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export type Vec3 = [number, number, number];

export interface R16Cell {
  domain: number;
  qx: number;
  qy: number;
  morton: bigint;
  payload: bigint;
  center: { lat: number; lon: number };
  polygon: number[][];
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

interface DomainFrame {
  axis: Vec3;
  east: Vec3;
  north: Vec3;
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function buildDomainFrames(): DomainFrame[] {
  return Array.from({ length: DOMAIN_COUNT }, (_, k) => {
    const z = (k + 0.5) / DOMAIN_COUNT;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = k * GOLDEN_ANGLE;
    const axis = normalize([r * Math.cos(theta), r * Math.sin(theta), z]);
    const reference: Vec3 = Math.abs(axis[2]) > 0.92 ? [0, 1, 0] : [0, 0, 1];
    const east = normalize(cross(reference, axis));
    const north = normalize(cross(axis, east));
    return { axis, east, north };
  });
}

const FRAMES = buildDomainFrames();

export function latLonToVec(latDeg: number, lonDeg: number): Vec3 {
  const phi = latDeg * RAD;
  const lambda = lonDeg * RAD;
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.cos(phi) * Math.sin(lambda),
    Math.sin(phi)
  ];
}

function vecToLatLon(v: Vec3) {
  const n = normalize(v);
  return {
    lat: Math.asin(n[2]) * DEG,
    lon: Math.atan2(n[1], n[0]) * DEG
  };
}

export function selectR16Domain(v: Vec3) {
  let best = 0;
  let bestScore = Math.abs(dot(v, FRAMES[0].axis));
  for (let k = 1; k < FRAMES.length; k++) {
    const score = Math.abs(dot(v, FRAMES[k].axis));
    if (score < bestScore) {
      best = k;
      bestScore = score;
    }
  }
  return best;
}

function toDomainVec(v: Vec3, domain: number): Vec3 {
  const frame = FRAMES[domain];
  return [dot(v, frame.east), dot(v, frame.north), dot(v, frame.axis)];
}

function fromDomainVec(v: Vec3, domain: number): Vec3 {
  const frame = FRAMES[domain];
  return normalize([
    frame.east[0] * v[0] + frame.north[0] * v[1] + frame.axis[0] * v[2],
    frame.east[1] * v[0] + frame.north[1] * v[1] + frame.axis[1] * v[2],
    frame.east[2] * v[0] + frame.north[2] * v[1] + frame.axis[2] * v[2]
  ]);
}

function domainVecToCoord(v: Vec3) {
  const n = normalize(v);
  return {
    phi: Math.asin(Math.max(-1, Math.min(1, n[2]))),
    lambda: Math.atan2(n[1], n[0])
  };
}

function coordToDomainVec(phi: number, lambda: number): Vec3 {
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.cos(phi) * Math.sin(lambda),
    Math.sin(phi)
  ];
}

function quantize(phi: number, lambda: number) {
  const qx = Math.min(MX, Math.max(0, Math.floor(((lambda + Math.PI) / (2 * Math.PI)) * KX)));
  const qy = Math.min(MY, Math.max(0, Math.floor(((phi + Math.PI / 2) / Math.PI) * KY)));
  return { qx, qy };
}

export function morton45(qx: number, qy: number) {
  let z = 0n;
  for (let i = 0; i < 22; i++) {
    z |= BigInt((qx >> i) & 1) << BigInt(2 * i);
    z |= BigInt((qy >> i) & 1) << BigInt(2 * i + 1);
  }
  z |= BigInt((qx >> 22) & 1) << 44n;
  return z;
}

export function unmorton45(z: bigint) {
  let qx = 0;
  let qy = 0;
  for (let i = 0; i < 22; i++) {
    qx |= Number((z >> BigInt(2 * i)) & 1n) << i;
    qy |= Number((z >> BigInt(2 * i + 1)) & 1n) << i;
  }
  qx |= Number((z >> 44n) & 1n) << 22;
  return { qx, qy };
}

function payload(domain: number, morton: bigint) {
  return (BigInt(domain) << 45n) | morton;
}

function cellCoord(qx: number, qy: number, cornerX: 0 | 0.5 | 1, cornerY: 0 | 0.5 | 1) {
  return {
    lambda: ((qx + cornerX) / KX) * 2 * Math.PI - Math.PI,
    phi: ((qy + cornerY) / KY) * Math.PI - Math.PI / 2
  };
}

function worldPoint(domain: number, qx: number, qy: number, x: 0 | 0.5 | 1, y: 0 | 0.5 | 1) {
  const { phi, lambda } = cellCoord(qx, qy, x, y);
  return vecToLatLon(fromDomainVec(coordToDomainVec(phi, lambda), domain));
}

function unwrapLine(points: number[][]) {
  if (points.length < 2) return points;
  const unwrapped = [points[0]];
  let previousLon = points[0][0];

  for (const point of points.slice(1)) {
    let lon = point[0];
    while (lon - previousLon > 180) lon -= 360;
    while (lon - previousLon < -180) lon += 360;
    unwrapped.push([lon, point[1]]);
    previousLon = lon;
  }

  return unwrapped;
}

function domainGridPoint(domain: number, qx: number, qy: number) {
  const point = worldPoint(domain, qx, qy, 0, 0);
  return [point.lon, point.lat];
}

function verticalBoundary(domain: number, qx: number, qyMin: number, qyMax: number, sampleStep: number) {
  const line: number[][] = [];
  for (let qy = qyMin; qy <= qyMax; qy += sampleStep) {
    line.push(domainGridPoint(domain, qx, qy));
  }
  if (line[line.length - 1]?.[1] !== domainGridPoint(domain, qx, qyMax)[1]) {
    line.push(domainGridPoint(domain, qx, qyMax));
  }
  return unwrapLine(line);
}

function horizontalBoundary(domain: number, qy: number, qxMin: number, qxMax: number, sampleStep: number) {
  const line: number[][] = [];
  for (let qx = qxMin; qx <= qxMax; qx += sampleStep) {
    line.push(domainGridPoint(domain, qx, qy));
  }
  if (line[line.length - 1]?.[0] !== domainGridPoint(domain, qxMax, qy)[0]) {
    line.push(domainGridPoint(domain, qxMax, qy));
  }
  return unwrapLine(line);
}

export function getR16CellPolygon(domain: number, qx: number, qy: number, step = 1) {
  const corners = [
    worldPoint(domain, qx, qy, 0, 0),
    worldPoint(domain, qx + step, qy, 0, 0),
    worldPoint(domain, qx + step, qy + step, 0, 0),
    worldPoint(domain, qx, qy + step, 0, 0)
  ];
  const refLon = corners[0].lon;
  const polygon = corners.map((p) => {
    let lon = p.lon;
    if (lon - refLon > 180) lon -= 360;
    if (lon - refLon < -180) lon += 360;
    return [lon, p.lat];
  });
  return [...polygon, polygon[0]];
}

function boundsFromPolygon(polygon: number[][]) {
  const points = polygon.slice(0, -1);
  return {
    minLat: Math.min(...points.map((p) => p[1])),
    maxLat: Math.max(...points.map((p) => p[1])),
    minLon: Math.min(...points.map((p) => p[0])),
    maxLon: Math.max(...points.map((p) => p[0]))
  };
}

export function encodeR16Cell(lat: number, lon: number): R16Cell {
  const v = latLonToVec(lat, lon);
  const domain = selectR16Domain(v);
  const { phi, lambda } = domainVecToCoord(toDomainVec(v, domain));
  const { qx, qy } = quantize(phi, lambda);
  const morton = morton45(qx, qy);
  const polygon = getR16CellPolygon(domain, qx, qy);
  return {
    domain,
    qx,
    qy,
    morton,
    payload: payload(domain, morton),
    center: worldPoint(domain, qx, qy, 0.5, 0.5),
    polygon,
    bounds: boundsFromPolygon(polygon)
  };
}

export function decodeR16Payload(value: bigint): R16Cell | null {
  const reserved = value >> 49n;
  if (reserved !== 0n) return null;
  const domain = Number((value >> 45n) & 15n);
  if (domain < 0 || domain >= DOMAIN_COUNT) return null;
  const { qx, qy } = unmorton45(value & POSITION_MASK);
  const morton = morton45(qx, qy);
  const polygon = getR16CellPolygon(domain, qx, qy);
  return {
    domain,
    qx,
    qy,
    morton,
    payload: payload(domain, morton),
    center: worldPoint(domain, qx, qy, 0.5, 0.5),
    polygon,
    bounds: boundsFromPolygon(polygon)
  };
}

export function getR16GridFeatures(lat: number, lon: number, range: number, step = 64) {
  const center = encodeR16Cell(lat, lon);
  const gridLines: number[][][] = [];
  const gridCells: any[] = [];
  const cellStep = Math.max(1, Math.floor(step));
  const baseQx = Math.floor(center.qx / cellStep) * cellStep;
  const baseQy = Math.floor(center.qy / cellStep) * cellStep;
  const qxMin = Math.max(0, baseQx - range * cellStep);
  const qxMax = Math.min(MX, baseQx + (range + 1) * cellStep);
  const qyMin = Math.max(0, baseQy - range * cellStep);
  const qyMax = Math.min(MY, baseQy + (range + 1) * cellStep);
  const sampleStep = Math.max(1, Math.floor((Math.max(qxMax - qxMin, qyMax - qyMin) || 1) / 24));

  // Draw each domain boundary only once. Rendering every cell's four sides
  // stacks shared edges and creates the "rail track" effect the grid must avoid.
  for (let qx = qxMin; qx <= qxMax; qx += cellStep) {
    gridLines.push(verticalBoundary(center.domain, qx, qyMin, qyMax, sampleStep));
  }

  for (let qy = qyMin; qy <= qyMax; qy += cellStep) {
    gridLines.push(horizontalBoundary(center.domain, qy, qxMin, qxMax, sampleStep));
  }

  return { gridLines, gridCells };
}
