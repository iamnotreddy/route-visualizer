/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

import ActivityList from '@/components/ActivityList';
import Button from '@/components/buttons/Button';
import Layout from '@/components/layout/Layout';
import ArrowLink from '@/components/links/ArrowLink';
import UnstyledLink from '@/components/links/UnstyledLink';

import { ActivityListResponse, StravaActivity } from '@/api/types';

export default function HomePage() {
  const [activities, setActivities] = useState([] as StravaActivity[]);
  const [loading, setLoading] = useState(true);

  const { NODE_ENV = '' } = process.env;

  useEffect(() => {
    console.log('what env am i in?', process.env.NODE_ENV);
    console.log('boolean', process.env.NODE_ENV === 'production');
    console.log('what env am i in?', NODE_ENV);
    console.log('boolean', NODE_ENV === 'production');
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
      <main className='flex min-h-screen flex-grow flex-col items-center justify-center overflow-hidden bg-slate-100'>
        {activities[0] && activities.length > 0 && !loading ? (
          <div className='flex-grow overflow-auto'>
            <div className='h-screen overflow-y-scroll'>
              <ActivityList activities={activities} />
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center space-y-4'>
            <h1 className='mt-4'>Replay your favorite Strava activities</h1>
            <Button
              className='z-30'
              variant='dark'
              onClick={() => signIn('strava')}
            >
              Login
            </Button>

            <UnstyledLink
              href='https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Ftheodorusclarence%2Fts-nextjs-tailwind-starter'
              className='mt-4'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
            </UnstyledLink>
          </div>
        )}
        <footer className=' fixed bottom-0 mt-auto text-gray-700'>
          © {new Date().getFullYear()} By{' '}
          <ArrowLink href='https://github.com/iamnotreddy'>raveen</ArrowLink>
        </footer>
      </main>
    </Layout>
  );
}
