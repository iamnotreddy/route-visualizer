import { format } from 'date-fns';

import 'mapbox-gl/dist/mapbox-gl.css';

import { convertPaceValueForDisplay } from '@/helpers/chartHelpers';
import { StravaActivity } from '@/helpers/types';

type MapActivityRowProps = {
  activity: StravaActivity;
  currentActivityId: string | undefined;
};

export default function MapActivityRow({
  activity,
  currentActivityId,
}: MapActivityRowProps) {
  const metersToMiles = 0.000621371;
  const distanceFormatted = (metersToMiles * activity.distance).toFixed(1);
  const formattedActivityDate = format(
    new Date(activity.start_date),
    'EEEE, MMMM d yyyy'
  );

  const elevationGain = activity.total_elevation_gain;

  return (
    <div
      className={
        currentActivityId === activity.id
          ? 'border-2 border-green-800 bg-green-500 bg-opacity-5'
          : 'border-t-2 border-slate-400'
      }
    >
      <div className='flex flex-row space-x-4'>
        <div className='flex flex-col p-2'>
          <div className='text-lg font-light text-slate-800'>
            {activity.name}
          </div>
          <p className='text-sm font-light text-slate-600'>
            {formattedActivityDate}
          </p>
        </div>
      </div>
      <div className='flex flex-row space-x-4 px-2'>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-base font-light text-slate-500'>distance</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-light'>{distanceFormatted}</p>
            <p className='text-xs'>mi</p>
          </div>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-base font-light text-slate-500'>time</p>
          <div className='flex flex-row space-x-2'>
            <p className='text-xl font-light'>
              {convertPaceValueForDisplay(activity.moving_time / 60)}
            </p>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <p className='text-base font-light text-slate-500'>elevation Δ</p>
          <div className='flex flex-row items-center space-x-2'>
            <div className='flex flex-row items-center justify-center space-x-1'>
              <p className='text-xl font-light'>{Math.floor(elevationGain)}</p>
              <p className='text-xs'>ft</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
