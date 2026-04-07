import { useApi } from './useApi';
import * as getChart from '../api/dashboardApi';
import { useDashboardFilters } from '../context/DashboardFilterContext';

const createChartHook = (apiFn) => () => {
  const { appliedFilters } = useDashboardFilters();
  return useApi(apiFn, [appliedFilters]);
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
  createChartHook(getChart.getRatingBarChartChannelEvent)()

export const useAveReachBarChartChannelEventReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartChannelEvent)()

export const useRatingBarChartDayEventReturnApi = () =>
  createChartHook(getChart.getRatingBarChartDayEvent)()

export const useAveReachBarChartDayEventReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartDayEvent)()

export const useAllTableChartChannelReturnApi = () =>
  createChartHook(getChart.getAllTableChartChannel)()

export const useAllTableChartChannelEventReturnApi = () =>
  createChartHook(getChart.getAllTableChartChannelEvent)()

export const useRatingReachPercentTableChartRegionalReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentTableChartRegional)()

export const useRatingReachPercentTableChartProvinceReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentTableChartProvince)()

export const useRatingBarChartRegionalReturnApi = () =>
  createChartHook(getChart.getRatingBarChartRegional)()

export const useRatingBarChartKeyCityReturnApi = () =>
  createChartHook(getChart.getRatingBarChartKeyCity)()

export const useRatingBarChartProvinceReturnApi = () =>
  createChartHook(getChart.getRatingBarChartProvince)()

export const useRatingBarChartOthersReturnApi = () =>
  createChartHook(getChart.getRatingBarChartOthers)()

export const useAveReachBarChartRegionalReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartRegional)()

export const useAveReachBarChartKeyCityReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartKeyCity)()

export const useAveReachBarChartProvinceReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartProvince)()

export const useAveReachBarChartOthersReturnApi = () =>
  createChartHook(getChart.getAveReachBarChartOthers)()

export const useRatingReachMixedChartDateReturnApi = () =>
  createChartHook(getChart.getRatingReachMixedChartDate)()

export const useRatingReachPercentMixedChartTimebandReturnApi = () =>
  createChartHook(getChart.getRatingReachPercentMixedChartTimeband)()

export const useRatingPercentLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getRatingPercentLineChartTimebandChannel)()

export const useAveReachPercentLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getAveReachPercentLineChartDateChannel)()

export const useRatingPercentLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getRatingPercentLineChartDateChannel)()

export const useAveReachPercentTreemapChartChannelReturnApi = () =>
  createChartHook(getChart.getAveReachPercentTreemapChartChannel)()

export const useRatingReachMixedChartTimebandReturnApi = () =>
  createChartHook(getChart.getRatingReachMixedChartTimeband)()

export const useRatingLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartTimebandChannel)()

export const useAveReachLineChartTimebandChannelReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandChannel)()

export const useRatingLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartDateChannel)()

export const useAveReachLineChartDateChannelReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartDateChannel)()

export const useRatingLineChartTimebandDayReturnApi = () =>
  createChartHook(getChart.getRatingLineChartTimebandDay)()

export const useAveReachLineChartTimebandDayReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandDay)()

export const useAveReachLineChartTimebandRegionalReturnApi = () =>
  createChartHook(getChart.getAveReachLineChartTimebandRegional)()

export const useRatingTreemapChartChannelReturnApi = () =>
  createChartHook(getChart.getRatingTreemapChartChannel)()

export const useTotalEventDurationPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getTotalEventDurationPieChartFirstLevel)()

export const useTotalViewDurationPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getTotalViewDurationPieChartFirstLevel)()

export const useAllTableChartRankReturnApi = () =>
  createChartHook(getChart.getAllTableChartRank)()

export const useAllTableChartDetailReturnApi = () =>
  createChartHook(getChart.getAllTableChartDetail)()

export const useAllTableChartEventReturnApi = () =>
  createChartHook(getChart.getAllTableChartEvent)()

export const useRatingLineChartMinuteChannelReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannel)()

export const useRatingLineChartMinuteChannelOneDateReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannelOneDate)()

export const useRatingLineChartMinuteChannelDatesReturnApi = () =>
  createChartHook(getChart.getRatingLineChartMinuteChannelDates)()

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};

export const useFilterProgramReturnApi = () =>
  createChartHook(getChart.getFilterProgram)()