import { Position } from 'geojson';
import { ChangeEvent, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

export function useRouteAnimation(
  routeCoordinates: Position[] | undefined,
  setCurrentPoint: React.Dispatch<React.SetStateAction<Position | undefined>>,
  setAnimatedLineCoordinates: React.Dispatch<React.SetStateAction<Position[]>>,
  mapRef: React.RefObject<MapRef>
) {
  const [animationState, setAnimationState] = useState<'paused' | 'playing'>(
    'paused'
  );
  const [currentFrame, setCurrentFrame] = useState(0);

  //  handles route animation according to radio slider position
  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);

    if (mapRef.current && routeCoordinates && routeCoordinates[inputFrame]) {
      // pan camera towards next frame
      mapRef.current.panTo([
        routeCoordinates[inputFrame][0],
        routeCoordinates[inputFrame][1],
      ]);

      setCurrentFrame(inputFrame);

      // add, remove point based on inputFrame
      setAnimatedLineCoordinates((prev) => {
        if (routeCoordinates) {
          return routeCoordinates.slice(0, inputFrame + 1);
        } else {
          return prev;
        }
      });

      setCurrentPoint(routeCoordinates[inputFrame]);
    }
  };

  useEffect(() => {
    const routeLength = routeCoordinates?.length;

    if (animationState === 'playing' && routeLength) {
      const interval = setInterval(() => {
        setCurrentFrame((prevValue) => {
          let nextValue;
          if (routeCoordinates[prevValue++]) {
            nextValue = prevValue++;
          } else {
            nextValue = prevValue;
          }

          if (nextValue === routeCoordinates.length - 1) {
            nextValue = 0;
          }

          return nextValue;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [animationState, routeCoordinates]);

  useEffect(() => {
    if (mapRef.current && routeCoordinates && routeCoordinates[currentFrame]) {
      const route = routeCoordinates;
      mapRef.current.panTo([route[currentFrame][0], route[currentFrame][1]]);
      setAnimatedLineCoordinates(route.slice(0, currentFrame + 1));
      setCurrentPoint(route[currentFrame]);
    }
  }, [
    currentFrame,
    mapRef,
    setCurrentPoint,
    setAnimatedLineCoordinates,
    routeCoordinates,
  ]);

  return {
    animationState,
    setAnimationState,
    currentFrame,
    setCurrentFrame,
    handleRouteControl,
  };
}
