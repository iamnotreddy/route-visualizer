import { format } from 'date-fns';
import Link from 'next/link';

import Button from '@/components/buttons/Button';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activity: StravaActivity;
};

export default function ActivityRow({ activity }: ActivityListProps) {
  return (
    <>
      <div className='z-20 grid grid-cols-5 border-dashed border-slate-400'>
        <p>{format(new Date(activity.start_date), 'yyyy-MM-dd hh:mm')}</p>
        <p>{activity.name}</p>
        <p>{(activity.distance * 0.000621371).toFixed(2)} miles</p>
        <p>{activity.id}</p>
        <Link href={`/activities/${activity.id}`}>
          <Button variant='light' className='p-2 text-center'>
            Visualize
          </Button>
        </Link>
      </div>
    </>
  );
}
