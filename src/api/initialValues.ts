import { bearing } from '@turf/turf';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { ViewState } from 'react-map-gl';

import { RoutePoint, StravaRouteStream } from '@/api/types';

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

export const findInitialMetricPoint = (path: StravaRouteStream) => {
  return {
    heartRate: path.heartRate[0],
    distance: path.distance[0],
    time: path.time[0],
  } as RoutePoint;
};
