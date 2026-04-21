import { useApi } from './useApi';
import * as getChart from '../api/dashboardApiBrand';
import { useDashboardFilters } from '../context/DashboardFilterContext';

const createChartHook = (apiFn) => () => {
  const { appliedFilters } = useDashboardFilters();
  return useApi(apiFn, [appliedFilters]);
};

// ===== ADCODE =====
export const useAdcodeTableChartProgramReturnApi = () =>
  createChartHook(getChart.getAdcodeTableChartProgram)();

// ===== ALL TABLE =====
export const useAllTableChartBrandReturnApi = () =>
  createChartHook(getChart.getAllTableChartBrand)();

export const useAllTableChartCampaignReturnApi = () =>
  createChartHook(getChart.getAllTableChartCampaign)();

export const useAllTableChartDeviceReturnApi = () =>
  createChartHook(getChart.getAllTableChartDevice)();

export const useAllTableChartPlatformReturnApi = () =>
  createChartHook(getChart.getAllTableChartPlatform)();

export const useAllTableChartTopProgramReturnApi = () =>
  createChartHook(getChart.getAllTableChartTopProgram)();

// ===== GRP =====
export const useGrpBarChartBrandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrand)();

// ===== PERCENT =====
export const usePercentBartChartPlatformViewReturnApi = () =>
  createChartHook(getChart.getPercentBartChartPlatformView)();

// ===== REACH =====
export const useReachBarChartChannelReturnApi = () =>
  createChartHook(getChart.getReachBarChartChannel)();

export const useReachBarChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getReachBarChartFirstLevel)();

// ===== SOS =====
export const useSosPieChartBrandGroupReturnApi = () =>
  createChartHook(getChart.getSosPieChartBrandGroup)();

export const useSosPieChartBrandProductReturnApi = () =>
  createChartHook(getChart.getSosPieChartBrandProduct)();

// ===== SOV =====
export const useSovPieChartBrandGroupReturnApi = () =>
  createChartHook(getChart.getSovPieChartBrandGroup)();

export const useSovPieChartBrandProductReturnApi = () =>
  createChartHook(getChart.getSovPieChartBrandProduct)();

// ===== SPEND VND =====
export const useSpendVNDBarChartChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartChannel)();

export const useSpendVNDBarChartDateReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartDate)();

export const useSpendVNDBarChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartFirstLevel)();

export const useSpendVNDBarChartTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartTimeband)();

// ===== VIEW =====
export const useViewPieChartPlatformReturnApi = () =>
  createChartHook(getChart.getViewPieChartPlatform)();

export const useCountCampaignNumberChartReturnApi = () =>
  createChartHook(getChart.getCountCampaignNumberChart)();

export const useCountSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getCountSpotNumberChart)();

export const useDurationSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getDurationSpotNumberChart)();

export const useFrequencyNumberChartReturnApi = () =>
  createChartHook(getChart.getFrequencyNumberChart)();

export const useReachNumberChartReturnApi = () =>
  createChartHook(getChart.getReachNumberChart)();

export const useSpendVNDNumberChartReturnApi = () =>
  createChartHook(getChart.getSpendVNDNumberChart)();

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};

export const useFilterProgramReturnApi = () =>
  createChartHook(getChart.getFilterProgram)();

export const useFilterProductReturnApi = () =>
  createChartHook(getChart.getFilterProduct)();

export const useFilterGroupReturnApi = () =>
  createChartHook(getChart.getFilterGroup)();

export const useFilterCampaignReturnApi = () =>
  createChartHook(getChart.getFilterCampaign)();

export const useFilterBrandReturnApi = () =>
  createChartHook(getChart.getFilterBrand)();

export const useFilterAdvertiserReturnApi = () =>
  createChartHook(getChart.getFilterAdvertiser)();

export const useFilterAdcodeReturnApi = () => {
  return useApi(getChart.getFilterAdcode);
};