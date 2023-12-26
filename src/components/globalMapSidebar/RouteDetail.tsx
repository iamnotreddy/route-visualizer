import { format } from 'date-fns';
import { ChangeEvent, MutableRefObject, useState } from 'react';
import React from 'react';

import AnimationControl from '@/components/globalMapSidebar/AnimationControl';
import MetricChart from '@/components/globalMapSidebar/MetricChart';

import { transformMetricToDataPoint } from '@/helpers/helpers';
import { GlobalMapRoute } from '@/pages/api/globalMap';

export const RouteDetail = (props: {
  userRoute: GlobalMapRoute;
  currentFrame: number;
  setCurrentFrame: (currentFrame: number) => void;
  handleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
  animationState: string;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
}) => {
  const {
    userRoute,
    currentFrame,
    setCurrentFrame,
    handleRouteControl,
    animationState,
    sliderRef,
    setAnimationState,
  } = props;

  const [lockChartHover, setLockChartHover] = useState(true);
  const elevationArray = transformMetricToDataPoint(userRoute.elevation);

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex flex-col'>
        <div className='text-2xl font-light text-slate-800'>
          {userRoute.route_name}
        </div>
        <div className='mb-2 flex flex-row space-x-1 text-sm font-light text-slate-600'>
          <p>
            {`Added `}
            {format(new Date(userRoute.date_added), 'EEEE, MMMM d yyyy')}
          </p>
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
          <p className='text-sm  text-slate-800'>total elevation</p>
          <div className='flex flex-row items-center space-x-1'>
            <p className='text-xl font-semibold'>
              {userRoute.total_elevation_gain}
            </p>
            <p className='text-xs'>ft</p>
          </div>
        </div>
      </div>

      <MetricChart
        metricName='elevation'
        metricData={elevationArray}
        lockChartHover={lockChartHover}
        setLockChartHover={setLockChartHover}
        currentFrame={currentFrame}
        setCurrentFrame={setCurrentFrame}
        animationState={animationState}
      />
      <div className='flex flex-col space-y-2 overflow-auto'>
        <p className='font-semibold'>Route Description</p>
        <p className='ml-2 text-sm'>{userRoute.route_description}</p>
      </div>
      <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
        <AnimationControl
          routeCoordinates={userRoute.coordinates}
          currentFrame={currentFrame}
          handleRouteControl={handleRouteControl}
          animationState={animationState}
          sliderRef={sliderRef}
          setAnimationState={setAnimationState}
        />
      </div>
    </div>
  );
};
