import ActivityRow from '@/components/ActivityRow';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activities: StravaActivity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className='flex flex-col space-y-4  border-2 border-slate-200 p-4 shadow-2xl'>
      {activities.slice(0, 2).map((activity) => (
        <div
          className='border-2 border-slate-500 hover:scale-105 hover:bg-emerald-50'
          key={activity.id}
        >
          <ActivityRow activity={activity} />
        </div>
      ))}
    </div>
  );
}
