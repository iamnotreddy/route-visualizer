import { Dispatch, SetStateAction } from 'react';

import { Metrics } from '@/components/hooks/useChartMetric';

type ChooseMetricBarProps = {
  metricName: Metrics;
  setMetricName: Dispatch<SetStateAction<Metrics>>;
  orientation: 'horizontal' | 'vertical';
};

type Icon = {
  name: Metrics;
  displayName?: string;
  path: string;
  baseClass: string;
  selectedClass: string;
};

export default function ChooseMetricBar({
  metricName,
  setMetricName,
  orientation,
}: ChooseMetricBarProps) {
  const tailwindStyle =
    orientation == 'vertical'
      ? 'flex-col space-y-2'
      : 'flex-row justify-center space-x-2';

  const heroIconPaths: Icon[] = [
    {
      name: 'heartRate',
      displayName: 'heart rate',
      path: 'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z',
      baseClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-pink-300',
      selectedClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-pink-300 stroke-zinc-700 stroke-2 hover:scale-150',
    },

    {
      name: 'pace',
      path: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z',
      baseClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-emerald-600',
      selectedClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-emerald-600 stroke-zinc-700 stroke-2 hover:scale-150',
    },

    {
      name: 'elevation',
      path: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
      baseClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-purple-300',
      selectedClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-purple-300 stroke-zinc-700 stroke-2 hover:scale-150',
    },
    {
      name: 'grade',
      path: 'M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z',
      baseClass:
        'h-3 w-3 sm:h-5 sm:w-5  fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-amber-500',
      selectedClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-amber-500 stroke-zinc-700 stroke-2 hover:scale-150',
    },

    {
      name: 'cadence',
      path: 'M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z',
      baseClass:
        'h-3 w-3 sm:h-5 sm:w-5  fill-slate-300 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-amber-500',
      selectedClass:
        'h-3 w-3 sm:h-5 sm:w-5 fill-amber-500 stroke-zinc-700 stroke-2 hover:scale-150',
    },
  ];

  const iconOptions = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className:
      'h-5 w-5 fill-amber-400 stroke-zinc-700 stroke-2 hover:scale-150 hover:fill-pink-600',
  };

  const returnIconStyle = (icon: Icon) => {
    if (icon.name === metricName) {
      return icon.selectedClass;
    }
    return icon.baseClass;
  };

  const handleMetricSelection = (name: Metrics) => {
    setMetricName(name);
  };

  return (
    <div className={`flex ${tailwindStyle}  `}>
      {heroIconPaths.map((icon) => {
        return (
          <button
            key={icon.path}
            onClick={() => handleMetricSelection(icon.name)}
          >
            <div>
              <svg
                xmlns={iconOptions.xmlns}
                viewBox={iconOptions.viewBox}
                className={returnIconStyle(icon)}
              >
                <path d={icon.path} />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
