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

// Strava Endpoint Types

export type StravaActivity = {
  name: string;
  athlete: StravaActivityAthlete;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  type: string;
  id: string;
  start_date: string;
  timezone: string;
  start_latlng: Position[];
  end_latlng: Position[];
};

export type StravaActivityAthlete = {
  id: string;
};
