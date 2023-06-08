import { useQuery } from '@tanstack/react-query';
import { Position } from 'geojson';
import { ChangeEvent, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { getActivityStream } from '@/helpers/fetchingFunctions';

export function useRouteAnimation(
  routeId: string | undefined,
  mapRef: React.RefObject<MapRef>,
  animationState: 'playing' | 'paused'
) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>();

  // current point of the line drawn on the map
  const [animatedLineCoordinates, setAnimatedLineCoordinates] = useState<
    Position[]
  >([]);

  const { data: stravaPath, isLoading: isActivityStreamFetching } = useQuery(
    ['activityStream', routeId],
    () => getActivityStream(routeId),
    {
      keepPreviousData: true,
    }
  );

  //  handles route animation according to radio slider position
  const handleRouteControl = (e: ChangeEvent<HTMLInputElement>) => {
    const inputFrame = parseInt(e.target.value);
    const routeCoordinates = stravaPath?.latlng;

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
    setCurrentFrame(0);
    if (stravaPath && stravaPath.latlng) {
      setCurrentPoint(stravaPath?.latlng[0]);
    }
  }, [routeId, stravaPath]);

  useEffect(() => {
    const routeCoordinates = stravaPath?.latlng;
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
  }, [animationState, stravaPath]);

  useEffect(() => {
    if (mapRef.current && stravaPath) {
      const routeCoordinates = stravaPath.latlng;

      mapRef.current.panTo([
        routeCoordinates[currentFrame][0],
        routeCoordinates[currentFrame][1],
      ]);
      setAnimatedLineCoordinates(routeCoordinates.slice(0, currentFrame + 1));
      setCurrentPoint(routeCoordinates[currentFrame]);
    }
  }, [currentFrame, mapRef, stravaPath]);

  return {
    animatedLineCoordinates,
    setAnimatedLineCoordinates,
    currentPoint,
    handleRouteControl,
    currentFrame,
    setCurrentFrame,
    setCurrentPoint,
    stravaPath,
    isActivityStreamFetching,
  };
}
