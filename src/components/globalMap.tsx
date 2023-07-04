import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useSession } from 'next-auth/react';
import {
  ChangeEvent,
  createContext,
  MutableRefObject,
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
  mapConfig,
  pointLayerStyle,
  singleLineLayerStyle,
  skyLayer,
  skySource,
  startPointLayerStyle,
} from '@/helpers/layers';
import { StravaActivity, StravaRouteStream } from '@/helpers/types';

type GlobalMapHomePageProps = {
  activities: StravaActivity[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

type ActivityContext = {
  activities: StravaActivity[];
  showActivityDetail: boolean;
  setShowActivityDetail: (showActivityDetail: boolean) => void;
  currentActivity: StravaActivity | undefined;
  setCurrentActivity: (activity: StravaActivity) => void;
  fetchNextPage: () => void;
  // animation props
  animationState: string;
  currentFrame: number;
  sliderRef: MutableRefObject<null>;
  setAnimationState: (animationState: 'paused' | 'playing') => void;
  setViewState: (viewState: ViewState) => void;
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
}: GlobalMapHomePageProps) {
  const { status } = useSession();
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const [viewState, setViewState] = useState<ViewState>({
    ...findInitialViewState([
      [-118.401756, 33.775005],
      [-118.401747, 33.775007],
    ]),
    pitch: 85,
    zoom: 14,
    bearing: 90,
  });
  // the whole route line drawn on the map
  const [routeLineStrings, setRouteLineStrings] = useState(
    [] as Array<{
      routeId: string;
      geoJsonObject: FeatureCollection<Geometry, GeoJsonProperties>;
    }>
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

  // hook for currente route animation
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

  const activityLayers = useMemo(() => {
    if (!showActivityDetail)
      return routeLineStrings.map((route, index) => {
        return (
          <Source key={index} type='geojson' data={route.geoJsonObject}>
            <Layer
              id={`layer${index}`}
              {...{
                type: 'line',
                paint: {
                  'line-color':
                    route.routeId === currentActivity?.id ? 'green' : 'purple',
                  'line-width': route.routeId === currentActivity?.id ? 3 : 0.5,
                  'line-opacity':
                    route.routeId === currentActivity?.id ? 1 : 0.5,
                },
              }}
            />
          </Source>
        );
      });
  }, [currentActivity?.id, routeLineStrings, showActivityDetail]);

  const contextValues = {
    activities,
    currentActivity,
    setCurrentActivity,
    fetchNextPage,
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

  // decode polylines and construct route geoJSONs
  useEffect(() => {
    if (activities.length > 0) {
      const polyLines: Array<Position[]> = activities.map((activity) =>
        getPolyLineCoordinates(activity)
      );

      if (!currentActivity) {
        setCurrentActivity(activities[0]);
      }

      const lineStringsObject = polyLines.map((polyLine, index) => {
        return {
          routeId: activities[index].id,
          geoJsonObject: findRouteLineString(polyLine),
        };
      });

      setRouteLineStrings(lineStringsObject);
    }
  }, [activities, currentActivity]);

  // set first activity on map
  useEffect(() => {
    if (currentActivity) {
      const polyLine = getPolyLineCoordinates(currentActivity);
      setStartPoint(polyLine[0]);
      setEndPoint(polyLine[polyLine.length - 1]);
      findGlobalMapViewState(currentActivity, mapRef);
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
            <Source {...defineLineSource(splashAnimationedCoordinates)}>
              <Layer {...animatedLineLayerStyle} />
            </Source>
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
            <Source {...defineLineSource(animatedLineCoordinates)}>
              <Layer {...animatedLineLayerStyle} />
            </Source>
            {showActivityDetail && animationState === 'paused' && (
              <Source {...defineLineSource(stravaPath?.latlng ?? [])}>
                <Layer {...singleLineLayerStyle} />
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
