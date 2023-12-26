import { format } from 'date-fns';
import { Position } from 'geojson';
import { useState } from 'react';

import { ShadButton } from '@/components/primitives/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/primitives/Dialog';
import { Input } from '@/components/primitives/Input';
import { Label } from '@/components/primitives/Label';
import { Textarea } from '@/components/primitives/TextArea';

import { saveRouteOnGlobalMap } from '@/helpers/fetchingFunctions';
import { StravaActivity } from '@/helpers/types';
import { GlobalMapRoute } from '@/pages/api/globalMap';

export default function SaveActivityDialog(props: {
  currentActivity: StravaActivity;
  elevation: number[];
  distance: number[];
  coordinates: Position[];
}) {
  const { currentActivity, elevation, distance, coordinates } = props;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const routeToAdd: GlobalMapRoute = {
    strava_activity_id: parseInt(currentActivity.id),
    strava_athlete_id: parseInt(currentActivity.athlete.id),
    anonymous: false,
    date_added: format(new Date(), 'EEEE, MMMM d yyyy'),
    activity_date: currentActivity.start_date,
    route_polyline: currentActivity.map.summary_polyline,
    elevation: elevation,
    distance: distance,
    route_name: title,
    route_description: description,
    total_distance: currentActivity.distance,
    total_moving_time: currentActivity.moving_time,
    start_latlng: currentActivity.start_latlng,
    total_elevation_gain: currentActivity.total_elevation_gain,
    coordinates: coordinates,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ShadButton variant='default'>Add Activity To Map</ShadButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add route to global map</DialogTitle>
          <DialogDescription>
            Your route will be visible on the map to all re.play users
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <Label htmlFor='routeName' className='sr-only'>
              Route Name
            </Label>
            <p>Route Name</p>
            <Input
              id='routeName'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Label htmlFor='routeDescription' className='sr-only'>
              Route Description
            </Label>
            <p>Route Description</p>
            <Textarea
              id='routeDescription'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className='sm:justify-start'>
          <ShadButton onClick={() => saveRouteOnGlobalMap(routeToAdd)}>
            Add
          </ShadButton>
          <DialogClose asChild>
            <ShadButton type='button' variant='default'>
              Close
            </ShadButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
