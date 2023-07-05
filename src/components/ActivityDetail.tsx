import { format, parseISO } from 'date-fns';
import { useContext } from 'react';

import AnimationControl from '@/components/AnimationControl';
import { ActivityContext } from '@/components/globalMap';
import MetricChart from '@/components/MetricChart';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { metersToMiles } from '@/helpers/helpers';

export const ActivityDetail = () => {
  const { currentActivity } = useContext(ActivityContext);

  if (currentActivity) {
    return (
      <div className='m-4 flex flex-col space-y-2'>
        <h1 className='text-xl'>{currentActivity.name}</h1>
        <div className='flex flex-row space-x-1 text-slate-600 md:text-lg'>
          <p>
            {format(new Date(currentActivity.start_date), 'EEEE, MMMM d yyyy')}
          </p>
          <p>·</p>
          <p>{format(parseISO(currentActivity.start_date), 'hh:mm a')}</p>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='flex flex-col items-center space-y-2 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-xl  text-slate-500'>distance</p>
            <p className='font-light'>
              {`${metersToMiles(currentActivity.distance)}mi`}
            </p>
          </div>
          <div className='flex flex-col items-center space-y-2 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-xl  text-slate-500'>moving time</p>
            <p className='font-light'>
              {`${convertPaceValueForDisplay(
                currentActivity.moving_time / 60
              )}`}
            </p>
          </div>
          <div className='flex flex-col items-center space-y-2 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-xl  text-slate-500'>pace</p>
            <p className='font-light'>
              {`${convertPaceValueForDisplay(
                generatePacePoint(
                  currentActivity.moving_time,
                  currentActivity.distance
                )
              )}`}
            </p>
          </div>
          <div className='flex flex-col items-center space-y-2 rounded-lg border-2 border-slate-400 py-2'>
            <p className='text-xl  text-slate-500'>heart rate</p>
            <p className='font-light'>
              {`${Math.floor(currentActivity.average_heartrate)}bpm`}
            </p>
          </div>
        </div>

        <MetricChart />

        <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
          <AnimationControl />
        </div>
      </div>
    );
  }

  // return Loading text if currentActivity not set
  return <div>Loading...</div>;
};
