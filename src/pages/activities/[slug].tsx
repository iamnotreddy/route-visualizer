/* eslint-disable react-hooks/exhaustive-deps */

import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import MetricsSidebar from '@/components/MetricsSidebar';

import {
  returnSampledFrame,
  transformActivityStreamResponse,
} from '@/api/helpers';
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
  ActivityStreamResponse,
  RoutePoint,
  StravaRouteStream,
} from '@/api/types';

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;

  const [stravaPath, setStravaPath] = useState<StravaRouteStream>();

  // current animation frame index
  const [currentFrame, setCurrentFrame] = useState(0);

  const [displayFrame, setDisplayFrame] = useState(0);

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

  // holds performance metrics at current route point
  const [currentMetrics, setCurrentMetrics] = useState<RoutePoint>();

  // Set the initial state of the animation to "paused"
  const [animationState, setAnimationState] = useState('paused');

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
    const getStravaData = async () => {
      try {
        const response = await fetch(`/api/strava/activityStream/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const res = (await response.json()) as ActivityStreamResponse;

        setStravaPath(transformActivityStreamResponse(res.data[0]));
      } catch {
        alert('Route did not load successfully');
      }
    };
    getStravaData();
  }, []);

  // set initial points on chart
  useEffect(() => {
    if (stravaPath) {
      setViewState(findInitialViewState(stravaPath));
      setCurrentPoint(stravaPath.latlng[0]);
      setRouteLineString(findRouteLineString(stravaPath));
    }
  }, [stravaPath]);

  // samples frames sent to child components to reduce chart rendering rate
  useEffect(() => {
    let tempFrame;

    if (stravaPath) {
      const lastValidFrame = stravaPath.latlng.length - 1;
      tempFrame = returnSampledFrame(currentFrame, lastValidFrame);
    }

    // only set display frame and metrics if current frame hits valid sample interval
    if (tempFrame && stravaPath) {
      setDisplayFrame(tempFrame);
      setCurrentMetrics({
        heartRate: stravaPath.heartRate[tempFrame],
        distance: stravaPath.distance[tempFrame],
        time: stravaPath.time[tempFrame],
      });
    }
  }, [currentFrame]);

  //
  useEffect(() => {
    const routeLength = stravaPath?.latlng.length;

    // Check if the animation is currently "playing"
    if (animationState === 'playing' && routeLength) {
      // Update the value of the slider every 50 milliseconds
      const interval = setInterval(() => {
        setCurrentFrame((prevValue) =>
          prevValue < routeLength ? prevValue + 1 : prevValue
        );
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
    if (stravaPath) {
      setLineCoordinates([stravaPath.latlng[0]]);
    }
  };

  return (
    <main className='m-8 grid grid-cols-4 justify-evenly space-y-8'>
      <div className='col-span-3'>
        <div className='space-x-2'>
          <button
            onClick={() => {
              setAnimationState('playing');
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='h-6 w-6'
            >
              <path
                fill-rule='evenodd'
                d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z'
                clip-rule='evenodd'
              />
            </svg>
          </button>

          <button
            onClick={() => {
              setAnimationState('paused');
            }}
            disabled={animationState == 'paused'}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='h-6 w-6'
            >
              <path
                fill-rule='evenodd'
                d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9zm5.25 0a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.75z'
                clip-rule='evenodd'
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (stravaPath) {
                setViewState(findInitialViewState(stravaPath));
                setCurrentPoint(stravaPath.latlng[0]);
                setRouteLineString(findRouteLineString(stravaPath));
                setLineCoordinates([]);
                setCurrentFrame(0);
              }
            }}
            disabled={animationState == 'playing'}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='h-6 w-6'
            >
              <path
                fill-rule='evenodd'
                d='M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z'
                clip-rule='evenodd'
              />
            </svg>
          </button>
        </div>

        <input
          className='w-1/2 rounded-xl border-2 border-black bg-slate-100 py-2 px-4'
          ref={sliderRef}
          type='range'
          min={0}
          max={stravaPath ? stravaPath.latlng.length - 1 : 0}
          value={currentFrame}
          onChange={handleRouteControl}
          disabled={animationState == 'playing'}
        />
      </div>

      <div className='col-span-3 col-start-1'>
        {/* Mapbox parent component; each source renders a different layer onto the map */}
        <Map
          style={{ width: '70vw', height: '100vh' }}
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
          ref={mapRef}
          mapStyle='mapbox://styles/iamnotreddy/cl8mi1thc003914qikp84oo8l'
          terrain={{ source: 'mapbox-dem', exaggeration: 4 }}
          onMove={handleMoveEvent}
          onLoad={handleOnMapLoad}
        >
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
      </div>

      {stravaPath && currentMetrics && (
        <MetricsSidebar
          currentMetrics={currentMetrics}
          stravaPath={stravaPath}
          currentFrame={displayFrame}
        />
      )}
    </main>
  );
}
