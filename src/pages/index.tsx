import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

import ActivityList from '@/components/ActivityList';
import Button from '@/components/buttons/Button';
import Layout from '@/components/layout/Layout';

import { ActivityListResponse, StravaActivity } from '@/api/types';

export default function HomePage() {
  const [activities, setActivities] = useState([] as StravaActivity[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getActivityList = async () => {
      try {
        const response = await fetch('/api/strava/activities');

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = (await response.json()) as ActivityListResponse;

        setActivities(data.data[0]);
      } finally {
        setLoading(false);
      }
    };
    getActivityList();
  }, []);

  return (
    <Layout>
      <main className='flex min-h-screen flex-col items-center justify-center overflow-hidden'>
        {activities[0] && activities.length > 0 && !loading ? (
          <div className='flex-grow overflow-auto'>
            <div className='h-screen overflow-y-scroll'>
              <ActivityList activities={activities} />
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center space-y-4'>
            <h1 className='text-center text-3xl md:text-4xl'>
              Replay your Strava activities
            </h1>
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
        )}
      </main>
    </Layout>
  );
}
