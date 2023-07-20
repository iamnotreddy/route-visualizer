import { useEffect, useState } from 'react';

import { generatePace } from '@/helpers/chartHelpers';
import { transformMetricToDataPoint } from '@/helpers/helpers';
import { DataPoint, StravaRouteStream } from '@/helpers/types';

export type Metrics =
  | 'heartRate'
  | 'elevation'
  | 'pace'
  | 'cadence'
  | 'grade'
  | 'distance';

export function useChartMetric(stravaPath: StravaRouteStream | undefined) {
  const [metricName, setMetricName] = useState<Metrics>('elevation');
  const [metricData, setMetricData] = useState<DataPoint[]>();

  useEffect(() => {
    if (stravaPath) {
      if (metricName === 'heartRate') {
        setMetricData(transformMetricToDataPoint(stravaPath.heartRate));
      }

      if (metricName === 'grade') {
        setMetricData(transformMetricToDataPoint(stravaPath.grade_smooth));
      }

      if (metricName === 'elevation') {
        setMetricData(transformMetricToDataPoint(stravaPath.altitude));
      }

      if (metricName === 'pace') {
        const paceArray = generatePace(
          transformMetricToDataPoint(stravaPath.time),
          transformMetricToDataPoint(stravaPath.distance)
        );
        setMetricData(paceArray);
      }

      if (metricName === 'cadence') {
        setMetricData(transformMetricToDataPoint(stravaPath.cadence));
      }
    }
  }, [metricName, stravaPath]);

  return {
    metricName,
    metricData,
    setMetricName,
  };
}
