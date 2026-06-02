import { spawnSync } from 'node:child_process';
import { existsSync,mkdirSync,readFileSync,unlinkSync,writeFileSync } from 'node:fs';
import { join,relative } from 'node:path';

import { AFRICA_OPEN_GEO_SOURCES } from '../src/data/africaOpenGeoSources';
import { AMERICAS_OPEN_GEO_SOURCES } from '../src/data/americasOpenGeoSources';
import { ASIA_OPEN_GEO_SOURCES } from '../src/data/asiaOpenGeoSources';
import { EUROPE_OPEN_GEO_SOURCES } from '../src/data/europeOpenGeoSources';
import { OCEANIA_OPEN_GEO_SOURCES } from '../src/data/oceaniaOpenGeoSources';
import { POLAR_OPEN_GEO_SOURCES } from '../src/data/polarOpenGeoSources';

type BoundsRecord = {
  code?: string;
  id?: string;
  name?: string;
  n: number;
  s: number;
  w: number;
  e: number;
  polygon?: number[][];
  polygons?: number[][][];
};

type SourceRecord = {
  id: string;
  name: string;
  url: string;
  kind: string;
  coverage: string;
  usage: string;
};

type GisIssue = {
  severity: 'error' | 'warning';
  dataset: string;
  id: string;
  issue: string;
  detail: string;
};

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const changedOnly = args.has('--changed');
const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'test-results', 'gis-validation');
const REPORT_PATH = join(OUT_DIR, 'gis-validation-report.json');
const GEOJSON_PATH = join(OUT_DIR, 'agid-boundary-validation.geojson');
const GDAL_NORMALIZED_PATH = join(OUT_DIR, 'agid-boundary-validation.gdal.geojson');
const QGIS_PROJECT_PATH = join(OUT_DIR, 'AGID-gis-validation.qgs');

const DATASET_INPUTS = [
  { name: 'countries', path: join(ROOT, 'src', 'data', 'countries.json') },
  { name: 'disputed_territories', path: join(ROOT, 'src', 'data', 'disputed_territories.json') },
  { name: 'seas', path: join(ROOT, 'src', 'data', 'seas.json') },
  { name: 'asia_regions', path: join(ROOT, 'src', 'data', 'asia_regions.json') },
  { name: 'europe_regions', path: join(ROOT, 'src', 'data', 'europe_regions.json') },
  { name: 'africa_regions', path: join(ROOT, 'src', 'data', 'africa_regions.json') },
  { name: 'americas_regions', path: join(ROOT, 'src', 'data', 'americas_regions.json') },
  { name: 'oceania_regions', path: join(ROOT, 'src', 'data', 'oceania_regions.json') },
  { name: 'caribbean_regions', path: join(ROOT, 'src', 'data', 'caribbean_regions.json') },
  { name: 'south_america_regions', path: join(ROOT, 'src', 'data', 'south_america_regions.json') },
];

const DATASETS = DATASET_INPUTS.filter(dataset => existsSync(dataset.path));
const OPEN_SOURCE_REGISTRY_FILES = [
  join(ROOT, 'src', 'data', 'africaOpenGeoSources.ts'),
  join(ROOT, 'src', 'data', 'americasOpenGeoSources.ts'),
  join(ROOT, 'src', 'data', 'asiaOpenGeoSources.ts'),
  join(ROOT, 'src', 'data', 'europeOpenGeoSources.ts'),
  join(ROOT, 'src', 'data', 'oceaniaOpenGeoSources.ts'),
  join(ROOT, 'src', 'data', 'polarOpenGeoSources.ts'),
];
const VALIDATOR_FILES = [
  join(ROOT, 'scripts', 'verify-gis-data.ts'),
  join(ROOT, 'scripts', 'verify-gis-data.test.ts'),
];

const SOURCE_REGISTRY: Record<string, SourceRecord> = {
  ...AFRICA_OPEN_GEO_SOURCES,
  ...AMERICAS_OPEN_GEO_SOURCES,
  ...ASIA_OPEN_GEO_SOURCES,
  ...EUROPE_OPEN_GEO_SOURCES,
  ...OCEANIA_OPEN_GEO_SOURCES,
  ...POLAR_OPEN_GEO_SOURCES,
};

function cleanId(record: BoundsRecord, fallback: string) {
  return String(record.code || record.id || record.name || fallback);
}

function validLat(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function validLon(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function crossesAntimeridian(w: number, e: number) {
  return w > e;
}

function lonInBounds(lon: number, w: number, e: number) {
  return crossesAntimeridian(w, e) ? lon >= w || lon <= e : lon >= w && lon <= e;
}

function pointInBounds(lat: number, lon: number, record: BoundsRecord) {
  return lat <= record.n && lat >= record.s && lonInBounds(lon, record.w, record.e);
}

function closeRing(ring: number[][]) {
  if (ring.length === 0) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

function normalizeRings(record: BoundsRecord) {
  if (record.polygons?.length) return record.polygons;
  if (record.polygon?.length) return [record.polygon];
  return [];
}

function toGeoJsonPolygon(ring: number[][]) {
  return closeRing(ring).map(([lat, lon]) => [lon, lat]);
}

function readRecords(path: string): BoundsRecord[] {
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

function normalizePathForGit(path: string) {
  return relative(ROOT, path).replaceAll('\\', '/');
}

function gitChangedFiles(args: string[]) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function listChangedFiles() {
  const tracked = gitChangedFiles(['diff', '--name-only', 'HEAD']);
  const untracked = gitChangedFiles(['ls-files', '--others', '--exclude-standard']);
  if (!tracked || !untracked) return null;
  return [...new Set([...tracked, ...untracked])];
}

function shouldSkipChangedValidation(changedFiles: string[] | null) {
  if (!changedFiles) return false;
  const relevantFiles = new Set([
    ...DATASET_INPUTS.map(dataset => normalizePathForGit(dataset.path)),
    ...OPEN_SOURCE_REGISTRY_FILES.map(normalizePathForGit),
    ...VALIDATOR_FILES.map(normalizePathForGit),
    'package.json',
  ]);
  return !changedFiles.some(file => relevantFiles.has(file.replaceAll('\\', '/')));
}

function collectGeometryIssues(dataset: string, records: BoundsRecord[]) {
  const issues: GisIssue[] = [];
  const seen = new Set<string>();

  records.forEach((record, index) => {
    const id = cleanId(record, `${dataset}-${index}`);
    if (seen.has(id)) {
      issues.push({ severity: 'warning', dataset, id, issue: 'duplicate-id', detail: 'Dataset contains duplicate code/id/name. This is allowed for split sea/territory records, but should be reviewed in QGIS.' });
    }
    seen.add(id);

    if (![record.n, record.s, record.w, record.e].every(Number.isFinite)) {
      issues.push({ severity: 'error', dataset, id, issue: 'invalid-bounds', detail: 'n/s/w/e must all be finite numbers.' });
      return;
    }
    if (!validLat(record.n) || !validLat(record.s) || !validLon(record.w) || !validLon(record.e)) {
      issues.push({ severity: 'error', dataset, id, issue: 'bounds-out-of-range', detail: `n=${record.n} s=${record.s} w=${record.w} e=${record.e}` });
    }
    if (record.n < record.s) {
      issues.push({ severity: 'error', dataset, id, issue: 'inverted-latitude-bounds', detail: `n=${record.n} is south of s=${record.s}.` });
    }

    const rings = normalizeRings(record);
    if (!rings.length) {
      issues.push({ severity: 'warning', dataset, id, issue: 'missing-polygon', detail: 'Record has bbox but no polygon/polygons geometry.' });
    }

    rings.forEach((ring, ringIndex) => {
      if (ring.length < 4) {
        issues.push({ severity: 'error', dataset, id, issue: 'polygon-too-short', detail: `Ring ${ringIndex} has ${ring.length} points.` });
      }

      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        issues.push({ severity: 'warning', dataset, id, issue: 'unclosed-ring', detail: `Ring ${ringIndex} is not explicitly closed. The validator closes it for QGIS export.` });
      }

      ring.forEach(([lat, lon], pointIndex) => {
        if (!validLat(lat) || !validLon(lon)) {
          issues.push({ severity: 'error', dataset, id, issue: 'coordinate-out-of-range', detail: `Ring ${ringIndex} point ${pointIndex}: lat=${lat} lon=${lon}` });
        } else if (!pointInBounds(lat, lon, record)) {
          issues.push({ severity: 'warning', dataset, id, issue: 'point-outside-bbox', detail: `Ring ${ringIndex} point ${pointIndex}: lat=${lat} lon=${lon}` });
        }
      });
    });
  });

  return issues;
}

function toFeatureCollection(datasets: Array<{ name: string; records: BoundsRecord[] }>) {
  const features = datasets.flatMap(({ name, records }) => records.flatMap((record, index) => {
    const rings = normalizeRings(record);
    if (!rings.length) return [];
    const id = cleanId(record, `${name}-${index}`);
    return [{
      type: 'Feature',
      properties: {
        dataset: name,
        id,
        name: record.name || id,
        north: record.n,
        south: record.s,
        west: record.w,
        east: record.e,
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: rings.map(ring => [toGeoJsonPolygon(ring)]),
      },
    }];
  }));

  return {
    type: 'FeatureCollection',
    name: 'AGID GIS validation boundaries',
    features,
  };
}

function commandExists(command: string) {
  const result = spawnSync(process.platform === 'win32' ? 'where' : 'command', process.platform === 'win32' ? [command] : ['-v', command], {
    encoding: 'utf8',
    shell: process.platform !== 'win32',
  });
  return result.status === 0;
}

function runGdalValidation(inputPath: string) {
  if (!commandExists('ogr2ogr')) {
    return {
      available: false,
      ok: false,
      command: null,
      stderr: 'ogr2ogr was not found on PATH.',
    };
  }

  if (existsSync(GDAL_NORMALIZED_PATH)) {
    unlinkSync(GDAL_NORMALIZED_PATH);
  }
  const args = ['-f', 'GeoJSON', GDAL_NORMALIZED_PATH, inputPath, '-overwrite'];
  const result = spawnSync('ogr2ogr', args, { encoding: 'utf8' });
  return {
    available: true,
    ok: result.status === 0,
    command: `ogr2ogr ${args.join(' ')}`,
    stderr: result.stderr.trim(),
  };
}

function collectSourceIssues() {
  const issues: GisIssue[] = [];
  const ids = new Set<string>();
  Object.values(SOURCE_REGISTRY).forEach(source => {
    if (ids.has(source.id)) {
      issues.push({ severity: 'error', dataset: 'open_geo_sources', id: source.id, issue: 'duplicate-source-id', detail: source.name });
    }
    ids.add(source.id);
    if (!/^https?:\/\//.test(source.url)) {
      issues.push({ severity: 'error', dataset: 'open_geo_sources', id: source.id, issue: 'invalid-source-url', detail: source.url });
    }
    if (/(utm_source=chatgpt|share\.google|nothing)/i.test(source.url)) {
      issues.push({ severity: 'warning', dataset: 'open_geo_sources', id: source.id, issue: 'low-quality-source-url', detail: source.url });
    }
    if (!source.kind || !source.coverage || !source.usage) {
      issues.push({ severity: 'warning', dataset: 'open_geo_sources', id: source.id, issue: 'incomplete-source-metadata', detail: source.name });
    }
  });
  return issues;
}

function xmlEscape(value: string) {
  return value.replace(/[<>&"']/g, char => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] || char));
}

function writeQgisProject(geojsonPath: string) {
  const relativeGeojson = relative(OUT_DIR, geojsonPath).replaceAll('\\', '/');
  const qgis = `<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.44" projectname="AGID GIS Validation">
  <title>AGID GIS Validation</title>
  <layer-tree-group name="AGID GIS Validation" checked="Qt::Checked">
    <layer-tree-layer name="AGID boundaries" checked="Qt::Checked" providerKey="ogr" source="${xmlEscape(relativeGeojson)}" id="agid_boundaries"/>
  </layer-tree-group>
  <projectlayers>
    <maplayer type="vector" geometry="Polygon" id="agid_boundaries" name="AGID boundaries">
      <datasource>${xmlEscape(relativeGeojson)}</datasource>
      <provider encoding="UTF-8">ogr</provider>
    </maplayer>
  </projectlayers>
</qgis>
`;
  writeFileSync(QGIS_PROJECT_PATH, qgis);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const changedFiles = changedOnly ? listChangedFiles() : null;
  if (changedOnly && shouldSkipChangedValidation(changedFiles)) {
    const report = {
      generatedAt: new Date().toISOString(),
      skipped: true,
      reason: 'No changed GIS boundary, source-registry, or validator files were found.',
      changedFiles,
      summary: {
        features: 0,
        issues: 0,
        errors: 0,
        warnings: 0,
      },
    };
    writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    console.log('[GIS] Changed-file fast path: skipped full GIS validation.');
    return;
  }

  const datasets = DATASETS.map(dataset => ({
    ...dataset,
    records: readRecords(dataset.path),
  }));
  const geometryIssues = datasets.flatMap(dataset => collectGeometryIssues(dataset.name, dataset.records));
  const sourceIssues = collectSourceIssues();
  const featureCollection = toFeatureCollection(datasets);

  writeFileSync(GEOJSON_PATH, `${JSON.stringify(featureCollection, null, 2)}\n`);
  writeQgisProject(GEOJSON_PATH);
  const gdal = runGdalValidation(GEOJSON_PATH);

  const issues = [...geometryIssues, ...sourceIssues];
  const errorCount = issues.filter(issue => issue.severity === 'error').length + (gdal.available && !gdal.ok ? 1 : 0);
  const warningCount = issues.filter(issue => issue.severity === 'warning').length + (!gdal.available ? 1 : 0);
  const report = {
    generatedAt: new Date().toISOString(),
    datasets: datasets.map(dataset => ({
      name: dataset.name,
      file: relative(ROOT, dataset.path).replaceAll('\\', '/'),
      records: dataset.records.length,
    })),
    generatedFiles: {
      geojson: relative(ROOT, GEOJSON_PATH).replaceAll('\\', '/'),
      qgisProject: relative(ROOT, QGIS_PROJECT_PATH).replaceAll('\\', '/'),
      gdalNormalizedGeojson: gdal.ok ? relative(ROOT, GDAL_NORMALIZED_PATH).replaceAll('\\', '/') : null,
    },
    openSourceRegistry: {
      registeredSources: Object.keys(SOURCE_REGISTRY).length,
    },
    gdal,
    summary: {
      features: featureCollection.features.length,
      issues: issues.length,
      errors: errorCount,
      warnings: warningCount,
    },
    issues,
  };

  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`[GIS] Features: ${report.summary.features}`);
  console.log(`[GIS] Issues: ${report.summary.issues} (${report.summary.errors} errors, ${report.summary.warnings} warnings)`);
  console.log(`[GIS] GeoJSON: ${report.generatedFiles.geojson}`);
  console.log(`[GIS] QGIS: ${report.generatedFiles.qgisProject}`);
  console.log(`[GIS] GDAL: ${gdal.available ? (gdal.ok ? 'ok' : 'failed') : 'not found'}`);

  if (errorCount > 0 || (strict && warningCount > 0)) {
    process.exitCode = 1;
  }
}

main();
