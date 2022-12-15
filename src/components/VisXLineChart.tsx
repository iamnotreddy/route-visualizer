import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  AnimatedLineSeries,
  EventHandlerParams,
  Tooltip,
  TooltipProvider,
  XYChart,
} from '@visx/xychart';
import React from 'react';

type ChartProps = {
  metricArray: number[];
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
  metricArray,
  // eslint-disable-next-line unused-imports/no-unused-vars
  currentFrame,
  setCurrentFrame,
}: ChartProps) {
  const data = transformArray(metricArray);

  // Define the dimensions and margins of the chart

  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const accessors = {
    xAccessor: (d: DataPoint) => d.x,
    yAccessor: (d: DataPoint) => d.y,
  };

  return (
    <div>
      <TooltipProvider>
        <XYChart
          captureEvents={true}
          width={width}
          height={height}
          margin={margin}
          xScale={{
            type: 'linear',
            domain: [0, 500],
            range: [0, width],
            round: true,
          }}
          yScale={{ type: 'linear', domain: [0, 200], range: [height, 50] }}
          onPointerMove={(e: EventHandlerParams<object>) => {
            let frame = 0;
            if ('x' in e.datum) {
              if (typeof e.datum.x == 'number') {
                frame = e.datum.x;
                setCurrentFrame(frame);
              }
            }
          }}
        >
          <AnimatedAxis orientation='bottom' />
          <AnimatedGrid columns={false} numTicks={2} />
          <AnimatedLineSeries
            dataKey='Heart Rate'
            data={data}
            {...accessors}
            enableEvents
          />
          {/* <GlyphSeries data={data[]}></GlyphSeries> */}
          {/* <AnimatedAnnotation datum={data[currentFrame]}>
            <AnnotationLabel
              title='Title'
              subtitle='Subtitle deets'
              showAnchorLine={false}
              backgroundFill='rgba(0,150,150,0.1)'
            />
          </AnimatedAnnotation> */}

          <Tooltip
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            showSeriesGlyphs
            renderTooltip={({ tooltipData }) => {
              if (tooltipData?.nearestDatum) {
                return (
                  <div>
                    <p style={{ color: 'navy' }}>
                      {tooltipData.nearestDatum.key}
                    </p>
                    <p>{JSON.stringify(tooltipData.nearestDatum.datum)}</p>
                  </div>
                );
              }
            }}
          />
        </XYChart>
      </TooltipProvider>
    </div>
  );
}
