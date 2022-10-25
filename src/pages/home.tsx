import Button from '@/components/buttons/Button';

const redirectUrl = 'http://localhost:3000/';
const scope = 'activity:read_all';

export default function Home() {
  const handleLogin = () => {
    window.location.href = `http://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=${scope}`;
  };

  return (
    <main className='flex h-screen justify-center bg-slate-300'>
      <div className='m-auto space-y-4'>
        <h1 className='text-4xl'>Connect to Strava</h1>
        <Button className='z-30' variant='dark' onClick={handleLogin}>
          Login
        </Button>
      </div>
    </main>
  );
}
