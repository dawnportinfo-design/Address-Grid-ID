import React from 'react';

import {
loadAppDatabaseSnapshot,
persistAoids,
persistRegisteredAddresses,
persistSavedAgids,
persistSavedQrs,
} from '../lib/appDatabase';
import type { RegisteredAddressRecord } from '../lib/registeredAddressQr';

type AppDatabasePersistenceOptions = {
  savedAgids: any[];
  setSavedAgids: React.Dispatch<React.SetStateAction<any[]>>;
  savedQrs: any[];
  setSavedQrs: React.Dispatch<React.SetStateAction<any[]>>;
  registeredAddresses: RegisteredAddressRecord[];
  setRegisteredAddresses: React.Dispatch<React.SetStateAction<RegisteredAddressRecord[]>>;
  aoids: any[];
  setAoids: React.Dispatch<React.SetStateAction<any[]>>;
};

export function useAppDatabasePersistence({
  savedAgids,
  setSavedAgids,
  savedQrs,
  setSavedQrs,
  registeredAddresses,
  setRegisteredAddresses,
  aoids,
  setAoids,
}: AppDatabasePersistenceOptions) {
  const [isAppDatabaseHydrated, setIsAppDatabaseHydrated] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    loadAppDatabaseSnapshot({
      savedAgids,
      savedQrs,
      registeredAddresses,
      aoids,
    }).then(snapshot => {
      if (cancelled) return;

      setSavedAgids(snapshot.savedAgids);
      setSavedQrs(snapshot.savedQrs);
      setRegisteredAddresses(snapshot.registeredAddresses);
      setAoids(snapshot.aoids);
      setIsAppDatabaseHydrated(true);
    }).catch(error => {
      console.warn('[AGID DB] Failed to hydrate app database:', error);
      if (!cancelled) setIsAppDatabaseHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('saved_agids', JSON.stringify(savedAgids));
    if (isAppDatabaseHydrated) void persistSavedAgids(savedAgids);
  }, [savedAgids, isAppDatabaseHydrated]);

  React.useEffect(() => {
    localStorage.setItem('saved_qrs', JSON.stringify(savedQrs));
    if (isAppDatabaseHydrated) void persistSavedQrs(savedQrs);
  }, [savedQrs, isAppDatabaseHydrated]);

  React.useEffect(() => {
    const saved = localStorage.getItem('agid_grid_aoids');
    if (saved) {
      try {
        setAoids(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load AOIDs', error);
      }
    }
  }, [setAoids]);

  React.useEffect(() => {
    localStorage.setItem('agid_grid_aoids', JSON.stringify(aoids));
    if (isAppDatabaseHydrated) void persistAoids(aoids);
  }, [aoids, isAppDatabaseHydrated]);

  React.useEffect(() => {
    localStorage.setItem('agid_registered_addresses', JSON.stringify(registeredAddresses));
    if (isAppDatabaseHydrated) void persistRegisteredAddresses(registeredAddresses);
  }, [registeredAddresses, isAppDatabaseHydrated]);

  return isAppDatabaseHydrated;
}
