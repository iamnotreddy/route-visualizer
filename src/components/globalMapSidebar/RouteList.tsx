import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from 'react';

import { RouteDetail } from '@/components/globalMapSidebar/RouteDetail';
import RouteRow from '@/components/globalMapSidebar/RouteRow';
import {
  ChevronIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from '@/components/layout/icons';

import { getNavStyle } from '@/helpers/helpers';
import { GlobalMapRoute } from '@/pages/api/globalMap';

export const RouteList = React.memo(
  (props: {
    globalMapUserRoutes: GlobalMapRoute[];
    currentGlobalMapRoute: GlobalMapRoute | undefined;
    setCurrentGlobalMapRoute: Dispatch<
      SetStateAction<GlobalMapRoute | undefined>
    >;
  }) => {
    const {
      globalMapUserRoutes,
      currentGlobalMapRoute,
      setCurrentGlobalMapRoute,
    } = props;

    const [showRouteDetail, setShowRouteDetail] = useState(false);

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleShowRouteDetail = () => {
      setShowRouteDetail((prev) => {
        if (prev) {
          setCurrentGlobalMapRoute(undefined);
          return !prev;
        }
        return !prev;
      });
    };

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [currentGlobalMapRoute]);

    return (
      <div
        className='absolute top-20 left-0 z-20 ml-4 flex max-h-screen max-w-xs flex-col overflow-y-auto rounded-xl border-2 border-black bg-slate-200 bg-opacity-90 p-4'
        style={{ maxHeight: '80vh' }}
      >
        <div className='flex flex-col'>
          <div className={getNavStyle(isSidebarVisible)}>
            {/* chevron to link back to list */}
            {showRouteDetail && (
              <button onClick={handleShowRouteDetail}>
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

            {globalMapUserRoutes && (
              <div className='flex flex-row items-center justify-center space-x-2'>
                <div className='w-8 rounded-full border-2 border-slate-400 py-1 text-center text-xs font-semibold'>
                  {globalMapUserRoutes?.length}
                </div>
                <p className='text-xs'>routes loaded</p>
              </div>
            )}
          </div>
        </div>
        {isSidebarVisible && !showRouteDetail && (
          <div className='flex flex-col space-y-2 overflow-auto pt-2'>
            {globalMapUserRoutes &&
              globalMapUserRoutes.length > 0 &&
              globalMapUserRoutes.map((userRoute) => (
                <div
                  className='hover:cursor-pointer hover:rounded-lg hover:border-2 hover:border-black hover:bg-slate-700 hover:bg-opacity-5'
                  key={userRoute.strava_activity_id}
                  onClick={() => {
                    setShowRouteDetail(true);
                    setCurrentGlobalMapRoute(userRoute);
                  }}
                  ref={
                    userRoute.strava_activity_id ===
                    currentGlobalMapRoute?.strava_activity_id
                      ? scrollRef
                      : null
                  }
                >
                  <RouteRow
                    route={userRoute}
                    currentRouteId={currentGlobalMapRoute?.strava_activity_id.toString()}
                  />
                </div>
              ))}
          </div>
        )}
        {isSidebarVisible && showRouteDetail && currentGlobalMapRoute && (
          <RouteDetail userRoute={currentGlobalMapRoute} />
        )}
      </div>
    );
  }
);
