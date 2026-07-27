import type {
  TopographicExportPlan,
  TopographicSourceRecord,
} from './topographicExport';
import { buildTopographicExportPlan } from './topographicExport';
import type { CoastalSeamResult } from './topographicCoastalSeam';
import { vectorizeNormalizedElevationGrid } from './topographicElevationVectorizer';
import { serializeTopographicExport } from './topographicExportSerializers';

export const TOPOGRAPHIC_COASTAL_MANIFEST_VERSION =
  'agid-topographic-coastal-manifest-v0.1';
export const TOPOGRAPHIC_COASTAL_MANIFEST_MEDIA_TYPE =
  'application/vnd.agid.topographic-coastal-manifest+json';

export type SerializedCoastalSeamManifest = {
  mediaType: typeof TOPOGRAPHIC_COASTAL_MANIFEST_MEDIA_TYPE;
  extension: '.coastal-manifest.json';
  data: string;
  byteLength: number;
  contentSha256: `sha256:${string}`;
};

export type SerializedCoastalTerrainGltfBundle = {
  model: {
    mediaType: 'model/gltf+json';
    extension: '.gltf';
    data: string;
    byteLength: number;
    contentSha256: `sha256:${string}`;
  };
  manifest: SerializedCoastalSeamManifest;
};

type CoastalSourceRole = 'land' | 'bathymetry' | 'coastline';

function requireSha256(field: string, value: string) {
  if (!/^sha256:[a-f0-9]{64}$/i.test(value)) {
    throw new Error(`${field} must be a SHA-256 digest.`);
  }
}

function requireHttpsUrl(field: string, value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${field} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== 'https:') {
    throw new Error(`${field} must be a valid HTTPS URL.`);
  }
}

function requireReadySource(
  role: CoastalSourceRole,
  gate: TopographicExportPlan,
  expected: {
    sourceId: string;
    version: string;
    termsUrl: string;
    correctionUrl: string;
  },
) {
  if (gate.status !== 'ready') {
    throw new Error(`${role} source gate must be ready before serialization.`);
  }
  if (gate.selectedSources.length !== 1) {
    throw new Error(`${role} source gate must select exactly one source.`);
  }
  const source = gate.selectedSources[0];
  if (
    source.sourceId !== expected.sourceId ||
    source.version !== expected.version
  ) {
    throw new Error(`${role} source identity does not match seam provenance.`);
  }
  if (
    source.termsUrl !== expected.termsUrl ||
    source.correctionUrl !== expected.correctionUrl
  ) {
    throw new Error(`${role} source rights evidence does not match provenance.`);
  }
  requireHttpsUrl(`${role} source URL`, source.sourceUrl);
  requireHttpsUrl(`${role} terms URL`, source.termsUrl);
  requireHttpsUrl(`${role} correction URL`, source.correctionUrl);
  if (source.reuseStatus !== 'approved') {
    throw new Error(`${role} source reuse must be approved.`);
  }
  return source;
}

function publicSourceRecord(
  role: CoastalSourceRole,
  source: TopographicSourceRecord,
  snapshotSha256: `sha256:${string}`,
) {
  return {
    role,
    sourceId: source.sourceId,
    publisher: source.publisher,
    product: source.product,
    sourceUrl: source.sourceUrl,
    termsUrl: source.termsUrl,
    licenseId: source.licenseId,
    version: source.version,
    publishedAt: source.publishedAt,
    retrievedAt: source.retrievedAt,
    freshUntil: source.freshUntil ?? null,
    attribution: source.attribution,
    correctionUrl: source.correctionUrl,
    coverage: source.coverage,
    layerIds: [...source.layerIds],
    allowedFormats: [...source.allowedFormats],
    reuseStatus: source.reuseStatus,
    syntheticOnly: source.syntheticOnly === true,
    snapshotSha256,
  };
}

async function sha256(bytes: Uint8Array) {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    Uint8Array.from(bytes).buffer,
  );
  return `sha256:${Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}` as const;
}

export async function serializeCoastalSeamManifest(
  result: CoastalSeamResult,
): Promise<SerializedCoastalSeamManifest> {
  const { provenance, grid, metrics } = result;
  if (result.seamVersion.trim() === '') {
    throw new Error('Coastal seam version is required.');
  }
  if (
    grid.horizontalCrs !== 'EPSG:4326' ||
    grid.verticalDatum !== provenance.targetVerticalDatum
  ) {
    throw new Error('Coastal grid reference systems do not match provenance.');
  }
  if (
    grid.sourceIds.land !== provenance.landSourceId ||
    grid.sourceIds.bathymetry !== provenance.bathymetrySourceId ||
    grid.sourceIds.coastline !== provenance.coastlineSourceId
  ) {
    throw new Error('Coastal grid source IDs do not match provenance.');
  }
  const expectedCellCount = grid.width * grid.height;
  if (
    grid.elevationsMeters.length !== expectedCellCount ||
    metrics.gridCellCount !== expectedCellCount ||
    metrics.landCellCount +
      metrics.oceanCellCount +
      metrics.breaklineCellCount !==
      expectedCellCount
  ) {
    throw new Error('Coastal grid and seam metrics have inconsistent cell counts.');
  }

  requireSha256('land snapshot', provenance.landSnapshotSha256);
  requireSha256('bathymetry snapshot', provenance.bathymetrySnapshotSha256);
  requireSha256('coastline snapshot', provenance.coastlineSnapshotSha256);
  requireSha256('coastline classification', provenance.classificationSha256);
  if (
    provenance.sourceTermsUrls.length !== 3 ||
    provenance.sourceCorrectionUrls.length !== 3
  ) {
    throw new Error('Coastal provenance must contain three source evidence URLs.');
  }

  const evidence = [
    {
      role: 'land' as const,
      gate: result.sourceGates.land,
      sourceId: provenance.landSourceId,
      version: provenance.landSourceVersion,
      snapshotSha256: provenance.landSnapshotSha256,
      termsUrl: provenance.sourceTermsUrls[0],
      correctionUrl: provenance.sourceCorrectionUrls[0],
    },
    {
      role: 'bathymetry' as const,
      gate: result.sourceGates.bathymetry,
      sourceId: provenance.bathymetrySourceId,
      version: provenance.bathymetrySourceVersion,
      snapshotSha256: provenance.bathymetrySnapshotSha256,
      termsUrl: provenance.sourceTermsUrls[1],
      correctionUrl: provenance.sourceCorrectionUrls[1],
    },
    {
      role: 'coastline' as const,
      gate: result.sourceGates.coastline,
      sourceId: provenance.coastlineSourceId,
      version: provenance.coastlineSourceVersion,
      snapshotSha256: provenance.coastlineSnapshotSha256,
      termsUrl: provenance.sourceTermsUrls[2],
      correctionUrl: provenance.sourceCorrectionUrls[2],
    },
  ];
  const sources = evidence.map(item => {
    const source = requireReadySource(item.role, item.gate, item);
    return publicSourceRecord(item.role, source, item.snapshotSha256);
  });

  const manifest = {
    manifestVersion: TOPOGRAPHIC_COASTAL_MANIFEST_VERSION,
    seamVersion: result.seamVersion,
    generatedAt: grid.generatedAt,
    grid: {
      gridId: grid.gridId,
      title: grid.title,
      bounds: grid.bounds,
      width: grid.width,
      height: grid.height,
      rowOrder: grid.rowOrder,
      horizontalCrs: grid.horizontalCrs,
      verticalDatum: grid.verticalDatum,
      countryCode: grid.countryCode ?? null,
    },
    sources,
    coastlineEvidence: {
      classificationSha256: provenance.classificationSha256,
      adapterVersion: provenance.coastlineAdapterVersion,
      shorelineEpoch: provenance.shorelineEpoch,
    },
    metrics: {
      gridCellCount: metrics.gridCellCount,
      landCellCount: metrics.landCellCount,
      oceanCellCount: metrics.oceanCellCount,
      breaklineCellCount: metrics.breaklineCellCount,
      maximumLandBreaklineAdjustmentMeters:
        metrics.maximumLandBreaklineAdjustmentMeters,
      maximumBathymetryBreaklineAdjustmentMeters:
        metrics.maximumBathymetryBreaklineAdjustmentMeters,
    },
    nonClaims: [
      'This manifest is evidence metadata, not an independent signature.',
      'The reconciled surface is non-navigational.',
      'Terrain context does not prove an address, entrance, or delivery point.',
    ],
  };
  const data = `${JSON.stringify(manifest, null, 2)}\n`;
  const bytes = new TextEncoder().encode(data);
  return {
    mediaType: TOPOGRAPHIC_COASTAL_MANIFEST_MEDIA_TYPE,
    extension: '.coastal-manifest.json',
    data,
    byteLength: bytes.byteLength,
    contentSha256: await sha256(bytes),
  };
}

export async function serializeCoastalTerrainGltfBundle(
  result: CoastalSeamResult,
): Promise<SerializedCoastalTerrainGltfBundle> {
  const manifest = await serializeCoastalSeamManifest(result);
  const sources = [
    result.sourceGates.land.selectedSources[0],
    result.sourceGates.bathymetry.selectedSources[0],
    result.sourceGates.coastline.selectedSources[0],
  ];
  const syntheticModes = new Set(
    sources.map(source => source.syntheticOnly === true),
  );
  if (syntheticModes.size !== 1) {
    throw new Error(
      'Coastal glTF export cannot mix synthetic and source-backed evidence.',
    );
  }

  const landSource = sources[0];
  const vectorized = vectorizeNormalizedElevationGrid(
    {
      ...result.grid,
      sourceRecord: landSource,
    },
    {
      contourIntervalMeters: 1,
      includeContours: false,
      meshLodStrides: [1],
    },
  );
  const plan = buildTopographicExportPlan({
    bounds: result.grid.bounds,
    countryCode: result.grid.countryCode,
    crs: result.grid.horizontalCrs,
    format: 'gltf',
    layerIds: ['terrain-mesh'],
    sourceRecords: [landSource],
    dataMode: landSource.syntheticOnly ? 'synthetic' : 'source-backed',
    now: result.grid.generatedAt,
  });
  if (plan.status !== 'ready') {
    throw new Error('Coastal glTF export plan must be ready.');
  }

  const serialized = serializeTopographicExport(vectorized.dataset, plan);
  const gltf = JSON.parse(String(serialized.data)) as {
    asset: {
      version: string;
      extras?: Record<string, unknown>;
    };
  };
  gltf.asset.extras = {
    ...(gltf.asset.extras ?? {}),
    agidCoastalEvidence: {
      manifestVersion: TOPOGRAPHIC_COASTAL_MANIFEST_VERSION,
      manifestSha256: manifest.contentSha256,
      seamVersion: result.seamVersion,
      sourceIds: {
        land: result.provenance.landSourceId,
        bathymetry: result.provenance.bathymetrySourceId,
        coastline: result.provenance.coastlineSourceId,
      },
      horizontalCrs: result.grid.horizontalCrs,
      verticalDatum: result.grid.verticalDatum,
    },
  };
  const data = `${JSON.stringify(gltf, null, 2)}\n`;
  const bytes = new TextEncoder().encode(data);
  return {
    model: {
      mediaType: 'model/gltf+json',
      extension: '.gltf',
      data,
      byteLength: bytes.byteLength,
      contentSha256: await sha256(bytes),
    },
    manifest,
  };
}
