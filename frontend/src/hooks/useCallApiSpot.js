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

export const useAdcodeTableChartProductReturnApi = () =>
  createChartHook(getChart.getAdcodeTableChartProduct)();

export const useAdcodeTableChartProgramReturnApi = () =>
  createChartHook(getChart.getAdcodeTableChartProgram)();

export const useCountPieChartTimebandReturnApi = () =>
  createChartHook(getChart.getCountPieChartTimeband)();

export const useSpendVNDBarChartChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartChannel)();

export const useSpendVNDBarChartProgramReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartProgram)();

export const useSpendVNDBarChartTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartTimeband)();

export const useSpendVNDPivotTableChartChannelFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPivotTableChartChannelFirstLevel)();

export const useSpendVNDPivotTableChartChannelTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDPivotTableChartChannelTimeband)();

export const useSpendVNDTableChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDTableChartAdvertiser)();

// ===== ALL TABLE =====
export const useAllTableChartBrandReturnApi = () =>
  createChartHook(getChart.getAllTableChartBrand)();

export const useAllTableChartBrandProgramReturnApi = () =>
  createChartHook(getChart.getAllTableChartBrandProgram)();

export const useAllTableChartDeviceReturnApi = () =>
  createChartHook(getChart.getAllTableChartDevice)();

// ===== COUNT PIVOT =====
export const useCountPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getCountPivotTableChartCampaignWeek)();

// ===== GRP =====
export const useGrpBarChartWeekBrandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartWeekBrand)();

export const useGrpBarChartRegionalBrandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartRegionalBrand)();

export const useGrpPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getGrpPivotTableChartCampaignWeek)();

// ===== REACH =====
export const useReachPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getReachPivotTableChartCampaignWeek)();

export const useReachTableChartCampaignBrandReturnApi = () =>
  createChartHook(getChart.getReachTableChartCampaignBrand)();

// ===== SPEND VND (BRAND) =====
export const useSpendVNDBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandChannel)();

export const useSpendVNDBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandFirstLevel)();

export const useSpendVNDBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandTimeband)();

// ===== SPEND VND PIE =====
export const useSpendVNDPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartAdvertiser)();

export const useGrpBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandChannel)();

export const useGrpBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandFirstLevel)();

export const useGrpBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandTimeband)();

export const useGrpPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getGrpPieChartAdvertiser)();

export const useReachBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandChannel)();

export const useReachBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandFirstLevel)();

export const useReachBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandTimeband)();

export const useReachPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getReachPieChartAdvertiser)();

export const useAllTableChartMonitoringReturnApi = () =>
  createChartHook(getChart.getAllTableChartMonitoring)();

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};