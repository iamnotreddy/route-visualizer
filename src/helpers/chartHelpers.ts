import { DataPoint } from '@/helpers/types';

export const generateMovingAverage = (
  series: DataPoint[],
  windowSize: number
): DataPoint[] => {
  const result = series.map((point, i) => {
    if (i > windowSize) {
      const windowSum = series
        .slice(i - 5, i)
        .map((y) => y.y)
        .reduce((x, y) => x + y, 0);

      const average = windowSum / windowSize;

      return {
        x: point.x,
        y: average,
      };
    } else {
      return {
        x: point.x,
        y: point.y,
      };
    }
  });

  return result;
};

export const generatePace = (
  timeStream: DataPoint[],
  distanceStream: DataPoint[]
): DataPoint[] => {
  const paceArray = timeStream.map((point, i) => {
    const minutes = point.y / 60;
    const miles = distanceStream[i].y * 0.00062137;
    const pace = minutes / miles;

    return {
      x: i,
      y: pace,
    };
  });
  return paceArray;
};

export const generatePacePoint = (time: number, distance: number) => {
  const minutes = time / 60;
  const miles = distance * 0.00062137;
  const pace = minutes / miles;

  return pace;
};

export const convertPaceValueForDisplay = (pace: number) => {
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - Math.floor(pace)) * 60);
  const paceDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return paceDisplay;
};

export const convertPaceToEntireArray = (paceStream: DataPoint[]) => {
  const conversion = paceStream.map((point) => {
    const minutes = Math.floor(point.y / 60);
    const seconds = Math.floor(point.y % 60);
    return {
      x: point.x,
      y: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    };
  });

  return conversion;
};

export const formatSecondsToPace = (seconds: number) => {
  const displayMinutes = Math.floor(seconds / 60);
  const displaySeconds = Math.floor(seconds % 60);
  const displayTime = `${displayMinutes}:${displaySeconds
    .toString()
    .padStart(2, '0')}`;

  return displayTime;
};
