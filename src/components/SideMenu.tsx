
import {
AppWindow,
Bookmark,
Boxes,
Building2,
ChevronDown,
ClipboardCheck,
Code2,
CreditCard,
FileText,
Grid3X3,
HelpCircle,
History,
Home as HomeIcon,
KeyRound,
LayoutDashboard,
Map as MapIcon,
PackageCheck,
Search,
Settings,
Share2,
Shield as ShieldIcon,
Truck,
UserRound,
X
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import React from 'react';
import {
  getAppSurfaceCopy,
  getAppSurfaces,
  getAppSurfaceStatusLabel,
  getAppSurfaceGroupLabel,
  getSideMenuPrimaryAppSurfaces,
  getSideMenuSecondaryAppSurfaceGroups,
  isAppSurfaceActive,
  isStandaloneAppSurface,
  type AppSurfaceDefinition,
} from '../lib/appNavigation';
import { cn } from '../lib/utils';

interface SideMenuProps {
  show: boolean;
  onClose: () => void;
  setSavedTab: (t: 'agid' | 'aoid') => void;
  setShowSaved: (s: boolean) => void;
  setAoidModeForced: (f: boolean) => void;
  setShowAddressRegistration: (r: boolean) => void;
  setShowHistory: (h: boolean) => void;
  setShowSettings: (s: boolean) => void;
  setSettingsTab: (t: string) => void;
  handleShare: () => void;
  isSearchVisible: boolean;
  setSearchVisible: (v: boolean) => void;
  appLanguage: string;
  setAppLanguage: (l: string) => void;
  t: (key: any) => string;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  show,
  onClose,
  setSavedTab,
  setShowSaved,
  setAoidModeForced,
  setShowAddressRegistration,
  setShowHistory,
  setShowSettings,
  setSettingsTab,
  handleShare,
  setSearchVisible,
  appLanguage,
  t
}) => {
  const appSurfaces = React.useMemo(() => getAppSurfaces(), []);
  const primaryAppSurfaces = React.useMemo(() => getSideMenuPrimaryAppSurfaces(appSurfaces), [appSurfaces]);
  const secondaryAppGroups = React.useMemo(() => getSideMenuSecondaryAppSurfaceGroups(appSurfaces), [appSurfaces]);
  const secondaryAppCount = React.useMemo(
    () => secondaryAppGroups.reduce((total, item) => total + item.surfaces.length, 0),
    [secondaryAppGroups],
  );
  const [showAllApps, setShowAllApps] = React.useState(false);
  const [showTools, setShowTools] = React.useState(false);

  const iconForSurface = (icon: string) => {
    const icons = {
      map: MapIcon,
      home: HomeIcon,
      key: KeyRound,
      settings: Settings,
      pos: CreditCard,
      truck: Truck,
      dashboard: LayoutDashboard,
      review: ClipboardCheck,
      code: Code2,
      element: AppWindow,
      vault: FileText,
      research: FileText,
      grid: Grid3X3,
      ops: Boxes,
      hotel: Building2,
      machine: Boxes,
    } as const;
    return icons[icon as keyof typeof icons] ?? AppWindow;
  };

  const handleAppSurfaceClick = (surface: AppSurfaceDefinition) => {
    if (surface.action === 'disabled' || surface.status === 'planned') return;

    if (surface.action === 'open-address-registration') {
      setAoidModeForced(false);
      setShowAddressRegistration(true);
      onClose();
      return;
    }

    if (surface.action === 'navigate' && surface.route) {
      window.location.href = surface.route;
      onClose();
    }
  };

  const renderSurfaceButton = (surface: AppSurfaceDefinition, variant: 'primary' | 'secondary') => {
    const SurfaceIcon = iconForSurface(surface.icon);
    const copy = getAppSurfaceCopy(surface, appLanguage);
    const active = isAppSurfaceActive(surface, window.location);
    const disabled = surface.action === 'disabled' || surface.status === 'planned';
    const primary = variant === 'primary';

    return (
      <motion.button
        key={surface.id}
        whileHover={disabled ? undefined : { x: primary ? 0 : 2, y: primary ? -1 : 0 }}
        disabled={disabled}
        onClick={() => handleAppSurfaceClick(surface)}
        title={`${copy.label} - ${copy.description}`}
        aria-label={`${copy.label}. ${copy.description}`}
        className={cn(
          "w-full rounded-xl border text-left transition-all",
          primary
            ? "min-h-[66px] px-2.5 py-2.5"
            : "min-h-[46px] px-2.5 py-2",
          primary ? "flex flex-col items-start justify-between gap-2" : "flex items-center gap-2.5",
          active
            ? "border-blue-200 bg-blue-50 shadow-sm"
            : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50",
          disabled && "cursor-not-allowed opacity-55 hover:border-slate-200/70 hover:bg-white"
        )}
      >
        <span className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border",
          primary ? "h-8 w-8" : "h-8 w-8",
          active ? "border-blue-200 bg-blue-100 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
        )}>
          <SurfaceIcon className="h-4 w-4" />
        </span>
        <span className={cn("min-w-0", primary ? "w-full" : "flex-1")}>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cn(
              "min-w-0 truncate font-black text-slate-900",
              primary ? "text-[12px]" : "text-[12px]"
            )}>
              {primary ? copy.shortLabel : copy.label}
            </span>
            {!primary && isStandaloneAppSurface(surface) && (
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                split
              </span>
            )}
          </span>
          {!primary && (
            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
              {copy.description}
            </span>
          )}
        </span>
        {primary && (
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]",
            surface.status === 'ready' && "bg-emerald-50 text-emerald-700",
            surface.status === 'partial' && "bg-amber-50 text-amber-700"
          )}>
            {getAppSurfaceStatusLabel(surface.status, appLanguage)}
          </span>
        )}
      </motion.button>
    );
  };

  const personalTools = [
    { icon: Bookmark, label: t('saved_locations'), color: "blue", onClick: () => { setSavedTab('agid'); setShowSaved(true); } },
    { icon: ShieldIcon, label: t('verified_aoids'), color: "emerald", onClick: () => { setSavedTab('aoid'); setShowSaved(true); } },
    { icon: Search, label: t('advanced_search'), color: "slate", onClick: () => setSearchVisible(true) },
    { icon: History, label: t('search_history'), color: "slate", onClick: () => setShowHistory(true) },
  ];

  const systemTools = [
    { icon: Settings, label: t('settings'), onClick: () => setShowSettings(true) },
    { icon: HelpCircle, label: t('help'), onClick: () => { setShowSettings(true); setSettingsTab('help'); } },
    { icon: Share2, label: t('share_app'), onClick: handleShare },
    { icon: UserRound, label: appLanguage?.startsWith('ja') ? 'ローカル設定' : 'Local prefs', onClick: () => { setShowSettings(true); setSettingsTab('main'); } },
  ];

  return (
    <AnimatePresence mode="wait">
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] pointer-events-auto"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 1 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[88vw] md:w-[22rem] bg-white/95 backdrop-blur-xl shadow-2xl z-[101] pointer-events-auto flex flex-col border-r border-white/20 md:rounded-r-[1.5rem]"
            role="dialog"
            aria-modal="true"
            aria-label={appLanguage?.startsWith('ja') ? 'AGID統合ナビゲーション' : 'AGID integrated navigation'}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
            }}
          >
            <div className="px-3 py-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/agid-logo.png"
                  alt="AGID"
                  className="h-8 w-auto max-w-[88px] object-contain"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">App Switcher</p>
                  <p className="truncate text-sm font-black text-slate-900">AGID Workspace</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label={appLanguage?.startsWith('ja') ? 'メニューを閉じる' : 'Close menu'}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
              <section className="space-y-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">Local-first shell</p>
                  <p className="mt-1 text-[11px] font-bold leading-snug text-blue-950">
                    {appLanguage?.startsWith('ja')
                      ? '現場・運用・研究/設計はヒーローに移動。ここは個人操作と開発入口に絞ります。'
                      : 'Field, operations, and research now live in the hero. This menu stays focused on personal and developer entry points.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="truncate px-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {appLanguage?.startsWith('ja') ? 'よく使うアプリ' : 'Pinned apps'}
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {primaryAppSurfaces.map(surface => renderSurfaceButton(surface, 'primary'))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    aria-expanded={showAllApps}
                    onClick={() => setShowAllApps(value => !value)}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                        <Grid3X3 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-slate-900">
                          {appLanguage?.startsWith('ja') ? 'その他のアプリ' : 'More apps'}
                        </span>
                        <span className="block truncate text-[10px] font-semibold text-slate-500">
                          {appLanguage?.startsWith('ja')
                            ? `日常の個人・開発アプリ ${secondaryAppCount}件`
                            : `${secondaryAppCount} personal and developer apps`}
                        </span>
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", showAllApps && "rotate-180")} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {showAllApps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-1">
                          {secondaryAppGroups.map(({ group, surfaces }) => (
                            <div key={group.id} className="space-y-1.5">
                              <h3 className="truncate px-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {getAppSurfaceGroupLabel(group.id, appLanguage)}
                              </h3>
                              <div className="grid grid-cols-1 gap-1">
                                {surfaces.map(surface => renderSurfaceButton(surface, 'secondary'))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              <section className="space-y-2">
                <button
                  type="button"
                  aria-expanded={showTools}
                  onClick={() => setShowTools(value => !value)}
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      <Settings className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-black text-slate-900">
                        {appLanguage?.startsWith('ja') ? 'ツール・設定' : 'Tools & settings'}
                      </span>
                      <span className="block truncate text-[10px] font-semibold text-slate-500">
                        {appLanguage?.startsWith('ja')
                          ? `${personalTools.length + systemTools.length}件の補助操作`
                          : `${personalTools.length + systemTools.length} support actions`}
                      </span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", showTools && "rotate-180")} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {showTools && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        <div className="space-y-1.5">
                          <h3 className="truncate px-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('personal_space')}</h3>
                          <div className="grid grid-cols-4 gap-1">
                            {personalTools.map((item, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ y: -1 }}
                                onClick={() => { item.onClick(); onClose(); }}
                                aria-label={item.label}
                                title={item.label}
                                className="min-h-[44px] w-full flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 hover:bg-slate-50 transition-all group"
                              >
                                <div className={cn(
                                  "transition-all",
                                  item.color === 'blue' ? "text-blue-600 group-hover:text-blue-700" :
                                  item.color === 'emerald' ? "text-emerald-600 group-hover:text-emerald-700" :
                                  "text-slate-400 group-hover:text-slate-900"
                                )}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="sr-only">{item.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="truncate px-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('system')}</h3>
                          <div className="grid grid-cols-4 gap-1">
                            {systemTools.map((item, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ y: -1 }}
                                onClick={() => { item.onClick(); onClose(); }}
                                aria-label={item.label}
                                title={item.label}
                                className="min-h-[44px] w-full flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 hover:bg-slate-50 transition-all group"
                              >
                                <div className="text-slate-400 group-hover:text-slate-900 transition-all">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="sr-only">{item.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
