/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import Button from '@/components/buttons/Button';

import { StravaActivity } from '@/api/types';

export default function Home() {
  const { data: session, status } = useSession();

  const [activities, setActivities] = useState([] as StravaActivity[]);

  let imageLink = '';

  if (typeof session?.user?.image == 'string') {
    imageLink = session.user?.image;
  }

  const handleStravaRequest = async () => {
    const response = await fetch('/api/strava/activities', {
      method: 'POST',
    }).then((res) => res.json());

    const activityData: StravaActivity[] = response['data'][0];

    setActivities(activityData);
  };

  return (
    <main className='flex h-screen justify-center bg-slate-800'>
      <div className='m-auto space-y-4'>
        <h1 className='text-4xl'>Connect to Strava</h1>
        <Button
          className='z-30'
          variant='dark'
          onClick={() => signIn('strava')}
        >
          Login
        </Button>
        <Button className='z-30' variant='dark' onClick={() => signOut()}>
          Logout
        </Button>
        <p>status: {status}</p>
        {session && <p>{session.user?.name}</p>}
        {session && <p>{session.user?.email}</p>}
        {session && <img src={imageLink} />}
        <Button onClick={handleStravaRequest} variant='light'>
          Fetch Activities
        </Button>

        <div className='grid grid-cols-5 divide-x-2 divide-slate-700 border-2 border-slate-700 text-center'>
          <p>Date</p>
          <p>Name</p>
          <p>Distance</p>
          <p>ID</p>
          <p>.</p>
        </div>
        {activities &&
          activities.map((activity) => {
            return (
              <div
                key={activity.id}
                className='grid grid-cols-5 divide-x-2 divide-slate-700 border-2 border-slate-700 text-center'
              >
                <p>{activity.start_date}</p>
                <p>{activity.name}</p>
                <p>{(activity.distance * 0.000621371).toFixed(2)} miles</p>
                <p>{activity.id}</p>
                <Link href={`/activities/${activity.id}`}>
                  <Button variant='light' className='p-2 text-center'>
                    Visualize
                  </Button>
                </Link>
              </div>
            );
          })}
      </div>
    </main>
  );
}
