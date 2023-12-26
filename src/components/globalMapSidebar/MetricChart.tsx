import { ParentSize } from '@visx/responsive';
import {
  AnimatedAnnotation,
  AnimatedAreaSeries,
  AnimatedAxis,
  AnnotationCircleSubject,
  AnnotationLineSubject,
  EventHandlerParams,
  XYChart,
} from '@visx/xychart';
import React, { Dispatch } from 'react';

import { LockIcon, UnlockIcon } from '@/components/layout/icons';

import { calculateDomain } from '@/helpers/helpers';
import { DataPoint } from '@/helpers/types';

export default function MetricChart(props: {
  metricName: string;
  lockChartHover: boolean;
  setLockChartHover: Dispatch<React.SetStateAction<boolean>>;
  metricData: DataPoint[];
  currentFrame: number;
  setCurrentFrame: (currentFrame: number) => void;
  animationState: string;
}) {
  const {
    metricName,
    metricData,
    lockChartHover,
    currentFrame,
    setCurrentFrame,
    animationState,
    setLockChartHover,
  } = props;

  const accessors = {
    xAccessor: (d: DataPoint) => (d ? d.x : 0),
    yAccessor: (d: DataPoint) => (d ? d.y : 0),
  };

  const fillStyles = {
    heartRate: '#f9a8d4',
    pace: '#059669',
    elevation: '#d8b4fe',
    grade: '#f59e0b',
    cadence: '#f59e0b',
  };

  type FillStylesKeys = keyof typeof fillStyles;

  const currentFillColor = fillStyles[metricName as FillStylesKeys];

  const handleOnPointerMove = (e: EventHandlerParams<DataPoint>) => {
    if (!lockChartHover && animationState != 'playing') {
      setCurrentFrame(e.datum.x);
    }
  };

  const xDomain = [0, metricData.length - 1];
  const yDomain = calculateDomain(metricData);

  return (
    <div className='flex flex-col space-y-2 rounded-xl border-2 border-slate-400 p-2'>
      <div style={{ width: '16rem', height: '15vh' }}>
        <ParentSize>
          {(parent) => {
            return (
              <div>
                <div className='flex flex-row justify-between'>
                  <p className='text-center text-xs font-semibold text-slate-800'>
                    {metricName === 'heartRate' ? 'heart rate' : metricName}
                  </p>
                  {lockChartHover ? (
                    <button onClick={() => setLockChartHover(false)}>
                      <LockIcon />
                    </button>
                  ) : (
                    <button onClick={() => setLockChartHover(true)}>
                      <UnlockIcon />
                    </button>
                  )}
                </div>

                <XYChart
                  captureEvents={true}
                  width={parent.width}
                  height={parent.height}
                  margin={{ top: 10, bottom: 15, left: 30, right: 0 }}
                  xScale={{
                    type: 'linear',
                    domain: xDomain,
                    zero: false,
                  }}
                  yScale={{
                    type: 'linear',
                    domain: yDomain,
                    zero: false,
                  }}
                  onPointerMove={handleOnPointerMove}
                >
                  <AnimatedAxis orientation='left' numTicks={4} />

                  <AnimatedAreaSeries
                    dataKey='area'
                    data={metricData}
                    {...accessors}
                    fillOpacity={0.6}
                    fill={currentFillColor}
                    lineProps={{
                      stroke: 'slate',
                      strokeWidth: 1.5,
                    }}
                  />

                  <AnimatedAnnotation
                    dataKey='area'
                    datum={metricData[currentFrame]}
                  >
                    <AnnotationCircleSubject
                      className=''
                      radius={3}
                      stroke='black'
                    />
                    <AnnotationLineSubject stroke='gray' strokeWidth={0.5} />
                  </AnimatedAnnotation>
                </XYChart>
              </div>
            );
          }}
        </ParentSize>
      </div>
    </div>
  );
}
