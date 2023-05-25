import { animated, useSprings } from '@react-spring/web';
import React from 'react';

import { formatSecondsToPace } from '@/helpers/chartHelpers';

type SplitsProps = {
  metricArray: number[];
  metricType: string;
  currentSplit: number;
};

export default function Splits({
  metricArray,
  metricType,
  currentSplit,
}: SplitsProps) {
  // used to calculate svg rect length; add 20% chart padding
  const svgNormalizeValue = Math.max(...metricArray) * 1.2;

  const fillStyles = {
    heartRate: '#f9a8d4',
    pace: '#059669',
    elevation: '#d8b4fe',
    grade: '#f59e0b',
  };

  type FillStylesKeys = keyof typeof fillStyles;
  const currentFillColor = fillStyles[metricType as FillStylesKeys];

  const springs = useSprings(
    metricArray.length,
    metricArray.map((lap) => ({
      width: 0,
      to: { width: (lap / svgNormalizeValue) * 100 },
    }))
  );

  const returnCurrentSplitStyle = (
    currentSplit: number,
    mappedSplit: number
  ) => {
    if (currentSplit === mappedSplit) {
      return true;
    }
  };

  return (
    <div className='grid grid-cols-6 items-start space-y-1'>
      {metricArray.length > 0 &&
        springs.map((value, index) => {
          return (
            <React.Fragment key={index}>
              <div>{index}</div>
              <svg className='col-span-4' viewBox='0 0 100 10'>
                <animated.rect
                  x='0'
                  y='0'
                  width={value.width}
                  height='10'
                  fill={currentFillColor}
                />
                {returnCurrentSplitStyle(currentSplit, index) && (
                  <svg className='col-span-4' viewBox='0 0 100 10'>
                    <animated.rect
                      x='0'
                      y='0'
                      width={value.width}
                      height='20'
                      fill='slate'
                      fillOpacity={0.4}
                    />
                  </svg>
                )}
              </svg>
              <div
                className={
                  returnCurrentSplitStyle(currentSplit, index)
                    ? 'scale-125 font-semibold'
                    : ''
                }
              >
                {metricType == 'pace'
                  ? formatSecondsToPace(metricArray[index])
                  : Math.floor(metricArray[index])}
              </div>
            </React.Fragment>
          );
        })}
    </div>
  );
}
