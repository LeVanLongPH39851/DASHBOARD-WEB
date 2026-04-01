import { useApi } from './useApi';
import * as getChart from '../api/dashboardApiSpot';
import { useDashboardFilters } from '../context/DashboardFilterContext';

const createChartHook = (apiFn) => () => {
  const { appliedFilters } = useDashboardFilters();
  return useApi(apiFn, [appliedFilters]);
};

// ===== TOP 10 =====
export const useTop10AllTableChartProductReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartProduct)();

export const useTop10AllTableChartCampaignReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartCampaign)();

export const useTop10AllTableChartBrandReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartBrand)();

// ===== SPEND VND =====
export const useSpendVNDPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartFirstLevel)();

export const useSpendVNDPieChartChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartChannel)();

export const useSpendVNDNumberChartReturnApi = () =>
  createChartHook(getChart.getSpendVNDNumberChart)();

export const useSpendVNDBarChartDateReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartDate)();

export const useSpendVNDBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartAdvertiser)();

export const useSpendVNDBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartAdvertiserChannel)();

// ===== SPEND USD =====
export const useSpendUSDNumberChartReturnApi = () =>
  createChartHook(getChart.getSpendUSDNumberChart)();

export const useSpendUSDBarChartDateReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartDate)();

export const useSpendUSDBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartAdvertiser)();

export const useSpendUSDBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartAdvertiserChannel)();

// ===== GRP =====
export const useGRPPieChartChannelReturnApi = () =>
  createChartHook(getChart.getGRPPieChartChannel)();

// ===== DURATION SPOT =====
export const useDurationSpotPieChartLenghtReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartLenght)();

export const useDurationSpotPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartFirstLevel)();

export const useDurationSpotPieChartChannelReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartChannel)();

export const useDurationSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getDurationSpotNumberChart)();

// ===== COUNT SPOT =====
export const useCountSpotPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getCountSpotPieChartFirstLevel)();

export const useCountSpotPieChartChannelReturnApi = () =>
  createChartHook(getChart.getCountSpotPieChartChannel)();

export const useCountSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getCountSpotNumberChart)();

export const useCountSpotBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getCountSpotBarChartAdvertiser)();

export const useCountSpotBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getCountSpotBarChartAdvertiserChannel)();

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};