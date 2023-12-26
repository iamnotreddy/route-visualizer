import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { ViewState } from 'react-map-gl';

import { RoutePoint, StravaRouteStream } from '@/helpers/types';
export const findRouteLineString = (
  coordinates: Position[] | Array<Position[]>
) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiLineString',
          coordinates: coordinates,
        },
        properties: {},
      },
    ],
  } as FeatureCollection<Geometry, GeoJsonProperties>;
};

export const findInitialViewState = (coordinates: Position[]) => {
  const initialPoint = coordinates[0];

  return {
    latitude: initialPoint[1],
    longitude: initialPoint[0],
    zoom: 14,
    bearing: 80,
    pitch: 65,
  } as ViewState;
};

export const findInitialMetricPoint = (path: StravaRouteStream) => {
  return {
    heartRate: path.heartrate[0],
    distance: path.distance[0],
    time: path.time[0],
  } as RoutePoint;
};
