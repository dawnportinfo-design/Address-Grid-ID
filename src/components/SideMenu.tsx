
import {
  AppWindow,
  ChevronDown,
  Compass,
  Home as HomeIcon,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import React from 'react';
import {
  getAppSurfaceCopy,
  getAppSurfaces,
  getAppSurfaceStatusLabel,
  getSideMenuPrimaryAppSurfaces,
  getSideMenuStoreAppSurfaces,
  isAppSurfaceActive,
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
  setAoidModeForced,
  setShowAddressRegistration,
  appLanguage,
}) => {
  const appSurfaces = React.useMemo(() => getAppSurfaces(), []);
  const primaryAppSurfaces = React.useMemo(() => getSideMenuPrimaryAppSurfaces(appSurfaces), [appSurfaces]);
  const storeAppSurfaces = React.useMemo(() => getSideMenuStoreAppSurfaces(appSurfaces), [appSurfaces]);

  const iconForSurface = (icon: string) => {
    const icons = {
      map: HomeIcon,
      key: UserRound,
      friends: Users,
      topics: Sparkles,
      discover: Compass,
      'my-stores': ShoppingBag,
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
            ? "min-h-[52px] px-3 py-2"
            : "min-h-[42px] px-2.5 py-2",
          "flex items-center gap-2.5",
          active
            ? "border-blue-200 bg-blue-50 shadow-sm"
            : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50",
          disabled && "cursor-not-allowed opacity-55 hover:border-slate-200/70 hover:bg-white"
        )}
      >
        <span className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border",
          "h-8 w-8",
          active ? "border-blue-200 bg-blue-100 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
        )}>
          <SurfaceIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cn(
              "min-w-0 truncate font-black text-slate-900",
              primary ? "text-[13px]" : "text-[12px]"
            )}>
              {primary ? copy.label : copy.label}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
            {copy.description}
          </span>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Address Wallet OS</p>
                  <p className="truncate text-sm font-black text-slate-900">Veygrit</p>
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
                <div className="space-y-1.5">
                  <h3 className="truncate px-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {appLanguage?.startsWith('ja') ? 'メニュー' : 'Menu'}
                  </h3>
                  <div className="space-y-1.5">
                    {primaryAppSurfaces.slice(0, 2).map(surface => renderSurfaceButton(surface, 'primary'))}
                    <div className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-2">
                      <div className="flex min-h-[38px] items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                          <StoreIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-black text-slate-900">Store</div>
                          <div className="truncate text-[10px] font-semibold text-slate-500">
                            {appLanguage?.startsWith('ja') ? '住所対応サービス' : 'Address-connected services'}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      </div>
                      <div className="mt-2 space-y-1 pl-10">
                        {storeAppSurfaces.map(surface => renderSurfaceButton(surface, 'secondary'))}
                      </div>
                    </div>
                    {primaryAppSurfaces.slice(2).map(surface => renderSurfaceButton(surface, 'primary'))}
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
