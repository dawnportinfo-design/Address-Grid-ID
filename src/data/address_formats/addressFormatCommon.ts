export type AddressFormatSourceHydration = {
  openSourceIds?: string[];
  addressRules?: {
    openSourceIds?: string[];
  } | null;
};

function uniqueSourceIds(sourceIds: readonly string[] | undefined) {
  return Array.from(new Set(sourceIds ?? []));
}

export function hydrateAddressFormat<T extends AddressFormatSourceHydration>(format: T): T {
  const openSourceIds = uniqueSourceIds([
    ...(format.openSourceIds ?? []),
    ...(format.addressRules?.openSourceIds ?? []),
  ]);

  if (openSourceIds.length > 0) {
    format.openSourceIds = openSourceIds;
    if (format.addressRules) {
      format.addressRules.openSourceIds = openSourceIds;
    }
  }

  return format;
}
