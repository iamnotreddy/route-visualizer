// old code attempting to do auth before switching to NextAuth

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { StravaAuth } from '@/pages/api/auth/tokenExchange';

export default function Home() {
  const router = useRouter();
  const { code } = router.query;
  const [tokenResponse, setTokenResponse] = useState({} as StravaAuth);
  const [hasTokenLoaded, setHasTokenLoaded] = useState(false);

  useEffect(() => {
    if (code && typeof code == 'string') {
      fetch(`http://localhost:3000/api/auth/tokenExchange?code=${code}`)
        .then((res) => res.json())
        .then((res) => {
          setTokenResponse(res);
          setHasTokenLoaded(true);
        })
        .catch((err) => {
          alert('error authenticating: ' + err.toString());
        });
    }
  }, [code]);

  // useEffect(() => {
  //   if (hasTokenLoaded) {
  //     router.push('/lol');
  //   }
  // }, [hasTokenLoaded, router]);

  if (!hasTokenLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <main className='m-8'>
        <div className='flex flex-col space-y-4'>
          <div className='flex flex-row items-center bg-slate-300 text-4xl'>
            <h1 className='w-10/12 p-8'>Login Status</h1>
            <div className='w-2/12 rounded-full border-2 border-black bg-slate-100 ' />
          </div>
          {tokenResponse.athlete && (
            <div>
              <img src={tokenResponse.athlete.profile} />
            </div>
          )}

          {tokenResponse.athlete && (
            <div>
              <p>
                Name:{' '}
                {tokenResponse.athlete.firstname +
                  ' ' +
                  tokenResponse.athlete.lastname}
              </p>
              <p>City: {tokenResponse.athlete.city}</p>
              <p>weight: {tokenResponse.athlete.weight} lb</p>
              <p>access token: {tokenResponse.access_token}</p>
            </div>
          )}
        </div>
      </main>
    );
  }
}
