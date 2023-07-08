import { format, parseISO } from 'date-fns';
import { useContext, useState } from 'react';

import AnimationControl from '@/components/AnimationControl';
import ChooseMetricBar from '@/components/ChooseMetricBar';
import { ActivityContext } from '@/components/globalMap';
import { LockIcon, UnlockIcon } from '@/components/icons';
import MetricChart from '@/components/MetricChart';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { metersToMiles } from '@/helpers/helpers';

export const ActivityDetail = () => {
  const { currentActivity, currentFrame, stravaPath } =
    useContext(ActivityContext);

  const [areaSeriesMetric, setAreaSeriesMetric] = useState('elevation');
  const [lockChartHover, setLockChartHover] = useState(true);

  if (!currentActivity) {
    return <div>No Activity Loaded...</div>;
  }

  const distance =
    stravaPath && currentFrame > 20
      ? metersToMiles(stravaPath?.distance[currentFrame])
      : metersToMiles(currentActivity.distance);

  const movingTime =
    stravaPath && currentFrame > 20
      ? convertPaceValueForDisplay(stravaPath.time[currentFrame] / 60)
      : convertPaceValueForDisplay(currentActivity.moving_time / 60);

  const pace =
    stravaPath && currentFrame > 20
      ? convertPaceValueForDisplay(
          generatePacePoint(
            stravaPath.time[currentFrame],
            stravaPath.distance[currentFrame]
          )
        )
      : convertPaceValueForDisplay(
          generatePacePoint(
            currentActivity.moving_time,
            currentActivity.distance
          )
        );

  const heartRate =
    stravaPath && currentFrame > 20
      ? Number.isInteger(stravaPath.heartRate[0])
        ? stravaPath.heartRate[currentFrame]
        : 0
      : Number.isInteger(currentActivity.average_heartrate)
      ? currentActivity.average_heartrate
      : 0;

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex flex-col'>
        <div className='text-2xl font-light text-slate-800'>
          {currentActivity.name}
        </div>
        <div className='mb-2 flex flex-row space-x-1 text-sm font-light text-slate-600'>
          <p>
            {format(new Date(currentActivity.start_date), 'EEEE, MMMM d yyyy')}
          </p>
          <p>{format(parseISO(currentActivity.start_date), 'hh:mm a')}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  font-light text-slate-800'>distance</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-light'>{`${distance}`}</p>
            <p className='text-xs'>mi</p>
          </div>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>moving time</p>
          <p className='text-xl font-light'>{`${movingTime}`}</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>pace</p>
          <p className='text-xl font-light'>{pace}</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>heart rate</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-light'>{`${
              Math.floor(heartRate) ?? 0
            }`}</p>
            <p className='text-xs'>bpm</p>
          </div>
        </div>
      </div>

      <div className='flex flex-row justify-between pt-4'>
        <ChooseMetricBar
          setCurrentMetric={setAreaSeriesMetric}
          currentMetric={areaSeriesMetric}
          orientation='horizontal'
        />
        {lockChartHover ? (
          <button onClick={() => setLockChartHover(false)}>
            <LockIcon />
          </button>
        ) : (
          <button onClick={() => setLockChartHover(true)}>
            <UnlockIcon />
          </button>
        )}
      </div>

      <MetricChart
        areaSeriesMetric={areaSeriesMetric}
        lockChartHover={lockChartHover}
      />

      <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
        <AnimationControl />
      </div>
    </div>
  );
};
