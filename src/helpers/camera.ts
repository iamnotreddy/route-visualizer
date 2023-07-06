import { bearing } from '@turf/turf';
import { Dispatch, SetStateAction } from 'react';
import { ViewState, ViewStateChangeEvent } from 'react-map-gl';

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
