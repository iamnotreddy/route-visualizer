import { Position } from 'geojson';
import { useSession } from 'next-auth/react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Map, { Layer, MapRef, Marker, Source, ViewState } from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import useActivityPolylines from '@/components/hooks/useActivityPolylines';
import { useRouteAnimation } from '@/components/hooks/useRouteAnimation';
import Header from '@/components/layout/Header';
import { ActivityList } from '@/components/sidebar/ActivityList';

import {
  findActivityViewState,
  getPolyLineCoordinates,
} from '@/helpers/helpers';
import {
  animatedLineLayerStyle,
  currentPointStyle,
  defineLineLayerStyle,
  defineLineSource,
  definePointSource,
  endPointStyle,
  getPolylineLayerStyle,
  mapConfig,
  skyLayerStyle,
  skySource,
  startPointStyle,
} from '@/helpers/layers';
import { ActivityContextType, StravaActivity } from '@/helpers/types';
import { FetchingContext } from '@/pages';

export const ActivityContext = createContext<ActivityContextType>(
  {} as ActivityContextType
);

export default function GlobalMap() {
  const { allActivities: activities } = useContext(FetchingContext);

  const { status } = useSession();

  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [viewState, setViewState] = useState<ViewState>();

  const [currentActivity, setCurrentActivity] = useState<StravaActivity>();
  const [startPoint, setStartPoint] = useState<Position>();
  const [endPoint, setEndPoint] = useState<Position>();
  const [animationState, setAnimationState] = useState<'playing' | 'paused'>(
    'paused'
  );

  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  // hook for current route animation
  const {
    refetchActivityStream,
    animatedLineCoordinates,
    currentPoint,
    setCurrentPoint,
    handleRouteControl,
    currentFrame,
    setCurrentFrame,
    stravaPath,
    isActivityStreamFetching,
  } = useRouteAnimation(currentActivity?.id, mapRef, animationState);

  const { polylineLayer } = useActivityPolylines(activities, currentActivity);

  const contextValues = {
    refetchActivityStream,
    isActivityStreamFetching,
    currentActivity,
    setCurrentActivity,
    stravaPath,
    animationState,
    setAnimationState,
    currentFrame,
    sliderRef,
    setViewState,
    setCurrentPoint,
    setCurrentFrame,
    handleRouteControl,
    showActivityDetail,
    setShowActivityDetail,
  };

  const memoizedPolylineLayer = useMemo(() => {
    if (polylineLayer && currentFrame === 0) {
      return (
        <Source type='geojson' data={polylineLayer}>
          <Layer {...getPolylineLayerStyle()} />
        </Source>
      );
    }
  }, [polylineLayer, currentFrame]);

  const memoizedCurrentActivity = useMemo(() => {
    if (currentActivity && activities && activities.length > 0) {
      const activity = activities.filter(
        (activity) => activity.id === currentActivity.id
      )[0];

      if (activity && activity.map.summary_polyline) {
        const coordinates = getPolyLineCoordinates(
          activity.map.summary_polyline
        );

        return (
          <Source {...defineLineSource(coordinates)}>
            <Layer {...defineLineLayerStyle(animationState, currentFrame)} />
          </Source>
        );
      }
    }
  }, [activities, animationState, currentActivity, currentFrame]);

  const memoizedStartAndEndPoints = useMemo(() => {
    if (startPoint && endPoint) {
      return (
        <>
          <Source {...definePointSource(startPoint)}>
            <Layer {...startPointStyle} />
          </Source>
          <Source {...definePointSource(endPoint)}>
            <Layer {...endPointStyle} />
          </Source>
        </>
      );
    }
  }, [startPoint, endPoint]);

  const memoizedMarkers = useMemo(
    () =>
      activities?.map((activity) => {
        const handleMarkerOnClick = (routeId: string) => {
          if (activities) {
            const nextActivity = activities.filter((x) => routeId === x.id)[0];
            setCurrentActivity(nextActivity);
          }
        };

        const startCoordinate =
          getPolyLineCoordinates(activity.map.summary_polyline)[0] ?? [];

        if (
          Number.isFinite(startCoordinate[0]) &&
          Number.isFinite(startCoordinate[1]) &&
          !currentActivity
        ) {
          return (
            <Marker
              key={activity.id}
              longitude={startCoordinate[0]}
              latitude={startCoordinate[1]}
              scale={0.5}
              color='black'
              onClick={() => handleMarkerOnClick(activity.id)}
            />
          );
        }
      }),
    [activities, currentActivity]
  );

  const memoizedAnimation = useMemo(() => {
    return (
      <Source {...defineLineSource(animatedLineCoordinates)}>
        <Layer {...animatedLineLayerStyle} />
      </Source>
    );
  }, [animatedLineCoordinates]);

  // toggle selected activity on map
  useEffect(() => {
    if (currentActivity) {
      const polyLine = getPolyLineCoordinates(
        currentActivity.map.summary_polyline
      );
      setStartPoint(polyLine[0]);
      setEndPoint(polyLine[polyLine.length - 1]);
      findActivityViewState(polyLine, mapRef);
      setShowActivityDetail(true);
    }
  }, [currentActivity]);

  useEffect(() => {
    // center map on first activity with valid lat lng coordinates
    if (activities) {
      const validActivity = activities.find(
        (activity) => activity.start_latlng
      );

      if (validActivity) {
        findActivityViewState([activities[0].start_latlng], mapRef);
      }
    }
  }, [activities]);

  if (status === 'loading') {
    return <div className='flex items-center justify-center'>Loading...</div>;
  }

  return (
    <ActivityContext.Provider value={contextValues}>
      <div className='relative flex max-h-screen w-full'>
        <div className='absolute top-0 left-0 z-20 w-full'>
          <Header />
        </div>
        <ActivityList />
        <div className='flex-grow-0'>
          <Map {...viewState} ref={mapRef} {...mapConfig}>
            {/* layer to style sky */}
            <Source {...skySource}>
              <Layer {...skyLayerStyle} />
            </Source>

            {/* current point during route animation */}
            {currentPoint && !isActivityStreamFetching && showActivityDetail && (
              <Source {...definePointSource(currentPoint)}>
                <Layer {...currentPointStyle} />
              </Source>
            )}
            {memoizedPolylineLayer}
            {memoizedCurrentActivity}
            {memoizedStartAndEndPoints}
            {memoizedMarkers}
            {memoizedAnimation}
          </Map>
        </div>
      </div>
    </ActivityContext.Provider>
  );
}
