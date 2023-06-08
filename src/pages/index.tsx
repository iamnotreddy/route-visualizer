import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import GlobalMap from '@/components/globalMap';
import SignInPage from '@/components/SignInPage';

import { getActivityList } from '@/helpers/fetchingFunctions';
import { StravaActivity } from '@/helpers/types';

export default function HomePage() {
  const {
    data: activities,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ['activities'],
    ({ pageParam = 1 }) => getActivityList(pageParam),
    {
      getNextPageParam: (
        lastPage: StravaActivity[],
        allPages: Array<StravaActivity[]>
      ) => {
        return lastPage.length ? allPages.length + 1 : undefined;
      },
    }
  );

  const { status } = useSession();

  // map all pages into one array
  const allActivities = activities
    ? activities.pages.flatMap((page) => page)
    : [];

  if (status === 'unauthenticated') {
    return <SignInPage />;
  }

  if (status === 'loading' && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    allActivities &&
    allActivities.length > 0 && (
      <GlobalMap
        activities={allActivities}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    )
  );
}
