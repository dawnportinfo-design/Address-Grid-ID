import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { AFRICA_OPEN_GEO_SOURCES } from '../src/data/africaOpenGeoSources';
import { AMERICAS_OPEN_GEO_SOURCES } from '../src/data/americasOpenGeoSources';
import { ASIA_OPEN_GEO_SOURCES } from '../src/data/asiaOpenGeoSources';
import { EUROPE_OPEN_GEO_SOURCES } from '../src/data/europeOpenGeoSources';
import { OCEANIA_OPEN_GEO_SOURCES } from '../src/data/oceaniaOpenGeoSources';
import { POLAR_OPEN_GEO_SOURCES } from '../src/data/polarOpenGeoSources';

type SourceRecord = {
  id: string;
  name: string;
  url: string;
  kind: string;
  coverage: string;
  usage: string;
};

type AddressFormatFile = {
  countryCode: string;
  name: string;
  openSourceIds?: string[];
  postalCode?: {
    api?: string | null;
    source?: string | null;
  };
  addressRules?: {
    openSourceIds?: string[];
    postalCode?: {
      required: boolean;
      usage: string;
    } | null;
  };
};

type StaticIssue = {
  file: string;
  countryCode?: string;
  issue: string;
  detail: string;
};

type ProbeTarget = {
  id: string;
  kind: 'postal-api' | 'open-source';
  sourceKind?: string;
  name: string;
  url: string;
  probeUrl: string;
  countries: string[];
};

type ProbeResult = ProbeTarget & {
  status: 'ok' | 'restricted' | 'not-found' | 'server-error' | 'network-error';
  httpStatus: number | null;
  method: string | null;
  error?: string;
  elapsedMs: number;
};

const ADDRESS_FORMAT_ROOT = join(process.cwd(), 'src', 'data', 'address_formats');
const REPORT_PATH = join(process.cwd(), 'test-results', 'postal-source-health.json');
const POSTAL_SOURCE_KINDS = new Set(['postal-code']);
const args = new Set(process.argv.slice(2));
const shouldProbeLive = args.has('--live');
const strictLive = args.has('--strict-live');

const SOURCE_REGISTRY: Record<string, SourceRecord> = {
  ...AFRICA_OPEN_GEO_SOURCES,
  ...AMERICAS_OPEN_GEO_SOURCES,
  ...ASIA_OPEN_GEO_SOURCES,
  ...EUROPE_OPEN_GEO_SOURCES,
  ...OCEANIA_OPEN_GEO_SOURCES,
  ...POLAR_OPEN_GEO_SOURCES,
};

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

function cleanHttpUrl(value: string) {
  return /^https?:\/\//.test(value) && !/(utm_source=chatgpt|share\.google|nothing)/i.test(value);
}

function normalizeProbeUrl(rawUrl: string) {
  const value = rawUrl.trim();
  const parsed = new URL(value);
  if (/[{}]/.test(value)) {
    return parsed.origin;
  }
  return value;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function loadAddressFormats() {
  return walkJsonFiles(ADDRESS_FORMAT_ROOT).map(file => ({
    file,
    relativePath: relative(ADDRESS_FORMAT_ROOT, file),
    format: JSON.parse(readFileSync(file, 'utf8')) as AddressFormatFile,
  }));
}

function collectStaticIssues(files: ReturnType<typeof loadAddressFormats>) {
  const issues: StaticIssue[] = [];

  for (const { relativePath, format } of files) {
    const sourceIds = unique([
      ...(format.openSourceIds ?? []),
      ...(format.addressRules?.openSourceIds ?? []),
    ]);

    if (format.postalCode?.api && !cleanHttpUrl(format.postalCode.api)) {
      issues.push({
        file: relativePath,
        countryCode: format.countryCode,
        issue: 'invalid-postal-api-url',
        detail: format.postalCode.api,
      });
    }

    for (const sourceId of sourceIds) {
      const source = SOURCE_REGISTRY[sourceId];
      if (!source) {
        issues.push({
          file: relativePath,
          countryCode: format.countryCode,
          issue: 'unregistered-open-source-id',
          detail: sourceId,
        });
        continue;
      }

      if (!cleanHttpUrl(source.url)) {
        issues.push({
          file: relativePath,
          countryCode: format.countryCode,
          issue: 'invalid-open-source-url',
          detail: `${sourceId}: ${source.url}`,
        });
      }
    }

    if (format.addressRules?.postalCode?.required) {
      const hasPostalEvidence =
        Boolean(format.postalCode?.api || format.postalCode?.source) ||
        sourceIds.some(sourceId => SOURCE_REGISTRY[sourceId]?.kind === 'postal-code');

      if (!hasPostalEvidence) {
        issues.push({
          file: relativePath,
          countryCode: format.countryCode,
          issue: 'missing-required-postal-evidence',
          detail: 'Postal code is required but no postal API/source or registered postal-code source is linked.',
        });
      }
    }
  }

  return issues;
}

function collectProbeTargets(files: ReturnType<typeof loadAddressFormats>) {
  const byUrl = new Map<string, ProbeTarget>();

  for (const { format } of files) {
    if (format.postalCode?.api) {
      const probeUrl = normalizeProbeUrl(format.postalCode.api);
      const id = `postal-api:${probeUrl}`;
      const existing = byUrl.get(id);
      if (existing) {
        existing.countries.push(format.countryCode);
      } else {
        byUrl.set(id, {
          id,
          kind: 'postal-api',
          name: format.postalCode.source || format.postalCode.api,
          url: format.postalCode.api,
          probeUrl,
          countries: [format.countryCode],
        });
      }
    }

    const sourceIds = unique([
      ...(format.openSourceIds ?? []),
      ...(format.addressRules?.openSourceIds ?? []),
    ]);

    for (const sourceId of sourceIds) {
      const source = SOURCE_REGISTRY[sourceId];
      if (!source || !POSTAL_SOURCE_KINDS.has(source.kind)) continue;
      const id = `open-source:${source.url}`;
      const existing = byUrl.get(id);
      if (existing) {
        existing.countries.push(format.countryCode);
      } else {
        byUrl.set(id, {
          id,
          kind: 'open-source',
          sourceKind: source.kind,
          name: source.name,
          url: source.url,
          probeUrl: normalizeProbeUrl(source.url),
          countries: [format.countryCode],
        });
      }
    }
  }

  return [...byUrl.values()].map(target => ({
    ...target,
    countries: unique(target.countries).sort(),
  }));
}

function classifyStatus(httpStatus: number | null, error?: string): ProbeResult['status'] {
  if (error) return 'network-error';
  if (httpStatus === null) return 'network-error';
  if (httpStatus >= 200 && httpStatus < 400) return 'ok';
  if ([401, 403, 405, 429].includes(httpStatus)) return 'restricted';
  if (httpStatus === 404 || httpStatus === 410) return 'not-found';
  if (httpStatus >= 500) return 'server-error';
  return 'restricted';
}

async function requestWithTimeout(url: string, method: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'AGID postal source verifier',
        accept: 'text/html,application/json,text/plain,*/*',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function probeTarget(target: ProbeTarget): Promise<ProbeResult> {
  const started = Date.now();
  let response: Response | null = null;
  let method: string | null = null;
  let error: string | undefined;

  try {
    method = 'HEAD';
    response = await requestWithTimeout(target.probeUrl, method);
    if ([400, 405, 429].includes(response.status)) {
      method = 'GET';
      response = await requestWithTimeout(target.probeUrl, method);
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  const httpStatus = response?.status ?? null;
  return {
    ...target,
    status: classifyStatus(httpStatus, error),
    httpStatus,
    method,
    error,
    elapsedMs: Date.now() - started,
  };
}

async function probeAll(targets: ProbeTarget[], concurrency = 8) {
  const results: ProbeResult[] = [];
  let index = 0;

  async function worker() {
    while (index < targets.length) {
      const target = targets[index++];
      results.push(await probeTarget(target));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results.sort((left, right) => left.id.localeCompare(right.id));
}

async function main() {
  const files = loadAddressFormats();
  const staticIssues = collectStaticIssues(files);
  const probeTargets = collectProbeTargets(files);
  const liveResults = shouldProbeLive ? await probeAll(probeTargets) : [];

  const summary = {
    checkedAt: new Date().toISOString(),
    addressFormatFiles: files.length,
    registeredOpenSourceIds: Object.keys(SOURCE_REGISTRY).length,
    uniquePostalApis: new Set(files.map(({ format }) => format.postalCode?.api).filter(Boolean)).size,
    uniquePostalProbeTargets: probeTargets.length,
    staticIssueCount: staticIssues.length,
    liveProbeEnabled: shouldProbeLive,
    liveStatusCounts: liveResults.reduce<Record<string, number>>((counts, result) => {
      counts[result.status] = (counts[result.status] || 0) + 1;
      return counts;
    }, {}),
  };

  const report = {
    summary,
    staticIssues,
    liveResults,
  };

  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    ...summary,
    reportPath: REPORT_PATH,
    liveFailures: liveResults
      .filter(result => ['not-found', 'server-error', 'network-error'].includes(result.status))
      .slice(0, 20)
      .map(result => ({
        name: result.name,
        url: result.url,
        probeUrl: result.probeUrl,
        status: result.status,
        httpStatus: result.httpStatus,
        error: result.error,
      })),
  }, null, 2));

  if (staticIssues.length > 0 || (strictLive && liveResults.some(result => ['not-found', 'server-error', 'network-error'].includes(result.status)))) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
