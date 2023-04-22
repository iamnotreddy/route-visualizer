import { ParentSize } from '@visx/responsive';
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
import React from 'react';

import { convertPaceValueForDisplay } from '@/api/chartHelpers';
import { calculateDomain } from '@/api/helpers';
import { DataPoint } from '@/api/types';

type ChartProps = {
  currentFrame: number;
  setCurrentFrame: (newValue: number) => void;
  areaSeriesMetric: string;
  areaSeries: DataPoint[];
};

export default function VisXLineChart({
  currentFrame,
  setCurrentFrame,
  areaSeriesMetric,
  areaSeries,
}: ChartProps) {
  // Define the dimensions and margins of the chart

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
  const currentFillColor = fillStyles[areaSeriesMetric as FillStylesKeys];

  return (
    <ParentSize>
      {(parent) =>
        areaSeries && (
          <div style={{ width: '100%', height: '20vh' }}>
            <XYChart
              captureEvents={true}
              width={parent.width}
              height={parent.height}
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
              <AnimatedAxis orientation='left' numTicks={3} />
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
          </div>
        )
      }
    </ParentSize>
  );
}
