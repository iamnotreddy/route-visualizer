import { NextApiRequest, NextApiResponse } from 'next';

import { getTokenResponse } from '@/archive/helpers';

export type StravaAuth = {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
};

export type StravaAthlete = {
  id: number;
  firstname: string;
  lastname: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  created_at: string;
  updated_at: string;
  weight: string;
  profile_medium: string;
  profile: string;
};

export default async function stravaAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const { code } = query;

  let response: StravaAuth | undefined = undefined;

  if (typeof code == 'string') {
    response = await getTokenResponse(code);
  }

  return response
    ? res.status(200).json(response)
    : res
        .status(400)
        .json({ message: `The following code: ${code} resulted in an err0r` });
}
