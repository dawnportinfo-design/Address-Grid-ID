import React from 'react';
import { FieldActionBar, type FieldActionSurface } from './components/FieldActionBar';
import { PwaStatusBar } from './components/PwaStatusBar';
import {
  shouldShowAgidFieldActionBar,
  type AgidDesignRouteKey,
} from './design/agidDesignRules';

const App = React.lazy(() => import('./App'));
const PosAppScreen = React.lazy(() => import('./components/PosAppScreen').then(module => ({
  default: module.PosAppScreen,
})));
const FieldHandoffAppScreen = React.lazy(() => import('./components/FieldHandoffAppScreen').then(module => ({
  default: module.FieldHandoffAppScreen,
})));
const HotelCheckInScreen = React.lazy(() => import('./components/HotelCheckInScreen').then(module => ({
  default: module.HotelCheckInScreen,
})));
const OracleOperaHotelAddressScreen = React.lazy(() => import('./components/OracleOperaHotelAddressScreen').then(module => ({
  default: module.OracleOperaHotelAddressScreen,
})));
const SettingsPolicyCenterScreen = React.lazy(() => import('./components/SettingsPolicyCenterScreen').then(module => ({
  default: module.SettingsPolicyCenterScreen,
})));
const AddressPortalScreen = React.lazy(() => import('./components/AddressPortalScreen').then(module => ({
  default: module.AddressPortalScreen,
})));
const AddressDashboardScreen = React.lazy(() => import('./components/AddressDashboardScreen').then(module => ({
  default: module.AddressDashboardScreen,
})));
const DeveloperConsoleScreen = React.lazy(() => import('./components/DeveloperConsoleScreen').then(module => ({
  default: module.DeveloperConsoleScreen,
})));
const AddressElementPlaygroundScreen = React.lazy(() => import('./components/AddressElementPlaygroundScreen').then(module => ({
  default: module.AddressElementPlaygroundScreen,
})));
const EvidenceVaultScreen = React.lazy(() => import('./components/EvidenceVaultScreen').then(module => ({
  default: module.EvidenceVaultScreen,
})));
const ResearchDesignHubScreen = React.lazy(() => import('./components/ResearchDesignHubScreen').then(module => ({
  default: module.ResearchDesignHubScreen,
})));
const PostalZoneDesignerScreen = React.lazy(() => import('./components/PostalZoneDesignerScreen').then(module => ({
  default: module.PostalZoneDesignerScreen,
})));
const MachineCommsScreen = React.lazy(() => import('./components/MachineCommsScreen').then(module => ({
  default: module.MachineCommsScreen,
})));
const OpenLockerPudoSimulatorScreen = React.lazy(() => import('./components/OpenLockerPudoSimulatorScreen').then(module => ({
  default: module.OpenLockerPudoSimulatorScreen,
})));
const DroneLockerOpsScreen = React.lazy(() => import('./components/DroneLockerOpsScreen').then(module => ({
  default: module.DroneLockerOpsScreen,
})));
const OpenSourceHomeScreen = React.lazy(() => import('./components/OpenSourceHomeScreen').then(module => ({
  default: module.OpenSourceHomeScreen,
})));

function RouteLoadingShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-200">AGID</p>
        <p className="mt-1 text-sm font-bold text-white/80">Loading workspace...</p>
      </div>
    </div>
  );
}

function isPosRoute() {
  return window.location.pathname === '/pos' || window.location.hash === '#/pos';
}

function isFieldRoute() {
  return window.location.pathname === '/field' || window.location.hash === '#/field';
}

function isHotelRoute() {
  return window.location.pathname === '/hotel' || window.location.hash === '#/hotel';
}

function isOracleOperaRoute() {
  return window.location.pathname === '/opera' || window.location.hash === '#/opera';
}

function isSettingsRoute() {
  return window.location.pathname === '/settings' || window.location.hash === '#/settings';
}

function isPortalRoute() {
  return window.location.pathname === '/portal' || window.location.hash === '#/portal';
}

function isDashboardRoute() {
  return window.location.pathname === '/dashboard' || window.location.hash === '#/dashboard';
}

function isDeveloperRoute() {
  return window.location.pathname === '/developer' || window.location.hash === '#/developer';
}

function isAddressElementRoute() {
  return window.location.pathname === '/element' || window.location.hash === '#/element';
}

function isEvidenceRoute() {
  return window.location.pathname === '/evidence' || window.location.hash === '#/evidence';
}

function isResearchRoute() {
  return window.location.pathname === '/research' || window.location.hash === '#/research';
}

function isPostalZoneDesignerRoute() {
  return window.location.pathname === '/postal-zones' || window.location.hash === '#/postal-zones';
}

function isMachineRoute() {
  return window.location.pathname === '/machine' || window.location.hash === '#/machine';
}

function isOpenLockerPudoRoute() {
  return window.location.pathname === '/locker' || window.location.hash === '#/locker';
}

function isDroneLockerOpsRoute() {
  return window.location.pathname === '/ops' || window.location.hash === '#/ops';
}

function isOpenSourceRoute() {
  return window.location.pathname === '/open-source' || window.location.hash === '#/open-source';
}

type RouteSnapshot = {
  pos: boolean;
  field: boolean;
  hotel: boolean;
  opera: boolean;
  settings: boolean;
  portal: boolean;
  dashboard: boolean;
  developer: boolean;
  element: boolean;
  evidence: boolean;
  research: boolean;
  postalZones: boolean;
  machine: boolean;
  locker: boolean;
  ops: boolean;
  openSource: boolean;
};

function readRouteSnapshot(): RouteSnapshot {
  return {
    pos: isPosRoute(),
    field: isFieldRoute(),
    hotel: isHotelRoute(),
    opera: isOracleOperaRoute(),
    settings: isSettingsRoute(),
    portal: isPortalRoute(),
    dashboard: isDashboardRoute(),
    developer: isDeveloperRoute(),
    element: isAddressElementRoute(),
    evidence: isEvidenceRoute(),
    research: isResearchRoute(),
    postalZones: isPostalZoneDesignerRoute(),
    machine: isMachineRoute(),
    locker: isOpenLockerPudoRoute(),
    ops: isDroneLockerOpsRoute(),
    openSource: isOpenSourceRoute(),
  };
}

function routeDesignKey(route: RouteSnapshot): AgidDesignRouteKey {
  if (route.pos) return 'pos';
  if (route.field) return 'field';
  if (route.hotel) return 'hotel';
  if (route.opera) return 'opera';
  if (route.settings) return 'settings';
  if (route.portal) return 'portal';
  if (route.dashboard) return 'dashboard';
  if (route.developer) return 'developer';
  if (route.element) return 'element';
  if (route.evidence) return 'evidence';
  if (route.research) return 'research';
  if (route.postalZones) return 'postal-zones';
  if (route.machine) return 'machine';
  if (route.locker) return 'locker';
  if (route.ops) return 'ops';
  if (route.openSource) return 'open-source';
  return 'map';
}

function routeSurface(route: RouteSnapshot): FieldActionSurface {
  const routeKey = routeDesignKey(route);
  return routeKey === 'open-source' ? 'map' : routeKey;
}

function shouldShowFieldActionBar(route: RouteSnapshot) {
  return shouldShowAgidFieldActionBar(routeDesignKey(route));
}

export default function RootApp() {
  const [route, setRoute] = React.useState(readRouteSnapshot);

  React.useEffect(() => {
    const handleNavigation = () => setRoute(readRouteSnapshot());
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('agid:navigation', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('agid:navigation', handleNavigation);
    };
  }, []);

  return (
    <>
      <PwaStatusBar />
      {shouldShowFieldActionBar(route) && <FieldActionBar surface={routeSurface(route)} />}
      <React.Suspense fallback={<RouteLoadingShell />}>
        {route.openSource
          ? <OpenSourceHomeScreen />
          : route.pos
          ? <PosAppScreen />
          : route.field
            ? <FieldHandoffAppScreen />
            : route.hotel
              ? <HotelCheckInScreen />
              : route.opera
                ? <OracleOperaHotelAddressScreen />
                : route.settings
                  ? <SettingsPolicyCenterScreen />
                  : route.portal
                    ? <AddressPortalScreen />
                    : route.dashboard
                      ? <AddressDashboardScreen />
                      : route.developer
                        ? <DeveloperConsoleScreen />
                        : route.element
                          ? <AddressElementPlaygroundScreen />
                          : route.evidence
                            ? <EvidenceVaultScreen />
                            : route.research
                              ? <ResearchDesignHubScreen />
                              : route.postalZones
                                ? <PostalZoneDesignerScreen />
                                : route.machine
                                  ? <MachineCommsScreen />
                                  : route.locker
                                    ? <OpenLockerPudoSimulatorScreen />
                                    : route.ops
                                      ? <DroneLockerOpsScreen />
                                      : <App />}
      </React.Suspense>
    </>
  );
}
