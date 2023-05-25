import polyline from '@mapbox/polyline';
import { bbox } from '@turf/turf';
import { Position } from 'geojson';
import { RefObject } from 'react';
import { MapRef } from 'react-map-gl';

import {
  ActivityStream,
  DataPoint,
  RoutePoint,
  StravaActivity,
  StravaRouteStream,
} from '@/helpers/types';

// returns [longitude, latitude] to account for mapbox quirk
export const reverseLatLng = (coordinates: Position[]) => {
  return coordinates.map((point: Position) => {
    return [point[1], point[0]];
  });
};

export const transformActivityStreamResponse = (
  data: Array<ActivityStream>
): StravaRouteStream => {
  const transformed: StravaRouteStream = {
    latlng: [],
    heartRate: [],
    distance: [],
    time: [],
    velocity_smooth: [],
    grade_smooth: [],
    altitude: [],
  };

  data.map((activity) => {
    if (activity.type == 'latlng') {
      transformed.latlng = reverseLatLng(activity.data);
    }
    if (activity.type == 'heartrate') {
      transformed.heartRate = activity.data;
    }
    if (activity.type == 'distance') {
      transformed.distance = activity.data;
    }
    if (activity.type == 'time') {
      transformed.time = activity.data;
    }
    if (activity.type == 'velocity_smooth') {
      transformed.velocity_smooth = activity.data;
    }
    if (activity.type == 'grade_smooth') {
      transformed.grade_smooth = activity.data;
    }
    if (activity.type == 'altitude') {
      transformed.altitude = activity.data;
    }
  });

  return transformed;
};

// convert pace from meters per second to miles per minute
export const computePace = (point: RoutePoint) => {
  const pace = point.time / 60 / (point.distance / 1609);
  const minStr = Math.floor(pace).toString();
  const secStr = Math.floor((pace % 1) * 60).toString();

  return minStr + ':' + secStr;
};

export const returnSampledFrame = (
  currentFrame: number,
  lastValidFrame: number,
  samplingRate?: number
) => {
  // if no sampling rate is provided, set default of 25
  if (!samplingRate) {
    samplingRate = 25;
  }

  // if current frame is greater than last sampling interval, return last frame of metric array
  if (lastValidFrame - currentFrame < samplingRate) {
    return lastValidFrame;
  }

  // only return if current frame hits sampling interval
  if (currentFrame % samplingRate == 0) {
    return Math.floor(currentFrame);
  }
};

// convert distance from meters to miles
export const metersToMiles = (miles: number) => {
  return (miles * 0.000621371).toFixed(2);
};

// convert time to hh:mm
export const formatTime = (time: number) => {
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  const displayMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
  const displaySeconds = seconds < 10 ? '0' + seconds : seconds.toString();

  let displayTime: string;

  if (hours < 1) {
    displayTime = displayMinutes + ':' + displaySeconds;
  } else {
    displayTime =
      hours.toString() + ':' + displayMinutes + ':' + displaySeconds;
  }
  return displayTime;
};

export const calculateDomain = (series: DataPoint[]) => {
  const seriesPoints = series.map((point) => point.y);
  const [minY, maxY] = [Math.min(...seriesPoints), Math.max(...seriesPoints)];

  const padding = 0.02;

  return [minY * (1 - padding), maxY * (1 + padding)];
};

export const transformMetricToDataPoint = (input: number[]): DataPoint[] => {
  return input.map((pt, idx) => ({
    x: idx,
    y: pt,
  }));
};

export const getRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return '#' + randomColor;
};

export const transformActivityList = (
  activities: StravaActivity[]
): StravaActivity[] => {
  const transformedActivities = activities.map((activity) => {
    const activityCopy = { ...activity };
    activityCopy.start_latlng = [
      activityCopy.start_latlng[1],
      activityCopy.start_latlng[0],
    ];
    activityCopy.end_latlng = [
      activityCopy.end_latlng[1],
      activityCopy.end_latlng[0],
    ];

    return activityCopy;
  });

  return transformedActivities;
};

export const getPolyLineCoordinates = (activity: StravaActivity) => {
  const decodedPolyLine = polyline.decode(activity.map.summary_polyline);
  const mapSourceCoordinates = decodedPolyLine.map(([lng, lat]) => [lat, lng]);
  return mapSourceCoordinates;
};

export const findGlobalMapViewState = (
  activity: StravaActivity,
  mapRef: RefObject<MapRef>
) => {
  const mapCoordinates = getPolyLineCoordinates(activity);
  const [minLng, minLat, maxLng, maxLat] = bbox({
    type: 'LineString',
    coordinates: mapCoordinates,
  });

  if (mapRef.current) {
    mapRef.current.flyTo({
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
      duration: 5000,
      zoom: Math.min(
        Math.log2(512 / (maxLng - minLng)) - 1,
        Math.log2(512 / (maxLat - minLat)) - 1,
        15
      ),
      // zoom: 15,
    });
  }
};
