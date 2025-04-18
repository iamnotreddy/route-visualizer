import Image from 'next/image';
import { signIn } from 'next-auth/react';

import Button from '@/components/buttons/Button';

export const InfoModal = () => {
  return (
    <div className='flex max-w-xl flex-col items-center justify-center'>
      <div className='flex flex-col justify-start space-y-4'>
        <div>
          re.play is a community map of running / biking routes across the
          world. Its also a visualization tool that adds perspective to your
          Strava activities.
        </div>
        <div>
          If you feel compelled, you can add your favorite routes to the
          community map to inspire others!
        </div>

        <div className='mb-4 text-center font-semibold'>
          Sign in with Strava to relive your activities by watching captivating
          route animations accompanied by insightful performance charts.
        </div>
      </div>

      <div className='py-2'>
        <Button
          className='z-30'
          variant='dark'
          onClick={() => signIn('strava')}
        >
          <div className='md:text-xl'>Login</div>
          <Image
            src='/images/strava_logo.png'
            alt='Strava Logo'
            width={25}
            height={25}
          />
        </Button>
      </div>
      <div className='text-center font-bold'>
        Or exit this modal to browse the community map to see where re.play
        users have ventured to.
      </div>
      <div className='flex max-w-sm flex-row items-center justify-center space-x-2 text-xs font-light'>
        <div className='flex flex-col space-y-1'>
          <div className='mt-8 text-center text-xs'>
            re.play reads your activities directly from Strava. Data is only
            saved when you add your activity to the community map. Please be
            mindful about what locations you save to the map.
          </div>
        </div>
      </div>
    </div>
  );
};
