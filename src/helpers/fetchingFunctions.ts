/* eslint-disable no-console */
import { getTime, sub } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { transformActivityList } from '@/helpers/helpers';
import {
  ActivityListResponse,
  ActivitySplitsResponse,
  StravaRouteStream,
} from '@/helpers/types';
import { GlobalMapRoute } from '@/pages/api/globalMap';

// Strava API fetchers

export const getActivityList = async (
  page: number,
  dateRange: DateRange | undefined
) => {
  let after, before;

  try {
    if (dateRange && dateRange.from && dateRange.to) {
      const { from, to } = dateRange;
      // convert provided params to timestamps
      after = getTime(from) / 1000;
      before = getTime(to) / 1000;
    } else {
      // Handle the undefined case here, e.g., by assigning default values
      const today = new Date();
      const defaultStart = sub(today, { days: 30 });
      after = getTime(defaultStart) / 1000;
      before = getTime(today) / 1000;
    }

    const url = `/api/strava/activities?page=${page}&before=${before}&after=${after}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as ActivityListResponse;

    // flip lat / lng points
    const cleaned = data.data[0] ? transformActivityList(data.data[0]) : [];
    const sorted = cleaned.sort(
      (a, b) =>
        getTime(new Date(b.start_date)) - getTime(new Date(a.start_date))
    );

    return sorted;
  } catch (error) {
    console.error('Error fetching activity list:', error);
    throw error;
  }
};

export const getActivityStream = async (
  routeId?: string | string[] | undefined
): Promise<StravaRouteStream> => {
  const response = await fetch(`/api/strava/activityStream/${routeId}`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const responseJson = await response.json();

  const data = responseJson.data as StravaRouteStream;

  return data;
};

export const getActivitySplits = async (
  routeId?: string | string[] | undefined
) => {
  const response = await fetch(`/api/strava/activityLaps/${routeId}`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const res = (await response.json()) as ActivitySplitsResponse;

  return res.data[0];
};

type TokenResponse = {
  token_type: 'Bearer';
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
};

export const refreshAccessToken = async (
  id: string,
  secret: string,
  refreshToken: string
) => {
  const url = `https://www.strava.com/oauth/token`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    method: 'POST',
  });

  const data: TokenResponse = await response.json();

  return data;
};

// global map fetchers

export const saveRouteOnGlobalMap = async (routeData: GlobalMapRoute) => {
  const response = await fetch('/api/globalMap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(routeData),
  });

  if (!response.ok) {
    throw new Error('Failed to save route');
  }

  return response.json();
};

export const getRoutesOnGlobalMap = async (): Promise<GlobalMapRoute[]> => {
  const response = await fetch('/api/globalMap');

  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }

  const responseData = await response.json();

  return responseData.data;
};
