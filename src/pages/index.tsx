import { useInfiniteQuery } from '@tanstack/react-query';

import GlobalMap from '@/components/globalMap';

import { getActivityList } from '@/helpers/fetchingFunctions';
import { StravaActivity } from '@/helpers/types';

export default function HomePage() {
  const {
    data: activities,
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

  // map all pages into one array
  const allActivities = activities
    ? activities.pages.flatMap((page) => page)
    : [];

  return (
    <GlobalMap
      activities={allActivities}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
    // )
  );
}
