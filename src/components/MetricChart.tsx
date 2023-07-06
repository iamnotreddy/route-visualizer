import { ParentSize } from '@visx/responsive';
import {
  AnimatedAnnotation,
  AnimatedAreaSeries,
  AnimatedAxis,
  AnnotationCircleSubject,
  EventHandlerParams,
  XYChart,
} from '@visx/xychart';
import React, { useContext, useEffect, useState } from 'react';

import { ActivityContext } from '@/components/GlobalMap';

import { generatePace } from '@/helpers/chartHelpers';
import { calculateDomain, transformMetricToDataPoint } from '@/helpers/helpers';
import { DataPoint } from '@/helpers/types';

export default function MetricChart(props: { areaSeriesMetric: string }) {
  const { areaSeriesMetric } = props;

  const { currentFrame, setCurrentFrame, stravaPath } =
    useContext(ActivityContext);

  const accessors = {
    xAccessor: (d: DataPoint) => (d ? d.x : 0),
    yAccessor: (d: DataPoint) => (d ? d.y : 0),
  };

  const fillStyles = {
    heartRate: '#f9a8d4',
    pace: '#059669',
    elevation: '#d8b4fe',
    grade: '#f59e0b',
  };

  type FillStylesKeys = keyof typeof fillStyles;

  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();

  const currentFillColor = fillStyles[areaSeriesMetric as FillStylesKeys];

  useEffect(() => {
    if (stravaPath) {
      const paceArray = generatePace(
        transformMetricToDataPoint(stravaPath.time),
        transformMetricToDataPoint(stravaPath.distance)
      );

      if (areaSeriesMetric == 'heartRate') {
        setAreaSeries(transformMetricToDataPoint(stravaPath.heartRate));
      } else if (areaSeriesMetric == 'pace') {
        setAreaSeries(paceArray);
      } else if (areaSeriesMetric == 'grade') {
        setAreaSeries(transformMetricToDataPoint(stravaPath.grade_smooth));
      } else {
        setAreaSeries(transformMetricToDataPoint(stravaPath.altitude));
      }
    }
  }, [areaSeriesMetric, stravaPath]);

  if (areaSeries) {
    return (
      <div className='flex flex-col space-y-2 rounded-xl border-2 border-slate-400 p-2'>
        {areaSeries[0] ? (
          <div style={{ width: '25vw', height: '15vh' }}>
            <ParentSize>
              {(parent) => {
                return (
                  <div>
                    <p className='text-center text-xs font-semibold text-slate-800'>
                      {areaSeriesMetric}
                    </p>
                    <XYChart
                      captureEvents={true}
                      width={parent.width}
                      height={parent.height}
                      margin={{ top: 10, bottom: 15, left: 30, right: 0 }}
                      xScale={{
                        type: 'linear',
                        domain: [0, areaSeries.length - 1],
                        zero: false,
                      }}
                      yScale={{
                        type: 'linear',
                        domain: calculateDomain(areaSeries),
                        zero: false,
                      }}
                      onPointerMove={(e: EventHandlerParams<DataPoint>) =>
                        setCurrentFrame(e.datum.x)
                      }
                    >
                      <AnimatedAxis orientation='left' numTicks={4} />

                      <AnimatedAreaSeries
                        dataKey='area'
                        data={areaSeries}
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
                        datum={areaSeries[currentFrame]}
                      >
                        <AnnotationCircleSubject
                          className=''
                          radius={3}
                          stroke='black'
                        />
                      </AnimatedAnnotation>
                    </XYChart>
                  </div>
                );
              }}
            </ParentSize>
          </div>
        ) : (
          <div className='flex items-center justify-center text-xs'>{`no ${areaSeriesMetric} data recorded`}</div>
        )}
      </div>
    );
  }

  return <div></div>;
}
