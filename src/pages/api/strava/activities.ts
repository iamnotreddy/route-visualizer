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

  const url = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}`;

  const activities = await fetch(url).then((res) => res.json());

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
