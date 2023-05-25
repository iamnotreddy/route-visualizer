/* eslint-disable react-hooks/exhaustive-deps */

import { animated, useSpring } from '@react-spring/web';
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
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

import { ActivityOverview, Trail } from '@/components/ActivityOverview';
import AnimationControl from '@/components/AnimationControl';
import ChooseMetricBar from '@/components/ChooseMetricBar';
import VisXLineChart from '@/components/VisXLineChart';

import { generatePace } from '@/helpers/chartHelpers';
import {
  transformActivityStreamResponse,
  transformMetricToDataPoint,
} from '@/helpers/helpers';
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
import {
  ActivitySplits,
  ActivitySplitsResponse,
  ActivityStreamResponse,
  DataPoint,
  StravaRouteStream,
} from '@/helpers/types';

export default function Dashboard() {
  // get Strava activity ID from URL param
  const router = useRouter();
  const { slug } = router.query;

  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  const [stravaPath, setStravaPath] = useState<StravaRouteStream>();

  const [splits, setSplits] = useState<ActivitySplits[]>([]);

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
  const [animationState, setAnimationState] = useState<'paused' | 'playing'>(
    'paused'
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();
  const [areaSeriesMetric, setAreaSeriesMetric] = useState('');

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
    let attempt = 1;
    const getStravaData = async () => {
      try {
        const response = await fetch(`/api/strava/activityStream/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const res = (await response.json()) as ActivityStreamResponse;

        setStravaPath(transformActivityStreamResponse(res.data[0]));
      } catch {
        alert(`error requesting data, attempt: ${attempt}`);
        attempt++;
      }
    };

    getStravaData();
  }, [slug]);

  // load data from api
  useEffect(() => {
    let attempt = 1;
    const getSplits = async () => {
      try {
        const response = await fetch(`/api/strava/activityLaps/${slug}`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const res = (await response.json()) as ActivitySplitsResponse;

        setSplits(res.data[0]);
      } catch {
        alert(`error requesting data, attempt: ${attempt}`);
        attempt++;
      }
    };

    getSplits();
  }, [slug]);

  // set initial points on chart
  useEffect(() => {
    if (stravaPath) {
      setViewState(findInitialViewState(stravaPath.latlng));
      setCurrentPoint(stravaPath.latlng[0]);
      setRouteLineString(findRouteLineString(stravaPath.latlng));
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
    setHasMapLoaded(true);
    if (stravaPath) {
      setLineCoordinates([stravaPath.latlng[0]]);
      setAreaSeriesMetric('pace');
    }
  };

  const mapSpring = useSpring({
    width: isSidebarOpen ? '75vw' : '80vw',
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

  // control sidebar with spacebar
  useEffect(() => {
    const handleSpaceBar = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsSidebarOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleSpaceBar);

    return () => {
      document.removeEventListener('keydown', handleSpaceBar);
    };
  }, []);

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

  return (
    <main className='flex flex-col p-4'>
      <div className='flex flex-row space-x-2 '>
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
              <Source {...defineLineSource(lineCoordinates)}>
                <Layer {...animatedLineLayerStyle} />
              </Source>
            </Map>
          </animated.div>

          <div className='relative bottom-10 left-20 w-1/4 '>
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
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}
          </div>
        </div>
        {stravaPath && hasMapLoaded && (
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
        )}
      </div>
      <div className='flex flex-row items-center space-x-2'>
        {areaSeriesMetric && (
          <ChooseMetricBar
            setCurrentMetric={setAreaSeriesMetric}
            currentMetric={areaSeriesMetric}
            orientation='vertical'
          />
        )}

        {stravaPath && (
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
        )}
      </div>
    </main>
  );
}
