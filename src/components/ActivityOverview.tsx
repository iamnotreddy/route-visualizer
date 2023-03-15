import { animated, useTrail } from '@react-spring/web';
import React from 'react';

import {
  DistanceComponent,
  PaceComponent,
  TimeComponent,
} from '@/components/MetricDisplay';

import { ActivitySplits, StravaRouteStream } from '@/api/types';

type ActivityOverviewProps = {
  activityTitle: string;
  userNotes: string;
  metrics: StravaRouteStream;
  splits: ActivitySplits[];
};

export const Trail: React.FC<{ open: boolean; children: React.ReactNode }> = ({
  open,
  children,
}) => {
  const items = React.Children.toArray(children);
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200, duration: 400 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 110 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  });
  return (
    <>
      {trail.map(({ height, ...style }, index) => (
        <animated.div key={index} style={style}>
          <animated.div style={{ height }}>{items[index]}</animated.div>
        </animated.div>
      ))}
    </>
  );
};

export const ActivityOverview = ({
  metrics,
  splits,
}: ActivityOverviewProps) => {
  return (
    <div
      style={{ width: '22vw', height: '50vh' }}
      className='space-y-2 border-2 border-dashed border-slate-300 p-4'
    >
      <p className='text-2xl font-bold'>Evening Run</p>
      <div className='flex flex-row items-center space-x-1'>
        <p className='items-center text-xs font-light text-slate-900'>
          Friday, December 14 2022
        </p>
        <p className='font-thin text-slate-400  '>|</p>
        <p className='text-xs font-light text-slate-900'>New York, NY</p>
      </div>

      <div className='flex flex-row items-center space-x-2 text-3xl '>
        <DistanceComponent
          distance={metrics.distance[metrics.distance.length - 1]}
          showMetricTitle
        />
        <div className='font-thin'>|</div>
        <TimeComponent
          time={metrics.time[metrics.time.length - 1]}
          showMetricTitle
        />
        <p className='font-thin'>|</p>
        <PaceComponent
          distance={metrics.distance[metrics.distance.length - 1]}
          time={metrics.time[metrics.time.length - 1]}
          showMetricTitle
        />
      </div>
      <div className='flex flex-col'>
        {splits.length > 0 &&
          splits.map((lap, index) => {
            return (
              <div key={lap.id} className='flex flex-row space-x-4'>
                <p>{index}</p>
                <svg>
                  <rect width='25%' height='5%' fill='blue' />
                </svg>
                <p>{lap.average_speed}</p>
                <p>{lap.total_elevation_gain}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};
