import Image from 'next/image';
import { signIn } from 'next-auth/react';

import Button from '@/components/buttons/Button';
import { InfoCircle } from '@/components/layout/icons';

export const InfoModal = () => {
  return (
    <div className='absolute inset-0 flex h-1/2 sm:inset-x-0 sm:items-center sm:justify-center sm:pt-4'>
      <div className='z-50 rounded-2xl border-2 border-slate-300 bg-slate-200 bg-opacity-80 p-10 shadow-lg'>
        <div className='flex max-w-xl flex-col items-center justify-center space-y-2'>
          <div className='flex flex-col justify-start space-y-1 text-sm'>
            <p className='text-center text-3xl font-semibold'>
              Discover Your Adventures
            </p>
            <p className='text-base'>
              re.play brings your Strava activities to life with an interactive
              3D heatmap.
            </p>
            <p className='py-2'>
              Relive your journeys, explore your accomplishments, and watch
              captivating route animations—all accompanied by insightful
              performance charts.
            </p>
          </div>

          <p className='text-center text-base font-semibold'>
            Sign in with Strava to visualize your activities
          </p>

          <div className='py-2'>
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
          <div className='flex max-w-sm flex-row items-center justify-center space-x-2 text-xs font-light'>
            <InfoCircle />
            <div className='flex flex-col space-y-1'>
              <p className='text-center text-xs'>
                re.play reads your activities directly from Strava.
              </p>
              <p className='font-bold'> No data is saved externally.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
