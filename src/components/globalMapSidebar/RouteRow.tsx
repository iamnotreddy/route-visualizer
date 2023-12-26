import { format } from 'date-fns';

import 'mapbox-gl/dist/mapbox-gl.css';

import { GlobalMapRoute } from '@/pages/api/globalMap';

type MapActivityRowProps = {
  route: GlobalMapRoute;
  currentRouteId: string | undefined;
};

export default function MapActivityRow({
  route,
  currentRouteId,
}: MapActivityRowProps) {
  // const metersToMiles = 0.000621371;
  // const distanceFormatted = (metersToMiles * activity.distance).toFixed(1);
  const formattedActivityDate = format(
    new Date(route.date_added),
    'EEEE, MMMM d yyyy'
  );

  const elevationGain = 500;

  const metersToMiles = 0.000621371;
  const distanceFormatted = (metersToMiles * route.total_distance).toFixed(1);

  return (
    <div
      className={
        currentRouteId === route.strava_activity_id.toString()
          ? 'border-2 border-green-800 bg-green-500 bg-opacity-5'
          : 'border-t-2 border-slate-400'
      }
      title='select activity'
    >
      <div className='flex flex-row space-x-4'>
        <div className='flex flex-col p-2'>
          <div className='text-lg font-light text-slate-800'>
            {route.route_name}
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
