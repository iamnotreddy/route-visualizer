import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { getActivityList } from '@/helpers/fetchingFunctions';
import { StravaActivity } from '@/helpers/types';

const useActivityList = (dateRange: DateRange) => {
  const [allActivities, setAllActivities] = useState<StravaActivity[]>();

  const { status } = useSession();

  const {
    data: activities,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<StravaActivity[], Error>(
    ['activities', dateRange, new Date().getTime()],
    ({ pageParam = 1 }) => getActivityList(pageParam, dateRange),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length ? allPages.length + 1 : undefined;
      },
      enabled: status === 'authenticated',
    }
  );

  useEffect(() => {
    if (activities) {
      const newActivities = activities.pages.flatMap((page) => page);
      setAllActivities(newActivities);
    }
  }, [activities]);

  return {
    allActivities,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
  };
};

export default useActivityList;
