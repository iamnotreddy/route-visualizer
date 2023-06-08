import { animated, useTrail } from '@react-spring/web';
import { format } from 'date-fns';
import React, { useState } from 'react';

import ChooseMetricBar from '@/components/archived/ChooseMetricBar';
import {
  DistanceComponent,
  PaceComponent,
  TimeComponent,
} from '@/components/archived/MetricDisplay';
import Splits from '@/components/Splits';

import { metersToMiles } from '@/helpers/helpers';
import { ActivitySplits, StravaRouteStream } from '@/helpers/types';

type ActivityOverviewProps = {
  activityTitle: string;
  userNotes: string;
  metrics: StravaRouteStream;
  splits: ActivitySplits[];
  currentFrame: number;
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
  currentFrame,
}: ActivityOverviewProps) => {
  const [currentSplitSeries, setCurrentSplitSeries] = useState('pace');

  const returnCurrentSplit = (
    distanceArray: number[],
    currentFrame: number
  ) => {
    const distance = distanceArray[currentFrame];
    const miles = metersToMiles(distance);
    return Math.floor(parseInt(miles));
  };

  const currentSplit = returnCurrentSplit(metrics.distance, currentFrame);

  const chooseSplitsArray = () => {
    // default to pace
    let returnArray = splits.map((lap) => lap.moving_time);
    if (currentSplitSeries == 'pace') {
      returnArray = splits.map((lap) => lap.moving_time);
    } else if (currentSplitSeries == 'heartRate') {
      returnArray = splits.map((lap) => lap.average_heartrate);
    } else if (currentSplitSeries == 'elevation') {
      returnArray = splits.map((lap) => lap.total_elevation_gain);
    } else if (currentSplitSeries == 'grade') {
      returnArray = splits.map((lap) => lap.average_cadence);
    } else {
      returnArray = splits.map((lap) => lap.moving_time);
    }
    return returnArray;
  };

  const formattedActivityDate = format(
    new Date(splits[0].start_date_local),
    'EEEE, MMMM d yyyy'
  );

  return (
    <div
      style={{ width: '22vw', height: '50vh' }}
      className='space-y-2 overflow-hidden p-4'
    >
      <p className='text-2xl font-bold'>Evening Run</p>
      <div className='flex flex-row items-center space-x-1'>
        <p className='items-center text-sm font-light text-slate-900'>
          {formattedActivityDate}
        </p>
        <p className='font-thin text-slate-400  '>|</p>
        <p className='text-sm font-light text-slate-900'>New York, NY</p>
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
      <div className='flex flex-col space-y-4'>
        <ChooseMetricBar
          currentMetric={currentSplitSeries}
          setCurrentMetric={setCurrentSplitSeries}
          orientation='horizontal'
        />

        <Splits
          metricArray={chooseSplitsArray()}
          metricType={currentSplitSeries}
          currentSplit={currentSplit}
        />
      </div>
    </div>
  );
};
