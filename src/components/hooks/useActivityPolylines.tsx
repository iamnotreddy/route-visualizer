import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useEffect, useState } from 'react';

import { getPolyLineCoordinates } from '@/helpers/helpers';
import { findRouteLineString } from '@/helpers/initialValues';
import { StravaActivity } from '@/helpers/types';

const useActivityPolylines = (
  activities: StravaActivity[] | undefined,
  currentActivity: StravaActivity | undefined
) => {
  const [polylineLayer, setPolylineLayer] =
    useState<FeatureCollection<Geometry, GeoJsonProperties>>();

  useEffect(() => {
    if (activities && activities.length > 0) {
      const mergedCoordinates: Array<Position[]> = [];

      const backgroundActivities = activities.filter(
        (activity) => activity.id != currentActivity?.id
      );

      backgroundActivities.map((activity) =>
        mergedCoordinates.push(
          getPolyLineCoordinates(activity.map.summary_polyline)
        )
      );

      setPolylineLayer(findRouteLineString(mergedCoordinates));
    }
  }, [activities, currentActivity?.id]);
  return {
    polylineLayer,
  };
};

export default useActivityPolylines;
