import { Position } from 'geojson';
import { ChangeEvent, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

export function useRouteAnimation(
  mapRef: React.RefObject<MapRef>,
  animationState: 'playing' | 'paused',
  routeCoordinates: Position[] | undefined
) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>();

  // current point of the line drawn on the map
  const [animatedLineCoordinates, setAnimatedLineCoordinates] = useState<
    Position[]
  >([]);

  //  handles route animation according to radio slider position
  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);

    if (mapRef.current && routeCoordinates) {
      // pan camera towards next frame
      try {
        mapRef.current.panTo([
          routeCoordinates[inputFrame][0],
          routeCoordinates[inputFrame][1],
        ]);
      } catch {
        alert('Invalid Lat/Lng coordinates');
      }

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
    if (routeCoordinates) {
      setCurrentFrame(0);
      setCurrentPoint(routeCoordinates[0]);
    }
  }, [routeCoordinates]);

  useEffect(() => {
    const routeLength = routeCoordinates?.length;

    if (animationState === 'playing' && routeLength) {
      const interval = setInterval(() => {
        setCurrentFrame((prevValue) => {
          let nextValue;
          if (routeCoordinates[prevValue + 1]) {
            nextValue = prevValue + 1;
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
    try {
      if (mapRef.current && routeCoordinates) {
        mapRef.current.panTo([
          routeCoordinates[currentFrame][0],
          routeCoordinates[currentFrame][1],
        ]);
        setAnimatedLineCoordinates(routeCoordinates.slice(0, currentFrame + 1));
        setCurrentPoint(routeCoordinates[currentFrame]);
      }
    } catch {
      alert('activity has invalid lat/lng coordinates');
    }
  }, [currentFrame, mapRef, routeCoordinates]);

  return {
    animatedLineCoordinates,
    setAnimatedLineCoordinates,
    currentPoint,
    handleRouteControl,
    currentFrame,
    setCurrentFrame,
    setCurrentPoint,
  };
}
