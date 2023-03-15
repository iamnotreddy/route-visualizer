import React from 'react';

import { formatSecondsToPace } from '@/api/chartHelpers';

type SplitsProps = {
  metricArray: number[];
  metricType: string;
};

export default function Splits({ metricArray, metricType }: SplitsProps) {
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

  return (
    <div className='grid grid-cols-6 items-start'>
      {metricArray.length > 0 &&
        metricArray.map((value, index) => {
          return (
            <React.Fragment key={index}>
              <div>{index}</div>
              <svg className='col-span-4' viewBox='0 0 100 10'>
                <rect
                  x='0'
                  y='0'
                  width={`${(value / svgNormalizeValue) * 100}%`}
                  height='10'
                  fill={currentFillColor}
                />
              </svg>
              <div>
                {metricType == 'pace'
                  ? formatSecondsToPace(value)
                  : Math.floor(value)}
              </div>
            </React.Fragment>
          );
        })}
    </div>
  );
}
