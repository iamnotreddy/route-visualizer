import { format, parseISO } from 'date-fns';
import { useContext, useState } from 'react';

import AnimationControl from '@/components/AnimationControl';
import ChooseMetricBar from '@/components/archived/ChooseMetricBar';
import { ActivityContext } from '@/components/GlobalMap';
import MetricChart from '@/components/MetricChart';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { metersToMiles } from '@/helpers/helpers';

export const ActivityDetail = () => {
  const { currentActivity, currentFrame, stravaPath } =
    useContext(ActivityContext);

  const [areaSeriesMetric, setAreaSeriesMetric] = useState('heartRate');

  if (currentActivity) {
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
        ? stravaPath.heartRate[currentFrame]
        : currentActivity.average_heartrate;

    return (
      <div className='m-2 flex flex-col space-y-2'>
        <div className='text-lg font-semibold'>{currentActivity.name}</div>
        <div className='flex flex-row space-x-1 text-slate-600 md:text-sm'>
          <p>
            {format(new Date(currentActivity.start_date), 'EEEE, MMMM d yyyy')}
          </p>
          <p>{format(parseISO(currentActivity.start_date), 'hh:mm a')}</p>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-sm  text-slate-800'>distance</p>
            <p className='text-xl'>{`${distance}mi`}</p>
          </div>
          <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-sm  text-slate-800'>moving time</p>
            <p className='text-xl'>{`${movingTime}`}</p>
          </div>
          <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-sm  text-slate-800'>pace</p>
            <p className='text-xl'>{pace}</p>
          </div>
          <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-sm  text-slate-800'>heart rate</p>
            <p className='text-xl'>{`${Math.floor(heartRate) ?? 0}bpm`}</p>
          </div>
        </div>

        <div className='pt-4'>
          <ChooseMetricBar
            setCurrentMetric={setAreaSeriesMetric}
            currentMetric={areaSeriesMetric}
            orientation='horizontal'
          />
        </div>

        <MetricChart areaSeriesMetric={areaSeriesMetric} />

        <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
          <AnimationControl />
        </div>
      </div>
    );
  }

  return <div>No Activity Loaded...</div>;
};
