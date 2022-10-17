import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { code } = router.query;
  const [tokenResponse, setTokenResponse] = useState('');

  useEffect(() => {
    if (code && typeof code == 'string') {
      fetch(`http://localhost:3000/api/tokenExchange?code=${code}`)
        .then((res) => res.json())
        .then((res) => setTokenResponse(JSON.stringify(res)))
        .catch((err) => {
          alert('error authenticating: ' + err.toString());
        });
    }
  }, [code]);

  return (
    <main className='m-10'>
      <div className='flex flex-col space-y-4'>
        <h1 className='w-1/6 bg-slate-300 text-4xl'>Login Status</h1>
        <p className='w-1/2 border-2 border-dotted border-black p-4'>
          auth response: {tokenResponse}
        </p>
      </div>
    </main>
  );
}
