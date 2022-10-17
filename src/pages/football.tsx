import { Position } from 'geojson';
import { useEffect, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import MetricsSidebar from '@/components/MetricsSidebar';

import { drawStravaPath, returnSampledFrame } from '@/api/helpers';
import { initialPathPoint } from '@/api/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  definePointSource,
  pointLayerStyle,
} from '@/api/layers';
import {
  footballLayerStyle,
  footballPathLineString,
  initialFootballViewState,
  stravaFootballMatch,
} from '@/api/sampleFootballData';
import { RoutePoint } from '@/api/types';

// initialize variables that control animation
let frameStartTime: number;
let animation: number;
const FPS = 60;
const fpsInterval = 1000 % FPS;

export default function Dashboard() {
  // current animation frame index
  const [currentFrame, setCurrentFrame] = useState(0);

  // array index to display the current metric and chart annotation in the animation
  const [displayFrame, setDisplayFrame] = useState(0);

  // current Mapbox ViewState, initialized to first point of strava route
  const [viewState, setViewState] = useState<ViewState>(
    initialFootballViewState
  );

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>(
    stravaFootballMatch.latlng[0]
  );

  // // current point of the line drawn on the map
  const [lineCoordinates, setLineCoordinates] = useState<Position[]>([
    stravaFootballMatch.latlng[0],
  ]);

  // the actual line being drawn between two points
  const [interpolated, setInterpolated] = useState<Position[]>([]);

  // holds performance metrics at current route point
  const [currentMetrics, setCurrentMetrics] =
    useState<RoutePoint>(initialPathPoint);

  const mapRef = useRef<MapRef>(null);

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  // // controls the route animation
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
    const lastValidFrame = stravaFootballMatch.latlng.length - 1;
    const tempFrame = returnSampledFrame(currentFrame, lastValidFrame);

    // only set display frame and metrics if current frame hits valid sample interval
    if (tempFrame) {
      setDisplayFrame(tempFrame);
      setCurrentMetrics({
        heartRate: stravaFootballMatch.heartRate[tempFrame],
        distance: stravaFootballMatch.distance[tempFrame],
        time: stravaFootballMatch.time[tempFrame],
      });
    }
  }, [currentFrame]);

  // // initialize drawing of route
  const handleOnMapLoad = () => {
    const interpolated = drawStravaPath(stravaFootballMatch);
    setInterpolated(interpolated);
    setLineCoordinates([interpolated[0]]);
  };

  return (
    <main className='grid grid-cols-4'>
      <div className='col-span-3'>
        {/* Mapbox parent component; each source renders a different layer onto the map */}
        <Map
          style={{ width: '70vw', height: '100vh' }}
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
          ref={mapRef}
          mapStyle='mapbox://styles/mapbox/streets-v11'
          onMove={handleMoveEvent}
          onLoad={handleOnMapLoad}
        >
          {/* render full path of route on map  */}

          <Source type='geojson' data={footballPathLineString}>
            <Layer {...footballLayerStyle} />
            <Layer
              type='heatmap'
              paint={{
                'heatmap-radius': 10,
                'heatmap-color': {
                  stops: [
                    [0.0, 'blue'],
                    [0.5, 'yellow'],
                    [1.0, 'red'],
                  ],
                },
                'heatmap-intensity': 1,
              }}
            />
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

      <MetricsSidebar
        currentMetrics={currentMetrics}
        stravaPath={stravaFootballMatch}
        displayFrame={displayFrame}
      />
    </main>
  );
}
