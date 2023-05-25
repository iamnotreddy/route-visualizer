import { bearing } from '@turf/turf';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { ViewState } from 'react-map-gl';

import { RoutePoint, StravaRouteStream } from '@/helpers/types';
export const findRouteLineString = (coordinates: Position[]) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
        properties: {},
      },
    ],
  } as FeatureCollection<Geometry, GeoJsonProperties>;
};

export const findInitialViewState = (coordinates: Position[]) => {
  const initialPoint = coordinates[0];
  const finalPoint = coordinates[coordinates.length - 1];

  return {
    latitude: initialPoint[1],
    longitude: initialPoint[0],
    zoom: 15,
    bearing: bearing(initialPoint, finalPoint),
    pitch: 45,
    padding: {
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
    },
  } as ViewState;
};

export const findInitialMetricPoint = (path: StravaRouteStream) => {
  return {
    heartRate: path.heartRate[0],
    distance: path.distance[0],
    time: path.time[0],
  } as RoutePoint;
};
