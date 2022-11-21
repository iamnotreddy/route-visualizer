import { Position } from 'geojson';

export type ActivityStreamResponse = {
  status: string;
  data: Array<Array<ActivityStream>>;
};

export type ActivityListResponse = {
  status: string;
  data: Array<Array<StravaActivity>>;
};

export type ActivityStream =
  | {
      type: 'latlng';
      data: Position[];
      series_type: string;
      original_size: number;
      resolution: string;
    }
  | {
      type: 'distance';
      data: number[];
      series_type: string;
      original_size: number;
      resolution: string;
    }
  | {
      type: 'heartrate';
      data: number[];
      series_type: string;
      original_size: number;
      resolution: string;
    }
  | {
      type: 'time';
      data: number[];
      series_type: string;
      original_size: number;
      resolution: string;
    };

export type RoutePoint = {
  heartRate: number;
  distance: number;
  time: number;
  routePoint?: Position;
};

// strava data mappers

export type LatLngStream = {
  data: Position[];
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
