import { Position } from 'geojson';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { ChangeEvent, MutableRefObject } from 'react';

import Button from '@/components/buttons/Button';

type SignInPageProps = {
  sliderRef: MutableRefObject<null>;
  splashRouteCoordinates: Position[];
  splashCurrentFrame: number;
  splashHandleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function SignInPage({
  sliderRef,
  splashRouteCoordinates,
  splashCurrentFrame,
  splashHandleRouteControl,
}: SignInPageProps) {
  return (
    <div className='absolute inset-0 flex h-1/2 sm:inset-x-0 sm:items-center sm:justify-center sm:pt-4'>
      <div className='z-50 rounded-2xl border-2 border-slate-300 bg-slate-200 bg-opacity-70 p-10 shadow-lg'>
        <div className='flex max-w-2xl flex-col items-center justify-center space-y-2'>
          <p className='text-center text-2xl font-light'>
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
          <p className='text-xs'>
            RouteViz reads your activities directly from Strava. No data is
            saved externally
          </p>
        </div>
        <input
          className='hidden w-1/2 rounded-xl border-2 border-black bg-slate-100 py-2 px-4 hover:scale-y-125'
          ref={sliderRef}
          type='range'
          min={0}
          max={splashRouteCoordinates ? splashRouteCoordinates.length - 1 : 0}
          value={splashCurrentFrame}
          onChange={
            status === 'unauthenticated'
              ? splashHandleRouteControl
              : () => {
                  return;
                }
          }
        />
      </div>
    </div>
  );
}
