import { VictoryChart, VictoryLine, VictoryScatter } from 'victory';

const transformArray = (input: number[]) => {
  return input.map((pt, idx) => ({
    x: idx,
    y: pt,
  }));
};

type RouteMetricChartProps = {
  metricArray: number[];
  // currentFrame: number;
};

export default function RouteMetricChart({
  metricArray,
}: // currentFrame,
RouteMetricChartProps) {
  // const displayFrame = currentFrame < 0 ? 1 : currentFrame;
  return (
    <div>
      {metricArray && (
        <VictoryChart width={300} height={200}>
          <VictoryLine
            data={transformArray(metricArray)}
            style={{
              data: { stroke: '#005083', strokeWidth: '2' },
            }}
          />
          <VictoryScatter
            data={[transformArray(metricArray)[2]]}
            style={{
              data: { fill: '#ffb14e', stroke: 'black', strokeWidth: '1' },
            }}
          />
        </VictoryChart>
      )}
    </div>
  );
}
