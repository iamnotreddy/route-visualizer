import { animated, useSpring } from '@react-spring/web';

import {
  convertPaceValueForDisplay,
  generatePacePoint,
} from '@/helpers/chartHelpers';

export type TimeComponentProps = {
  time: number;
  showMetricTitle?: boolean;
};

export type DistanceComponentProps = {
  distance: number;
  showMetricTitle?: boolean;
};

export type PaceComponentProps = {
  time: number;
  distance: number;
  showMetricTitle?: boolean;
};

export const DistanceComponent = ({
  distance,
  showMetricTitle,
}: DistanceComponentProps) => {
  const metersToMiles = 0.000621371;

  const { number } = useSpring({
    from: { number: 0 },
    to: { number: distance * metersToMiles },
    config: { duration: 750 },
  });

  return (
    <div className='flex flex-col '>
      <div className='flex flex-row items-center font-light'>
        <animated.div>{number.to((val) => val.toFixed(1))}</animated.div>
        <p className='ml-1 text-xs'>mi</p>
      </div>
      {showMetricTitle && (
        <div className='text-center text-xs font-light text-slate-600'>
          distance
        </div>
      )}
    </div>
  );
};

export const TimeComponent = ({
  time,
  showMetricTitle,
}: TimeComponentProps) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: time / 60 },
    config: { duration: 750 },
  });
  return (
    <div className='flex flex-col'>
      <div className='flex flex-row items-center font-light '>
        <animated.div>
          {number.to((val) => convertPaceValueForDisplay(val))}
        </animated.div>
      </div>
      {showMetricTitle && (
        <p className='text-center text-xs font-light text-slate-600'>time</p>
      )}
    </div>
  );
};

export const PaceComponent = ({
  time,
  distance,
  showMetricTitle,
}: PaceComponentProps) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: generatePacePoint(time, distance) },
    config: { duration: 750 },
  });

  return (
    <div className='flex flex-col'>
      <div className='flex flex-row items-center space-x-1 font-light'>
        <animated.div>
          {number.to((val) => convertPaceValueForDisplay(val))}
        </animated.div>
        <div className='flex flex-col items-center text-xs'>
          <p>min</p>
          <p>m</p>
        </div>
      </div>
      {showMetricTitle && (
        <p className='text-center text-xs font-light text-slate-600'>pace</p>
      )}
    </div>
  );
};
