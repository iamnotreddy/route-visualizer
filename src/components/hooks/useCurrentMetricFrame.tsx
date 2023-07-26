import { useEffect, useState } from 'react';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { metersToMiles } from '@/helpers/helpers';
import { StravaActivity, StravaRouteStream } from '@/helpers/types';

export function useCurrentMetricFrame(
  currentFrame: number,
  stravaPath: StravaRouteStream | undefined,
  currentActivity: StravaActivity | undefined
) {
  const [distance, setDistance] = useState('');
  const [movingTime, setMovingTime] = useState('');
  const [pace, setPace] = useState('');
  const [heartRate, setHeartRate] = useState(0);

  useEffect(() => {
    if (stravaPath && currentFrame > 10) {
      setDistance(metersToMiles(stravaPath?.distance[currentFrame]));
      setMovingTime(
        convertPaceValueForDisplay(stravaPath.time[currentFrame] / 60)
      );
      setPace(
        convertPaceValueForDisplay(
          generatePacePoint(
            stravaPath.time[currentFrame],
            stravaPath.distance[currentFrame]
          )
        )
      );
      setHeartRate(stravaPath.heartrate[currentFrame]);
    } else if (currentActivity) {
      setDistance(metersToMiles(currentActivity.distance));
      setMovingTime(
        convertPaceValueForDisplay(currentActivity.moving_time / 60)
      );
      setPace(
        convertPaceValueForDisplay(
          generatePacePoint(
            currentActivity.moving_time,
            currentActivity.distance
          )
        )
      );
      setHeartRate(currentActivity.average_heartrate);
    }
  }, [currentActivity, currentFrame, stravaPath]);

  return {
    distance,
    movingTime,
    pace,
    heartRate,
  };
}
