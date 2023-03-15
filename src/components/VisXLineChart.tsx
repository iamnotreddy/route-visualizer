import {
  AnimatedAreaSeries,
  AnimatedLineSeries,
  Annotation,
  AnnotationCircleSubject,
  AnnotationConnector,
  AnnotationLabel,
  EventHandlerParams,
  XYChart,
} from '@visx/xychart';
import React, { useEffect, useState } from 'react';

import ChooseMetricBar from '@/components/ChooseMetricBar';

import { convertPaceValueForDisplay, generatePace } from '@/api/chartHelpers';
import { calculateDomain, transformMetricToDataPoint } from '@/api/helpers';
import { DataPoint, StravaRouteStream } from '@/api/types';

type ChartProps = {
  metrics: StravaRouteStream;
  currentFrame: number;
  setCurrentFrame: (newValue: number) => void;
};

export default function VisXLineChart({
  metrics,
  currentFrame,
  setCurrentFrame,
}: ChartProps) {
  // Define the dimensions and margins of the chart
  const width = 1100;

  const accessors = {
    xAccessor: (d: DataPoint) => (d ? d.x : 0),
    yAccessor: (d: DataPoint) => (d ? d.y : 0),
  };

  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();

  const [areaSeriesMetric, setAreaSeriesMetric] = useState('pace');

  useEffect(() => {
    const paceArray = generatePace(
      transformMetricToDataPoint(metrics.time),
      transformMetricToDataPoint(metrics.distance)
    );

    if (areaSeriesMetric == 'heartRate') {
      setAreaSeries(transformMetricToDataPoint(metrics.heartRate));
    } else if (areaSeriesMetric == 'elevation') {
      setAreaSeries(transformMetricToDataPoint(metrics.altitude));
    } else if (areaSeriesMetric == 'pace') {
      setAreaSeries(paceArray);
    } else if (areaSeriesMetric == 'grade') {
      setAreaSeries(transformMetricToDataPoint(metrics.grade_smooth));
    }
  }, [areaSeriesMetric, metrics]);

  const fillStyles = {
    heartRate: '#f9a8d4',
    pace: '#059669',
    elevation: '#d8b4fe',
    grade: '#f59e0b',
  };

  type FillStylesKeys = keyof typeof fillStyles;
  const currentFillColor = fillStyles[areaSeriesMetric as FillStylesKeys];

  return (
    <div className='flex flex-row items-center space-x-4'>
      <ChooseMetricBar
        setCurrentMetric={setAreaSeriesMetric}
        currentMetric={areaSeriesMetric}
      />
      {areaSeries && (
        <XYChart
          captureEvents={true}
          width={width}
          height={300}
          xScale={{
            type: 'linear',
            domain: [0, areaSeries.length - 1],
            zero: false,
            nice: true,
          }}
          yScale={{
            type: 'linear',
            domain: calculateDomain(areaSeries),
            zero: false,
            nice: true,
          }}
          onPointerMove={(e: EventHandlerParams<DataPoint>) =>
            setCurrentFrame(e.datum.x)
          }
        >
          <AnimatedAreaSeries
            dataKey='area'
            data={areaSeries}
            {...accessors}
            fillOpacity={0.6}
            fill={currentFillColor}
          />
          <AnimatedLineSeries
            dataKey='area'
            data={areaSeries}
            {...accessors}
            stroke='#334155'
          />
          <Annotation
            dataKey='area'
            datum={areaSeries[currentFrame]}
            {...accessors}
            dx={50}
            dy={-50}
          >
            <AnnotationLabel
              title={areaSeriesMetric}
              subtitle={
                areaSeriesMetric == 'pace'
                  ? convertPaceValueForDisplay(areaSeries[currentFrame].y)
                  : areaSeries[currentFrame].y.toString()
              }
              subtitleFontWeight={2}
              showAnchorLine={false}
              backgroundFill='rgba(0,150,150,0.1)'
              backgroundPadding={10}
            />
            <AnnotationCircleSubject radius={4} stroke='green' />
            <AnnotationConnector />
          </Annotation>
        </XYChart>
      )}
    </div>
  );
}
