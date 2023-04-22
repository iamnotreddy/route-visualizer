import ActivityRow from '@/components/ActivityRow';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activities: StravaActivity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className='flex w-full flex-col space-y-4 border-slate-200 p-4 md:max-w-4xl'>
      <h1 className='mt-4 text-center font-light md:text-4xl'>
        Your Activities
      </h1>
      {activities.slice(0, 4).map((activity) => (
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
