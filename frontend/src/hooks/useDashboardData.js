import { useEffect, useRef } from 'react';
import * as useCallApi from './useCallApi';

const HOOKS = [
  { hook: useCallApi.useRatingNumberChartReturnApi, dataKey: 'ratingNumberData' },
  { hook: useCallApi.useAveReachNumberChartReturnApi, dataKey: 'aveReachNumberData' },
  { hook: useCallApi.useRatingPercentNumberChartReturnApi, dataKey: 'ratingPercentNumberData' },
  { hook: useCallApi.useAveReachPercentNumberChartReturnApi, dataKey: 'aveReachPercentNumberData' },
  { hook: useCallApi.useRatingBarChartChannelEventReturnApi, dataKey: 'ratingBarChannelEventData' },
  { hook: useCallApi.useAveReachBarChartChannelEventReturnApi, dataKey: 'aveReachBarChannelEventData' },
  { hook: useCallApi.useRatingBarChartDayEventReturnApi, dataKey: 'ratingBarDayEventData' },
  { hook: useCallApi.useAveReachBarChartDayEventReturnApi, dataKey: 'aveReachBarDayEventData' },
  { hook: useCallApi.useRatingPercentLineChartTimebandChannelReturnApi, dataKey: 'ratingPercentLineTimebandChannelData' },
  { hook: useCallApi.useRatingReachPercentMixedChartTimebandReturnApi, dataKey: 'ratingReachPercentMixedTimebandData' }
];

export const useDashboardData = () => {
  const hookResults = HOOKS.map(({ hook }) => hook());
  const hasLoggedRef = useRef(false);
  
  const data = {};
  const isLoading = hookResults.some(result => result.loading);
  const hasError = hookResults.find(result => result.error)?.error;

  HOOKS.forEach(({ dataKey }, index) => {
    data[dataKey] = hookResults[index].data;
  });

  const allDataLoaded = Object.values(data).every(value => value != null);

  useEffect(() => {
    if (!hasLoggedRef.current && allDataLoaded && !isLoading) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      hasLoggedRef.current = true;
    }
  }, [allDataLoaded, isLoading]);

  return {
    ...data,
    isLoading,
    hasError
  };
};