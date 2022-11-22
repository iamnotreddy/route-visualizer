import { format } from 'date-fns';

import UnstyledLink from '@/components/links/UnstyledLink';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activity: StravaActivity;
};

export default function ActivityRow({ activity }: ActivityListProps) {
  return (
    <>
      <UnstyledLink href={`/activities/${activity.id}`}>
        <div className='grid grid-cols-5 p-4'>
          <p>{format(new Date(activity.start_date), 'yyyy-MM-dd hh:mm')}</p>
          <p>{activity.name}</p>
          <p>{(activity.distance * 0.000621371).toFixed(2)} miles</p>
        </div>
      </UnstyledLink>
    </>
  );
}
