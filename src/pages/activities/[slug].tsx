import { useRouter } from 'next/router';

const StravaActivityPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <div className='text-4xl'>Loading Visualization for Activity {slug}</div>
  );
};

export default StravaActivityPage;
