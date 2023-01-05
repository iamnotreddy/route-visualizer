import { Group } from '@visx/group';
import {
  AnimatedAreaSeries,
  AnimatedAxis,
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
import { DataPoint, StravaRouteStream } from '@/api/types';

type ChartProps = {
  metrics: StravaRouteStream;
  currentFrame: number;
  setCurrentFrame: (newValue: number) => void;
};

const transformArray = (input: number[]): DataPoint[] => {
  return input.map((pt, idx) => ({
    x: idx,
    y: pt,
  }));
};

export default function VisXLineChart({
  metrics,
  // eslint-disable-next-line unused-imports/no-unused-vars
  currentFrame,
  setCurrentFrame,
}: ChartProps) {
  // Define the dimensions and margins of the chart
  const width = 1000;
  const height = 300;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const accessors = {
    xAccessor: (d: DataPoint) => d.x,
    yAccessor: (d: DataPoint) => d.y,
  };

  const [lineSeries, setLineSeries] = useState<DataPoint[]>();
  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();

  const [lineSeriesMetric, setLineSeriesMetric] = useState('heartRate');
  const [areaSeriesMetric, setAreaSeriesMetric] = useState('pace');

  useEffect(() => {
    const paceArray = generatePace(
      transformArray(metrics.time),
      transformArray(metrics.distance)
    );

    if (lineSeriesMetric == 'heartRate') {
      setLineSeries(transformArray(metrics.heartRate));
    } else if (lineSeriesMetric == 'distance') {
      setLineSeries(transformArray(metrics.distance));
    } else if (lineSeriesMetric == 'pace') {
      setLineSeries(paceArray);
    } else if (lineSeriesMetric == 'grade') {
      setLineSeries(transformArray(metrics.grade_smooth));
    }
  }, [lineSeriesMetric, metrics]);

  useEffect(() => {
    const paceArray = generatePace(
      transformArray(metrics.time),
      transformArray(metrics.distance)
    );

    if (areaSeriesMetric == 'heartRate') {
      setAreaSeries(transformArray(metrics.heartRate));
    } else if (areaSeriesMetric == 'distance') {
      setAreaSeries(transformArray(metrics.distance));
    } else if (areaSeriesMetric == 'pace') {
      setAreaSeries(paceArray);
    } else if (areaSeriesMetric == 'grade') {
      setAreaSeries(transformArray(metrics.grade_smooth));
    }
  }, [areaSeriesMetric, metrics]);

  return (
    <div className='flex flex-row items-center space-x-4'>
      <ChooseMetricBar setCurrentMetric={setLineSeriesMetric} />
      {lineSeries && areaSeries && (
        <XYChart
          captureEvents={true}
          width={width}
          height={height}
          margin={margin}
          xScale={{
            type: 'linear',
            domain: [0, lineSeries.length - 1],
          }}
          yScale={{
            type: 'linear',
            domain: [0, lineSeries[lineSeries.length - 1].y],
          }}
          onPointerMove={(e: EventHandlerParams<DataPoint>) =>
            setCurrentFrame(e.datum.x)
          }
        >
          <Group top={40} left={0}>
            <AnimatedLineSeries
              dataKey='line'
              data={lineSeries}
              {...accessors}
            />
            <AnimatedAxis tickFormat={(v) => `${v}%`} orientation='left' />
          </Group>
          <Group top={140} left={10}>
            <AnimatedAreaSeries
              dataKey='area'
              data={areaSeries}
              {...accessors}
              fillOpacity={0.4}
            />
            <AnimatedAxis tickFormat={(v) => `${v}%`} orientation='right' />
          </Group>
          <Annotation
            dataKey='line'
            datum={lineSeries[currentFrame]}
            {...accessors}
            dx={-10}
            dy={50}
          >
            <AnnotationLabel
              title={lineSeriesMetric}
              subtitle={
                lineSeriesMetric == 'pace'
                  ? convertPaceValueForDisplay(lineSeries[currentFrame].y)
                  : lineSeries[currentFrame].y.toString()
              }
              subtitleFontWeight={2}
              showAnchorLine={false}
              backgroundFill='rgba(0,150,150,0.1)'
              backgroundPadding={10}
            />
            <AnnotationCircleSubject radius={4} stroke='green' />
            <AnnotationConnector />
          </Annotation>
          <Annotation
            dataKey='area'
            datum={areaSeries[currentFrame]}
            {...accessors}
            dx={50}
            dy={20}
          >
            <AnnotationLabel
              title={areaSeriesMetric}
              subtitle={areaSeries[currentFrame].y.toString()}
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
      <ChooseMetricBar setCurrentMetric={setAreaSeriesMetric} />
    </div>
  );
}
