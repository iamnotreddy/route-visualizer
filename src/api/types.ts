import { Position } from 'geojson';

export type ActivityStreamResponse = {
  status: string;
  data: Array<Array<ActivityStream>>;
};

export type ActivitySplitsResponse = {
  status: string;
  data: Array<Array<ActivitySplits>>;
};

export type ActivityListResponse = {
  status: string;
  data: Array<Array<StravaActivity>>;
};

export type ActivitySplits = {
  id: number;
  resource_state: number;
  name: string;
  activity: { id: number; resource_state: number };
  athlete: { id: number; resource_state: number };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  device_watts: boolean;
  average_heartrate: number;
  max_heartrate: number;
  lap_index: number;
  split: number;
  pace_zone: number;
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
