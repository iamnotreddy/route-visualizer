import { animated, useSpring } from '@react-spring/web';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ViewState } from 'react-map-gl';

import {
  findInitialViewState,
  findRouteLineString,
} from '@/helpers/initialValues';
import { StravaRouteStream } from '@/helpers/types';

type AnimationControlProps = {
  animationState: string;
  stravaPath: StravaRouteStream;
  currentFrame: number;
  isSidebarOpen: boolean;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
  setViewState: (viewState: ViewState) => void;
  setCurrentPoint: (currentPoint: Position) => void;
  setRouteLineString: (
    routeLineString: FeatureCollection<Geometry, GeoJsonProperties>
  ) => void;
  setLineCoordinates: (lineCoordinates: Position[]) => void;
  setCurrentFrame: (currentFrame: number) => void;
  handleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export default function AnimationControl({
  animationState,
  stravaPath,
  currentFrame,
  sliderRef,
  setAnimationState,
  setViewState,
  setCurrentPoint,
  setRouteLineString,
  setLineCoordinates,
  setCurrentFrame,
  handleRouteControl,
  isSidebarOpen,
  setIsSidebarOpen,
}: AnimationControlProps) {
  const { transform } = useSpring({
    transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(2340deg)',
  });

  const baseClass =
    'h-5 w-5 fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-purple-300';
  const selectedClass =
    'h-7 w-7 fill-purple-300 stroke-zinc-700 stroke-2 hover:scale-150 animate-pulse';

  return (
    <>
      <div className='ml-8 flex flex-row space-x-2 '>
        <button
          onClick={() => {
            setAnimationState('playing');
          }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6 hover:scale-125'
          >
            <path
              fill-rule='evenodd'
              d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z'
              clip-rule='evenodd'
            />
          </svg>
        </button>

        <button
          onClick={() => {
            setAnimationState('paused');
          }}
          disabled={animationState == 'paused'}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6 hover:scale-125'
          >
            <path
              fill-rule='evenodd'
              d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9zm5.25 0a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.75z'
              clip-rule='evenodd'
            />
          </svg>
        </button>
        <button
          onClick={() => {
            if (stravaPath) {
              setViewState(findInitialViewState(stravaPath.latlng));
              setCurrentPoint(stravaPath.latlng[0]);
              setRouteLineString(findRouteLineString(stravaPath.latlng));
              setLineCoordinates([]);
              setCurrentFrame(0);
            }
          }}
          disabled={animationState == 'playing'}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-6 w-6 hover:scale-125'
          >
            <path
              fill-rule='evenodd'
              d='M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z'
              clip-rule='evenodd'
            />
          </svg>
        </button>

        <button onClick={() => setIsSidebarOpen((prev) => !prev)}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={isSidebarOpen ? baseClass : selectedClass}
          >
            <animated.path
              fill-rule='evenodd'
              d='M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z'
              clip-rule='evenodd'
              style={{ transform, transformOrigin: 'center' }}
            />
            <animated.path
              fill-rule='evenodd'
              d='M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z'
              clip-rule='evenodd'
              style={{ transform, transformOrigin: 'center' }}
            />
          </svg>
        </button>

        <input
          className='w-1/2 rounded-xl border-2 border-black bg-slate-100 py-2 px-4 hover:scale-y-125'
          ref={sliderRef}
          type='range'
          min={0}
          max={stravaPath ? stravaPath.latlng.length - 1 : 0}
          value={currentFrame}
          onChange={handleRouteControl}
          disabled={animationState == 'playing'}
        />
      </div>
    </>
  );
}
