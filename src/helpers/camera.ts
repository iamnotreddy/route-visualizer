import { bbox, bearing, distance, isObject, point } from '@turf/turf';
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
  const minPitch = 50;
  const maxPitch = 80;
  const pitchInterval = 10;

  const nextPitch = pitch + pitchInterval;

  if (nextPitch > maxPitch) {
    return minPitch + (nextPitch % maxPitch);
  }

  return nextPitch;
};

export const getNextBearing = (bearing: number) => {
  const nextBearing = bearing + 60;
  if (nextBearing > 360) {
    return 0;
  }
  return nextBearing;
};

// NOT WORKING YET: optimal positioning of camera across all routes
export const calculateMapViewState = (
  activities: StravaActivity[]
): ViewState | null => {
  if (activities.length === 0) {
    return null;
  }

  const points = activities
    .filter((activity) => isObject(activity.start_latlng))
    .map((activity) => {
      if (typeof activity.start_latlng[0] === 'number') {
        return point(activity.start_latlng);
      }
    });

  const bboxCoords = bbox(points);

  const [minLng, minLat, maxLng, maxLat] = bboxCoords;

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const diagonalDistance = distance(
    point([minLng, minLat]),
    point([maxLng, maxLat])
  );
  const zoom = getZoomLevel(diagonalDistance);

  return {
    longitude: centerLng,
    latitude: centerLat,
    zoom,
    bearing: 0,
    pitch: 25,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  };
};

const getZoomLevel = (diagonalDistance: number): number => {
  const WORLD_WIDTH = 256;
  const ZOOM_MAX = 20;

  const meterPerPixel = diagonalDistance / WORLD_WIDTH;
  const zoom = Math.log2((156543.03392 * Math.cos(0)) / meterPerPixel);
  return Math.min(Math.floor(zoom), ZOOM_MAX);
};

// ALSO not working, simpler way to calculate view state initially
export const calculateBoundingBox = (
  activities: StravaActivity[]
): ViewState | null => {
  if (activities.length === 0 && activities[0].start_latlng[0] != undefined) {
    return null;
  }

  let minLat = 0;
  let maxLat = 0;
  let minLng = 0;
  let maxLng = 0;

  activities.map((activity) => {
    minLat = Math.min(minLat, activity.start_latlng[1]);
    maxLat = Math.max(maxLat, activity.start_latlng[1]);
    minLng = Math.min(minLng, activity.start_latlng[0]);
    maxLng = Math.max(maxLng, activity.start_latlng[0]);
  });

  return {
    longitude: minLng + maxLng / 2,
    latitude: minLat + maxLat / 2,
    zoom: 12,
    bearing: 0,
    pitch: 25,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  };
};
