import Image from 'next/image';
import { signIn } from 'next-auth/react';

import Button from '@/components/buttons/Button';

export const InfoModal = () => {
  return (
    <div className='flex max-w-xl flex-col items-center justify-center'>
      <div className='flex flex-col justify-start space-y-4'>
        <p>
          re.play is a community map of running / biking routes across the
          world. Its also a visualization tool to enhance your Strava
          activities. You can relive journeys, explore your accomplishments, and
          watch captivating route animations—all accompanied by insightful
          performance charts.
        </p>
        <p>
          If you feel compelled, add your favorite routes to the community map
          to inspire others!
        </p>

        <p className='font-semibold'>
          Sign in with Strava to visualize your own activities, or browse the
          map to see where the re.play community has ventured to.
        </p>
      </div>

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
        <div className='flex flex-col space-y-1'>
          <p className='text-center text-xs'>
            re.play reads your activities directly from Strava. Data is only
            saved when you add your activity to the community map. Please be
            mindful about what locations you save to the map.
          </p>
        </div>
      </div>
    </div>
  );
};
