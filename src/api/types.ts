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
    }
  | {
      type: 'velocity_smooth';
      data: number[];
      series_type: string;
      original_size: number;
      resolution: string;
    }
  | {
      type: 'grade_smooth';
      data: number[];
      series_type: string;
      original_size: number;
      resolution: string;
    }
  | {
      type: 'altitude';
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
  grade_smooth?: number;
  velocity_smooth?: number;
  altitude?: number;
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
  velocity_smooth: number[];
  grade_smooth: number[];
  altitude: number[];
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

export type DataPoint = {
  x: number;
  y: number;
};
