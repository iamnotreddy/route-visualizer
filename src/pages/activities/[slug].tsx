/* eslint-disable react-hooks/exhaustive-deps */

import { animated, useSpring } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import Map, {
  Layer,
  MapRef,
  NavigationControl,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import {
  ActivityOverview,
  Trail,
} from '@/components/archived/ActivityOverview';
import AnimationControl from '@/components/archived/AnimationControl';
import ChooseMetricBar from '@/components/archived/ChooseMetricBar';
import VisXLineChart from '@/components/archived/VisXLineChart';
import { useRouteAnimation } from '@/components/hooks/archived/useRouteAnimation';

import { generatePace } from '@/helpers/chartHelpers';
import {
  getActivitySplits,
  getActivityStream,
} from '@/helpers/fetchingFunctions';
import { transformMetricToDataPoint } from '@/helpers/helpers';
import {
  findInitialViewState,
  findRouteLineString,
} from '@/helpers/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  definePointSource,
  lineLayerStyle,
  pointLayerStyle,
  skyLayer,
  skySource,
} from '@/helpers/layers';
import { DataPoint } from '@/helpers/types';

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;

  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  // current Mapbox ViewState, initialized to first point of strava route
  const [viewState, setViewState] = useState<ViewState>();

  // current point on route, point marker on Map
  const [currentPoint, setCurrentPoint] = useState<Position>();

  // current point of the line drawn on the map
  const [animatedLineCoordinates, setAnimatedLineCoordinates] = useState<
    Position[]
  >([]);

  // the whole route line drawn on the map
  const [routeLineString, setRouteLineString] = useState(
    {} as FeatureCollection<Geometry, GeoJsonProperties>
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();
  const [areaSeriesMetric, setAreaSeriesMetric] = useState('');

  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);

  const { data: stravaPath, isLoading } = useQuery(
    ['activityStream'],
    () => getActivityStream(slug),
    {
      keepPreviousData: true,
    }
  );

  const { data: splits } = useQuery(
    ['activitySplits'],
    () => getActivitySplits(slug),
    {
      keepPreviousData: true,
    }
  );

  // change viewState as camera pans around route
  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  // set initial points on chart
  useEffect(() => {
    if (stravaPath) {
      setViewState(findInitialViewState(stravaPath.latlng));
      setCurrentPoint(stravaPath.latlng[0]);
      setRouteLineString(findRouteLineString(stravaPath.latlng));
    }
  }, [stravaPath]);

  const {
    animationState,
    setAnimationState,
    currentFrame,
    setCurrentFrame,
    handleRouteControl,
  } = useRouteAnimation(
    stravaPath?.latlng,
    setCurrentPoint,
    setAnimatedLineCoordinates,
    mapRef
  );

  // initialize drawing of route
  const handleOnMapLoad = () => {
    setHasMapLoaded(true);
    if (stravaPath) {
      setAnimatedLineCoordinates([stravaPath.latlng[0]]);
      setAreaSeriesMetric('pace');
    }
  };

  const mapSpring = useSpring({
    width: isSidebarOpen ? '75vw' : '100vw',
    height: isSidebarOpen ? '60vh' : '90vh',
    config: { tension: 100 },
  });

  const chartSpring = useSpring({
    width: isSidebarOpen ? '75vw' : '80vw',
    height: isSidebarOpen ? '20vh' : '0vh',
    config: { tension: 100 },
  });

  useEffect(() => {
    setIsSidebarOpen((prev) => !prev);
  }, [hasMapLoaded]);

  useEffect(() => {
    if (stravaPath) {
      const paceArray = generatePace(
        transformMetricToDataPoint(stravaPath.time),
        transformMetricToDataPoint(stravaPath.distance)
      );

      if (areaSeriesMetric == 'heartRate') {
        setAreaSeries(transformMetricToDataPoint(stravaPath.heartRate));
      } else if (areaSeriesMetric == 'elevation') {
        setAreaSeries(transformMetricToDataPoint(stravaPath.altitude));
      } else if (areaSeriesMetric == 'pace') {
        setAreaSeries(paceArray);
      } else if (areaSeriesMetric == 'grade') {
        setAreaSeries(transformMetricToDataPoint(stravaPath.grade_smooth));
      }
    }
  }, [areaSeriesMetric]);

  if (isLoading) {
    return <div>Loading... </div>;
  }

  return (
    <main className='flex max-h-screen w-full'>
      {stravaPath && splits && (
        <div className='flex flex-col'>
          <div className='flex flex-row space-x-2'>
            <div className='relative'>
              <animated.div style={{ ...mapSpring }}>
                <Map
                  {...viewState}
                  maxPitch={85}
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
                  <Source {...defineLineSource(animatedLineCoordinates)}>
                    <Layer {...animatedLineLayerStyle} />
                  </Source>
                </Map>
              </animated.div>

              <div className='relative bottom-10 left-20 w-1/4 '>
                <AnimationControl
                  animationState={animationState}
                  stravaPath={stravaPath}
                  currentFrame={currentFrame}
                  setAnimationState={setAnimationState}
                  setViewState={setViewState}
                  setCurrentPoint={setCurrentPoint}
                  setRouteLineString={setRouteLineString}
                  setLineCoordinates={setAnimatedLineCoordinates}
                  setCurrentFrame={setCurrentFrame}
                  handleRouteControl={handleRouteControl}
                  sliderRef={sliderRef}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </div>
            </div>

            <div className='hidden sm:block'>
              <Trail open={isSidebarOpen}>
                <ActivityOverview
                  activityTitle=''
                  userNotes=''
                  metrics={stravaPath}
                  splits={splits}
                  currentFrame={currentFrame}
                />
              </Trail>
            </div>
          </div>
          <div className='flex flex-row items-center space-x-2'>
            {areaSeriesMetric && (
              <ChooseMetricBar
                setCurrentMetric={setAreaSeriesMetric}
                currentMetric={areaSeriesMetric}
                orientation='vertical'
              />
            )}

            <Trail open={isSidebarOpen}>
              {areaSeries && areaSeriesMetric && (
                <animated.div style={{ ...chartSpring }}>
                  <VisXLineChart
                    currentFrame={currentFrame}
                    setCurrentFrame={setCurrentFrame}
                    areaSeries={areaSeries}
                    areaSeriesMetric={areaSeriesMetric}
                  />
                </animated.div>
              )}
            </Trail>
          </div>
        </div>
      )}
    </main>
  );
}
