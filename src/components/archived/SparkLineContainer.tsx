import SparklineChart from '@/components/archived/SparklineChart';

import { DataPoint } from '@/helpers/types';

type SparklineContainerProps = {
  name: string;
  series: DataPoint[];
};

export const SparklineContainer = ({
  name,
  series,
}: SparklineContainerProps) => {
  return (
    <div className='flex flex-row items-center space-x-2'>
      <p className='text-center text-sm font-semibold'>{name}</p>
      <div className='col-span-3 border-2'>
        <SparklineChart series={series} />
      </div>
    </div>
  );
};
