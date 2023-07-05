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
import React, { useContext, useEffect, useState } from 'react';

import ChooseMetricBar from '@/components/archived/ChooseMetricBar';
import { ActivityContext } from '@/components/globalMap';

import {
  convertPaceValueForDisplay,
  generatePace,
} from '@/helpers/chartHelpers';
import { calculateDomain, transformMetricToDataPoint } from '@/helpers/helpers';
import { DataPoint } from '@/helpers/types';

export default function MetricChart() {
  // Define the dimensions and margins of the chart

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

  const [areaSeriesMetric, setAreaSeriesMetric] = useState('');
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
      <div className='flex flex-row rounded-xl border-2 border-slate-400 p-2'>
        <div className='border-4 border-blue-400'>
          <ChooseMetricBar
            setCurrentMetric={setAreaSeriesMetric}
            currentMetric={areaSeriesMetric}
            orientation='vertical'
          />
        </div>
        <div className='border-4 border-orange-400'>
          <ParentSize>
            {(parent) => {
              return (
                <div>
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
                            ? convertPaceValueForDisplay(
                                areaSeries[currentFrame].y
                              )
                            : areaSeries[currentFrame].y.toString()
                        }
                        subtitleFontWeight={2}
                        showAnchorLine={false}
                        backgroundFill='rgba(0,150,150,0.1)'
                      />
                      <AnnotationCircleSubject radius={4} stroke='green' />
                      <AnnotationConnector />
                    </Annotation>
                  </XYChart>
                </div>
              );
            }}
          </ParentSize>
        </div>
      </div>
    );
  }

  return <div>hello.</div>;
}
