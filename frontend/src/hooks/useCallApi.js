import { useApi } from './useApi';
import * as getChart from '../api/dashboardApi';

export const useRatingPercentTrendNumberReturnApi = () => {
  return useApi(getChart.getRatingPercentTrendNumberChart);
};

export const useRatingNumberChartReturnApi = () => {
  return useApi(getChart.getRatingNumberChart);
};

export const useAveReachNumberChartReturnApi = () => {
  return useApi(getChart.getAveReachNumberChart);
};

export const useRatingPercentNumberChartReturnApi = () => {
  return useApi(getChart.getRatingPercentNumberChart);
};

export const useAveReachPercentNumberChartReturnApi = () => {
  return useApi(getChart.getAveReachPercentNumberChart);
};

export const useRatingBarChartChannelEventReturnApi = () => {
  return useApi(getChart.getRatingBarChartChannelEvent);
};

export const useAveReachBarChartChannelEventReturnApi = () => {
  return useApi(getChart.getAveReachBarChartChannelEvent);
};

export const useRatingBarChartDayEventReturnApi = () => {
  return useApi(getChart.getRatingBarChartDayEvent);
};

export const useAveReachBarChartDayEventReturnApi = () => {
  return useApi(getChart.getAveReachBarChartDayEvent);
};

export const useAllTableChartChannelReturnApi = () => {
  return useApi(getChart.getAllTableChartChannel);
};

export const useAllTableChartChannelEventReturnApi = () => {
  return useApi(getChart.getAllTableChartChannelEvent);
};

export const useRatingReachPercentTableChartRegionalReturnApi = () => {
  return useApi(getChart.getRatingReachPercentTableChartRegional);
};

export const useRatingReachPercentTableChartProvinceReturnApi = () => {
  return useApi(getChart.getRatingReachPercentTableChartProvince);
};

export const useRatingBarChartRegionalReturnApi = () => {
  return useApi(getChart.getRatingBarChartRegional);
};

export const useRatingBarChartKeyCityReturnApi = () => {
  return useApi(getChart.getRatingBarChartKeyCity);
};

export const useRatingBarChartProvinceReturnApi = () => {
  return useApi(getChart.getRatingBarChartProvince);
};

export const useRatingBarChartOthersReturnApi = () => {
  return useApi(getChart.getRatingBarChartOthers);
};

export const useAveReachBarChartRegionalReturnApi = () => {
  return useApi(getChart.getAveReachBarChartRegional);
};

export const useAveReachBarChartKeyCityReturnApi = () => {
  return useApi(getChart.getAveReachBarChartKeyCity);
};

export const useAveReachBarChartProvinceReturnApi = () => {
  return useApi(getChart.getAveReachBarChartProvince);
};

export const useAveReachBarChartOthersReturnApi = () => {
  return useApi(getChart.getAveReachBarChartOthers);
};

export const useRatingReachMixedChartDateReturnApi = () => {
  return useApi(getChart.getRatingReachMixedChartDate);
};

export const useRatingPercentLineChartTimebandChannelReturnApi = () => {
  return useApi(getChart.getRatingPercentLineChartTimebandChannel);
};

export const useRatingReachPercentMixedChartTimebandReturnApi = () => {
  return useApi(getChart.getRatingReachPercentMixedChartTimeband);
};