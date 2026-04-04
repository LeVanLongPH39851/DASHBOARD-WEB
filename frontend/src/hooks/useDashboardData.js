import { useEffect, useRef } from 'react';
import * as useCallApi from './useCallApi';

const HOOKS = [
  { hook: useCallApi.useRatingPercentTrendNumberReturnApi, dataKey: 'ratingPercentTrendNumberData' },
  { hook: useCallApi.useRatingNumberChartReturnApi, dataKey: 'ratingNumberData' },
  { hook: useCallApi.useAveReachNumberChartReturnApi, dataKey: 'aveReachNumberData' },
  { hook: useCallApi.useRatingPercentNumberChartReturnApi, dataKey: 'ratingPercentNumberData' },
  { hook: useCallApi.useAveReachPercentNumberChartReturnApi, dataKey: 'aveReachPercentNumberData' },
  { hook: useCallApi.useRatingBarChartChannelEventReturnApi, dataKey: 'ratingBarChannelEventData' },
  { hook: useCallApi.useAveReachBarChartChannelEventReturnApi, dataKey: 'aveReachBarChannelEventData' },
  { hook: useCallApi.useRatingBarChartDayEventReturnApi, dataKey: 'ratingBarDayEventData' },
  { hook: useCallApi.useAveReachBarChartDayEventReturnApi, dataKey: 'aveReachBarDayEventData' },
  { hook: useCallApi.useAllTableChartChannelReturnApi, dataKey: 'allTableChannelData' },
  { hook: useCallApi.useAllTableChartChannelEventReturnApi, dataKey: 'allTableChannelEventData' },
  { hook: useCallApi.useRatingReachPercentTableChartRegionalReturnApi, dataKey: 'ratingReachPercentTableRegionalData' },
  { hook: useCallApi.useRatingReachPercentTableChartProvinceReturnApi, dataKey: 'ratingReachPercentTableProvinceData' },
  { hook: useCallApi.useRatingBarChartRegionalReturnApi, dataKey: 'ratingBarRegionalData' },
  { hook: useCallApi.useRatingBarChartKeyCityReturnApi, dataKey: 'ratingBarKeyCityData' },
  { hook: useCallApi.useRatingBarChartProvinceReturnApi, dataKey: 'ratingBarProvinceData' },
  { hook: useCallApi.useRatingBarChartOthersReturnApi, dataKey: 'ratingBarOthersData' },
  { hook: useCallApi.useAveReachBarChartRegionalReturnApi, dataKey: 'aveReachBarRegionalData' },
  { hook: useCallApi.useAveReachBarChartKeyCityReturnApi, dataKey: 'aveReachBarKeyCityData' },
  { hook: useCallApi.useAveReachBarChartProvinceReturnApi, dataKey: 'aveReachBarProvinceData' },
  { hook: useCallApi.useAveReachBarChartOthersReturnApi, dataKey: 'aveReachBarOthersData' },
  { hook: useCallApi.useRatingReachMixedChartDateReturnApi, dataKey: 'ratingReachMixedDateData' },
  { hook: useCallApi.useRatingReachPercentMixedChartTimebandReturnApi, dataKey: 'ratingReachPercentMixedTimebandData' },
  { hook: useCallApi.useRatingPercentLineChartTimebandChannelReturnApi, dataKey: 'ratingPercentLineTimebandChannelData' },
  { hook: useCallApi.useAveReachPercentLineChartDateChannelReturnApi, dataKey: 'aveReachPercentLineDateChannelData' },
  { hook: useCallApi.useRatingPercentLineChartDateChannelReturnApi, dataKey: 'ratingPercentLineDateChannelData' },
  { hook: useCallApi.useAveReachPercentTreemapChartChannelReturnApi, dataKey: 'aveReachPercentTreemapChannelData' },
  { hook: useCallApi.useRatingReachMixedChartTimebandReturnApi, dataKey: 'ratingReachMixedTimebandData' },
  { hook: useCallApi.useRatingLineChartTimebandChannelReturnApi, dataKey: 'ratingLineTimebandChannelData' },
  { hook: useCallApi.useAveReachLineChartTimebandChannelReturnApi, dataKey: 'aveReachLineTimebandChannelData' },
  { hook: useCallApi.useRatingLineChartDateChannelReturnApi, dataKey: 'ratingLineDateChannelData' },
  { hook: useCallApi.useAveReachLineChartDateChannelReturnApi, dataKey: 'aveReachLineDateChannelData' },
  { hook: useCallApi.useRatingLineChartTimebandDayReturnApi, dataKey: 'ratingLineTimebandDayData' },
  { hook: useCallApi.useAveReachLineChartTimebandDayReturnApi, dataKey: 'aveReachLineTimebandDayData' },
  { hook: useCallApi.useAveReachLineChartTimebandRegionalReturnApi, dataKey: 'aveReachLineTimebandRegionalData' },
  { hook: useCallApi.useRatingTreemapChartChannelReturnApi, dataKey: 'ratingTreemapChannelData' },
  { hook: useCallApi.useTotalEventDurationPieChartFirstLevelReturnApi, dataKey: 'totalEventDurationPieFirstLevelData' },
  { hook: useCallApi.useTotalViewDurationPieChartFirstLevelReturnApi, dataKey: 'totalViewDurationPieFirstLevelData' },
  { hook: useCallApi.useAllTableChartRankReturnApi, dataKey: 'allTableRankData' },
  { hook: useCallApi.useAllTableChartDetailReturnApi, dataKey: 'allTableDetailData' },
  { hook: useCallApi.useAllTableChartEventReturnApi, dataKey: 'allTableEventData' },
  { hook: useCallApi.useRatingLineChartMinuteChannelReturnApi, dataKey: 'ratingLineMinuteChannelData' },
  { hook: useCallApi.useRatingLineChartMinuteChannelOneDateReturnApi, dataKey: 'ratingLineMinuteChannelOneDateData' },
  { hook: useCallApi.useRatingLineChartMinuteChannelDatesReturnApi, dataKey: 'ratingLineMinuteChannelDatesData' },
  { hook: useCallApi.useFilterProvinceReturnApi, dataKey: 'filterProvinceData' },
  { hook: useCallApi.useFilterProgramReturnApi, dataKey: 'filterProgramData' }
];

export const useDashboardData = () => {
  const hookResults = HOOKS.map(({ hook }) => hook());
  const hasLoggedRef = useRef(false);
  
  const data = {};
  const isLoading = {};
  const hasError = {};

  HOOKS.forEach(({ dataKey }, index) => {
    data[dataKey] = hookResults[index].data;
    isLoading[dataKey] = hookResults[index].loading;
    hasError[dataKey] = hookResults[index].error;
  });

  const anyLoading = Object.values(isLoading).some(Boolean);
  const allDataLoaded = Object.values(data).every(value => value != null);

  useEffect(() => {
    if (!hasLoggedRef.current && allDataLoaded && !anyLoading) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      hasLoggedRef.current = true;
    }
  }, [allDataLoaded, anyLoading]);

  return {
    ...data,
    isLoading,
    hasError
  };
};