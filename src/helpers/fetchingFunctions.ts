import {
  transformActivityList,
  transformActivityStreamResponse,
} from '@/helpers/helpers';
import {
  ActivityListResponse,
  ActivitySplitsResponse,
  ActivityStreamResponse,
  StravaRouteStream,
} from '@/helpers/types';

export const getActivityList = async (page: number) => {
  const response = await fetch(`/api/strava/activities?page=${page}`);

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

  const responseData = (await response.json()) as ActivityStreamResponse;

  const transformed = transformActivityStreamResponse(responseData.data[0]);

  return transformed;
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
