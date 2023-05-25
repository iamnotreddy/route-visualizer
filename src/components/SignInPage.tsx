import Image from 'next/image';
import { signIn } from 'next-auth/react';

import Button from '@/components/buttons/Button';

export default function SignInPage() {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 '>
      <h1 className='text-center text-3xl md:text-4xl'>
        Replay your Strava activities
      </h1>
      <Button className='z-30' variant='dark' onClick={() => signIn('strava')}>
        <p className='md:text-xl'>Login</p>
        <Image
          src='/images/strava_logo.png'
          alt='Strava Logo'
          width={25}
          height={25}
        />
      </Button>
    </div>
  );
}
