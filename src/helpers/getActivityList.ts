import { transformActivityList } from '@/helpers/helpers';
import { ActivityListResponse } from '@/helpers/types';

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
