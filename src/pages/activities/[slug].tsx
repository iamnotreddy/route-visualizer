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
  NavigationControl,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

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
import { ActivityStreamResponse, StravaRouteStream } from '@/api/types';

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;

  const [stravaPath, setStravaPath] = useState<StravaRouteStream>();

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
    if (stravaPath) {
      setLineCoordinates([stravaPath.latlng[0]]);
    }
  };

  return (
    <main className='m-4 flex flex-col justify-evenly'>
      <div className='relative'>
        {/* Mapbox parent component; each source renders a different layer onto the map */}
        <Map
          style={{ width: '95vw', height: '50vh' }}
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
      {stravaPath && (
        <div className='col-span-4 col-start-1'>
          <VisXLineChart
            metrics={stravaPath}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
          />
        </div>
      )}
    </main>
  );
}
