import { Position } from 'geojson';

export type RoutePoint = {
  heartRate: number;
  distance: number;
  time: number;
  routePoint?: Position;
};

// strava data mappers

export type StravaActivityStream = {
  latlng: LatLngStream;
  distance: GenericStream;
  heartrate: GenericStream;
  time: GenericStream;
};

export type LatLngStream = {
  data: Array<number[]>;
  series_type: string;
  original_size: number;
  resolution: string;
};

export type GenericStream = {
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
};

export type StravaRouteStream = {
  latlng: Position[];
  heartRate: number[];
  distance: number[];
  time: number[];
};
