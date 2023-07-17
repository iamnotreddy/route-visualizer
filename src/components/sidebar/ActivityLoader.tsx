import { format, isValid } from 'date-fns';
import { useContext } from 'react';

import Button from '@/components/buttons/Button';

import { FetchingContext } from '@/pages';

export const ActivityLoader = () => {
  const { isRefetching, refetch, dateRange, setDateRange } =
    useContext(FetchingContext);

  const handleDateRange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'start' | 'end'
  ) => {
    const date = new Date(e.target.value);

    if (isValid(date)) {
      if (type === 'start') {
        setDateRange((prev) => ({
          ...prev,
          isDefault: false,
          startDate: date,
        }));
      } else {
        setDateRange((prev) => ({ ...prev, isDefault: false, endDate: date }));
      }
    }
  };

  return (
    <div className='flex flex-col items-center justify-center space-y-2  border-black py-4'>
      <p className='text-center text-xl'>Load Activities From Strava</p>
      <div className='flex flex-row items-center justify-center space-x-2 text-sm font-light'>
        <div className='flex flex-col items-center justify-center space-y-1'>
          <p>Start Date</p>
          <input
            type='date'
            value={format(dateRange.startDate, 'yyyy-MM-dd')}
            onChange={(e) => handleDateRange(e, 'start')}
          />
        </div>
        <div className='flex flex-col items-center justify-center space-y-1'>
          <p>End Date</p>
          <input
            type='date'
            value={format(dateRange.endDate, 'yyyy-MM-dd')}
            onChange={(e) => handleDateRange(e, 'end')}
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
      <div className='flex max-w-sm flex-col space-y-1 text-xs font-light'>
        <p>Currently, only 50 Activities can be loaded at a time</p>
        <p>Adjust the date range if your activity is not visible</p>
      </div>
    </div>
  );
};
