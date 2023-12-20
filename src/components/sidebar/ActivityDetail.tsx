import { format, parseISO } from 'date-fns';
import { useContext, useState } from 'react';
import React from 'react';

import AnimationControl from '@/components/AnimationControl';
import Button from '@/components/buttons/Button';
import { ActivityContext } from '@/components/globalMap';
import { useChartMetric } from '@/components/hooks/useChartMetric';
import { useCurrentMetricFrame } from '@/components/hooks/useCurrentMetricFrame';
import { LockIcon, UnlockIcon } from '@/components/layout/icons';
import MetricChart from '@/components/MetricChart';
import ChooseMetricBar from '@/components/sidebar/ChooseMetricBar';

import { saveRouteOnGlobalMap } from '@/helpers/fetchingFunctions';

export const ActivityDetail = () => {
  const {
    currentActivity,
    currentFrame,
    stravaPath,
    isActivityStreamFetching,
    refetchActivityStream,
  } = useContext(ActivityContext);

  const [lockChartHover, setLockChartHover] = useState(true);

  const { metricName, metricData, setMetricName } = useChartMetric(stravaPath);
  const { distance, movingTime, heartRate, pace } = useCurrentMetricFrame(
    currentFrame,
    stravaPath,
    currentActivity
  );

  if (!currentActivity) {
    return <div>No Activity Loaded...</div>;
  }

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
            <p className='text-xl font-semibold'>{`${distance}`}</p>
            <p className='text-xs'>mi</p>
          </div>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>moving time</p>
          <p className='text-xl font-semibold'>{`${movingTime}`}</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>pace</p>
          <p className='text-xl font-semibold'>{pace}</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>heart rate</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-semibold'>{`${
              heartRate ? Math.floor(heartRate) : 0
            }`}</p>
            <p className='text-xs'>bpm</p>
          </div>
        </div>
      </div>

      <div className='flex flex-row justify-between pt-4'>
        <ChooseMetricBar
          metricName={metricName}
          setMetricName={setMetricName}
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

      {metricData ? (
        <MetricChart
          metricName={metricName}
          metricData={metricData}
          lockChartHover={lockChartHover}
        />
      ) : (
        <div className='flex items-center justify-center py-8'>
          <Button
            variant='dark'
            isLoading={!isActivityStreamFetching}
            onClick={() => refetchActivityStream()}
            className=''
          >
            Load Chart
          </Button>
        </div>
      )}

      <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
        <AnimationControl />
      </div>
      <div className='flex items-center justify-center'>
        <Button
          variant='dark'
          onClick={() =>
            saveRouteOnGlobalMap({
              strava_activity_id: parseInt(currentActivity.id),
              strava_athlete_id: parseInt(currentActivity.athlete.id),
              anonymous: false,
              date_added: format(new Date(), 'EEEE, MMMM d yyyy'),
              activity_date: currentActivity.start_date,
              route_polyline: currentActivity.map.summary_polyline,
              elevation: [],
              route_name: 'PV Suburbs to Lunada Bay Out and Back',
              route_description:
                'Super steep descent down to Lunada Bay and back up to PV Suburbs. Really beautiful view of the Ocean. This run is a super fast downhill sprint for the first 2 miles (be careful with those hammys) followed by a serious 500ft ascent over two miles ',
            })
          }
        >
          Save Activity
        </Button>
      </div>
    </div>
  );
};
