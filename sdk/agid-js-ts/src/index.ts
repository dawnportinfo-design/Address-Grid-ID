export const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const AGID_PREFIX_LENGTH = 2;
export const AGID_HASH_LENGTH = 10;
export const AGID_TOTAL_LENGTH = 12;

export type AgidResult = {
  id: string;
  lat: number;
  lon: number;
  face?: number;
};

export function encode(_lat: number, _lon: number): AgidResult {
  throw new Error("wire this package to the AGID TypeScript reference implementation");
}

export function decode(_id: string): AgidResult | null {
  return null;
}
