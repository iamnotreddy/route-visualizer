import { format, parseISO } from 'date-fns';
import { Position } from 'geojson';
import { ChangeEvent, MutableRefObject, useState } from 'react';
import { ViewState } from 'react-map-gl';

import MapActivityRow from '@/components/ActivityRow';
import AnimationControl from '@/components/AnimationControl';
import MetricChart from '@/components/MetricChart';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';
import { metersToMiles } from '@/helpers/helpers';
import { StravaActivity, StravaRouteStream } from '@/helpers/types';

type ActivityListProps = {
  activities: StravaActivity[];
  currentActivityId: string;
  currentActivity: StravaActivity | undefined;
  setCurrentActivity: (activity: StravaActivity) => void;
  fetchNextPage: () => void;
  // animation props
  animationState: string;
  currentFrame: number;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
  setViewState: (viewState: ViewState) => void;
  setCurrentPoint: (currentPoint: Position) => void;
  setCurrentFrame: (currentFrame: number) => void;
  handleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
  stravaPath: StravaRouteStream | undefined;
};

export default function ActivityList({
  activities,
  currentActivity,
  setCurrentActivity,
  currentActivityId,
  fetchNextPage,
  animationState,
  currentFrame,
  sliderRef,
  setAnimationState,
  setViewState,
  setCurrentPoint,
  setCurrentFrame,
  handleRouteControl,
  stravaPath,
}: ActivityListProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const getNavStyle = (isSidebarVisible: boolean) => {
    const expandedStyle =
      'z-30 flex flex-row items-center justify-center space-x-4 border-b-2 border-slate-400 pb-2';

    const collapsedStyle =
      'z-30 flex flex-row items-center justify-center space-x-4';

    return isSidebarVisible ? expandedStyle : collapsedStyle;
  };

  return (
    <div
      className='absolute top-20 left-0 z-20 ml-4 flex max-h-screen flex-col overflow-y-auto rounded-2xl border-2 border-black bg-gray-200 bg-opacity-70 p-4'
      style={{ maxHeight: '80vh' }}
    >
      <div className={getNavStyle(isSidebarVisible)}>
        {/* chevron to link back to list */}
        {showActivityDetail && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6'
            onClick={() => {
              setShowActivityDetail(false);
            }}
          >
            <path
              fill-rule='evenodd'
              d='M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z'
              clip-rule='evenodd'
            />
          </svg>
        )}

        {/* eye icon to hide sidebar */}
        {isSidebarVisible ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6 hover:text-pink-400'
            onClick={() => setIsSidebarVisible((prev) => !prev)}
          >
            <path d='M12 15a3 3 0 100-6 3 3 0 000 6z' />
            <path
              fill-rule='evenodd'
              d='M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z'
              clip-rule='evenodd'
            />
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6 hover:text-pink-400'
            onClick={() => setIsSidebarVisible((prev) => !prev)}
          >
            <path d='M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z' />
            <path d='M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z' />
            <path d='M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z' />
          </svg>
        )}

        <button onClick={fetchNextPage}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6'
          >
            <path
              fill-rule='evenodd'
              d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z'
              clip-rule='evenodd'
            />
          </svg>
        </button>
        <div className='flex h-8 w-8 items-center justify-center'>
          <svg viewBox='0 0 24 24'>
            <circle
              className='fill-transparent stroke-current stroke-2 text-blue-500'
              cx='12'
              cy='12'
              r='10'
            />
            <text
              className='text-center text-xs font-bold text-blue-500'
              x='50%'
              y='50%'
              dominant-baseline='middle'
              text-anchor='middle'
            >
              {activities.length}
            </text>
          </svg>
        </div>
      </div>
      {isSidebarVisible && !showActivityDetail && (
        <div className='flex flex-col space-y-8 overflow-auto'>
          {activities.map((activity) => (
            <div
              className='hover:border-2 hover:border-green-800 hover:bg-green-500 hover:bg-opacity-5'
              key={activity.id}
              onClick={() => {
                setShowActivityDetail(true);
                setCurrentActivity(activity);
              }}
            >
              <MapActivityRow
                activity={activity}
                currentActivityId={currentActivityId}
              />
            </div>
          ))}
        </div>
      )}

      {showActivityDetail && currentActivity && (
        <div className='m-4 flex flex-col space-y-2'>
          <h1 className='text-xl'>{currentActivity.name}</h1>
          <div className='flex flex-row space-x-1 text-slate-600 md:text-lg'>
            <p>
              {format(
                new Date(currentActivity.start_date),
                'EEEE, MMMM d yyyy'
              )}
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

          {stravaPath && (
            <MetricChart
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              stravaPath={stravaPath}
            />
          )}
          <div className='rounded-xl border-2 border-slate-400 bg-slate-300 bg-opacity-50'>
            <AnimationControl
              animationState={animationState}
              setAnimationState={setAnimationState}
              routeCoordinates={stravaPath?.latlng}
              currentFrame={currentFrame}
              sliderRef={sliderRef}
              setViewState={setViewState}
              setCurrentPoint={setCurrentPoint}
              setCurrentFrame={setCurrentFrame}
              handleRouteControl={handleRouteControl}
            />
          </div>
        </div>
      )}
    </div>
  );
}
