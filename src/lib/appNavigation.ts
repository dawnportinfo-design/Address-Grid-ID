export const APP_NAVIGATION_MODEL_VERSION = 'agid-integrated-app-navigation-v2';

export type AppSurfaceId =
  | 'open-source-home'
  | 'map-workspace'
  | 'address-registration'
  | 'address-portal'
  | 'pos-terminal'
  | 'hotel-checkin'
  | 'oracle-opera-hotel-address'
  | 'field-handoff'
  | 'machine-comms'
  | 'settings-policy'
  | 'address-dashboard'
  | 'address-review-console'
  | 'developer-console'
  | 'agid-address-element'
  | 'evidence-vault'
  | 'research-design-hub'
  | 'postal-zone-designer'
  | 'open-locker-pudo-simulator'
  | 'drone-locker-ops';

export type AppSurfaceGroup = 'core' | 'operations' | 'admin' | 'developer' | 'labs';

export type AppSurfaceRole = 'user' | 'operator' | 'field' | 'admin' | 'developer';

export type AppSurfaceDeployment = 'same-shell' | 'standalone-route' | 'embedded-sdk' | 'dashboard-module' | 'planned-app';

export type AppSurfaceStatus = 'ready' | 'partial' | 'planned';

export type AppSurfaceMenuTier = 'primary' | 'secondary' | 'roadmap';

export type AppSurfaceAction =
  | 'navigate'
  | 'open-address-registration'
  | 'open-local-settings'
  | 'disabled';

export type AppSurfaceCopy = {
  label: string;
  shortLabel: string;
  description: string;
};

export type AppSurfaceDefinition = {
  id: AppSurfaceId;
  group: AppSurfaceGroup;
  route: string | null;
  action: AppSurfaceAction;
  deployment: AppSurfaceDeployment;
  status: AppSurfaceStatus;
  menuTier: AppSurfaceMenuTier;
  roles: AppSurfaceRole[];
  icon: string;
  privacyBoundary: 'local-first' | 'redacted-admin' | 'operator' | 'embedded' | 'planned';
  copy: Record<'en' | 'ja', AppSurfaceCopy>;
};

export type AppSurfaceGroupDefinition = {
  id: AppSurfaceGroup;
  copy: Record<'en' | 'ja', { label: string; description: string }>;
};

export type AppNavigationValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type AppSurfaceDiscoverability =
  | 'primary-side-menu'
  | 'secondary-side-menu'
  | 'hero-lane'
  | 'workspace-secondary'
  | 'deep-link-module'
  | 'same-shell-action'
  | 'roadmap';

export type HiddenAppFeatureSeverity = 'high' | 'medium' | 'low';

export type HiddenAppFeatureFinding = {
  surfaceId: AppSurfaceId;
  route: string | null;
  label: string;
  group: AppSurfaceGroup;
  discoverability: AppSurfaceDiscoverability;
  severity: HiddenAppFeatureSeverity;
  reason: string;
  recommendedAction: string;
};

export type HiddenAppFeatureAudit = {
  totalSurfaces: number;
  hiddenCount: number;
  deepLinkModules: number;
  workspaceSecondary: number;
  roadmap: number;
  findings: HiddenAppFeatureFinding[];
};

export const APP_SURFACE_GROUPS: AppSurfaceGroupDefinition[] = [
  {
    id: 'core',
    copy: {
      en: { label: 'Personal', description: 'Map, registration, consent, and policy.' },
      ja: { label: '個人', description: '地図、登録、同意、ポリシー。' },
    },
  },
  {
    id: 'operations',
    copy: {
      en: { label: 'Field', description: 'Counter, field, handoff, machine, locker, and drone work.' },
      ja: { label: '現場', description: '受付、現場、引き渡し、機械、ロッカー、ドローン。' },
    },
  },
  {
    id: 'admin',
    copy: {
      en: { label: 'Operations', description: 'Review, audit, issuer, and terminal control.' },
      ja: { label: '運用', description: '審査、監査、issuer、端末管理。' },
    },
  },
  {
    id: 'developer',
    copy: {
      en: { label: 'Development', description: 'SDK, element, API, and integration work.' },
      ja: { label: '開発', description: 'SDK、Element、API、連携。' },
    },
  },
  {
    id: 'labs',
    copy: {
      en: { label: 'Research / Design', description: 'Postal zoning, evidence, models, and design experiments.' },
      ja: { label: '研究/設計', description: '郵便区画、証跡、数理モデル、設計実験。' },
    },
  },
];

export const HERO_WORKSPACE_GROUP_IDS = ['operations', 'admin', 'labs'] as const satisfies readonly AppSurfaceGroup[];

const HERO_WORKSPACE_GROUP_SET: ReadonlySet<AppSurfaceGroup> = new Set(HERO_WORKSPACE_GROUP_IDS);

export function isHeroWorkspaceGroup(group: AppSurfaceGroup): boolean {
  return HERO_WORKSPACE_GROUP_SET.has(group);
}

export function classifyAppSurfaceDiscoverability(surface: AppSurfaceDefinition): AppSurfaceDiscoverability {
  if (surface.status === 'planned' || surface.action === 'disabled') return 'roadmap';
  if (surface.action !== 'navigate') return 'same-shell-action';
  if (surface.route?.includes('?')) return 'deep-link-module';
  if (isHeroWorkspaceGroup(surface.group)) {
    return surface.menuTier === 'primary' ? 'hero-lane' : 'workspace-secondary';
  }
  return surface.menuTier === 'primary' ? 'primary-side-menu' : 'secondary-side-menu';
}

function hiddenFeatureSeverity(discoverability: AppSurfaceDiscoverability): HiddenAppFeatureSeverity {
  if (discoverability === 'deep-link-module') return 'high';
  if (discoverability === 'workspace-secondary') return 'medium';
  return 'low';
}

function hiddenFeatureReason(discoverability: AppSurfaceDiscoverability, surface: AppSurfaceDefinition): string {
  if (discoverability === 'deep-link-module') {
    return 'The feature has a route or query surface, but users need a specific deep link or internal dashboard state to reach it.';
  }
  if (discoverability === 'workspace-secondary') {
    return 'The feature is implemented as a ready route, but it is outside the side-menu app switcher and sits behind a broad hero/footer workspace lane.';
  }
  if (discoverability === 'roadmap') {
    return 'The feature is modeled in navigation, but is planned or disabled and should not be presented as a ready workflow.';
  }
  return `${surface.id} is discoverable enough for the current navigation model.`;
}

function hiddenFeatureRecommendedAction(discoverability: AppSurfaceDiscoverability): string {
  if (discoverability === 'deep-link-module') {
    return 'Add an explicit dashboard tab/card and one stable link from the Developer Console or app switcher.';
  }
  if (discoverability === 'workspace-secondary') {
    return 'Expose it in a searchable All Apps launcher from the map home, or add a compact card under the matching hero lane.';
  }
  if (discoverability === 'roadmap') {
    return 'Keep it in roadmap/research copy only until it has a tested route and no-raw-address gate.';
  }
  return 'No action required.';
}

export function detectHiddenAppFeatures(
  surfaces = APP_SURFACES,
  language = 'en',
): HiddenAppFeatureAudit {
  const findings = surfaces
    .map(surface => ({
      surface,
      discoverability: classifyAppSurfaceDiscoverability(surface),
    }))
    .filter(item => (
      item.discoverability === 'deep-link-module'
      || item.discoverability === 'workspace-secondary'
      || item.discoverability === 'roadmap'
    ))
    .map(({ surface, discoverability }) => ({
      surfaceId: surface.id,
      route: surface.route,
      label: getAppSurfaceCopy(surface, language).label,
      group: surface.group,
      discoverability,
      severity: hiddenFeatureSeverity(discoverability),
      reason: hiddenFeatureReason(discoverability, surface),
      recommendedAction: hiddenFeatureRecommendedAction(discoverability),
    }));

  return {
    totalSurfaces: surfaces.length,
    hiddenCount: findings.length,
    deepLinkModules: findings.filter(item => item.discoverability === 'deep-link-module').length,
    workspaceSecondary: findings.filter(item => item.discoverability === 'workspace-secondary').length,
    roadmap: findings.filter(item => item.discoverability === 'roadmap').length,
    findings,
  };
}

export const APP_SURFACES: AppSurfaceDefinition[] = [
  {
    id: 'open-source-home',
    group: 'developer',
    route: '/open-source',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['developer', 'admin', 'operator'],
    icon: 'code',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'Open Source Home',
        shortLabel: 'OSS',
        description: 'Download, SDKs, docs, and developer entry points.',
      },
      ja: {
        label: 'OSSホーム',
        shortLabel: 'OSS',
        description: 'ダウンロード、SDK、Docs、開発入口。',
      },
    },
  },
  {
    id: 'map-workspace',
    group: 'core',
    route: '/',
    action: 'navigate',
    deployment: 'same-shell',
    status: 'ready',
    menuTier: 'primary',
    roles: ['user', 'operator', 'field', 'admin', 'developer'],
    icon: 'map',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'AGID Map',
        shortLabel: 'Map',
        description: 'Search, select, and inspect AGID cells.',
      },
      ja: {
        label: 'AGIDマップ',
        shortLabel: '地図',
        description: 'AGIDセルの検索、選択、表示。',
      },
    },
  },
  {
    id: 'address-registration',
    group: 'core',
    route: '/',
    action: 'open-address-registration',
    deployment: 'same-shell',
    status: 'partial',
    menuTier: 'primary',
    roles: ['user', 'operator', 'field', 'admin'],
    icon: 'home',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'Address Registration',
        shortLabel: 'Register',
        description: 'Register or correct an address locally first.',
      },
      ja: {
        label: '住所登録',
        shortLabel: '登録',
        description: '住所登録・修正をローカル優先で行う。',
      },
    },
  },
  {
    id: 'address-portal',
    group: 'core',
    route: '/portal',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'primary',
    roles: ['user', 'admin'],
    icon: 'key',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'Address Portal',
        shortLabel: 'Portal',
        description: 'Manage consent, scopes, revoke, export.',
      },
      ja: {
        label: 'Address Portal',
        shortLabel: 'Portal',
        description: '同意、scope、取消、exportを管理。',
      },
    },
  },
  {
    id: 'settings-policy',
    group: 'core',
    route: '/settings',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['user', 'operator', 'field', 'admin', 'developer'],
    icon: 'settings',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'Settings & Policy',
        shortLabel: 'Policy',
        description: 'Language, modes, providers, devices, high-risk defaults.',
      },
      ja: {
        label: '設定・ポリシー',
        shortLabel: '設定',
        description: '言語、モード、外部連携、端末、高リスク設定。',
      },
    },
  },
  {
    id: 'pos-terminal',
    group: 'operations',
    route: '/pos',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'primary',
    roles: ['operator', 'field', 'admin'],
    icon: 'pos',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'AGID POS Terminal',
        shortLabel: 'POS',
        description: 'Scan -> Decision -> Handoff -> Report.',
      },
      ja: {
        label: 'AGID POS端末',
        shortLabel: 'POS',
        description: 'Scan -> Decision -> Handoff -> Report。',
      },
    },
  },
  {
    id: 'hotel-checkin',
    group: 'operations',
    route: '/hotel',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['operator', 'admin'],
    icon: 'hotel',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Hotel Check-in',
        shortLabel: 'Hotel',
        description: 'Issue short-lived check-in QR and verify guest address QR locally.',
      },
      ja: {
        label: 'Hotel Check-in',
        shortLabel: 'ホテル',
        description: '短期チェックインQRを発行し、ゲスト住所QRをローカル照合。',
      },
    },
  },
  {
    id: 'oracle-opera-hotel-address',
    group: 'operations',
    route: '/opera',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['operator', 'admin', 'developer'],
    icon: 'hotel',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Oracle OPERA Address Review',
        shortLabel: 'OPERA',
        description: 'Confirm hotel/profile addresses, OHIP mappers, redaction gates, and sync queue readiness.',
      },
      ja: {
        label: 'Oracle OPERA住所確認',
        shortLabel: 'OPERA',
        description: 'ホテル/プロフィール住所、OHIP mapper、秘匿ゲート、送信キュー準備を確認。',
      },
    },
  },
  {
    id: 'field-handoff',
    group: 'operations',
    route: '/field',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['field', 'operator', 'admin'],
    icon: 'truck',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Field Handoff',
        shortLabel: 'Field',
        description: 'Mobile handoff, reachability, and offline receipts.',
      },
      ja: {
        label: 'Field Handoff',
        shortLabel: '現場',
        description: '現場引き渡し、到達可否、オフラインreceipt。',
      },
    },
  },
  {
    id: 'machine-comms',
    group: 'operations',
    route: '/machine',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['operator', 'field', 'admin', 'developer'],
    icon: 'machine',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Machine Link',
        shortLabel: 'Machine',
        description: 'AGID/AOID M2M envelopes for devices, lockers, drones, POS, and carriers.',
      },
      ja: {
        label: 'Machine Link',
        shortLabel: '機械通信',
        description: '端末、ロッカー、ドローン、POS、配送業者向けAGID/AOID機械間通信。',
      },
    },
  },
  {
    id: 'address-dashboard',
    group: 'admin',
    route: '/dashboard',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'primary',
    roles: ['admin', 'operator', 'developer'],
    icon: 'dashboard',
    privacyBoundary: 'redacted-admin',
    copy: {
      en: {
        label: 'Address Dashboard',
        shortLabel: 'Dashboard',
        description: 'Redacted operations, registry health, audit status.',
      },
      ja: {
        label: 'Address Dashboard',
        shortLabel: 'Dashboard',
        description: '秘匿運用、レジストリ状態、監査状況。',
      },
    },
  },
  {
    id: 'address-review-console',
    group: 'admin',
    route: '/dashboard?surface=review',
    action: 'navigate',
    deployment: 'dashboard-module',
    status: 'partial',
    menuTier: 'secondary',
    roles: ['admin', 'operator'],
    icon: 'review',
    privacyBoundary: 'redacted-admin',
    copy: {
      en: {
        label: 'Review Console',
        shortLabel: 'Review',
        description: 'Review partial, rejected, disputed, and high-risk cases.',
      },
      ja: {
        label: 'Review Console',
        shortLabel: '審査',
        description: 'partial、拒否、異議、高リスク案件を審査。',
      },
    },
  },
  {
    id: 'developer-console',
    group: 'developer',
    route: '/developer',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['developer', 'admin'],
    icon: 'code',
    privacyBoundary: 'redacted-admin',
    copy: {
      en: {
        label: 'Developer Console',
        shortLabel: 'Dev',
        description: 'API keys, webhooks, SDK snippets, launch checks.',
      },
      ja: {
        label: 'Developer Console',
        shortLabel: 'Dev',
        description: 'APIキー、Webhook、SDK、導入チェック。',
      },
    },
  },
  {
    id: 'agid-address-element',
    group: 'developer',
    route: '/element',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['developer', 'admin'],
    icon: 'element',
    privacyBoundary: 'embedded',
    copy: {
      en: {
        label: 'Address Element Playground',
        shortLabel: 'Element',
        description: 'Try the embeddable address UI for EC, CMS, and agents.',
      },
      ja: {
        label: 'Address Element Playground',
        shortLabel: 'Element',
        description: 'EC、CMS、Agent向け埋め込み住所UIを試す。',
      },
    },
  },
  {
    id: 'evidence-vault',
    group: 'labs',
    route: '/evidence',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['user', 'admin', 'operator'],
    icon: 'vault',
    privacyBoundary: 'local-first',
    copy: {
      en: {
        label: 'Evidence Vault',
        shortLabel: 'Vault',
        description: 'Photo/PDF OCR, redaction, and encrypted evidence.',
      },
      ja: {
        label: 'Evidence Vault',
        shortLabel: '証跡',
        description: '写真/PDF OCR、秘匿化、暗号化証跡。',
      },
    },
  },
  {
    id: 'research-design-hub',
    group: 'labs',
    route: '/research',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'primary',
    roles: ['admin', 'developer', 'operator'],
    icon: 'research',
    privacyBoundary: 'redacted-admin',
    copy: {
      en: {
        label: 'Research / Design Hub',
        shortLabel: 'Research',
        description: 'Evidence, postal-zone design, simulation, and release prep in one workspace.',
      },
      ja: {
        label: '研究/設計ハブ',
        shortLabel: '研究',
        description: '証跡、郵便区画設計、実験、公開準備を一つの入口で管理。',
      },
    },
  },
  {
    id: 'postal-zone-designer',
    group: 'labs',
    route: '/postal-zones',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['admin', 'developer', 'operator'],
    icon: 'grid',
    privacyBoundary: 'redacted-admin',
    copy: {
      en: {
        label: 'Postal Zone Designer',
        shortLabel: 'Zones',
        description: 'Design draft AGID postal zones with math, GIS, privacy, and governance gates.',
      },
      ja: {
        label: '郵便区画デザイナー',
        shortLabel: '区画',
        description: '数理・GIS・プライバシー・承認ゲート付きでAGID郵便区画を設計。',
      },
    },
  },
  {
    id: 'open-locker-pudo-simulator',
    group: 'labs',
    route: '/locker',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['operator', 'field', 'admin', 'developer'],
    icon: 'locker',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Open Locker/PUDO Simulator',
        shortLabel: 'Locker',
        description: 'QR/NFC locker intake, PUDO counter handoff, and local protocol simulation.',
      },
      ja: {
        label: 'Open Locker/PUDO Simulator',
        shortLabel: 'ロッカー',
        description: 'QR/NFCロッカー受付、PUDOカウンター、ローカル通信シミュレーション。',
      },
    },
  },
  {
    id: 'drone-locker-ops',
    group: 'labs',
    route: '/ops',
    action: 'navigate',
    deployment: 'standalone-route',
    status: 'ready',
    menuTier: 'secondary',
    roles: ['operator', 'field', 'admin'],
    icon: 'ops',
    privacyBoundary: 'operator',
    copy: {
      en: {
        label: 'Drone / Locker Ops',
        shortLabel: 'Ops',
        description: 'Reachability evidence, locker state, and local protocol simulation.',
      },
      ja: {
        label: 'Drone / Locker Ops',
        shortLabel: 'Ops',
        description: '到達証跡、ロッカー状態、ローカル通信シミュレーション。',
      },
    },
  },
];

export function normalizeAppNavigationLanguage(language: string): 'en' | 'ja' {
  return language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function getPrimaryAppSurfaces(surfaces = getAppSurfaces()): AppSurfaceDefinition[] {
  return surfaces.filter(surface => surface.menuTier === 'primary');
}

export function getSideMenuPrimaryAppSurfaces(surfaces = getAppSurfaces()): AppSurfaceDefinition[] {
  return getPrimaryAppSurfaces(surfaces).filter(surface => !isHeroWorkspaceGroup(surface.group));
}

export function getSecondaryAppSurfaceGroups(
  surfaces = getAppSurfaces(),
): Array<{ group: AppSurfaceGroupDefinition; surfaces: AppSurfaceDefinition[] }> {
  return groupAppSurfaces(surfaces.filter(surface => surface.menuTier !== 'primary'));
}

export function getSideMenuSecondaryAppSurfaceGroups(
  surfaces = getAppSurfaces(),
): Array<{ group: AppSurfaceGroupDefinition; surfaces: AppSurfaceDefinition[] }> {
  return groupAppSurfaces(
    surfaces.filter(surface => surface.menuTier !== 'primary' && !isHeroWorkspaceGroup(surface.group)),
  );
}

export function getHeroWorkspaceSurfaceGroups(
  surfaces = getAppSurfaces(),
): Array<{ group: AppSurfaceGroupDefinition; surfaces: AppSurfaceDefinition[] }> {
  return groupAppSurfaces(surfaces.filter(surface => isHeroWorkspaceGroup(surface.group)));
}

export function getAppSurfaces(
  roles: AppSurfaceRole[] = ['user', 'operator', 'field', 'admin', 'developer'],
): AppSurfaceDefinition[] {
  const roleSet = new Set(roles);
  return APP_SURFACES
    .filter(surface => surface.roles.some(role => roleSet.has(role)))
    .map(surface => ({
      ...surface,
      roles: [...surface.roles],
      copy: {
        en: { ...surface.copy.en },
        ja: { ...surface.copy.ja },
      },
    }));
}

export function getAppSurfaceGroupLabel(group: AppSurfaceGroup, language: string): string {
  const normalizedLanguage = normalizeAppNavigationLanguage(language);
  return APP_SURFACE_GROUPS.find(item => item.id === group)?.copy[normalizedLanguage].label ?? group;
}

export function groupAppSurfaces(
  surfaces = getAppSurfaces(),
): Array<{ group: AppSurfaceGroupDefinition; surfaces: AppSurfaceDefinition[] }> {
  return APP_SURFACE_GROUPS
    .map(group => ({
      group,
      surfaces: surfaces.filter(surface => surface.group === group.id),
    }))
    .filter(item => item.surfaces.length > 0);
}

export function getAppSurfaceCopy(surface: AppSurfaceDefinition, language: string): AppSurfaceCopy {
  return surface.copy[normalizeAppNavigationLanguage(language)];
}

export function getAppSurfaceStatusLabel(status: AppSurfaceStatus, language: string): string {
  const ja = normalizeAppNavigationLanguage(language) === 'ja';
  if (status === 'ready') return ja ? '利用可' : 'Ready';
  if (status === 'partial') return ja ? '一部' : 'Partial';
  return ja ? '予定' : 'Planned';
}

export function isStandaloneAppSurface(surface: AppSurfaceDefinition): boolean {
  return surface.deployment === 'standalone-route' || surface.deployment === 'dashboard-module';
}

export function isAppSurfaceActive(surface: AppSurfaceDefinition, locationLike = window.location): boolean {
  if (!surface.route) return false;
  const [path] = surface.route.split('?');
  if (path === '/') {
    return locationLike.pathname === '/' && !locationLike.hash.startsWith('#/');
  }
  return locationLike.pathname === path || locationLike.hash === `#${path}`;
}

export function getRouteSurface(
  locationLike = window.location,
  surfaces = APP_SURFACES,
): AppSurfaceDefinition | null {
  return surfaces.find(surface => isAppSurfaceActive(surface, locationLike)) ?? null;
}

export function validateAppNavigation(surfaces = APP_SURFACES): AppNavigationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<AppSurfaceId>();

  for (const surface of surfaces) {
    if (ids.has(surface.id)) errors.push(`duplicate-surface:${surface.id}`);
    ids.add(surface.id);
    if (!surface.copy.en.label.trim()) errors.push(`missing-en-label:${surface.id}`);
    if (!surface.copy.ja.label.trim()) errors.push(`missing-ja-label:${surface.id}`);
    if (surface.roles.length === 0) errors.push(`missing-roles:${surface.id}`);
    if (surface.action === 'navigate' && !surface.route) errors.push(`navigate-without-route:${surface.id}`);
    if (surface.action === 'disabled' && surface.status === 'ready') errors.push(`ready-surface-disabled:${surface.id}`);
    if (surface.deployment === 'standalone-route' && !surface.route) errors.push(`standalone-without-route:${surface.id}`);
    if (surface.privacyBoundary !== 'local-first' && surface.group === 'core' && surface.id !== 'settings-policy') {
      warnings.push(`core-surface-non-local-boundary:${surface.id}`);
    }
  }

  for (const required of ['/', '/pos', '/hotel', '/portal', '/dashboard', '/settings', '/field', '/machine', '/developer', '/element', '/research', '/postal-zones', '/locker', '/ops']) {
    if (!surfaces.some(surface => surface.route?.split('?')[0] === required)) {
      errors.push(`missing-route:${required}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
