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
      <main className=' bg-slate-100'>
        <div className='flex flex-col items-center space-y-4 '>
          <h1 className='mt-8 font-extralight'>Your Activities</h1>

          {activities[0] && activities.length > 0 && !loading ? (
            <ActivityList activities={activities} />
          ) : (
            <div className='space-y-4'>
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
          <footer className=' text-gray-700'>
            © {new Date().getFullYear()} By{' '}
            <ArrowLink href='https://github.com/iamnotreddy'>raveen</ArrowLink>
          </footer>
        </div>
      </main>
    </Layout>
  );
}
