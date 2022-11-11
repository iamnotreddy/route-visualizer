export const createAuthURL = (code: string) => {
  const oAuthUrl = 'https://www.strava.com/api/v3/oauth/token';
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET;
  const grantType = 'authorization_code';
  return `${oAuthUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=${grantType}`;
};

export const getTokenResponse = async (code: string) => {
  const oAuthURL = createAuthURL(code);
  return fetch(oAuthURL, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  }).then((res) => res.json());
};
