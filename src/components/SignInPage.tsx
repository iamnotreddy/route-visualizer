import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import Button from '@/components/buttons/Button';
import { useSplashAnimation } from '@/components/hooks/useSplashAnimation';
import Header from '@/components/layout/Header';

import { findInitialViewState } from '@/helpers/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  mapConfig,
  skyLayer,
  skySource,
} from '@/helpers/layers';

export default function SignInPage() {
  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  const {
    animatedLineCoordinates: splashAnimationedCoordinates,
    splashRouteCoordinates,
    handleRouteControl: splashHandleRouteControl,
    currentFrame: splashCurrentFrame,
  } = useSplashAnimation(mapRef, 'playing');

  const [viewState, setViewState] = useState<ViewState>(
    findInitialViewState(splashRouteCoordinates)
  );

  // record viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  return (
    <div className='relative flex max-h-screen w-full'>
      <div className='absolute top-0 left-0 z-20 w-full'>
        <Header />
      </div>
      <div className='flex-grow-0'>
        <Map
          {...viewState}
          ref={mapRef}
          onMove={handleMoveEvent}
          {...mapConfig}
        >
          {/* layer to style sky */}
          <Source {...skySource}>
            <Layer {...skyLayer} />
          </Source>

          {/* animated coordinates for the splash route */}
          {splashAnimationedCoordinates && (
            <Source {...defineLineSource(splashAnimationedCoordinates)}>
              <Layer {...animatedLineLayerStyle} />
            </Source>
          )}
        </Map>
      </div>
      <div className='absolute inset-0 flex h-1/2 sm:inset-x-0 sm:items-center sm:justify-center sm:pt-4'>
        <div className='z-50 rounded-2xl border-2 border-slate-300 bg-slate-200 bg-opacity-40 p-10 shadow-lg'>
          <div className='flex max-w-xl flex-col items-center justify-center space-y-2'>
            <p className='text-center text-3xl font-light'>
              A utility for exploring the areas you work out in.
            </p>
            <p className='text-center text-base'>
              Sign in with Strava to visualize your workouts
            </p>

            <div className='py-4'>
              <Button
                className='z-30'
                variant='dark'
                onClick={() => signIn('strava')}
              >
                <p className='md:text-xl'>Login</p>
                <Image
                  src='/images/strava_logo.png'
                  alt='Strava Logo'
                  width={25}
                  height={25}
                />
              </Button>
            </div>
            <div className='flex max-w-sm flex-col space-y-1 text-xs font-light'>
              <p className='text-center text-xs'>
                re.play reads your activities directly from Strava.
              </p>
              <p className='text-center text-sm font-bold'>
                No data is saved externally.
              </p>
            </div>
          </div>
          <input
            className='hidden w-1/2 rounded-xl border-2 border-black bg-slate-100 py-2 px-4 hover:scale-y-125'
            ref={sliderRef}
            type='range'
            min={0}
            max={splashRouteCoordinates ? splashRouteCoordinates.length - 1 : 0}
            value={splashCurrentFrame}
            onChange={splashHandleRouteControl}
          />
        </div>
      </div>
    </div>
  );
}
