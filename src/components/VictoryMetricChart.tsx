import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';

const transformArray = (input: number[]) => {
  return input.map((pt, idx) => ({
    x: idx,
    y: pt,
  }));
};

type RouteMetricChartProps = {
  metricArray: number[];
  displayFrame: number;
};

export default function RouteMetricChart({
  metricArray,
  displayFrame,
}: RouteMetricChartProps) {
  return (
    <div>
      {metricArray && (
        <VictoryChart width={300} height={200}>
          <VictoryAxis
            dependentAxis={true}
            style={{ axis: { stroke: 'none' } }}
          />
          <VictoryLine
            data={transformArray(metricArray)}
            style={{
              data: { stroke: '#005083', strokeWidth: '3' },
            }}
          />
          <VictoryScatter
            data={[transformArray(metricArray)[displayFrame]]}
            size={5}
            style={{
              data: { fill: '#ffb14e', stroke: 'black', strokeWidth: '2' },
            }}
          />
        </VictoryChart>
      )}
    </div>
  );
}
