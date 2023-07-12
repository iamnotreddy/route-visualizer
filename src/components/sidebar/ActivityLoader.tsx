import { format } from 'date-fns';
import { useContext } from 'react';

import Button from '@/components/buttons/Button';

import { FetchingContext } from '@/pages';

export const ActivityLoader = () => {
  const { isRefetching, refetch, dateRange, setDateRange } =
    useContext(FetchingContext);

  return (
    <div className='flex flex-col items-center justify-center space-y-2  border-black py-4'>
      <p className='text-center text-xl'>Load More Activities From Strava</p>
      <div className='flex flex-row items-center justify-center space-x-2 text-sm font-light'>
        <div className='flex flex-col items-center justify-center space-y-1'>
          <p>Start Date</p>
          <input
            type='date'
            value={format(dateRange.startDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              setDateRange((prev) => ({
                ...prev,
                isDefault: false,
                startDate: new Date(e.target.value),
              }));
            }}
          />
        </div>
        <div className='flex flex-col items-center justify-center space-y-1'>
          <p>End Date</p>
          <input
            type='date'
            value={format(dateRange.endDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              setDateRange((prev) => ({
                ...prev,
                isDefault: false,
                endDate: new Date(e.target.value),
              }));
            }}
          />
        </div>
      </div>

      <Button
        variant='dark'
        isLoading={isRefetching}
        onClick={() => refetch()}
        className='w-1/4 justify-center'
      >
        <p>Load</p>
      </Button>

      <ul className='ml-2 flex flex-col space-y-1'>
        <li className='text-xs'>20 activities are loaded at a time</li>
        <li className='text-xs'>
          please note app performance will dip once ~100 activities are loaded
        </li>
      </ul>
    </div>
  );
};
