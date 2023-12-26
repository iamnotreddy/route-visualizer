import { useContext, useEffect, useRef, useState } from 'react';
import React from 'react';

import { DatePickerWithRange } from '@/components/DatePicker';
import { ActivityContext } from '@/components/globalMap';
import {
  ChevronIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from '@/components/layout/icons';
import { ActivityDetail } from '@/components/sidebar/ActivityDetail';
import MapActivityRow from '@/components/sidebar/ActivityRow';

import { getNavStyle } from '@/helpers/helpers';
import { FetchingContext } from '@/pages';

export const ActivityList = React.memo(() => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const { allActivities: activities } = useContext(FetchingContext);

  const {
    currentActivity,
    setCurrentActivity,
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentActivity]);

  return (
    <div
      className='absolute top-20 left-0 z-20 ml-4 flex max-h-screen flex-col overflow-y-auto rounded-xl border-2 border-black bg-slate-200 bg-opacity-90 p-4'
      style={{ maxHeight: '80vh' }}
    >
      <div className='flex flex-col'>
        <div className={getNavStyle(isSidebarVisible)}>
          {/* chevron to link back to list */}
          {showActivityDetail && (
            <button onClick={handleShowActivityDetail}>
              <ChevronIcon />
            </button>
          )}

          <DatePickerWithRange />
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
        </div>
      </div>
      {isSidebarVisible && !showActivityDetail && (
        <div className='flex flex-col space-y-2 overflow-auto pt-2'>
          {activities &&
            activities.length > 0 &&
            activities.map((activity) => (
              <div
                className='hover:cursor-pointer hover:rounded-lg hover:border-2 hover:border-black hover:bg-slate-700 hover:bg-opacity-5'
                key={activity.id}
                onClick={() => {
                  setShowActivityDetail(true);
                  setCurrentActivity(activity);
                }}
                ref={activity.id === currentActivity?.id ? scrollRef : null}
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
});
