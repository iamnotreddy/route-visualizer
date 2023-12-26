import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useEffect, useState } from 'react';

import { getPolyLineCoordinates } from '@/helpers/helpers';
import { findRouteLineString } from '@/helpers/initialValues';
import { GlobalMapRoute } from '@/pages/api/globalMap';

const useGlobalMapPolylines = (
  globalMapUserRoutes: GlobalMapRoute[] | undefined,
  currentUserRoute: GlobalMapRoute | undefined
) => {
  const [polylineLayer, setPolylineLayer] =
    useState<FeatureCollection<Geometry, GeoJsonProperties>>();

  useEffect(() => {
    if (globalMapUserRoutes && globalMapUserRoutes.length > 0) {
      const mergedCoordinates: Array<Position[]> = [];

      const backgroundRoutes = globalMapUserRoutes.filter(
        (route) =>
          route.strava_activity_id != currentUserRoute?.strava_activity_id
      );

      backgroundRoutes.map((route) =>
        mergedCoordinates.push(getPolyLineCoordinates(route.route_polyline))
      );

      setPolylineLayer(findRouteLineString(mergedCoordinates));
    }
  }, [globalMapUserRoutes, currentUserRoute?.strava_activity_id]);
  return {
    polylineLayer,
  };
};

export default useGlobalMapPolylines;
