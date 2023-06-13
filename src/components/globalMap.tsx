import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  skyLayer,
  skySource,
  startPointLayerStyle,
} from '@/helpers/layers';
import { StravaActivity } from '@/helpers/types';

type GlobalMapHomePageProps = {
  activities: StravaActivity[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

export default function GlobalMap({
  activities,
  fetchNextPage,
  isFetchingNextPage,
}: GlobalMapHomePageProps) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { status } = useSession();

  const [hasMapLoaded, setHasMapLoaded] = useState(false);

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
                'line-opacity': route.routeId === currentActivity?.id ? 1 : 0.5,
              },
            }}
          />
        </Source>
      );
    });
  }, [currentActivity?.id, routeLineStrings]);

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
      {activities && status === 'authenticated' && (
        <MapActivityList
          activities={activities}
          currentActivityId={currentActivity ? currentActivity.id : ''}
          currentActivity={currentActivity}
          setCurrentActivity={setCurrentActivity}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          stravaPath={stravaPath}
          animationState={animationState}
          setAnimationState={setAnimationState}
          currentFrame={currentFrame}
          sliderRef={sliderRef}
          setViewState={setViewState}
          setCurrentPoint={setCurrentPoint}
          setCurrentFrame={setCurrentFrame}
          handleRouteControl={handleRouteControl}
        />
      )}
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
          {currentPoint && !isActivityStreamFetching && (
            <Source {...definePointSource(currentPoint)}>
              <Layer {...pointLayerStyle} />
            </Source>
          )}
          {activityLayers}
        </Map>
      </div>
    </div>
  );
}
