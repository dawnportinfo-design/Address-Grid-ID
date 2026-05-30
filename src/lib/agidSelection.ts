import { decodeAGID } from './agid';

type AgidLike = {
  id?: string;
  lat?: number;
  lon?: number;
};

export function getAgidCoordinates(agid: AgidLike | null | undefined): { lat: number; lon: number } | null {
  if (!agid) return null;

  if (agid.id) {
    const decoded = decodeAGID(agid.id);
    if (decoded) {
      return { lat: decoded.lat, lon: decoded.lon };
    }
  }

  if (Number.isFinite(agid.lat) && Number.isFinite(agid.lon)) {
    return { lat: agid.lat as number, lon: agid.lon as number };
  }

  return null;
}
