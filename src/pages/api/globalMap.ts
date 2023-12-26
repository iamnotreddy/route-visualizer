import { Position } from 'geojson';
import type { NextApiRequest, NextApiResponse } from 'next';

import handleGetGlobalMap from '@/handlers/handleGetGlobalMap';
import handlePostGlobalMap from '@/handlers/handleSaveGlobalMap';

export interface ApiResponse {
  message?: string;
  data?: GlobalMapRoute[];
}

export interface GlobalMapRoute {
  strava_activity_id: number;
  strava_athlete_id: number;
  anonymous: boolean;
  date_added: string;
  activity_date: string;
  route_polyline: string;
  elevation: number[];
  distance: number[];
  total_distance: number;
  total_moving_time: number;
  total_elevation_gain: number;
  start_latlng: Position;
  route_name: string;
  route_description: string;
  coordinates: Position[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        await handlePostGlobalMap(req, res);
        break;

      case 'GET':
        await handleGetGlobalMap(req, res);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
