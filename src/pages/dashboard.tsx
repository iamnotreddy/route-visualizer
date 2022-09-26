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

import { handleMapLoad } from '@/api/helpers';
import {
  initialViewState,
  routeLineString,
  stravaPath,
} from '@/api/initialValues';
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
import { RoutePoint } from '@/api/types';

let frameStartTime: number;
let animation: number;
const FPS = 60;
const fpsInterval = 1000 % FPS;

export default function Playground() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [viewState, setViewState] = useState<ViewState>(initialViewState);
  const [currentPoint, setCurrentPoint] = useState<Position>(
    stravaPath.latlng[0]
  );
  const [lineCoordinates, setLineCoordinates] = useState<Position[]>([
    stravaPath.latlng[0],
  ]);
  const [interpolated, setInterpolated] = useState<Position[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<RoutePoint>({
    heartRate: stravaPath.heartRate[0],
    distance: stravaPath.distance[0],
    time: stravaPath.time[0],
  });

  const mapRef = useRef<MapRef>(null);

  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  useEffect(() => {
    const animateLine = (timestamp: number) => {
      if (!frameStartTime) {
        frameStartTime = timestamp;
      }

      const elapsed = timestamp - frameStartTime;
      if (elapsed > fpsInterval) {
        frameStartTime = timestamp - (elapsed % fpsInterval);
        setCurrentFrame((currentFrame) => {
          const newFrame = currentFrame + 1;
          if (newFrame > interpolated.length - 1) {
            setInterpolated([]);
            cancelAnimationFrame(animation);
            return newFrame;
          }

          setLineCoordinates((lineCoordinates: Position[]) => {
            if (mapRef.current) {
              mapRef.current.panTo([
                interpolated[newFrame][0],
                interpolated[newFrame][1],
              ]);
            }
            return [...lineCoordinates, interpolated[newFrame]];
          });

          setCurrentPoint(interpolated[newFrame]);
          setCurrentMetrics({
            heartRate: stravaPath.heartRate[Math.floor(currentFrame / 2)],
            distance: stravaPath.distance[Math.floor(currentFrame / 2)],
            time: stravaPath.time[Math.floor(currentFrame / 2)],
          });

          return newFrame;
        });
      }
      animation = requestAnimationFrame(animateLine);
    };

    if (interpolated.length > 0) {
      animation = requestAnimationFrame(animateLine);
    }

    return () => cancelAnimationFrame(animation);
  }, [interpolated]);

  return (
    <main className='grid grid-cols-4'>
      <div className='col-span-3'>
        <Map
          style={{ width: '70vw', height: '100vh' }}
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
          ref={mapRef}
          mapStyle='mapbox://styles/mapbox/satellite-v9'
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
          fog={fogLayer}
          onMove={handleMoveEvent}
          onLoad={() =>
            handleMapLoad(stravaPath, setInterpolated, setLineCoordinates)
          }
        >
          <Source {...skySource}>
            <Layer {...skyLayer} />
          </Source>
          <Source type='geojson' data={routeLineString}>
            <Layer {...lineLayerStyle} />
          </Source>
          <Source {...definePointSource(currentPoint)}>
            <Layer {...pointLayerStyle} />
          </Source>
          <Source {...defineLineSource(lineCoordinates)}>
            <Layer {...animatedLineLayerStyle} />
          </Source>
        </Map>
      </div>

      <MetricsSidebar
        currentMetrics={currentMetrics}
        stravaPath={stravaPath}
        currentFrame={currentFrame}
      />
    </main>
  );
}
