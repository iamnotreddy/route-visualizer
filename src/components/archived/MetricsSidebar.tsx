import VictoryMetricChart from '@/components/archived/VictoryMetricChart';

import { formatTime, metersToMiles } from '@/helpers/helpers';
import { RoutePoint, StravaRouteStream } from '@/helpers/types';

type MetricsSidebarProps = {
  currentMetrics: RoutePoint;
  stravaPath: StravaRouteStream;
  currentFrame: number;
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
  currentFrame,
}: MetricsSidebarProps) {
  const renderMetrics: RenderMetrics[] = [
    {
      metricTitle: 'Heart Rate',
      metricArray: stravaPath.heartRate,
      currentMetric: currentMetrics.heartRate.toString(),
    },
    {
      metricTitle: 'Total Distance',
      metricArray: stravaPath.distance,
      currentMetric: metersToMiles(currentMetrics.distance),
    },
    {
      metricTitle: 'Elapsed Time',
      metricArray: stravaPath.time,
      currentMetric: formatTime(currentMetrics.time),
    },
    {
      metricTitle: 'Altitude',
      metricArray: stravaPath.altitude,
      currentMetric: currentMetrics.altitude
        ? currentMetrics.altitude.toString()
        : '0',
    },
    {
      metricTitle: 'Grade',
      metricArray: stravaPath.grade_smooth,
      currentMetric: currentMetrics.grade_smooth
        ? currentMetrics.grade_smooth.toString()
        : '0',
    },
    {
      metricTitle: 'Velocity',
      metricArray: stravaPath.velocity_smooth,
      currentMetric: currentMetrics.velocity_smooth
        ? currentMetrics.velocity_smooth.toString()
        : '0',
    },
  ];

  return (
    <div className='col-span-1'>
      {renderMetrics.map((metric) => {
        return (
          <div key={metric.metricTitle}>
            <div className='grid grid-cols-6 items-center pr-12 pt-2'>
              <p className='col-span-6 rounded-lg border-2 border-slate-800 bg-slate-100 p-2 text-center text-xl'>
                {metric.metricTitle}: {metric.currentMetric}
              </p>
              <div className='col-span-6'>
                <VictoryMetricChart
                  metricArray={metric.metricArray}
                  currentFrame={currentFrame}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
