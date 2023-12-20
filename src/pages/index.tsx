import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useSession } from 'next-auth/react';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import GlobalMap from '@/components/globalMap';
import { DateRangeInput } from '@/components/hooks/useActivityList';
import NewSignInPage from '@/components/NewSignInPage';

import {
  getActivityList,
  getRoutesOnGlobalMap,
} from '@/helpers/fetchingFunctions';
import { StravaActivity } from '@/helpers/types';
import { GlobalMapRoute } from '@/pages/api/globalMap';

type FetchingContext = {
  allActivities: StravaActivity[] | undefined;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  dateRange: DateRangeInput;
  setDateRange: Dispatch<SetStateAction<DateRangeInput>>;
  globalMapUserRoutes: GlobalMapRoute[] | undefined;
};

export const FetchingContext = createContext<FetchingContext>(
  {} as FetchingContext
);

export default function HomePage() {
  const { status } = useSession();

  const currentDate = new Date();
  const priorDate = subDays(currentDate, 90);

  const [dateRange, setDateRange] = useState({
    startDate: currentDate,
    endDate: priorDate,
    isDefault: true,
  });

  const [allActivities, setAllActivities] = useState<StravaActivity[]>();

  const {
    data: activities,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<StravaActivity[], Error>(
    ['activities'],
    ({ pageParam = 1 }) => getActivityList(pageParam, dateRange),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length ? allPages.length + 1 : undefined;
      },
      enabled: status === 'authenticated',
    }
  );

  const { data: globalMapUserRoutes } = useQuery(['globalMapUserRoutes'], () =>
    getRoutesOnGlobalMap()
  );

  useEffect(() => {
    if (status === 'authenticated' && activities) {
      const newActivities = activities.pages.flatMap((page) => page);
      setAllActivities(newActivities);
    }
  }, [activities, status]);

  const fetchingContextValues = {
    allActivities,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    fetchNextPage,
    refetch,
    dateRange,
    setDateRange,
    globalMapUserRoutes,
  };

  if (status === 'authenticated') {
    return (
      <FetchingContext.Provider value={fetchingContextValues}>
        <GlobalMap />
      </FetchingContext.Provider>
    );
  }

  if (globalMapUserRoutes) {
    return <NewSignInPage globalMapUserRoutes={globalMapUserRoutes} />;
  }

  // return signin page if not authenticated
  return <div className='flex items-center justify-center'>Loading...</div>;
}
