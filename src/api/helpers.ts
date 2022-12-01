import { Position } from 'geojson';

import { ActivityStream, RoutePoint, StravaRouteStream } from '@/api/types';

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
