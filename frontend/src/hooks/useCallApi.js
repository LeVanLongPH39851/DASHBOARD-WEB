import { useApi } from './useApi';
import * as getChart from '../api/dashboardApi';

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

export const useRatingPercentLineChartTimebandChannelReturnApi = () => {
  return useApi(getChart.getRatingPercentLineChartTimebandChannel);
};

export const useRatingReachPercentMixedChartTimebandReturnApi = () => {
  return useApi(getChart.getRatingReachPercentMixedChartTimeband);
};