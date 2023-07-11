/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, before, after } = req.query;

  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  });

  let accessToken;

  if (token && token['accessToken']) {
    accessToken = token['accessToken'];
  }

  const defaultUrl = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&page=${page}&per_page=50`;
  const dateUrl = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&page=${page}&per_page=50&before=${before}&after=${after}`;

  const responseUrl =
    before && after && typeof before === 'string' && typeof after === 'string'
      ? dateUrl
      : defaultUrl;

  const activities = await fetch(responseUrl).then((res) => res.json());

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
