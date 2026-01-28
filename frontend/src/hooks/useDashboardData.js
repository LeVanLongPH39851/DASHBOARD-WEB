import { useEffect, useRef } from 'react';
import { useRatingNumberChartReturnApi } from './results/useRatingNumberChartReturnApi';
import { useAveReachNumberChartReturnApi } from './results/useAveReachNumberChartReturnApi';
import { useRatingPercentNumberChartReturnApi } from './results/useRatingPercentNumberChartReturnApi';
import { useAveReachPercentNumberChartReturnApi } from './results/useAveReachPercentNumberChartReturnApi';
import { useRatingBarChartChannelEventReturnApi } from './results/useRatingBarChartChannelEventReturnApi';
import { useRatingReachPercentLineChartReturnApi } from './results/useRatingReachPercentLineChartReturnApi';
import { useRatingReachPercentMixedChartTimebandReturnApi } from './results/useRatingReachPercentMixedChartTimebandReturnApi';

const HOOKS = [
  { hook: useRatingNumberChartReturnApi, dataKey: 'ratingNumberData' },
  { hook: useAveReachNumberChartReturnApi, dataKey: 'aveReachNumberData' },
  { hook: useRatingPercentNumberChartReturnApi, dataKey: 'ratingPercentNumberData' },
  { hook: useAveReachPercentNumberChartReturnApi, dataKey: 'aveReachPercentNumberData' },
  { hook: useRatingBarChartChannelEventReturnApi, dataKey: 'ratingBarChannelEventData' },
  { hook: useRatingReachPercentLineChartReturnApi, dataKey: 'ratingReachPercentLineData' },
  { hook: useRatingReachPercentMixedChartTimebandReturnApi, dataKey: 'ratingReachPercentMixedTimebandData' }
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