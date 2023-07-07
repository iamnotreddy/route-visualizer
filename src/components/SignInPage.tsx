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
    <div className='absolute inset-0 flex h-1/2 p-8 pt-20 sm:inset-x-0 sm:items-center sm:justify-center sm:pt-4'>
      <div className='z-50 rounded-2xl border-2 border-slate-300 bg-slate-200 bg-opacity-70 p-20 shadow-lg'>
        <div className='flex flex-col items-center justify-center space-y-4 '>
          <h1 className='text-center text-3xl md:text-4xl'>[Title]</h1>
          <p> A utility for exploring the areas you work out in.</p>
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
          <p className='text-xs'>
            [name] reads your activities directly from Strava. No data is saved
            externally.{' '}
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
