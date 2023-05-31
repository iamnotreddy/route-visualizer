import { animated, useSpring } from '@react-spring/web';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import Button from '@/components/buttons/Button';
import MapActivityList from '@/components/MapActivityList';

import {
  findGlobalMapViewState,
  getPolyLineCoordinates,
} from '@/helpers/helpers';
import {
  findInitialViewState,
  findRouteLineString,
} from '@/helpers/initialValues';
import {
  definePointSource,
  endPointLayerStyle,
  mapConfig,
  mobileMapConfig,
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

  const [showActivityList, setShowActivityList] = useState(false);

  const mapRef = useRef<MapRef>(null);

  // initialize drawing of route
  const handleOnMapLoad = () => {
    setHasMapLoaded(true);
  };

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  const [activityNumber, setActivityNumber] = useState(activities.length);

  const props = useSpring({
    val: activityNumber,
    from: { val: 0 },
  });

  useEffect(() => {
    setActivityNumber(activities.length);
  }, [activities]);

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

  const DesktopMap = () => {
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
            {activityLayers}
          </Map>
        </div>
      </div>
    );
  };

  const MobileMap = () => {
    return (
      <div className='flex flex-col'>
        <div
          className='flex flex-row items-center justify-evenly space-x-2'
          style={{ width: '100vw', height: '10vh' }}
        >
          <Button
            className='w-1/4 border-b-4 border-slate-300'
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
          <div>
            <div onClick={() => setShowActivityList((prev) => !prev)}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill={showActivityList ? 'black' : 'white'}
                viewBox='0 0 24 24'
                stroke-width='1.5'
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  d='M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z'
                />
              </svg>
            </div>
          </div>
        </div>
        {!showActivityList && (
          <Map
            {...viewState}
            ref={mapRef}
            onLoad={handleOnMapLoad}
            onMove={handleMoveEvent}
            style={{ width: '100vw', height: '90vh' }}
            {...mobileMapConfig}
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
            {activityLayers}
          </Map>
        )}

        {showActivityList && (
          <div
            className='overflow-y-auto'
            style={{ width: '100vw', height: '90vh' }}
          >
            <MapActivityList
              activities={activities}
              currentActivityId={currentActivity ? currentActivity.id : ''}
              setCurrentActivity={setCurrentActivity}
            />
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return <MobileMap />;
  } else {
    return <DesktopMap />;
  }
}
