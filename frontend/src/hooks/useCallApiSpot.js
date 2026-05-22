import { useApi } from './useApi';
import * as getChart from '../api/dashboardApiSpot';
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

// ===== TOP 10 =====
export const useTop10AllTableChartProductReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartProduct, 'top10ProductData')();

export const useTop10AllTableChartCampaignReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartCampaign, 'top10CampaignData')();

export const useTop10AllTableChartBrandReturnApi = () =>
  createChartHook(getChart.getTop10AllTableChartBrand, 'top10BrandData')();

// ===== SPEND VND =====
export const useSpendVNDPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartFirstLevel, 'pieFirstLevelData')();

export const useSpendVNDPieChartChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartChannel, 'pieChannelData')();

export const useSpendVNDNumberChartReturnApi = () =>
  createChartHook(getChart.getSpendVNDNumberChart)();

export const useSpendVNDBarChartDateReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartDate)();

export const useSpendVNDBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartAdvertiser, 'barAdvertiserData')();

export const useSpendVNDBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartAdvertiserChannel, 'barAdvertiserChannelData')();

// ===== SPEND USD =====
export const useSpendUSDNumberChartReturnApi = () =>
  createChartHook(getChart.getSpendUSDNumberChart)();

export const useSpendUSDBarChartDateReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartDate)();

export const useSpendUSDBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartAdvertiser, 'barAdvertiserData')();

export const useSpendUSDBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getSpendUSDBarChartAdvertiserChannel, 'barAdvertiserChannelData')();

// ===== GRP =====
export const useGRPPieChartChannelReturnApi = () =>
  createChartHook(getChart.getGRPPieChartChannel, 'pieChannelData')();

// ===== DURATION SPOT =====
export const useDurationSpotPieChartLenghtReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartLenght)();

export const useDurationSpotPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartFirstLevel, 'pieFirstLevelData')();

export const useDurationSpotPieChartChannelReturnApi = () =>
  createChartHook(getChart.getDurationSpotPieChartChannel, 'pieChannelData')();

export const useDurationSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getDurationSpotNumberChart)();

// ===== COUNT SPOT =====
export const useCountSpotPieChartFirstLevelReturnApi = () =>
  createChartHook(getChart.getCountSpotPieChartFirstLevel, 'pieFirstLevelData')();

export const useCountSpotPieChartChannelReturnApi = () =>
  createChartHook(getChart.getCountSpotPieChartChannel, 'pieChannelData')();

export const useCountSpotNumberChartReturnApi = () =>
  createChartHook(getChart.getCountSpotNumberChart)();

export const useCountSpotBarChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getCountSpotBarChartAdvertiser, 'barAdvertiserData')();

export const useCountSpotBarChartAdvertiserChannelReturnApi = () =>
  createChartHook(getChart.getCountSpotBarChartAdvertiserChannel, 'barAdvertiserChannelData')();

export const useAdcodeTableChartProductReturnApi = () =>
  createChartHook(getChart.getAdcodeTableChartProduct, 'adcodeProductData')();

export const useAdcodeTableChartProgramReturnApi = () =>
  createChartHook(getChart.getAdcodeTableChartProgram, 'adcodeProgramData')();

export const useCountPieChartTimebandReturnApi = () =>
  createChartHook(getChart.getCountPieChartTimeband)();

export const useSpendVNDBarChartChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartChannel, 'spendVNDBarChannelData')();

export const useSpendVNDBarChartProgramReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartProgram, 'spendVNDBarProgramData')();

export const useSpendVNDBarChartTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartTimeband, 'spendVNDBarTimebandData')();

export const useSpendVNDPivotTableChartChannelFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDPivotTableChartChannelFirstLevel, 'spendVNDPivotChannelFirstLevelData')();

export const useSpendVNDPivotTableChartChannelTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDPivotTableChartChannelTimeband, 'spendVNDPivotChannelTimebandData')();

export const useSpendVNDTableChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDTableChartAdvertiser, 'spendVNDTableAdvertiserData')();

// ===== COUNT PIVOT =====
export const useCountPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getCountPivotTableChartCampaignWeek, 'pivotCampaignWeekData')();

// ===== GRP =====
export const useGrpBarChartWeekBrandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartWeekBrand, 'grpBarWeekBrandData')();

export const useGrpBarChartRegionalBrandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartRegionalBrand, 'grpBarRegionalBrandData')();

export const useGrpPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getGrpPivotTableChartCampaignWeek, 'pivotCampaignWeekData')();

// ===== REACH =====
export const useReachPivotTableChartCampaignWeekReturnApi = () =>
  createChartHook(getChart.getReachPivotTableChartCampaignWeek, 'pivotCampaignWeekData')();

// export const useReachTableChartCampaignBrandReturnApi = () =>
//   createChartHook(getChart.getReachTableChartCampaignBrand)();

// ===== SPEND VND (BRAND) =====
export const useSpendVNDBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandChannel, 'barBrandChannelData')();

export const useSpendVNDBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandFirstLevel, 'barBrandFirstLevelData')();

export const useSpendVNDBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getSpendVNDBarChartBrandTimeband)();

// ===== SPEND VND PIE =====
export const useSpendVNDPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getSpendVNDPieChartAdvertiser)();

export const useGrpBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandChannel, 'barBrandChannelData')();

export const useGrpBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandFirstLevel, 'barBrandFirstLevelData')();

export const useGrpBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getGrpBarChartBrandTimeband)();

export const useGrpPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getGrpPieChartAdvertiser)();

export const useReachBarChartBrandChannelReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandChannel, 'barBrandChannelData')();

export const useReachBarChartBrandFirstLevelReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandFirstLevel, 'barBrandFirstLevelData')();

export const useReachBarChartBrandTimebandReturnApi = () =>
  createChartHook(getChart.getReachBarChartBrandTimeband)();

export const useReachPieChartAdvertiserReturnApi = () =>
  createChartHook(getChart.getReachPieChartAdvertiser)();

// ===== ALL TABLE =====
export const useAllTableChartBrandReturnApi = () =>
  createChartHook(getChart.getAllTableChartBrand, 'allTableBrandData')();

export const useAllTableChartBrandProgramReturnApi = () =>
  createChartHook(getChart.getAllTableChartBrandProgram, 'allTableBrandProgramData')();

export const useAllTableChartDeviceReturnApi = () =>
  createChartHook(getChart.getAllTableChartDevice)();

export const useAllTableChartMonitoringReturnApi = () =>
  createChartHook(getChart.getAllTableChartMonitoring, 'allTableMonitoringData')();

export const useMaxInsertReturnApi = () => {
  return useApi(getChart.getMaxInsert);
};

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