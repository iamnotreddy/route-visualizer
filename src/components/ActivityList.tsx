import ActivityRow from '@/components/ActivityRow';

import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activities: StravaActivity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className='layout z-20 m-8 h-96 overflow-auto shadow-lg'>
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
