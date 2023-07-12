/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, before, after } = req.query;

  // set page size for strava request, max=200
  const pageSize = 50;

  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  });

  let accessToken;

  if (token && token['accessToken']) {
    accessToken = token['accessToken'];
  }

  let requestUrl;

  if (before) {
    requestUrl = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&page=${page}&per_page=${pageSize}&before=${before}&after=${after}`;
  } else {
    requestUrl = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&page=${page}&per_page=${pageSize}&after=${after}`;
  }

  const activities = await fetch(requestUrl).then((res) => res.json());

  try {
    return res.status(200).json({
      status: 'OK',
      data: [activities],
    });
  } catch (err) {
    return res.status(400).json({
      status: err,
    });
  }
};
