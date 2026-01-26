import { useRatingNumberChartReturnApi } from './results/useRatingNumberChartReturnApi';
import { useAveReachNumberChartReturnApi } from './results/useAveReachNumberChartReturnApi';
import { useRatingPercentNumberChartReturnApi } from './results/useRatingPercentNumberChartReturnApi';
import { useAveReachPercentNumberChartReturnApi } from './results/useAveReachPercentNumberChartReturnApi';
import { useRatingBarChartChannelEventReturnApi } from './results/useRatingBarChartChannelEventReturnApi';

const HOOKS = [
  { hook: useRatingNumberChartReturnApi, dataKey: 'ratingNumberData' },
  { hook: useAveReachNumberChartReturnApi, dataKey: 'aveReachNumberData' },
  { hook: useRatingPercentNumberChartReturnApi, dataKey: 'ratingPercentNumberData' },
  { hook: useAveReachPercentNumberChartReturnApi, dataKey: 'aveReachPercentNumberData' },
  { hook: useRatingBarChartChannelEventReturnApi, dataKey: 'ratingBarChartChannelEventData' }
];

export const useDashboardData = () => {
  const hookResults = HOOKS.map(({ hook }) => hook());
  
  const data = {};
  const isLoading = hookResults.some(result => result.loading);
  const hasError = hookResults.find(result => result.error)?.error;

  HOOKS.forEach(({ dataKey }, index) => {
    data[dataKey] = hookResults[index].data;
  });

  return {
    ...data,
    isLoading,
    hasError
  };
};