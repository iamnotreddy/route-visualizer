/* eslint-disable unused-imports/no-unused-vars */
import { format } from 'date-fns';
import { useState } from 'react';
import React from 'react';

import MetricChart from '@/components/MetricChart';

import { GlobalMapRoute } from '@/pages/api/globalMap';

export const RouteDetail = (props: { userRoute: GlobalMapRoute }) => {
  const { userRoute } = props;
  const [lockChartHover, setLockChartHover] = useState(true);

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex flex-col'>
        <div className='text-2xl font-light text-slate-800'>
          {userRoute.route_name}
        </div>
        <div className='mb-2 flex flex-row space-x-1 text-sm font-light text-slate-600'>
          <p>{format(new Date(userRoute.date_added), 'EEEE, MMMM d yyyy')}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  font-light text-slate-800'>distance</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-semibold'>5.4</p>
            <p className='text-xs'>mi</p>
          </div>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>moving time</p>
          <p className='text-xl font-semibold'>30:42</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>pace</p>
          <p className='text-xl font-semibold'>7:45</p>
        </div>
        <div className='flex flex-col items-center space-y-1 rounded-lg border-2 border-slate-400 py-2'>
          <p className='text-sm  text-slate-800'>heart rate</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-semibold'>145</p>
            <p className='text-xs'>bpm</p>
          </div>
        </div>
      </div>

      <MetricChart
        metricName='Elevation'
        metricData={[
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 0, y: 2 },
          { x: 0, y: 1 },
        ]}
        lockChartHover={lockChartHover}
      />
    </div>
  );
};
