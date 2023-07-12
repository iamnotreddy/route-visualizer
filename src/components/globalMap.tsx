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
import Map, {
  Layer,
  MapRef,
  Marker,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { useRouteAnimation } from '@/components/hooks/useRouteAnimation';
import { useSplashAnimation } from '@/components/hooks/useSplashAnimation';
import Header from '@/components/layout/Header';
import ActivityList from '@/components/sidebar/ActivityList';
import SignInPage from '@/components/SignInPage';

import { getNextBearing } from '@/helpers/camera';
import {
  findActivityViewState,
  getCurrentRouteCoordinates,
  getPolyLineCoordinates,
} from '@/helpers/helpers';
import {
  findInitialViewState,
  findRouteLineString,
} from '@/helpers/initialValues';
import {
  animatedLineLayerStyle,
  defineLineLayerStyle,
  defineLineSource,
  definePointSource,
  endPointLayerStyle,
  getPolylineLayerStyle,
  mapConfig,
  pointLayerStyle,
  skyLayer,
  skySource,
  startPointLayerStyle,
} from '@/helpers/layers';
import {
  ActivityContextType,
  PolylineObj,
  StravaActivity,
} from '@/helpers/types';
import { FetchingContext } from '@/pages';

export const ActivityContext = createContext<ActivityContextType>(
  {} as ActivityContextType
);

export default function GlobalMap() {
  const { allActivities: activities } = useContext(FetchingContext);

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      setViewState({ ...findInitialViewState(splashRouteCoordinates) });
    }
  }, [splashRouteCoordinates, status]);

  // decode polylines and construct route geoJSONs

  useEffect(() => {
    if (activities && activities.length > 0) {
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

      setCurrentActivity((prev) => {
        // only set current activity to first if undefined
        if (!prev) {
          return activities[0];
        }
      });
    }
  }, [activities]);

  const activityLayers = useMemo(() => {
    const handleMarkerOnClick = (routeId: string) => {
      if (activities) {
        const nextActivity = activities.filter((x) => routeId === x.id)[0];

        setCurrentActivity(nextActivity);
      }
    };

    if (!currentActivity)
      return routeLineStrings.map((route, index) => {
        const accessor = route.geoJsonObject.features[0].geometry;
        return (
          <Source key={index} type='geojson' data={route.geoJsonObject}>
            {accessor.type === 'LineString' && accessor.coordinates[0] ? (
              <Marker
                latitude={accessor.coordinates[0][1]}
                longitude={accessor.coordinates[0][0]}
                scale={0.5}
                color='black'
                onClick={() => handleMarkerOnClick(route.routeId)}
              />
            ) : (
              <p></p>
            )}

            <Layer {...getPolylineLayerStyle(index)} />
          </Source>
        );
      });
  }, [activities, currentActivity, routeLineStrings]);

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

  // rotate camera for visual effect on load of route starting point
  useEffect(() => {
    setViewState((prev) => {
      if (prev) {
        return {
          ...prev,
          bearing: getNextBearing(prev.bearing),
        };
      }
    });
  }, [startPoint]);

  if (status === 'loading') {
    return <div className='flex items-center justify-center'>Loading...</div>;
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
        {activities && status === 'authenticated' && <ActivityList />}
        <div className='flex-grow-0'>
          <Map
            {...viewState}
            ref={mapRef}
            onLoad={handleOnMapLoad}
            onMove={handleMoveEvent}
            {...mapConfig}
          >
            {/* layer to style sky */}
            <Source {...skySource}>
              <Layer {...skyLayer} />
            </Source>

            {/* animated coordinates for the splash route */}
            {splashAnimationedCoordinates && (
              <Source {...defineLineSource(splashAnimationedCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            )}

            {/* animated coordinates of current route */}
            {animatedLineCoordinates && currentActivity && (
              <Source {...defineLineSource(animatedLineCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            )}

            {/* full coordinates of current route */}
            {currentActivity && (
              <Source
                {...defineLineSource(
                  getCurrentRouteCoordinates(
                    routeLineStrings,
                    currentActivity.id
                  )
                )}
              >
                <Layer {...defineLineLayerStyle(animationState)} />
              </Source>
            )}

            {/* start point current route */}
            {startPoint && (
              <Source {...definePointSource(startPoint)}>
                <Layer {...startPointLayerStyle} />
              </Source>
            )}

            {/* end point current route */}
            {endPoint && (
              <Source {...definePointSource(endPoint)}>
                <Layer {...endPointLayerStyle} />
              </Source>
            )}

            {/* current point during route animation */}
            {currentPoint && !isActivityStreamFetching && showActivityDetail && (
              <Source {...definePointSource(currentPoint)}>
                <Layer {...pointLayerStyle} />
              </Source>
            )}

            {/* memoized polylines of current activities loaded on map */}
            {activityLayers}
          </Map>
        </div>
      </div>
    </ActivityContext.Provider>
  );
}
