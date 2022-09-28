import VictoryMetricChart from '@/components/VictoryMetricChart';

import { formatTime, metersToMiles } from '@/api/helpers';
import { RoutePoint, StravaRouteStream } from '@/api/types';

type MetricsSidebarProps = {
  currentMetrics: RoutePoint;
  stravaPath: StravaRouteStream;
  displayFrame: number;
};

// type for rendering each metric on sidebar
type RenderMetrics = {
  metricTitle: string;
  metricArray: number[];
  currentMetric: string;
};

export default function MetricsSidebar({
  currentMetrics,
  stravaPath,
  displayFrame,
}: MetricsSidebarProps) {
  const renderMetrics: RenderMetrics[] = [
    {
      metricTitle: 'Current Heart Rate',
      metricArray: stravaPath.heartRate,
      currentMetric: currentMetrics.heartRate.toString(),
    },
    {
      metricTitle: 'Current Distance',
      metricArray: stravaPath.distance,
      currentMetric: metersToMiles(currentMetrics.distance),
    },
    {
      metricTitle: 'Current Time',
      metricArray: stravaPath.heartRate,
      currentMetric: formatTime(currentMetrics.time),
    },
  ];

  return (
    <div className='col-span-1'>
      {renderMetrics.map((metric) => {
        return (
          <div key={metric.metricTitle}>
            <p className='text-center font-semibold'>{metric.metricTitle}</p>
            <div className='grid grid-cols-4 items-center'>
              <p className='col-span-1 rounded-full border-2 p-4 text-4xl '>
                {metric.currentMetric}
              </p>
              <div className='col-span-3'>
                <VictoryMetricChart
                  metricArray={metric.metricArray}
                  displayFrame={displayFrame}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
