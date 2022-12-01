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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

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

  // array index to display the current metric and chart annotation in the animation
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

  const mapRef = useRef<MapRef>(null);

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);

    if (mapRef.current && stravaPath) {
      setCurrentFrame(inputFrame);
      // set line coordinates to next frame
      setLineCoordinates((prev) => {
        if (stravaPath) {
          return stravaPath.latlng.slice(0, inputFrame + 1);
        } else {
          return prev;
        }
      });
      mapRef.current.panTo([
        stravaPath?.latlng[inputFrame][0],
        stravaPath?.latlng[inputFrame][1],
      ]);
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
    if (stravaPath) {
      setLineCoordinates([stravaPath.latlng[0]]);
    }
  };

  return (
    <main className='m-8 grid grid-cols-4 space-y-8'>
      <div className='col-span-2 col-start-1'>
        <label
          id='default-range'
          className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'
        >
          Control Route Animation
        </label>
        <input
          className='dark:bg-gray-700" h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200'
          id='default-range'
          type='range'
          min={0}
          max={stravaPath ? stravaPath.latlng.length - 1 : 0}
          value={currentFrame}
          onChange={handleRouteControl}
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

      {/* <MetricsSidebar
        currentMetrics={currentMetrics}
        stravaPath={stravaPath}
        displayFrame={displayFrame}
      /> */}
    </main>
  );
}
