import { bearing } from '@turf/turf';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { ViewState } from 'react-map-gl';

import { RoutePoint, StravaRouteStream } from '@/api/types';

// // manually select sample route here
// export const selectedRoute = sampleStravaPVRun;

// export const stravaPath: StravaRouteStream = {
//   latlng: selectedRoute.latlng.data.map((point: Position) => {
//     // return [longitude, latitude] due to mapbox quirk
//     return [point[1], point[0]];
//   }),
//   heartRate:
//     selectedRoute.heartrate.type == 'heartrate'
//       ? selectedRoute.heartrate.data
//       : [],
//   distance:
//     selectedRoute.distance.type == 'distance'
//       ? selectedRoute.distance.data
//       : [],
//   time: selectedRoute.time.type == 'time' ? selectedRoute.time.data : [],
//   velocity_smooth:
//     selectedRoute.velocity_smooth.type == 'velocity_smooth'
//       ? selectedRoute.velocity_smooth.data
//       : [],
//   grade_smooth:
//     selectedRoute.grade_smooth.v == 'grade_smooth'
//       ? selectedRoute.grade_smooth.data
//       : [],
//   altitude:
//     selectedRoute.altitude.type == 'altitude'
//       ? selectedRoute.altitude.data
//       : [],
// };

// export const routeLineString: FeatureCollection<Geometry, GeoJsonProperties> = {
//   type: 'FeatureCollection',
//   features: [
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'LineString',
//         coordinates: stravaPath.latlng,
//       },
//       properties: {},
//     },
//   ],
// };

export const findRouteLineString = (path: StravaRouteStream) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path.latlng,
        },
        properties: {},
      },
    ],
  } as FeatureCollection<Geometry, GeoJsonProperties>;
};

// export const initialViewState: ViewState = {
//   latitude: stravaPath.latlng[0][1],
//   longitude: stravaPath.latlng[0][0],
//   zoom: 14,
//   bearing: 105,
//   pitch: 85,
//   padding: {
//     top: 1,
//     bottom: 1,
//     left: 1,
//     right: 1,
//   },
// };

export const findInitialViewState = (path: StravaRouteStream) => {
  const initialPoint = path.latlng[0];
  const finalPoint = path.latlng[path.latlng.length - 1];

  return {
    latitude: initialPoint[1],
    longitude: initialPoint[0],
    zoom: 14,
    bearing: bearing(initialPoint, finalPoint),
    pitch: 85,
    padding: {
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
    },
  } as ViewState;
};

// export const initialPathPoint: RoutePoint = {
//   heartRate: stravaPath.heartRate[0],
//   distance: stravaPath.distance[0],
//   time: stravaPath.distance[0],
// };

export const findInitialMetricPoint = (path: StravaRouteStream) => {
  return {
    heartRate: path.heartRate[0],
    distance: path.distance[0],
    time: path.time[0],
  } as RoutePoint;
};
