import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'SideMenu.tsx'), 'utf8');
const appSource = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

test('side menu acts as an integrated app switcher with stable controls', () => {
  assert.match(source, /top-0 left-0 bottom-0 w-80 max-w-\[88vw\] md:w-\[22rem\]/);
  assert.match(source, /h-8 w-auto max-w-\[88px\]/);
  assert.match(source, /App Switcher/);
  assert.match(source, /AGID Workspace/);
  assert.match(source, /Local-first shell/);
  assert.match(source, /現場・運用・研究\/設計はヒーローに移動/);
  assert.match(source, /getSideMenuPrimaryAppSurfaces\(appSurfaces\)/);
  assert.match(source, /getSideMenuSecondaryAppSurfaceGroups\(appSurfaces\)/);
  assert.match(source, /showAllApps/);
  assert.match(source, /showTools/);
  assert.match(source, /More apps/);
  assert.match(source, /Tools & settings/);
  assert.match(source, /ツール・設定/);
  assert.match(source, /よく使うアプリ/);
  assert.match(source, /日常の個人・開発アプリ/);
  assert.doesNotMatch(source, /個人・現場・運用・開発・研究\/設計/);
  assert.match(source, /isStandaloneAppSurface\(surface\)/);
  assert.match(source, /surface\.action === 'open-address-registration'/);
  assert.match(source, /surface\.action === 'navigate' && surface\.route/);
  assert.match(source, /min-h-\[66px\]/);
  assert.match(source, /min-h-\[46px\]/);
  assert.match(source, /min-h-\[44px\]/);
  assert.match(source, /grid grid-cols-3 gap-1\.5/);
  assert.match(source, /grid grid-cols-4 gap-1/);
  assert.match(source, /text-\[10px\] font-black uppercase tracking-\[0\.2em\]/);
  assert.match(source, /sr-only/);
  assert.match(source, /personalTools\.map/);
  assert.match(source, /systemTools\.map/);
  assert.doesNotMatch(source, /primaryAppSurfaces\.map\(surface => renderSurfaceButton\(surface, 'secondary'\)\)/);
  assert.doesNotMatch(source, /w-72 md:w-56/);
  assert.doesNotMatch(source, /w-64 max-w-\[82vw\] md:w-52/);
  assert.doesNotMatch(source, /space-y-8/);
  assert.doesNotMatch(source, /Absolute Grid Identity/);
  assert.doesNotMatch(source, /Build 2\.4\.0/);
});

test('side menu code is loaded only when the drawer is open', () => {
  assert.match(appSource, /const SideMenu = React\.lazy/);
  assert.match(appSource, /showMenu && \(\s*<React\.Suspense fallback=\{null\}>/s);
  assert.doesNotMatch(appSource, /import \{ SideMenu \} from '\.\/components\/SideMenu'/);
});
