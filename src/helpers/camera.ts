import { bearing } from '@turf/turf';
import { Position } from 'geojson';
import { Dispatch, SetStateAction } from 'react';
import { ViewState, ViewStateChangeEvent } from 'react-map-gl';

import { StravaActivity } from '@/helpers/types';

// type CameraMode = 'spin' | 'disabled';

export const placeCameraInRotation = (
  setViewState: Dispatch<SetStateAction<ViewState | undefined>>
) =>
  setViewState((prev) => {
    if (prev) {
      return {
        ...prev,
        bearing: prev.bearing + 0.05,
      };
    }
  });

export const placeCameraAlongRoute = (
  e: ViewStateChangeEvent,
  setViewState: Dispatch<SetStateAction<ViewState | undefined>>
) => {
  setViewState((prev) => {
    if (prev) {
      const prevCoord = [prev.latitude, prev.longitude];
      const nextCoord = [e.viewState.latitude, e.viewState.longitude];
      const nextBearing = bearing(prevCoord, nextCoord);
      const targetBearing =
        prev.bearing + (nextBearing - prev.bearing) * (1 / 100);

      return {
        ...prev,
        bearing: targetBearing,
      };
    }
  });
};

export const getNextPitch = (pitch: number) => {
  if (pitch > 65) {
    return pitch - 10;
  } else {
    return pitch + 15;
  }
};

export const getNextBearing = (bearing: number) => {
  const nextBearing = bearing + 60;
  if (nextBearing > 360) {
    return 0;
  }
  return nextBearing;
};

export const calculateBoundingBox = (
  activities: StravaActivity[]
): Position[] | null => {
  if (activities.length === 0) {
    return null;
  }

  let minLat = activities[0].start_latlng[1];
  let maxLat = activities[0].start_latlng[1];
  let minLng = activities[0].start_latlng[0];
  let maxLng = activities[0].start_latlng[0];

  activities.forEach((activity) => {
    const [long, lat] = activity.start_latlng;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, long);
    maxLng = Math.max(maxLng, long);
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};
