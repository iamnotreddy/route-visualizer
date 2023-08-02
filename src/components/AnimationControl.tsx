import { useContext } from 'react';

import { ActivityContext } from '@/components/globalMap';

export default function AnimationControl() {
  const {
    animationState,
    currentFrame,
    sliderRef,
    setAnimationState,
    handleRouteControl,
    stravaPath,
  } = useContext(ActivityContext);

  const routeCoordinates = stravaPath?.latlng;

  return (
    <>
      <div className='flex flex-row items-center space-x-2 py-2 px-4'>
        <button
          onClick={() => {
            setAnimationState('playing');
          }}
          title='play route animation'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={`h-6 w-6 hover:scale-125 ${
              !stravaPath ? 'animate-pulse' : ''
            }`}
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
          title='pause route animation'
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

        <input
          className=' accent-slate-200'
          ref={sliderRef}
          type='range'
          min={0}
          max={routeCoordinates ? Math.max(routeCoordinates.length - 1, 1) : 0}
          value={currentFrame}
          onChange={handleRouteControl}
          disabled={animationState == 'playing'}
        />
      </div>
    </>
  );
}
