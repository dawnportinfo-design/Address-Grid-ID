export type Coordinates = {
  lat: number;
  lng: number;
};

export type NamedCoordinates = Coordinates & {
  name?: string;
};

export type RouteStop = Coordinates & {
  name: string;
};

export type NearestRoad = {
  name: string;
  type: string;
  distance: number;
  point: [number, number];
  geometry: [number, number][];
};

export type PhotonFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    city?: string;
    country?: string;
    state?: string;
    postcode?: string;
    [key: string]: unknown;
  };
};

export type SearchResultFeature = {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  source?: string;
  matched_query?: string;
  morphism_status?: 'verified' | 'ambiguous' | 'unresolved' | string;
  [key: string]: unknown;
};

export type OsrmRoute = {
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  distance: number;
  duration: number;
};

export type RouteLineProperties = {
  distance: number;
  duration: number;
  bearing: number;
  method: string;
  mode?: string;
  [key: string]: unknown;
};

export type RoutePointProperties = {
  type: 'start' | 'end' | string;
  [key: string]: unknown;
};

export type RouteFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<
    | {
        type: 'Feature';
        geometry: {
          type: 'LineString';
          coordinates: number[][];
        };
        properties: RouteLineProperties;
      }
    | {
        type: 'Feature';
        geometry: {
        type: 'Point';
          coordinates: number[];
        };
        properties: RoutePointProperties;
      }
  >;
};
