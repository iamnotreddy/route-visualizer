import { Position } from 'geojson';
import { ChangeEvent, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { splashRouteCoordinates } from '@/helpers/initialValues';

export function useSplashAnimation(
  mapRef: React.RefObject<MapRef>,
  animationState: 'playing' | 'paused',
  status: 'authenticated' | 'loading' | 'unauthenticated'
) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // current point of the line drawn on the map
  const [animatedLineCoordinates, setAnimatedLineCoordinates] = useState<
    Position[]
  >([]);

  //  handles route animation according to radio slider position
  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);
    const routeCoordinates = splashRouteCoordinates;

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
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      return;
    }

    const routeCoordinates = splashRouteCoordinates;
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
      }, 50);

      return () => clearInterval(interval);
    }
  }, [animationState, status]);

  useEffect(() => {
    if (status === 'authenticated' || !mapRef.current) {
      return;
    }

    if (mapRef.current) {
      const routeCoordinates = splashRouteCoordinates;

      mapRef.current.panTo([
        routeCoordinates[currentFrame][0],
        routeCoordinates[currentFrame][1],
      ]);
      setAnimatedLineCoordinates(routeCoordinates.slice(0, currentFrame + 1));
    }
  }, [currentFrame, mapRef, status]);

  return {
    animatedLineCoordinates,
    handleRouteControl,
    currentFrame,
    setCurrentFrame,
    splashRouteCoordinates,
  };
}
