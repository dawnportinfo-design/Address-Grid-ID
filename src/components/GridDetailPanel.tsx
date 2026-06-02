
import {
ArrowUpRight,
Bookmark,
Check,
ChevronDown,
Copy,
Download,
Flag,
Key,
MapPin,
Maximize2,
QrCode,
Target,
Waves,
X,
Zap
} from 'lucide-react';
import type maplibregl from 'maplibre-gl';
import { AnimatePresence,motion } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';
import { getAddressFormat,type AddressFormat } from '../data/address_formats';
import { assessAddressDisplayQuality,formatAddressDisplayText,shouldPreserveAddressDisplayLines } from '../lib/addressDisplay';
import { collectOpenSourceAddressEvidenceSources } from '../lib/addressEvidence';
import { AddressRenderer,createCanonicalAddress } from '../lib/addressRendering';
import { COUNTRY_LANGUAGES,generateInternationalShippingLabel,LANGUAGES } from '../lib/addressUtils';
import type { AGIDResult } from '../lib/agid';
import {
formatTerritoryClaimSummary,
getTerritoryClaimOptions,
type TerritoryClaimOption,
} from '../lib/disputedTerritoryClaims';
import {
getAgidAddressDisplayTabs,
getAgidAddressTabLanguages,
isInternationalShippingEnglishTab,
} from '../lib/languageTabs';
import { cn } from '../lib/utils';
import { executeVerifiedAddressTranslationSync } from '../lib/verifiedAddressTranslation';
import type { AddressDetails } from '../types/address';
import type { RouteStop } from '../types/navigation';
import { AddressLanguageTabs } from './AddressLanguageTabs';
import { AddressQualitySummary } from './AddressQualitySummary';

interface GridDetailPanelProps {
  clickedAgid: AGIDResult | null;
  isAgidPanelCollapsed: boolean;
  setIsAgidPanelCollapsed: (c: boolean) => void;
  isAgidPinnedToGps: boolean;
  setIsAgidPinnedToGps: (p: boolean) => void;
  isManualSelection: boolean;
  setIsManualSelection: (m: boolean) => void;
  setClickedAgid: (a: AGIDResult | null) => void;
  setClickedAddress: (addr: string) => void;
  isQrVisible: boolean;
  setIsQrVisible: (v: boolean) => void;
  clickedAddress: string;
  clickedAddressMap: Record<string, string>;
  clickedAddressTab: string;
  setClickedAddressTab: (t: string) => void;
  clickedAddressTranslated: string;
  clickedAddressDetails: AddressDetails | null;
  clickedActiveLangs: string[];
  copied: string | null;
  setCopied: (s: string | null) => void;
  userLocation: { lat: number, lng: number } | null;
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  mapPitch: number;
  getDeviceZoom: () => number;
  encodeAGID: (lat: number, lng: number) => AGIDResult;
  reverseGeocode: (lat: number, lng: number, prefix: string, isSea: boolean, force?: boolean) => void;
  fetchAddressForLang: (lat: number, lon: number, langCode: string, isNative: boolean, countryCode: string, force?: boolean) => void;
  saveAgid: (agid: AGIDResult) => void;
  setShowLocationAnalysis: (s: boolean) => void;
  showLocationAnalysis: boolean;
  saveQrCode: () => void;
  setDestination: React.Dispatch<React.SetStateAction<RouteStop | null>>;
  setDestinationQuery: (q: string) => void;
  setIsRoutePlanning: (r: boolean) => void;
  setIsNavigating: (n: boolean) => void;
  setOrigin: React.Dispatch<React.SetStateAction<RouteStop | null>>;
  setOriginQuery: (q: string) => void;
  fastJapaneseTransliterate: (text: string) => string;
  showAlert: (title: string, message: string) => void;
  showPostalCodeLab: boolean;
  setShowPostalCodeLab: (s: boolean) => void;
  showGeoArchitect: boolean;
  setShowGeoArchitect: (s: boolean) => void;
  t: (key: string) => string;
}

export const GridDetailPanel: React.FC<GridDetailPanelProps> = ({
  clickedAgid,
  isAgidPanelCollapsed,
  setIsAgidPanelCollapsed,
  isAgidPinnedToGps,
  setIsAgidPinnedToGps,
  setIsManualSelection,
  setClickedAgid,
  setClickedAddress,
  isQrVisible,
  setIsQrVisible,
  clickedAddress,
  clickedAddressMap,
  clickedAddressTab,
  setClickedAddressTab,
  clickedAddressTranslated,
  clickedAddressDetails,
  copied,
  setCopied,
  userLocation,
  mapRef,
  mapPitch,
  getDeviceZoom,
  encodeAGID,
  reverseGeocode,
  saveAgid,
  setShowLocationAnalysis,
  showLocationAnalysis,
  saveQrCode,
  setDestination,
  setDestinationQuery,
  setIsRoutePlanning,
  setIsNavigating,
  setOrigin,
  setOriginQuery,
  fastJapaneseTransliterate,
  showAlert,
  t
}) => {
  const [shippingLabel, setShippingLabel] = React.useState<string>("");
  const [addressFormat, setAddressFormat] = React.useState<AddressFormat | null>(null);
  const [selectedTerritoryClaimId, setSelectedTerritoryClaimId] = React.useState<string | null>(null);

  // Move derived constants and hooks to the top to satisfy Rules of Hooks
  const regionCodeFromAgid = (!clickedAgid?.isSea && clickedAgid?.regionCode ? clickedAgid.regionCode : "").toLowerCase();
  const countryCodeFromPrefix = (clickedAgid?.prefix || "").toLowerCase();
  const countryCodeFromId = (clickedAgid?.id?.slice(0, 2) || "").toLowerCase();
  const countryCodeFromDetails = (clickedAddressDetails?.country_code || "").toLowerCase();
  const countryCode = regionCodeFromAgid || countryCodeFromDetails || countryCodeFromPrefix || countryCodeFromId || "";
  const territoryClaimOptions = React.useMemo(() => getTerritoryClaimOptions({
    regionCode: clickedAgid?.regionCode,
    countryCode,
    regionName: clickedAgid?.regionName || clickedAddressDetails?.country,
  }), [clickedAgid?.regionCode, clickedAgid?.regionName, clickedAddressDetails?.country, countryCode]);
  
  const officialLangs = React.useMemo(() => {
    const formatLanguages = addressFormat?.addressRules?.languages
      ?.map(language => language.code)
      .filter(Boolean) || [];
    if (territoryClaimOptions.length > 0 && formatLanguages.length > 0) {
      return formatLanguages;
    }

    return getAgidAddressTabLanguages({
      countryCode: countryCode || countryCodeFromDetails,
      countryLanguages: COUNTRY_LANGUAGES[countryCode] || ['en'],
      knownLanguageCodes: LANGUAGES.map(lang => lang.code),
    });
  }, [addressFormat, countryCode, countryCodeFromDetails, territoryClaimOptions.length]);

  const displayTabs = React.useMemo(() => {
    return getAgidAddressDisplayTabs(officialLangs);
  }, [officialLangs]);

  React.useEffect(() => {
    let cancelled = false;
    if (!countryCode) {
      setAddressFormat(null);
      return;
    }

    getAddressFormat(countryCode)
      .then(format => {
        if (!cancelled) setAddressFormat(format);
      })
      .catch(() => {
        if (!cancelled) setAddressFormat(null);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  React.useEffect(() => {
    if (territoryClaimOptions.length === 0) {
      if (selectedTerritoryClaimId !== null) setSelectedTerritoryClaimId(null);
      return;
    }
    if (!selectedTerritoryClaimId || !territoryClaimOptions.some(option => option.id === selectedTerritoryClaimId)) {
      setSelectedTerritoryClaimId(territoryClaimOptions[0].id);
    }
  }, [selectedTerritoryClaimId, territoryClaimOptions]);

  const verifiedAddressTranslation = React.useMemo(() => {
    if (!clickedAddressDetails) return null;
    try {
      const evidenceSources = collectOpenSourceAddressEvidenceSources(clickedAddressDetails);
      return executeVerifiedAddressTranslationSync({
        countryCode,
        language: clickedAddressTab,
        details: clickedAddressDetails as unknown as Record<string, unknown>,
        format: addressFormat,
        sources: [
          ...(clickedAddressDetails?.address_analysis?.sources || []),
          ...evidenceSources,
        ],
        referenceMatches: clickedAddressDetails?.address_analysis?.referenceMatches || clickedAddressDetails?.openaddresses_matches || [],
      });
    } catch (error) {
      console.warn('Verified address translation fallback:', error);
      return null;
    }
  }, [clickedAddressDetails, addressFormat, countryCode, clickedAddressTab]);
  const addressValidation = verifiedAddressTranslation?.validation || null;

  React.useEffect(() => {
    if (clickedAddressTab === 'shipping_label' && clickedAddressDetails) {
      generateInternationalShippingLabel(clickedAddressDetails)
        .then(setShippingLabel)
        .catch(() => {
          setShippingLabel("Address label unavailable");
        });
    }
  }, [clickedAddressTab, clickedAddressDetails]);

  // If current tab is not in display list (e.g. was 'local'), default to the first official lang
  React.useEffect(() => {
    if (!clickedAgid) return;
    if (clickedAddressTab === 'local' || !displayTabs.includes(clickedAddressTab)) {
      if (displayTabs.length > 0 && !isInternationalShippingEnglishTab(clickedAddressTab) && clickedAddressTab !== 'shipping_label') {
        setClickedAddressTab(displayTabs[0]);
      }
    }
  }, [clickedAgid, clickedAddressTab, displayTabs, setClickedAddressTab]);

  if (!clickedAgid) return null;

  const getAddressDisplay = () => {
    if (clickedAddressTab === 'shipping_label') {
      return verifiedAddressTranslation?.renderings.shippingLabel || shippingLabel || "Generating shipping label...";
    }

    if (clickedAddressDetails && verifiedAddressTranslation) {
      if (clickedAddressTab === 'en' || isInternationalShippingEnglishTab(clickedAddressTab)) {
        return verifiedAddressTranslation.renderings.internationalEnglish;
      }
      if (!clickedAddressTab.startsWith('en') && verifiedAddressTranslation.renderings.native) {
        return verifiedAddressTranslation.renderings.native;
      }
    }

    if (clickedAddressDetails) {
      const canonical = createCanonicalAddress(clickedAddressDetails);
      if (clickedAddressTab === 'en' || isInternationalShippingEnglishTab(clickedAddressTab)) {
        return AddressRenderer.renderInternationalShippingEnglish(canonical);
      }
      if (!clickedAddressTab.startsWith('en') && addressValidation?.displays.native) {
        return addressValidation.displays.native;
      }
      return AddressRenderer.render(clickedAddressTab, canonical);
    }

    return clickedAddressMap[clickedAddressTab] || 
           (clickedAddressTab === 'en' ? (fastJapaneseTransliterate(clickedAddress) || "Translating...") : clickedAddress) || 
           "Resolving...";
  };

  const getFallbackAddressDisplay = () =>
    clickedAddressMap[clickedAddressTab] ||
    clickedAddress ||
    clickedAgid?.id ||
    "Address unavailable";

  const safeAddressDisplay = () => {
    try {
      return getAddressDisplay();
    } catch (error) {
      console.warn('Address display fallback:', error);
      return getFallbackAddressDisplay();
    }
  };

  const rawAddressDisplay = safeAddressDisplay();
  const addressQuality = assessAddressDisplayQuality(rawAddressDisplay, {
    country: clickedAddressDetails?.country,
    countryCode,
    missingRequiredFields: addressValidation?.missingRequiredFields,
  });
  const resolvedAddressDisplay = (() => {
    try {
      return addressQuality.isWeak && clickedAddressDetails
        ? AddressRenderer.renderPartialAddress(clickedAddressTab, createCanonicalAddress(clickedAddressDetails))
        : rawAddressDisplay;
    } catch (error) {
      console.warn('Address display fallback:', error);
      return rawAddressDisplay || getFallbackAddressDisplay();
    }
  })();
  const addressDisplayText = formatAddressDisplayText(resolvedAddressDisplay, { tab: clickedAddressTab });
  const preserveAddressDisplayLines = shouldPreserveAddressDisplayLines(clickedAddressTab);
  const selectedTerritoryClaim: TerritoryClaimOption | null =
    territoryClaimOptions.find(option => option.id === selectedTerritoryClaimId) || territoryClaimOptions[0] || null;

  return (
    <motion.div 
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      className={cn(
        "bg-slate-900/90 backdrop-blur-xl shadow-2xl border pointer-events-auto text-white transition-all duration-500 overflow-hidden mx-auto",
        clickedAgid.id.startsWith('IN') ? "border-orange-500/30" : clickedAgid.id.startsWith('ZA') ? "border-green-500/30" : "border-slate-800",
        isAgidPanelCollapsed 
           ? "w-14 h-14 rounded-xl flex items-center justify-center p-0 cursor-pointer hover:bg-slate-800 hover:scale-110 active:scale-95 shadow-red-500/20 shadow-lg" 
           : "w-full rounded-2xl p-4"
      )}
      onClick={isAgidPanelCollapsed ? () => setIsAgidPanelCollapsed(false) : undefined}
    >
      <div className={cn("flex flex-col gap-2 w-full h-full", isAgidPanelCollapsed && "items-center justify-center")}>
        {isAgidPanelCollapsed ? (
           <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center"
           >
               <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
                <div className={cn(
                  "absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full animate-pulse",
                  isAgidPinnedToGps ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                )} />
               </div>
           </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="p-1.5 bg-red-500/10 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-red-400/90 truncate max-w-[150px]">
                  {clickedAgid.isSea ? t('agid_code') : t('country_code')}
                </span>
                {isAgidPinnedToGps && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full animate-pulse">
                    <Target className="w-2 h-2 text-amber-500" />
                    <span className="text-[7px] font-black uppercase text-amber-500 tracking-tighter">GPS Locked</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsAgidPanelCollapsed(true); }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"
                  title="Collapse"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                     e.stopPropagation();
                     setIsManualSelection(false);
                     if (mapRef.current) {
                       setClickedAgid(null);
                       setClickedAddress("");
                     }
                     setIsQrVisible(false);
                     setIsAgidPanelCollapsed(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between gap-3 px-0.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <motion.div 
                    layoutId="agid-text"
                    className="font-black text-white tracking-widest font-mono truncate text-lg"
                  >
                    {clickedAgid.id}
                  </motion.div>
                  <button 
                    onClick={() => {
                       const addr = clickedAddressTab === 'translated' ? clickedAddressTranslated : clickedAddressMap[clickedAddressTab] || clickedAddress;
                       const fullText = `${clickedAgid.id}${addr ? ` (${addr})` : ''}`;
                       navigator.clipboard.writeText(fullText);
                       setCopied('agid');
                       setTimeout(() => setCopied(null), 2000);
                    }}
                    className="p-1 hover:bg-white/10 text-slate-400 rounded-lg transition-all active:scale-95"
                    title="Copy ID & Address"
                  >
                    {copied === 'agid' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </div>
                
                <div className="flex items-center gap-0.5 font-mono">
                  <button 
                    onClick={() => {
                       if (mapRef.current && clickedAgid) {
                         mapRef.current.flyTo({
                           center: [(clickedAgid.bounds.minLon + clickedAgid.bounds.maxLon) / 2, (clickedAgid.bounds.minLat + clickedAgid.bounds.maxLat) / 2],
                           zoom: getDeviceZoom(),
                           pitch: mapPitch,
                           essential: true
                         });
                       }
                    }}
                    className="p-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all"
                    title="Zoom to location"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       const next = !isAgidPinnedToGps;
                       setIsAgidPinnedToGps(next);
                       if (next && userLocation) {
                         const result = encodeAGID(userLocation.lat, userLocation.lng);
                         setClickedAgid(result);
                         showAlert("AGID Locked", "Pinning current location...");
                         reverseGeocode(userLocation.lat, userLocation.lng, result.prefix, result.isSea, true);
                       } else if (!next) {
                         showAlert("AGID Unlocked", "Selection unlocked.");
                       }
                    }}
                    className={cn(
                       "p-1 rounded-lg transition-all border",
                       isAgidPinnedToGps 
                        ? "bg-amber-600/30 text-amber-400 border-amber-500/40 animate-pulse" 
                        : "bg-white/5 hover:bg-white/10 text-slate-400 border-white/5"
                    )}
                    title={isAgidPinnedToGps ? "Unlock AGID" : "Lock to GPS"}
                  >
                    <Key className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => setIsQrVisible(!isQrVisible)}
                    className={cn(
                       "p-1 rounded-lg transition-all border",
                       isQrVisible 
                        ? "bg-purple-600/30 text-purple-400 border-purple-500/40" 
                        : "bg-white/5 hover:bg-white/10 text-slate-400 border-white/5"
                    )}
                    title="Show QR Code"
                  >
                    <QrCode className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => {
                       const lat = (clickedAgid.bounds.minLat + clickedAgid.bounds.maxLat) / 2;
                       const lng = (clickedAgid.bounds.minLon + clickedAgid.bounds.maxLon) / 2;
                       const name = clickedAddress || clickedAgid.id;
                       setDestination({ lat, lng, name });
                       setDestinationQuery(name);
                       setIsRoutePlanning(true);
                       setIsNavigating(true);
                       if (userLocation) {
                         setOrigin({ ...userLocation, name: "My Location" });
                         setOriginQuery("My Location");
                       }
                    }}
                    className="p-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/30 active:scale-95"
                    title="Get Directions"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('get_directions')}</span>
                  </button>
                </div>
               </div>

               <motion.div 
                key="expanded-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
               >
                 {/* Territory Info */}
                 {clickedAgid.isSea && clickedAgid.regionName && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                      <Waves className="w-2.5 h-2.5 text-blue-400" />
                      <span className="text-[9px] font-black text-blue-200">{clickedAgid.regionName}</span>
                    </div>
                 )}
 
                 {/* Address Area */}
                 <div className="group relative bg-white/5 rounded-2xl p-3 border border-white/10 hover:bg-white/[0.08] transition-colors">
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <AddressLanguageTabs
                          tabs={displayTabs}
                          activeTab={clickedAddressTab}
                          countryCode={countryCode}
                          onSelect={setClickedAddressTab}
                        />
                      </div>
                      {territoryClaimOptions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {territoryClaimOptions.map(option => {
                            const isActive = selectedTerritoryClaim?.id === option.id;
                            return (
                              <button
                                key={option.id}
                                onClick={() => setSelectedTerritoryClaimId(option.id)}
                                className={cn(
                                  "px-2 py-1 rounded-lg text-[8px] font-black transition-all flex items-center gap-1.5 border",
                                  isActive
                                    ? "bg-amber-400 text-slate-950 border-amber-300"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                                )}
                                title={option.label}
                              >
                                <Flag className="w-2.5 h-2.5" />
                                <span>{option.shortLabel}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="text-[11px] font-medium text-slate-200 leading-snug min-h-[2.5em] space-y-2">
                         <div className={cn(
                           "p-2 rounded-lg border border-white/5 font-mono text-[10px] leading-relaxed",
                           preserveAddressDisplayLines ? "whitespace-pre-line" : "whitespace-normal",
                           (clickedAddressTab === 'en' || isInternationalShippingEnglishTab(clickedAddressTab) || clickedAddressTab === 'ascii' || clickedAddressTab === 'shipping_label') ? "bg-slate-800/80 uppercase" : "bg-white/5"
                         )}>
                           {addressDisplayText}
                         </div>
                         {selectedTerritoryClaim && (
                           <div className="rounded-lg border border-amber-400/15 bg-amber-400/10 px-2 py-1.5 text-[9px] font-bold leading-snug text-amber-100">
                             <div className="mb-0.5 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-amber-300">
                               <Flag className="w-2.5 h-2.5" />
                               <span>{selectedTerritoryClaim.label}</span>
                             </div>
                             <div>{formatTerritoryClaimSummary(selectedTerritoryClaim)}</div>
                           </div>
                         )}
                         {addressValidation && <AddressQualitySummary validation={addressValidation} />}
                      </div>

                     <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
                        <button onClick={() => saveAgid(clickedAgid)} className="p-1.5 bg-white/5 rounded-lg text-slate-500" title="Save AGID"><Bookmark className="w-3 h-3" /></button>
                        <button onClick={() => setShowLocationAnalysis(!showLocationAnalysis)} className="p-1.5 bg-white/5 rounded-lg text-slate-500" title="Location Analysis"><Zap className="w-3 h-3" /></button>
                        <button onClick={() => setIsQrVisible(!isQrVisible)} className="p-1.5 bg-white/5 rounded-lg text-slate-500" title="QR Code"><QrCode className="w-3 h-3" /></button>
                     </div>
                  </div>
                 </div>

                 <AnimatePresence>
                  {isQrVisible && (
                     <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-white rounded-[2rem] p-5 flex flex-col items-center gap-3 mt-3"
                     >
                        <div className="p-3 bg-slate-50 rounded-2xl shadow-inner">
                         <QRCodeCanvas value={clickedAgid.id} size={120} level="H" includeMargin={false} id="agid-qr-canvas" />
                        </div>
                        <button onClick={saveQrCode} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-slate-200">
                         <Download className="w-2.5 h-2.5" /> Save QR
                        </button>
                     </motion.div>
                  )}
                 </AnimatePresence>
               </motion.div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
