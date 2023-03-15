import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AnimatedAreaSeries, XYChart } from '@visx/xychart';
import React from 'react';

import { calculateDomain } from '@/api/helpers';
import { DataPoint } from '@/api/types';

type SparklineChartProps = {
  series: DataPoint[];
};

export default function SparklineChart({ series }: SparklineChartProps) {
  // Define the dimensions and margins of the chart

  const accessors = {
    xAccessor: (d: DataPoint) => (d ? d.x : 0),
    yAccessor: (d: DataPoint) => (d ? d.y : 0),
  };

  return (
    <ParentSize>
      {({ width: visWidth, height: visHeight }) => (
        <XYChart
          width={visWidth}
          height={visHeight}
          xScale={{
            type: 'linear',
            domain: [0, series.length - 1],
            zero: false,
            nice: true,
          }}
          yScale={{
            type: 'linear',
            domain: calculateDomain(series),
            zero: false,
            nice: true,
          }}
        >
          <AnimatedAreaSeries
            dataKey='area'
            data={series}
            {...accessors}
            fillOpacity={0.9}
          />
        </XYChart>
      )}
    </ParentSize>
  );
}
