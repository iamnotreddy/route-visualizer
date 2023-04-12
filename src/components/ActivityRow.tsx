import polyline from '@mapbox/polyline';
import { format, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import Map, { Layer, MapRef, Source, ViewState } from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import UnstyledLink from '@/components/links/UnstyledLink';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/api/chartHelpers';
import { defineLineSource, polylineLayerStyle } from '@/api/layers';
import { StravaActivity } from '@/api/types';

type ActivityListProps = {
  activity: StravaActivity;
};

type MapRowProps = {
  coordinates: number[][];
};

const MapPolylineRow = ({ coordinates }: MapRowProps) => {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({} as ViewState);

  useEffect(() => {
    if (coordinates[0]) {
      setViewState({
        bearing: 0,
        pitch: 0,
        padding: {
          top: 1,
          bottom: 1,
          left: 1,
          right: 1,
        },
        latitude: coordinates[0][1],
        longitude: coordinates[0][0],
        zoom: 12,
      });
    }
  }, [coordinates]);

  if (viewState) {
    return (
      <Map
        {...viewState}
        style={{ width: '20vw', height: '10vw' }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
        ref={mapRef}
        mapStyle='mapbox://styles/iamnotreddy/cl8mi1thc003914qikp84oo8l'
      >
        <Source {...defineLineSource(coordinates)}>
          <Layer {...polylineLayerStyle} />
        </Source>
      </Map>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default function ActivityRow({ activity }: ActivityListProps) {
  const decodedPolyline = polyline.decode(activity.map.summary_polyline);
  const coordinates = decodedPolyline.map(([lng, lat]) => [lat, lng]);
  const cityPlaceHolder = activity.timezone.split('/')[1].replace('_', ' ');
  const startTime = format(parseISO(activity.start_date), 'hh:mm a');
  const metersToMiles = 0.000621371;
  const pace = generatePacePoint(activity.moving_time, activity.distance);
  const formattedPace = convertPaceValueForDisplay(pace);

  const distanceFormatted = (metersToMiles * activity.distance).toFixed(1);
  const formattedActivityDate = format(
    new Date(activity.start_date),
    'EEEE, MMMM d yyyy'
  );

  return (
    <>
      <UnstyledLink href={`/activities/${activity.id}`}>
        <div className='items-center space-x-4 p-4 md:flex'>
          <div className='flex flex-1 flex-col space-y-2 '>
            <div className='flex flex-row space-x-4'>
              <div className='flex flex-col p-2'>
                <div className='text-2xl font-semibold'>{activity.name}</div>
                <div className='flex flex-row space-x-1 text-lg text-slate-600'>
                  <p>{formattedActivityDate}</p>
                  <p>·</p>
                  <p>{startTime}</p>
                </div>
                <div className='text-lg text-slate-600'>{cityPlaceHolder}</div>
              </div>
            </div>
            <div className='flex flex-row space-x-8'>
              <div className='flex flex-col'>
                <p className='text-center text-lg text-slate-600'>distance</p>
                <div className='flex flex-row items-center space-x-2'>
                  <p className='text-3xl'>{distanceFormatted}</p>
                  <p>mi</p>
                </div>
              </div>
              <div className='flex flex-col'>
                <p className='text-lg text-slate-600'>time</p>
                <div className='flex flex-row items-center space-x-2'>
                  <p className='text-3xl'>
                    {convertPaceValueForDisplay(activity.moving_time / 60)}
                  </p>
                </div>
              </div>
              <div className='flex flex-col'>
                <p className='text-lg text-slate-600'>pace</p>
                <div className='flex flex-row items-center space-x-2'>
                  <p className='text-3xl'>{formattedPace}</p>
                  <div className='flex flex-col items-center text-xs'>
                    <p>min</p>
                    <p>m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MapPolylineRow coordinates={coordinates} />
        </div>
      </UnstyledLink>
    </>
  );
}
