import { Position } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Marker,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { RouteList } from '@/components/globalMapSidebar/RouteList';
import useGlobalMapPolylines from '@/components/hooks/useGlobalMapPolylines';
import Header from '@/components/layout/Header';

import {
  findActivityViewState,
  getPolyLineCoordinates,
} from '@/helpers/helpers';
import {
  defineGlobalMapLineLayerStyle,
  defineLineSource,
  definePointSource,
  endPointStyle,
  getGlobalMapPolylineLayerStyle,
  mapConfig,
  skyLayerStyle,
  skySource,
  startPointStyle,
} from '@/helpers/layers';
import { GlobalMapRoute } from '@/pages/api/globalMap';

export default function NewSignInPage(props: {
  globalMapUserRoutes: GlobalMapRoute[];
}) {
  const { globalMapUserRoutes } = props;

  const [currentGlobalMapRoute, setCurrentGlobalMapRoute] =
    useState<GlobalMapRoute>();

  const [viewState, setViewState] = useState<ViewState>();
  const [startPoint, setStartPoint] = useState<Position>();
  const [endPoint, setEndPoint] = useState<Position>();

  const mapRef = useRef<MapRef>(null);

  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  const { polylineLayer } = useGlobalMapPolylines(
    globalMapUserRoutes,
    currentGlobalMapRoute
  );

  const memoizedPolylineLayer = useMemo(() => {
    if (polylineLayer) {
      return (
        <Source type='geojson' data={polylineLayer}>
          <Layer {...getGlobalMapPolylineLayerStyle()} />
        </Source>
      );
    }
  }, [polylineLayer]);

  const memoizedCurrentActivity = useMemo(() => {
    if (
      currentGlobalMapRoute &&
      globalMapUserRoutes &&
      globalMapUserRoutes.length > 0
    ) {
      const route = globalMapUserRoutes.filter(
        (route) => route.strava_activity_id === route.strava_activity_id
      )[0];

      if (route && route.route_polyline) {
        const coordinates = getPolyLineCoordinates(route.route_polyline);

        return (
          <Source {...defineLineSource(coordinates)}>
            <Layer {...defineGlobalMapLineLayerStyle()} />
          </Source>
        );
      }
    }
  }, [currentGlobalMapRoute, globalMapUserRoutes]);

  const memoizedMarkers = useMemo(
    () =>
      globalMapUserRoutes?.map((userRoute) => {
        const handleMarkerOnClick = (routeId: number) => {
          if (globalMapUserRoutes) {
            const nextActivity = globalMapUserRoutes.filter(
              (x) => routeId === x.strava_activity_id
            )[0];
            setCurrentGlobalMapRoute(nextActivity);
          }
        };

        const startCoordinate =
          getPolyLineCoordinates(userRoute.route_polyline)[0] ?? [];

        if (
          Number.isFinite(startCoordinate[0]) &&
          Number.isFinite(startCoordinate[1]) &&
          !currentGlobalMapRoute
        ) {
          return (
            <Marker
              key={userRoute.strava_activity_id}
              longitude={startCoordinate[0]}
              latitude={startCoordinate[1]}
              scale={0.5}
              color='black'
              onClick={() => handleMarkerOnClick(userRoute.strava_activity_id)}
            />
          );
        }
      }),
    [globalMapUserRoutes, currentGlobalMapRoute]
  );

  const memoizedStartAndEndPoints = useMemo(() => {
    if (startPoint && endPoint) {
      return (
        <>
          <Source {...definePointSource(startPoint)}>
            <Layer {...startPointStyle} />
          </Source>
          <Source {...definePointSource(endPoint)}>
            <Layer {...endPointStyle} />
          </Source>
        </>
      );
    }
  }, [startPoint, endPoint]);

  // toggle selected activity on map
  useEffect(() => {
    if (currentGlobalMapRoute) {
      const polyLine = getPolyLineCoordinates(
        currentGlobalMapRoute.route_polyline
      );
      setStartPoint(polyLine[0]);
      setEndPoint(polyLine[polyLine.length - 1]);
      findActivityViewState(polyLine, mapRef);
    }
  }, [currentGlobalMapRoute]);

  return (
    <div className='relative flex max-h-screen w-full'>
      <div className='absolute top-0 left-0 z-20 w-full'>
        <Header />
      </div>
      <RouteList
        globalMapUserRoutes={globalMapUserRoutes}
        currentGlobalMapRoute={currentGlobalMapRoute}
        setCurrentGlobalMapRoute={setCurrentGlobalMapRoute}
      />

      <div className='flex-grow-0'>
        <Map
          {...viewState}
          ref={mapRef}
          {...mapConfig}
          onMove={handleMoveEvent}
        >
          <Source {...skySource}>
            <Layer {...skyLayerStyle} />
          </Source>
          {memoizedPolylineLayer}
          {memoizedMarkers}
          {memoizedStartAndEndPoints}
          {memoizedCurrentActivity}
        </Map>
      </div>
    </div>
  );
}
