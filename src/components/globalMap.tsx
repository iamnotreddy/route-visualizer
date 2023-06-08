import { animated, useSpring } from '@react-spring/web';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
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
import AnimationControl from '@/components/AnimationControl';
import Button from '@/components/buttons/Button';
import { useRouteAnimation } from '@/components/hooks/useRouteAnimation';

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
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const [viewState, setViewState] = useState<ViewState>();
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

  const [activityNumber, setActivityNumber] = useState(activities.length);
  const [animationState, setAnimationState] = useState<'playing' | 'paused'>(
    'paused'
  );

  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  // initialize drawing of route
  const handleOnMapLoad = () => {
    setHasMapLoaded(true);
  };

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  const props = useSpring({
    val: activityNumber,
    from: { val: 0 },
  });

  useEffect(() => {
    setActivityNumber(activities.length);
  }, [activities]);

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

  useEffect(() => {
    if (activities.length > 0) {
      const polyLines: Array<Position[]> = activities.map((activity) =>
        getPolyLineCoordinates(activity)
      );
      const firstRoute = polyLines[0];

      setViewState(findInitialViewState(firstRoute));

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

  return (
    <div className='flex max-h-screen w-full'>
      {activities && (
        <div className='flex flex-col overflow-y-auto p-4'>
          <div className='z-30 flex flex-row items-center justify-center space-x-4 border-b-2 border-slate-300 pb-4'>
            <Button
              className='w-1/2 items-center border-b-4 border-slate-300 py-4'
              onClick={fetchNextPage}
              variant='light'
              disabled={isFetchingNextPage}
              isLoading={isFetchingNextPage}
            >
              Load More...
            </Button>
            <div className='flex flex-col'>
              <animated.div className='text-center'>
                {props.val.to((val) => Math.floor(val))}
              </animated.div>
              <p>activities loaded</p>
            </div>
          </div>
          <MapActivityList
            activities={activities}
            currentActivityId={currentActivity ? currentActivity.id : ''}
            setCurrentActivity={setCurrentActivity}
          />
        </div>
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
        <AnimationControl
          animationState={animationState}
          setAnimationState={setAnimationState}
          routeCoordinates={stravaPath?.latlng}
          currentFrame={currentFrame}
          sliderRef={sliderRef}
          setViewState={setViewState}
          setCurrentPoint={setCurrentPoint}
          setCurrentFrame={setCurrentFrame}
          handleRouteControl={handleRouteControl}
        />
      </div>
    </div>
  );
}
