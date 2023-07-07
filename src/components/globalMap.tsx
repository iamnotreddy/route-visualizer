import { Position } from 'geojson';
import { useSession } from 'next-auth/react';
import {
  ChangeEvent,
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import MapActivityList from '@/components/ActivityList';
import { useRouteAnimation } from '@/components/hooks/useRouteAnimation';
import { useSplashAnimation } from '@/components/hooks/useSplashAnimation';
import Header from '@/components/layout/Header';
import SignInPage from '@/components/SignInPage';

import {
  findGlobalMapViewState,
  getCurrentRouteCoordinates,
  getPolyLineCoordinates,
} from '@/helpers/helpers';
import {
  findInitialViewState,
  findRouteLineString,
} from '@/helpers/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  definePointSource,
  endPointLayerStyle,
  getPolylineLayerStyle,
  mapConfig,
  pointLayerStyle,
  singleLineLayerStyle,
  skyLayer,
  skySource,
  startPointLayerStyle,
} from '@/helpers/layers';
import {
  PolylineObj,
  StravaActivity,
  StravaRouteStream,
} from '@/helpers/types';

type GlobalMapHomePageProps = {
  activities: StravaActivity[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

type ActivityContext = {
  activities: StravaActivity[];
  showActivityDetail: boolean;
  setShowActivityDetail: Dispatch<SetStateAction<boolean>>;
  currentActivity: StravaActivity | undefined;
  setCurrentActivity: Dispatch<SetStateAction<StravaActivity | undefined>>;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  // animation props
  animationState: string;
  currentFrame: number;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
  setViewState: Dispatch<SetStateAction<ViewState | undefined>>;
  setCurrentPoint: (currentPoint: Position) => void;
  setCurrentFrame: (currentFrame: number) => void;
  handleRouteControl: (e: ChangeEvent<HTMLInputElement>) => void;
  stravaPath: StravaRouteStream | undefined;
};

export const ActivityContext = createContext<ActivityContext>(
  {} as ActivityContext
);

export default function GlobalMap({
  activities,
  fetchNextPage,
  isFetchingNextPage,
}: GlobalMapHomePageProps) {
  const { status } = useSession();
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const [viewState, setViewState] = useState<ViewState>();

  // array of all fetched activities' geojson objects
  const [routeLineStrings, setRouteLineStrings] = useState(
    [] as Array<PolylineObj>
  );

  const [currentActivity, setCurrentActivity] = useState<StravaActivity>();

  const [startPoint, setStartPoint] = useState<Position>();
  const [endPoint, setEndPoint] = useState<Position>();

  const [animationState, setAnimationState] = useState<'playing' | 'paused'>(
    'paused'
  );

  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  // initialize drawing of route
  const handleOnMapLoad = () => {
    setHasMapLoaded(true);
  };

  // record viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  // hook for splash route animation
  const {
    animatedLineCoordinates: splashAnimationedCoordinates,
    splashRouteCoordinates,
    handleRouteControl: splashHandleRouteControl,
    currentFrame: splashCurrentFrame,
  } = useSplashAnimation(mapRef, 'playing', status);

  // hook for current route animation
  const {
    animatedLineCoordinates,
    currentPoint,
    setCurrentPoint,
    handleRouteControl,
    currentFrame,
    setCurrentFrame,
    stravaPath,
    isActivityStreamFetching,
  } = useRouteAnimation(currentActivity?.id, mapRef, animationState);

  const contextValues = {
    activities,
    currentActivity,
    setCurrentActivity,
    fetchNextPage,
    isFetchingNextPage,
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      setViewState({ ...findInitialViewState(splashRouteCoordinates) });
    }
  }, [splashRouteCoordinates, status]);

  // decode polylines and construct route geoJSONs
  useEffect(() => {
    if (activities.length > 0) {
      const polyLines: Array<Position[]> = activities.map((activity) =>
        getPolyLineCoordinates(activity.map.summary_polyline)
      );

      const lineStringsObject = polyLines.map((polyLine, index) => {
        return {
          routeId: activities[index].id,
          geoJsonObject: findRouteLineString(polyLine),
        };
      });

      setRouteLineStrings(lineStringsObject);
      setCurrentActivity(activities[0]);
    }
  }, [activities]);

  const activityLayers = useMemo(() => {
    if (!showActivityDetail)
      return routeLineStrings.map((route, index) => {
        return (
          <Source key={index} type='geojson' data={route.geoJsonObject}>
            <Layer
              {...getPolylineLayerStyle(
                index,
                route.routeId,
                currentActivity?.id
              )}
            />
          </Source>
        );
      });
  }, [currentActivity?.id, routeLineStrings, showActivityDetail]);

  // set first activity on map
  useEffect(() => {
    if (currentActivity) {
      const polyLine = getPolyLineCoordinates(
        currentActivity.map.summary_polyline
      );
      setStartPoint(polyLine[0]);
      setEndPoint(polyLine[polyLine.length - 1]);
      findGlobalMapViewState(polyLine, mapRef);
    }
  }, [currentActivity]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <ActivityContext.Provider value={contextValues}>
      <div className='relative flex max-h-screen w-full'>
        <div className='absolute top-0 left-0 z-20 w-full'>
          <Header />
        </div>
        {status === 'unauthenticated' && hasMapLoaded && (
          <SignInPage
            sliderRef={sliderRef}
            splashRouteCoordinates={splashRouteCoordinates}
            splashCurrentFrame={splashCurrentFrame}
            splashHandleRouteControl={splashHandleRouteControl}
          />
        )}
        {activities && status === 'authenticated' && <MapActivityList />}
        <div className='flex-grow-0'>
          <Map
            {...viewState}
            ref={mapRef}
            onLoad={handleOnMapLoad}
            onMove={handleMoveEvent}
            {...mapConfig}
          >
            <Source {...skySource}>
              <Layer {...skyLayer} />
            </Source>

            {splashAnimationedCoordinates && (
              <Source {...defineLineSource(splashAnimationedCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            )}

            {animatedLineCoordinates && currentActivity && (
              <Source {...defineLineSource(animatedLineCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            )}

            {currentActivity && (
              <Source
                {...defineLineSource(
                  getCurrentRouteCoordinates(
                    routeLineStrings,
                    currentActivity.id
                  )
                )}
              >
                <Layer {...singleLineLayerStyle} />
              </Source>
            )}

            {startPoint && (
              <Source {...definePointSource(startPoint)}>
                <Layer {...startPointLayerStyle} />
              </Source>
            )}
            {endPoint && (
              <Source {...definePointSource(endPoint)}>
                <Layer {...endPointLayerStyle} />
              </Source>
            )}
            {currentPoint && !isActivityStreamFetching && showActivityDetail && (
              <Source {...definePointSource(currentPoint)}>
                <Layer {...pointLayerStyle} />
              </Source>
            )}

            {activityLayers}
          </Map>
        </div>
      </div>
    </ActivityContext.Provider>
  );
}
