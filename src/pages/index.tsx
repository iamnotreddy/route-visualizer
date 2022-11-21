import { signIn } from 'next-auth/react';
import * as React from 'react';
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
      // const activityData: StravaActivity[] = response['data'][0];
    };
    getActivityList();
  }, []);

  return (
    <Layout>
      <main>
        <section className='bg-slate-100'>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
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
            <footer className='absolute bottom-2 text-gray-700'>
              © {new Date().getFullYear()} By{' '}
              <ArrowLink href='https://github.com/iamnotreddy'>
                raveen
              </ArrowLink>
            </footer>
          </div>
        </section>
      </main>
    </Layout>
  );
}
