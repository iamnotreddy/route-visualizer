import { interpolateBasis, quantize, zip } from 'd3';
import { Position } from 'geojson';

import { RoutePoint, StravaRouteStream } from '@/api/types';

// convert pace from meters per second to miles per minute
export const computePace = (point: RoutePoint) => {
  const pace = point.time / 60 / (point.distance / 1609);
  const minStr = Math.floor(pace).toString();
  const secStr = Math.floor((pace % 1) * 60).toString();

  return minStr + ':' + secStr;
};

// draw strava path on map point by point using d3 interpolate
export const drawStravaPath = (stravaPath: StravaRouteStream) => {
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

  return [...totalInterpolated];
};
