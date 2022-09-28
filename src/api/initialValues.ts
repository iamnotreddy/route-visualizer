import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { ViewState } from 'react-map-gl';

import { sampleStravaPVRun } from '@/api/sampleData';
import { RoutePoint, StravaRouteStream } from '@/api/types';

// manually select sample route here
export const selectedRoute = sampleStravaPVRun;

export const stravaPath: StravaRouteStream = {
  latlng: selectedRoute.latlng.data.map((point: Position) => {
    // return [longitude, latitude] due to mapbox quirk
    return [point[1], point[0]];
  }),
  heartRate: selectedRoute.heartrate.data.map((point: number) => {
    return point;
  }),
  distance: selectedRoute.distance.data.map((point: number) => {
    return point;
  }),
  time: selectedRoute.time.data.map((point: number) => {
    return point;
  }),
};

export const routeLineString: FeatureCollection<Geometry, GeoJsonProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: stravaPath.latlng,
      },
      properties: {},
    },
  ],
};

export const initialViewState: ViewState = {
  latitude: stravaPath.latlng[0][1],
  longitude: stravaPath.latlng[0][0],
  zoom: 14,
  bearing: 86,
  pitch: 60,
  padding: {
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
  },
};

export const initialPathPoint: RoutePoint = {
  heartRate: stravaPath.heartRate[0],
  distance: stravaPath.distance[0],
  time: stravaPath.distance[0],
};
