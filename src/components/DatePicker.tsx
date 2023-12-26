import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import * as React from 'react';
import { useContext } from 'react';

import { cn } from '@/lib/utils';

import Button from '@/components/buttons/Button';
import { Calendar } from '@/components/primitives/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/primitives/Popover';

import { FetchingContext } from '@/pages';

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isRefetching, refetch, dateRange, setDateRange } =
    useContext(FetchingContext);

  const date = dateRange;
  const setDate = setDateRange;

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant='light'
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div className='my-2 flex flex-row justify-center '>
            <Button
              variant='light'
              isLoading={isRefetching}
              onClick={() => refetch()}
              className='w-1/4 justify-center'
            >
              <p>Load</p>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
