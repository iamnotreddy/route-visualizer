import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ViewState } from 'react-map-gl';

export type ActivityContextType = {
  refetchActivityStream: () => void;
  isActivityStreamFetching: boolean;
  showActivityDetail: boolean;
  setShowActivityDetail: Dispatch<SetStateAction<boolean>>;
  currentActivity: StravaActivity | undefined;
  setCurrentActivity: Dispatch<SetStateAction<StravaActivity | undefined>>;
  // animation props
  animationState: string;
  currentFrame: number;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
  setViewState: Dispatch<SetStateAction<ViewState | undefined>>;
  setCurrentPoint: (currentPoint: Position) => void;
  setCurrentFrame: (currentFrame: number) => void;
  handleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
  stravaPath: StravaRouteStream | undefined;
};

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
    }
  | {
      type: 'cadence';
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
  cadence?: number;
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
  heartrate: number[];
  distance: number[];
  time: number[];
  velocity_smooth: number[];
  grade_smooth: number[];
  altitude: number[];
  cadence: number[];
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
  start_latlng: Position;
  end_latlng: Position;
  map: {
    summary_polyline: string;
  };
  average_heartrate: number;
  total_elevation_gain: number;
};

export type StravaActivityAthlete = {
  id: string;
};

export type DataPoint = {
  x: number;
  y: number;
};

export type PolylineObj = {
  routeId: string;
  geoJsonObject: FeatureCollection<Geometry, GeoJsonProperties>;
};
