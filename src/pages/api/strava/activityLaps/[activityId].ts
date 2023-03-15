/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  });

  let accessToken;

  if (token && token['accessToken']) {
    accessToken = token['accessToken'];
  }

  const { activityId } = req.query;

  const url = `https://www.strava.com/api/v3/activities/${activityId}/laps?access_token=${accessToken}`;

  const laps = await fetch(url).then((res) => res.json());

  try {
    return res.status(200).json({
      status: 'OK',
      data: [laps],
    });
  } catch (err) {
    return res.status(400).json({
      status: err,
    });
  }
};
