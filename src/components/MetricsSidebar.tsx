import VictoryMetricChart from '@/components/VictoryMetricChart';

import { RoutePoint, StravaRouteStream } from '@/api/types';

type MetricsSidebarProps = {
  currentMetrics: RoutePoint;
  stravaPath: StravaRouteStream;
  currentFrame: number;
};

export default function MetricsSidebar({
  currentMetrics,
  stravaPath,
  currentFrame,
}: MetricsSidebarProps) {
  return (
    <div className='col-span-1 p-4'>
      <p>Current Heart Rate: {currentMetrics.heartRate}</p>
      <VictoryMetricChart
        metricArray={stravaPath.heartRate}
        // currentFrame={Math.floor(currentFrame / 2)}
      />
      <p>
        Total Distance: {(currentMetrics.distance * 0.000621371).toFixed(2)}{' '}
        miles
      </p>
      <p>
        Current Pace:{' '}
        {(
          currentMetrics.time /
          60 /
          (currentMetrics.distance * 0.000621371)
        ).toFixed(2)}
        min / mile
      </p>
      <VictoryMetricChart
        metricArray={stravaPath.distance}
        // currentFrame={Math.floor(currentFrame / 2)}
      />
      <p>Time Elapsed: {(currentMetrics.time / 60).toFixed(2)} minutes</p>
      <VictoryMetricChart
        metricArray={stravaPath.time}
        // currentFrame={Math.floor(currentFrame / 2)}
      />
      <p>currentFrame: {currentFrame}</p>
    </div>
  );
}
