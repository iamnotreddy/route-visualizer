import { getTime, sub } from 'date-fns';

import { transformActivityList } from '@/helpers/helpers';
import {
  ActivityListResponse,
  ActivitySplitsResponse,
  StravaRouteStream,
} from '@/helpers/types';

export const getActivityList = async (
  page: number,
  dateRange: {
    startDate: Date;
    endDate: Date;
    isDefault: boolean;
  }
) => {
  const { startDate, endDate } = dateRange;

  // convert provided params to timestamps
  const after = getTime(startDate) / 1000;
  const before = getTime(endDate) / 1000;

  // find timestamp for 30 days ago if default
  const today = new Date();
  const thirtyDaysAgo = sub(today, { days: 30 });
  const defaultTimestamp = getTime(thirtyDaysAgo) / 1000;

  // don't send parameters to api route if date is unchanged,
  const url = dateRange.isDefault
    ? `/api/strava/activities?page=${page}&after=${defaultTimestamp}`
    : `/api/strava/activities?page=${page}&before=${before}&after=${after}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = (await response.json()) as ActivityListResponse;

  // flip lat / lng points
  const cleaned = data.data[0] ? transformActivityList(data.data[0]) : [];

  return cleaned;
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
