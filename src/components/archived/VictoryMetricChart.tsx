import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
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
  currentFrame: number;
};

export default function RouteMetricChart({
  metricArray,
  currentFrame,
}: RouteMetricChartProps) {
  return (
    <div>
      {metricArray && (
        <VictoryChart width={300} height={200}>
          <VictoryAxis
            dependentAxis={true}
            style={{ axis: { stroke: 'none' } }}
          />
          <VictoryArea
            data={transformArray(metricArray)}
            style={{
              data: { fill: '#6aa68c', stroke: '#004225', strokeWidth: '3' },
            }}
          />

          <VictoryScatter
            data={[transformArray(metricArray)[currentFrame]]}
            size={5}
            style={{
              data: { fill: '#f6f3ee', stroke: 'black', strokeWidth: '2' },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 },
            }}
          />
        </VictoryChart>
      )}
    </div>
  );
}
