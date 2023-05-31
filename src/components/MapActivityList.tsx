import MapActivityRow from '@/components/MapActivityRow';

import { StravaActivity } from '@/helpers/types';

type ActivityListProps = {
  activities: StravaActivity[];
  currentActivityId: string;
  setCurrentActivity: (activity: StravaActivity) => void;
};

export default function ActivityList({
  activities,
  setCurrentActivity,
  currentActivityId,
}: ActivityListProps) {
  return (
    <div className='flex flex-col space-y-8 overflow-y-auto'>
      {activities.map((activity) => (
        <div
          className='hover:border-2 hover:border-green-800 hover:bg-green-500 hover:bg-opacity-5'
          key={activity.id}
          onClick={() => setCurrentActivity(activity)}
        >
          <MapActivityRow
            activity={activity}
            currentActivityId={currentActivityId}
          />
        </div>
      ))}
    </div>
  );
}
