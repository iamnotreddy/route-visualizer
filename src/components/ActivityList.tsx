import ActivityRow from '@/components/ActivityRow';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activities: StravaActivity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className='overflow-auto'>
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
