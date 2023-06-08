import ActivityRow from '@/components/archived/ActivityRow';

import { StravaActivity } from '@/helpers/types';

type ActivityListProps = {
  activities: StravaActivity[];
  showPolyLineMap: boolean;
  disableActivityLink: boolean;
};

export default function ActivityList({
  activities,
  showPolyLineMap,
  disableActivityLink,
}: ActivityListProps) {
  return (
    <div className='flex flex-col space-y-4 border-slate-200 p-4 shadow-xl md:max-w-4xl'>
      <h1 className='mt-4 text-center font-light md:text-4xl'>
        Your Activities
      </h1>
      {activities.map((activity) => (
        <div
          className='border-2 border-slate-500 hover:scale-105 hover:bg-emerald-50'
          key={activity.id}
        >
          <ActivityRow
            activity={activity}
            showPolyLineMap={showPolyLineMap}
            disableActivityLink={disableActivityLink}
          />
        </div>
      ))}
    </div>
  );
}
