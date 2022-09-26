import { interpolateBasis, quantize, zip } from 'd3';
import { Position } from 'geojson';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { MapRef } from 'react-map-gl';

import { RoutePoint, StravaRouteStream } from '@/api/types';

export const computePace = (point: RoutePoint) => {
  // convert pace from meters per second to miles per minute
  const pace = point.time / 60 / (point.distance / 1609);
  const minStr = Math.floor(pace).toString();
  const secStr = Math.floor((pace % 1) * 60).toString();

  return minStr + ':' + secStr;
};

export const handleMapLoad = (
  stravaPath: StravaRouteStream,
  setInterpolated: Dispatch<SetStateAction<Position[]>>,
  setLineCoordinates: Dispatch<SetStateAction<Position[]>>
) => {
  let totalInterpolated: Position[] = [];

  for (let i = 0; i < stravaPath.latlng.length - 1; i++) {
    const pairLocations = stravaPath.latlng.slice(i, i + 2);

    const n =
      Math.floor(
        Math.max(
          Math.abs(pairLocations[1][1] - pairLocations[0][1]),
          Math.abs(pairLocations[1][0] - pairLocations[0][0])
        )
      ) + 2;

    const lat = interpolateBasis(pairLocations.map((item) => item[1]));
    const lng = interpolateBasis(pairLocations.map((item) => item[0]));

    const _interpolated = zip(quantize(lng, n), quantize(lat, n));

    totalInterpolated = [...totalInterpolated, ..._interpolated];
  }

  setInterpolated([...totalInterpolated]);
  setLineCoordinates([totalInterpolated[0]]);
};

export const animateLine = (
  timestamp: number,
  frameStartTime: number,
  fpsInterval: number,
  stravaPath: StravaRouteStream,
  setCurrentFrame: Dispatch<SetStateAction<number>>,
  setInterpolated: Dispatch<SetStateAction<Position[]>>,
  setLineCoordinates: Dispatch<SetStateAction<Position[]>>,
  setCurrentPoint: Dispatch<SetStateAction<Position>>,
  setCurrentMetrics: Dispatch<SetStateAction<RoutePoint>>,
  interpolated: Position[],
  animation: number,
  mapRef: RefObject<MapRef>
) => {
  if (!frameStartTime) {
    frameStartTime = timestamp;
  }

  const elapsed = timestamp - frameStartTime;
  if (elapsed > fpsInterval) {
    frameStartTime = timestamp - (elapsed % fpsInterval);
    setCurrentFrame((currentFrame) => {
      const newFrame = currentFrame + 1;
      if (newFrame > interpolated.length - 1) {
        setInterpolated([]);
        cancelAnimationFrame(animation);
        return newFrame;
      }

      setLineCoordinates((lineCoordinates: Position[]) => {
        if (mapRef.current) {
          mapRef.current.panTo([
            interpolated[newFrame][0],
            interpolated[newFrame][1],
          ]);
        }
        return [...lineCoordinates, interpolated[newFrame]];
      });

      setCurrentPoint(interpolated[newFrame]);
      setCurrentMetrics({
        heartRate: stravaPath.heartRate[Math.floor(currentFrame / 2)],
        distance: stravaPath.distance[Math.floor(currentFrame / 2)],
        time: stravaPath.time[Math.floor(currentFrame / 2)],
      });

      return newFrame;
    });
  }
};
