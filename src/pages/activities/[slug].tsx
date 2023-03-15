/* eslint-disable react-hooks/exhaustive-deps */

import { animated, useSpring } from '@react-spring/web';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import React from 'react';
import Map, {
  Layer,
  MapRef,
  NavigationControl,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { ActivityOverview, Trail } from '@/components/ActivityOverview';
import AnimationControl from '@/components/AnimationControl';
import VisXLineChart from '@/components/VisXLineChart';

import { transformActivityStreamResponse } from '@/api/helpers';
import { findInitialViewState, findRouteLineString } from '@/api/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  definePointSource,
  lineLayerStyle,
  pointLayerStyle,
  skyLayer,
  skySource,
} from '@/api/layers';
import {
  ActivitySplits,
  ActivitySplitsResponse,
  ActivityStreamResponse,
  StravaRouteStream,
} from '@/api/types';

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;

  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  const [stravaPath, setStravaPath] = useState<StravaRouteStream>();

  const [splits, setSplits] = useState<ActivitySplits[]>([]);

  // current animation frame index
  const [currentFrame, setCurrentFrame] = useState(0);

  // current Mapbox ViewState, initialized to first point of strava route
  const [viewState, setViewState] = useState<ViewState>();

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>();

  // current point of the line drawn on the map
  const [lineCoordinates, setLineCoordinates] = useState<Position[]>([]);

  // the whole route line drawn on the map
  const [routeLineString, setRouteLineString] = useState(
    {} as FeatureCollection<Geometry, GeoJsonProperties>
  );

  // Set the initial state of the animation to "paused"
  const [animationState, setAnimationState] = useState('paused');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  //  handles route animation according to radio slider position
  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);

    if (mapRef.current && stravaPath && stravaPath.latlng[inputFrame]) {
      // pan camera towards next frame
      mapRef.current.panTo([
        stravaPath?.latlng[inputFrame][0],
        stravaPath?.latlng[inputFrame][1],
      ]);

      setCurrentFrame(inputFrame);

      // add, remove point based on inputFrame
      setLineCoordinates((prev) => {
        if (stravaPath) {
          return stravaPath.latlng.slice(0, inputFrame + 1);
        } else {
          return prev;
        }
      });

      setCurrentPoint(stravaPath.latlng[inputFrame]);
    }
  };

  // load data from api
  useEffect(() => {
    let attempt = 1;
    const getStravaData = async () => {
      try {
        const response = await fetch(`/api/strava/activityStream/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const res = (await response.json()) as ActivityStreamResponse;

        setStravaPath(transformActivityStreamResponse(res.data[0]));
      } catch {
        alert(`error requesting data, attempt: ${attempt}`);
        attempt++;
      }
    };

    getStravaData();
  }, [slug]);

  // load data from api
  useEffect(() => {
    let attempt = 1;
    const getSplits = async () => {
      try {
        const response = await fetch(`/api/strava/activityLaps/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const res = (await response.json()) as ActivitySplitsResponse;

        setSplits(res.data[0]);
      } catch {
        alert(`error requesting data, attempt: ${attempt}`);
        attempt++;
      }
    };

    getSplits();
  }, [slug]);

  // set initial points on chart
  useEffect(() => {
    if (stravaPath) {
      setViewState(findInitialViewState(stravaPath));
      setCurrentPoint(stravaPath.latlng[0]);
      setRouteLineString(findRouteLineString(stravaPath));
    }
  }, [stravaPath]);

  //
  useEffect(() => {
    const routeLength = stravaPath?.latlng.length;

    // Check if the animation is currently "playing"
    if (animationState === 'playing' && routeLength) {
      // Update the value of the slider every 100 milliseconds
      const interval = setInterval(() => {
        setCurrentFrame((prevValue) => {
          let nextValue;
          if (stravaPath.latlng[prevValue++]) {
            nextValue = prevValue++;
          } else {
            nextValue = prevValue;
          }

          if (nextValue == stravaPath.latlng.length - 1) {
            nextValue = 0;
          }

          return nextValue;
        });
      }, 100);

      // Clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [animationState]);

  // route animation
  useEffect(() => {
    if (mapRef.current && stravaPath && stravaPath.latlng[currentFrame]) {
      const route = stravaPath.latlng;
      mapRef.current.panTo([route[currentFrame][0], route[currentFrame][1]]);
      setLineCoordinates(route.slice(0, currentFrame + 1));

      setCurrentPoint(route[currentFrame]);
    }
  }, [currentFrame]);

  // initialize drawing of route
  const handleOnMapLoad = () => {
    setHasMapLoaded(true);
    if (stravaPath) {
      setLineCoordinates([stravaPath.latlng[0]]);
    }
  };

  const baseClass =
    'h-5 w-5 fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-purple-300 animate-pulse';
  const selectedClass =
    'h-7 w-7 fill-purple-300 stroke-zinc-700 stroke-2 hover:scale-150';

  const mapSpring = useSpring({
    width: isSidebarOpen ? '75vw' : '95vw',
    height: isSidebarOpen ? '50vh' : '85vh',
    config: { tension: 100 },
  });

  const { transform } = useSpring({
    transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(2340deg)',
  });

  useEffect(() => {
    setIsSidebarOpen((prev) => !prev);
  }, [hasMapLoaded]);

  return (
    <main className='m-4 flex flex-col justify-evenly'>
      <div className='flex flex-row space-x-2'>
        <div className='relative'>
          <animated.div style={{ ...mapSpring }}>
            <Map
              {...viewState}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
              ref={mapRef}
              mapStyle='mapbox://styles/iamnotreddy/cl8mi1thc003914qikp84oo8l'
              terrain={{ source: 'mapbox-dem', exaggeration: 4 }}
              onMove={handleMoveEvent}
              onLoad={handleOnMapLoad}
            >
              <NavigationControl showCompass={false} />
              {/* map sky layer  */}
              <Source {...skySource}>
                <Layer {...skyLayer} />
              </Source>
              {/* render full path of route on map  */}
              <Source type='geojson' data={routeLineString}>
                <Layer {...lineLayerStyle} />
              </Source>
              {/* render current point on route  */}
              {currentPoint && (
                <Source {...definePointSource(currentPoint)}>
                  <Layer {...pointLayerStyle} />
                </Source>
              )}
              {/* render animated line on route  */}
              <Source {...defineLineSource(lineCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            </Map>
          </animated.div>

          <div className='absolute bottom-0 left-20 w-1/2'>
            {stravaPath && (
              <AnimationControl
                animationState={animationState}
                stravaPath={stravaPath}
                currentFrame={currentFrame}
                setAnimationState={setAnimationState}
                setViewState={setViewState}
                setCurrentPoint={setCurrentPoint}
                setRouteLineString={setRouteLineString}
                setLineCoordinates={setLineCoordinates}
                setCurrentFrame={setCurrentFrame}
                handleRouteControl={handleRouteControl}
                sliderRef={sliderRef}
              />
            )}
          </div>
        </div>
        <div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={isSidebarOpen ? baseClass : selectedClass}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <animated.path
              fillRule='evenodd'
              d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z'
              clipRule='evenodd'
              style={{ transform, transformOrigin: 'center' }}
            />
          </svg>
        </div>
        {stravaPath && hasMapLoaded && (
          <Trail open={isSidebarOpen}>
            <ActivityOverview
              activityTitle=''
              userNotes=''
              metrics={stravaPath}
              splits={splits}
            />
          </Trail>
        )}
      </div>
      {stravaPath && (
        <Trail open={isSidebarOpen}>
          <div className='mt-2 flex flex-col'>
            <div className='h-5/6 justify-items-start'>
              <VisXLineChart
                metrics={stravaPath}
                currentFrame={currentFrame}
                setCurrentFrame={setCurrentFrame}
              />
            </div>
          </div>
        </Trail>
      )}
    </main>
  );
}

// <div className='ml-20 flex h-1/6 flex-row items-center justify-start space-x-12'>
//               <TimeComponent
//                 time={stravaPath.time[currentFrame]}
//                 showMetricTitle
//               />
//               <DistanceComponent
//                 distance={stravaPath.distance[currentFrame]}
//                 showMetricTitle
//               />
//               <PaceComponent
//                 time={stravaPath.time[currentFrame]}
//                 distance={stravaPath.distance[currentFrame]}
//                 showMetricTitle
//               />
//             </div>
