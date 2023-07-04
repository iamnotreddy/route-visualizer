import { format, parseISO } from 'date-fns';

import 'mapbox-gl/dist/mapbox-gl.css';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { StravaActivity } from '@/helpers/types';

type MapActivityRowProps = {
  activity: StravaActivity;
  currentActivityId: string | undefined;
};

export default function MapActivityRow({
  activity,
  currentActivityId,
}: MapActivityRowProps) {
  const cityPlaceHolder = '';
  const startTime = format(parseISO(activity.start_date), 'hh:mm a');
  const metersToMiles = 0.000621371;
  const pace = generatePacePoint(activity.moving_time, activity.distance);
  const formattedPace = convertPaceValueForDisplay(pace);

  const distanceFormatted = (metersToMiles * activity.distance).toFixed(1);
  const formattedActivityDate = format(
    new Date(activity.start_date),
    'EEEE, MMMM d yyyy'
  );

  return (
    <div
      className={
        currentActivityId === activity.id
          ? 'border-2 border-green-800 bg-green-500 bg-opacity-5'
          : ''
      }
    >
      <div className='flex flex-row space-x-4'>
        <div className='flex flex-col p-2'>
          <div className='text-2xl font-semibold'>{activity.name}</div>
          <div className='flex flex-row space-x-1 text-slate-600 md:text-lg'>
            <p>{formattedActivityDate}</p>
            <p>·</p>
            <p>{startTime}</p>
          </div>
          <div className='text-slate-600 md:text-lg'>{cityPlaceHolder}</div>
        </div>
      </div>
      <div className='flex flex-row space-x-8 px-2'>
        <div className='flex flex-col'>
          <p className='text-center text-slate-600 md:text-lg'>distance</p>
          <div className='flex flex-row items-center space-x-2'>
            <p className='text-2xl md:text-3xl'>{distanceFormatted}</p>
            <p>mi</p>
          </div>
        </div>
        <div className='flex flex-col'>
          <p className='text-slate-600 md:text-lg'>time</p>
          <div className='flex flex-row items-center space-x-2'>
            <p className='text-2xl md:text-3xl'>
              {convertPaceValueForDisplay(activity.moving_time / 60)}
            </p>
          </div>
        </div>
        <div className='flex flex-col'>
          <p className='text-slate-600 md:text-lg'>pace</p>
          <div className='flex flex-row items-center space-x-2'>
            <p className='text-2xl md:text-3xl'>{formattedPace}</p>
            <div className='flex flex-col items-center text-xs'>
              <p>min</p>
              <p>m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
