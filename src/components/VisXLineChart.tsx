import {
  Annotation,
  AnnotationCircleSubject,
  AnnotationConnector,
  AnnotationLabel,
  AreaSeries,
  EventHandlerParams,
  LineSeries,
  TooltipProvider,
  XYChart,
} from '@visx/xychart';
import React, { useEffect, useState } from 'react';

import ChooseMetricBar from '@/components/ChooseMetricBar';

import { StravaRouteStream } from '@/api/types';

type ChartProps = {
  metrics: StravaRouteStream;
  currentFrame: number;
  setCurrentFrame: (newValue: number) => void;
};

type DataPoint = {
  x: number;
  y: number;
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
  const width = 800;
  const height = 300;
  // const margin = { top: 40, right: 40, bottom: 40, left: 40 };

  const accessors = {
    xAccessor: (d: DataPoint) => d.x,
    yAccessor: (d: DataPoint) => d.y,
  };

  const [lineSeries, setLineSeries] = useState<DataPoint[]>();
  const [areaSeries, setAreaSeries] = useState<DataPoint[]>();

  const [lineSeriesMetric, setLineSeriesMetric] = useState('heartRate');
  const [areaSeriesMetric, setAreaSeriesMetric] = useState('altitude');

  // const lineSeries = transformArray(metrics.heartRate);
  // const areaSeries = transformArray(metrics.altitude);

  useEffect(() => {
    if (lineSeriesMetric == 'heartRate') {
      setLineSeries(transformArray(metrics.heartRate));
    } else if (lineSeriesMetric == 'distance') {
      setLineSeries(transformArray(metrics.distance));
    } else if (lineSeriesMetric == 'altitude') {
      setLineSeries(transformArray(metrics.altitude));
    } else if (lineSeriesMetric == 'velocity') {
      setLineSeries(transformArray(metrics.velocity_smooth));
    } else if (lineSeriesMetric == 'something') {
      setLineSeries(transformArray(metrics.time));
    }
  }, [lineSeriesMetric, metrics]);

  useEffect(() => {
    if (areaSeriesMetric == 'heartRate') {
      setAreaSeries(transformArray(metrics.heartRate));
    } else if (areaSeriesMetric == 'distance') {
      setAreaSeries(transformArray(metrics.distance));
    } else if (areaSeriesMetric == 'altitude') {
      setAreaSeries(transformArray(metrics.altitude));
    } else if (areaSeriesMetric == 'velocity') {
      setAreaSeries(transformArray(metrics.velocity_smooth));
    } else if (areaSeriesMetric == 'something') {
      setAreaSeries(transformArray(metrics.time));
    }
  }, [areaSeriesMetric, metrics]);

  return (
    <div className='flex flex-row items-center'>
      <ChooseMetricBar setCurrentMetric={setLineSeriesMetric} />
      {lineSeries && areaSeries && (
        <TooltipProvider>
          <XYChart
            captureEvents={true}
            width={width}
            height={height}
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
            <LineSeries dataKey='Heart Rate' data={lineSeries} {...accessors} />
            <AreaSeries
              dataKey='Grade'
              data={areaSeries}
              {...accessors}
              fillOpacity={0.4}
            />
            <Annotation
              dataKey='Heart Rate'
              datum={lineSeries[currentFrame]}
              {...accessors}
              dx={-10}
              dy={50}
            >
              <AnnotationLabel
                title={lineSeriesMetric}
                subtitle={lineSeries[currentFrame].y.toString()}
                subtitleFontWeight={2}
                showAnchorLine={false}
                backgroundFill='rgba(0,150,150,0.1)'
                backgroundPadding={10}
              />
              <AnnotationCircleSubject radius={4} stroke='green' />
              <AnnotationConnector />
            </Annotation>
            <Annotation
              dataKey='Grade'
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

            {/* <Tooltip<DataPoint>
            showSeriesGlyphs
            renderTooltip={({ tooltipData }) => {
              if (tooltipData?.nearestDatum && tooltipData.nearestDatum) {
                return (
                  <div>
                    <p style={{ color: 'black' }}>
                      {tooltipData.datumByKey['Grade'].datum.y}
                    </p>
                    <p>{tooltipData.nearestDatum.datum.y}</p>
                  </div>
                );
              }
            }}
          /> */}
          </XYChart>
        </TooltipProvider>
      )}
      <ChooseMetricBar setCurrentMetric={setAreaSeriesMetric} />
    </div>
  );
}
