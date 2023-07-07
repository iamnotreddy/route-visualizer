import { useContext, useState } from 'react';

import { ActivityDetail } from '@/components/ActivityDetail';
import MapActivityRow from '@/components/ActivityRow';
import { ActivityContext } from '@/components/GlobalMap';
import {
  ActivityNumberCircle,
  ChevronIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  PlusIcon,
} from '@/components/icons';

import { getNavStyle } from '@/helpers/helpers';

export default function ActivityList() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const {
    activities,
    currentActivity,
    setCurrentActivity,
    fetchNextPage,
    showActivityDetail,
    setShowActivityDetail,
  } = useContext(ActivityContext);

  const handleShowActivityDetail = () => {
    setShowActivityDetail((prev) => {
      if (prev) {
        setCurrentActivity(undefined);
        return !prev;
      }
      return !prev;
    });
  };

  return (
    <div
      className='absolute top-20 left-0 z-20 ml-4 flex max-h-screen flex-col overflow-y-auto rounded-xl border-2 border-black bg-slate-200 bg-opacity-90 p-4'
      style={{ maxHeight: '80vh' }}
    >
      <div className={getNavStyle(isSidebarVisible)}>
        {/* chevron to link back to list */}
        {showActivityDetail && (
          <button onClick={handleShowActivityDetail}>
            <ChevronIcon />
          </button>
        )}

        {/* eye icon to hide sidebar */}
        {isSidebarVisible ? (
          <button onClick={() => setIsSidebarVisible((prev) => !prev)}>
            <EyeOpenIcon />
          </button>
        ) : (
          <button onClick={() => setIsSidebarVisible((prev) => !prev)}>
            <EyeClosedIcon />
          </button>
        )}

        <button onClick={fetchNextPage}>
          <PlusIcon />
        </button>
        <div className='flex h-8 w-8 items-center justify-center'>
          <ActivityNumberCircle number={activities.length} />
        </div>
      </div>
      {isSidebarVisible && !showActivityDetail && (
        <div className='flex flex-col space-y-2 overflow-auto'>
          {activities.map((activity) => (
            <div
              className='hover:rounded-lg hover:border-2 hover:border-green-800 hover:bg-green-500 hover:bg-opacity-5'
              key={activity.id}
              onClick={() => {
                setShowActivityDetail(true);
                setCurrentActivity(activity);
              }}
            >
              <MapActivityRow
                activity={activity}
                currentActivityId={currentActivity?.id}
              />
            </div>
          ))}
        </div>
      )}

      {isSidebarVisible && showActivityDetail && currentActivity && (
        <ActivityDetail />
      )}
    </div>
  );
}
