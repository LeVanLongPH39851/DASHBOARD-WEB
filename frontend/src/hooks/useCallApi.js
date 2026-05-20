import { useApi } from './useApi';
import * as getChart from '../api/dashboardApi';
import { useDashboardFilters, useDashboardCrossFilters } from '../context/DashboardFilterContext';

const createChartHook = (apiFn, keyMain = '') => () => {
  const { appliedFilters } = useDashboardFilters();
  const { crossFilters } = useDashboardCrossFilters();

  const shouldSkip = crossFilters?.skipNext === keyMain || (crossFilters?.main && keyMain === crossFilters.main);

  return useApi(
    apiFn,
    [appliedFilters, crossFilters],
    { shouldSkip }
  );
};

export const useRatingPercentTrendNumberReturnApi = () =>
  createChartHook(getChart.getRatingPercentTrendNumberChart)()

export const useRatingNumberChartReturnApi = () =>
  createChartHook(getChart.getRatingNumberChart)()

export const useAveReachNumberChartReturnApi = () =>
  createChartHook(getChart.getAveReachNumberChart)()

export const useRatingPercentNumberChartReturnApi = () =>
  createChartHook(getChart.getRatingPercentNumberChart)()

export const useAveReachPercentNumberChartReturnApi = () =>
  createChartHook(getChart.getAveReachPercentNumberChart)()

export const useRatingBarChartChannelEventReturnApi = () =>
  createChartHook(getChart.getRatingBarChartChannelEvent, 'barChannelEventData')()

export const useAveReachBarChartChannelEventReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartChannelEvent, 'barChannelEventData')()

export const useRatingBarChartDayEventReturnApi = () =>
  createChartHook(getChart.getRatingBarChartDayEvent, 'barDayEventData')()

export const useAveReachBarChartDayEventReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartDayEvent, 'barDayEventData')()

export const useAllTableChartChannelReturnApi = () =>
  createChartHook(getChart.getAllTableChartChannel, 'allTableChannelData')()

export const useAllTableChartChannelEventReturnApi = () =>
  createChartHook(getChart.getAllTableChartChannelEvent, 'allTableChannelData')()

export const useRatingReachPercentTableChartRegionalReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentTableChartRegional, 'ratingReachPercentTableRegionalData')()

export const useRatingReachPercentTableChartProvinceReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentTableChartProvince, 'ratingReachPercentTableProvinceData')()

export const useRatingBarChartRegionalReturnApi = () =>
  createChartHook(getChart.getRatingBarChartRegional, 'ratingBarRegionalData')()

export const useRatingBarChartKeyCityReturnApi = () =>
  createChartHook(getChart.getRatingBarChartKeyCity, 'ratingBarKeyCityData')()

export const useRatingBarChartProvinceReturnApi = () =>
  createChartHook(getChart.getRatingBarChartProvince, 'ratingBarProvinceData')()

export const useRatingBarChartOthersReturnApi = () =>
  createChartHook(getChart.getRatingBarChartOthers)()

export const useAveReachBarChartRegionalReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartRegional, 'aveReachBarRegionalData')()

export const useAveReachBarChartKeyCityReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartKeyCity, 'aveReachBarKeyCityData')()

export const useAveReachBarChartProvinceReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartProvince, 'aveReachBarProvinceData')()

export const useAveReachBarChartOthersReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartOthers)()

export const useRatingReachMixedChartDateReturnApi = () =>
  createChartHook(getChart.getRatingReachMixedChartDate)()

export const useRatingReachPercentMixedChartTimebandReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentMixedChartTimeband)()

export const useRatingPercentLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getRatingPercentLineChartTimebandChannel, 'ratingPercentLineTimebandChannelData')()

export const useAveReachPercentLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getAveReachPercentLineChartDateChannel, 'aveReachPercentLineDateChannelData')()

export const useRatingPercentLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getRatingPercentLineChartDateChannel, 'ratingPercentLineDateChannelData')()

export const useAveReachPercentTreemapChartChannelReturnApi = () =>
  createChartHook(getChart.getAveReachPercentTreemapChartChannel, 'aveReachPercentTreemapChannelData')()

export const useRatingReachMixedChartTimebandReturnApi = () =>
  createChartHook(getChart.getRatingReachMixedChartTimeband)()

export const useRatingLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartTimebandChannel, 'ratingLineTimebandChannelData')()

export const useAveReachLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandChannel, 'aveReachLineTimebandChannelData')()

export const useRatingLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartDateChannel, 'ratingLineDateChannelData')()

export const useAveReachLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartDateChannel, 'aveReachLineDateChannelData')()

export const useRatingLineChartTimebandDayReturnApi = () =>
  createChartHook(getChart.getRatingLineChartTimebandDay)()

export const useAveReachLineChartTimebandDayReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandDay)()

export const useAveReachLineChartTimebandRegionalReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandRegional, 'aveReachLineTimebandRegionalData')()

export const useRatingTreemapChartChannelReturnApi = () =>
  createChartHook(getChart.getRatingTreemapChartChannel, 'ratingTreemapChannelData')()

export const useTotalEventDurationPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getTotalEventDurationPieChartFirstLevel, 'totalEventDurationPieFirstLevelData')()

export const useTotalViewDurationPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getTotalViewDurationPieChartFirstLevel, 'totalViewDurationPieFirstLevelData')()

export const useRatingReachTableChartRegionalReturnApi = () =>
  createChartHook(getChart.getRatingReachTableChartRegional, 'ratingReachTableData')()

export const useRatingReachTableChartKeyCityReturnApi = () =>
  createChartHook(getChart.getRatingReachTableChartKeyCity, 'ratingReachTableData')()

export const useRatingReachTableChartProvinceReturnApi = () =>
  createChartHook(getChart.getRatingReachTableChartProvince, 'ratingReachTableData')()

export const useRatingReachTableChartOthersReturnApi = () =>
  createChartHook(getChart.getRatingReachTableChartOthers, 'ratingReachTableData')()

export const useAllTableChartRankReturnApi = () =>
  createChartHook(getChart.getAllTableChartRank, 'allTableRankData')()

export const useAllTableChartDetailReturnApi = () =>
  createChartHook(getChart.getAllTableChartDetail, 'allTableDetailData')()

export const useAllTableChartEventReturnApi = () =>
  createChartHook(getChart.getAllTableChartEvent, 'allTableEventData')()

export const useRatingLineChartMinuteChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannel, 'ratingLineMinuteChannelData')()

export const useRatingLineChartMinuteChannelOneDateReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannelOneDate, 'ratingLineMinuteChannelOneDateData')()

export const useRatingLineChartMinuteChannelDatesReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannelDates)()

export const useMaxInsertReturnApi = () => {
  return useApi(getChart.getMaxInsert);
};

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};

export const useFilterProgramReturnApi = () =>
  createChartHook(getChart.getFilterProgram)()