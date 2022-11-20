/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import {
  drawStravaPath,
  returnSampledFrame,
  transformActivityStreamResponse,
} from '@/api/helpers';
import { findInitialViewState, findRouteLineString } from '@/api/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  definePointSource,
  fogLayer,
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

// initialize variables that control animation
let frameStartTime: number;
let animation: number;
const FPS = 60;
const fpsInterval = 1000 % FPS;

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);

  const [stravaPath, setStravaPath] = useState<StravaRouteStream>();

  // current animation frame index
  const [currentFrame, setCurrentFrame] = useState(0);

  // array index to display the current metric and chart annotation in the animation
  const [displayFrame, setDisplayFrame] = useState(0);

  // current Mapbox ViewState, initialized to first point of strava route
  const [viewState, setViewState] = useState<ViewState>();

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>();

  // current point of the line drawn on the map
  const [lineCoordinates, setLineCoordinates] = useState<Position[]>(
    [] as Position[]
  );

  // the whole route line drawn on the map
  const [routeLineString, setRouteLineString] = useState(
    {} as FeatureCollection<Geometry, GeoJsonProperties>
  );

  // the line animation point by point
  const [interpolated, setInterpolated] = useState<Position[]>([]);

  // holds performance metrics at current route point
  const [currentMetrics, setCurrentMetrics] = useState<RoutePoint>();

  const mapRef = useRef<MapRef>(null);

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  // load data from api
  useEffect(() => {
    const getStravaData = async () => {
      try {
        const response = await fetch(`/api/strava/activityStream/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = (await response.json()) as ActivityStreamResponse;

        setStravaPath(transformActivityStreamResponse(data));
      } finally {
        setLoading(false);
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
      setLineCoordinates(stravaPath.latlng);
    }
  }, [stravaPath]);

  // controls the route animation
  useEffect(() => {
    const animateLine = (timestamp: number) => {
      if (!frameStartTime) {
        frameStartTime = timestamp;
      }

      const elapsed = timestamp - frameStartTime;
      if (elapsed > fpsInterval) {
        frameStartTime = timestamp - (elapsed % fpsInterval);

        setCurrentFrame((currentFrame) => {
          // increment next frame
          const nextFrame = currentFrame + 1;
          if (nextFrame > interpolated.length - 1) {
            setInterpolated([]);
            cancelAnimationFrame(animation);
          }

          // set line coordinates to next frame
          setLineCoordinates((lineCoordinates: Position[]) => {
            if (mapRef.current && interpolated[nextFrame]) {
              mapRef.current.panTo([
                interpolated[nextFrame][0],
                interpolated[nextFrame][1],
              ]);
            }
            return [...lineCoordinates, interpolated[nextFrame]];
          });

          // set current point to next frame
          setCurrentPoint(interpolated[nextFrame]);

          // return next frame to currentFrame state
          return nextFrame;
        });
      }
      animation = requestAnimationFrame(animateLine);
    };

    if (interpolated.length > 0) {
      animation = requestAnimationFrame(animateLine);
    }

    return () => cancelAnimationFrame(animation);
  }, [interpolated]);

  // samples frames sent to child components to reduce rendering rate
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

  // initialize drawing of route
  const handleOnMapLoad = () => {
    let interpolated;
    if (stravaPath) {
      interpolated = drawStravaPath(stravaPath);
    }

    if (interpolated) {
      setInterpolated(interpolated);
      setLineCoordinates([interpolated[0]]);
    }
  };

  return (
    <main className='grid grid-cols-4'>
      {currentPoint && routeLineString && lineCoordinates && (
        <div className='col-span-3'>
          {/* Mapbox parent component; each source renders a different layer onto the map */}
          <Map
            style={{ width: '70vw', height: '100vh' }}
            {...viewState}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
            ref={mapRef}
            mapStyle='mapbox://styles/mapbox/satellite-v9'
            terrain={{ source: 'mapbox-dem', exaggeration: 4 }}
            fog={fogLayer}
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
            <Source {...definePointSource(currentPoint)}>
              <Layer {...pointLayerStyle} />
            </Source>
            {/* render animated line on route  */}
            <Source {...defineLineSource(lineCoordinates)}>
              <Layer {...animatedLineLayerStyle} />
            </Source>
          </Map>
        </div>
      )}

      {/* <MetricsSidebar
        currentMetrics={currentMetrics}
        stravaPath={stravaPath}
        displayFrame={displayFrame}
      /> */}
    </main>
  );
}
