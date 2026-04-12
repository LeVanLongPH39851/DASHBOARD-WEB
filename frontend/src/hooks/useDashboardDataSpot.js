import { useEffect, useRef } from 'react';
import * as useCallApi from './useCallApiSpot';

const HOOKS = [
  // ===== TOP 10 =====
  { hook: useCallApi.useTop10AllTableChartProductReturnApi, dataKey: 'top10ProductData' },
  { hook: useCallApi.useTop10AllTableChartCampaignReturnApi, dataKey: 'top10CampaignData' },
  { hook: useCallApi.useTop10AllTableChartBrandReturnApi, dataKey: 'top10BrandData' },

  // ===== SPEND VND =====
  { hook: useCallApi.useSpendVNDPieChartFirstLevelReturnApi, dataKey: 'spendVNDPieFirstLevelData' },
  { hook: useCallApi.useSpendVNDPieChartChannelReturnApi, dataKey: 'spendVNDPieChannelData' },
  { hook: useCallApi.useSpendVNDNumberChartReturnApi, dataKey: 'spendVNDNumberData' },
  { hook: useCallApi.useSpendVNDBarChartDateReturnApi, dataKey: 'spendVNDBarDateData' },
  { hook: useCallApi.useSpendVNDBarChartAdvertiserReturnApi, dataKey: 'spendVNDBarAdvertiserData' },
  { hook: useCallApi.useSpendVNDBarChartAdvertiserChannelReturnApi, dataKey: 'spendVNDBarAdvertiserChannelData' },

  // ===== SPEND USD =====
  { hook: useCallApi.useSpendUSDNumberChartReturnApi, dataKey: 'spendUSDNumberData' },
  { hook: useCallApi.useSpendUSDBarChartDateReturnApi, dataKey: 'spendUSDBarDateData' },
  { hook: useCallApi.useSpendUSDBarChartAdvertiserReturnApi, dataKey: 'spendUSDBarAdvertiserData' },
  { hook: useCallApi.useSpendUSDBarChartAdvertiserChannelReturnApi, dataKey: 'spendUSDBarAdvertiserChannelData' },

  // ===== GRP =====
  { hook: useCallApi.useGRPPieChartChannelReturnApi, dataKey: 'grpPieChannelData' },

  // ===== DURATION SPOT =====
  { hook: useCallApi.useDurationSpotPieChartLenghtReturnApi, dataKey: 'durationPieLengthData' },
  { hook: useCallApi.useDurationSpotPieChartFirstLevelReturnApi, dataKey: 'durationPieFirstLevelData' },
  { hook: useCallApi.useDurationSpotPieChartChannelReturnApi, dataKey: 'durationPieChannelData' },
  { hook: useCallApi.useDurationSpotNumberChartReturnApi, dataKey: 'durationNumberData' },

  { hook: useCallApi.useCountSpotPieChartFirstLevelReturnApi, dataKey: 'countPieFirstLevelData' },
  { hook: useCallApi.useCountSpotPieChartChannelReturnApi, dataKey: 'countPieChannelData' },
  { hook: useCallApi.useCountSpotNumberChartReturnApi, dataKey: 'countNumberData' },
  { hook: useCallApi.useCountSpotBarChartAdvertiserReturnApi, dataKey: 'countBarAdvertiserData' },
  { hook: useCallApi.useCountSpotBarChartAdvertiserChannelReturnApi, dataKey: 'countBarAdvertiserChannelData' },
  { hook: useCallApi.useAdcodeTableChartProductReturnApi, dataKey: 'adcodeProductData' },
  { hook: useCallApi.useAdcodeTableChartProgramReturnApi, dataKey: 'adcodeProgramData' },
  { hook: useCallApi.useCountPieChartTimebandReturnApi, dataKey: 'countPieTimebandData' },
  { hook: useCallApi.useSpendVNDBarChartChannelReturnApi, dataKey: 'spendVNDBarChannelData' },
  { hook: useCallApi.useSpendVNDBarChartProgramReturnApi, dataKey: 'spendVNDBarProgramData' },
  { hook: useCallApi.useSpendVNDBarChartTimebandReturnApi, dataKey: 'spendVNDBarTimebandData' },
  { hook: useCallApi.useSpendVNDPivotTableChartChannelFirstLevelReturnApi, dataKey: 'spendVNDPivotChannelFirstLevelData' },
  { hook: useCallApi.useSpendVNDPivotTableChartChannelTimebandReturnApi, dataKey: 'spendVNDPivotChannelTimebandData' },
  { hook: useCallApi.useSpendVNDTableChartAdvertiserReturnApi, dataKey: 'spendVNDTableAdvertiserData' },

    // ===== ALL TABLE =====
  { hook: useCallApi.useAllTableChartBrandReturnApi, dataKey: 'allTableBrandData' },
  { hook: useCallApi.useAllTableChartBrandProgramReturnApi, dataKey: 'allTableBrandProgramData' },
  { hook: useCallApi.useAllTableChartDeviceReturnApi, dataKey: 'allTableDeviceData' },

  // ===== COUNT PIVOT =====
  { hook: useCallApi.useCountPivotTableChartCampaignWeekReturnApi, dataKey: 'countPivotCampaignWeekData' },

  // ===== GRP =====
  { hook: useCallApi.useGrpBarChartWeekBrandReturnApi, dataKey: 'grpBarWeekBrandData' },
  { hook: useCallApi.useGrpBarChartRegionalBrandReturnApi, dataKey: 'grpBarRegionalBrandData' },
  { hook: useCallApi.useGrpPivotTableChartCampaignWeekReturnApi, dataKey: 'grpPivotCampaignWeekData' },

  // ===== REACH =====
  { hook: useCallApi.useReachPivotTableChartCampaignWeekReturnApi, dataKey: 'reachPivotCampaignWeekData' },
  { hook: useCallApi.useReachTableChartCampaignBrandReturnApi, dataKey: 'reachTableCampaignBrandData' },

  // ===== SPEND VND (BRAND) =====
  { hook: useCallApi.useSpendVNDBarChartBrandChannelReturnApi, dataKey: 'spendVNDBarBrandChannelData' },
  { hook: useCallApi.useSpendVNDBarChartBrandFirstLevelReturnApi, dataKey: 'spendVNDBarBrandFirstLevelData' },
  { hook: useCallApi.useSpendVNDBarChartBrandTimebandReturnApi, dataKey: 'spendVNDBarBrandTimebandData' },

  // ===== SPEND VND PIE =====
  { hook: useCallApi.useSpendVNDPieChartAdvertiserReturnApi, dataKey: 'spendVNDPieAdvertiserData' },

  { hook: useCallApi.useGrpBarChartBrandChannelReturnApi, dataKey: 'grpBarBrandChannelData' },
  { hook: useCallApi.useGrpBarChartBrandFirstLevelReturnApi, dataKey: 'grpBarBrandFirstLevelData' },
  { hook: useCallApi.useGrpBarChartBrandTimebandReturnApi, dataKey: 'grpBarBrandTimebandData' },

  { hook: useCallApi.useGrpPieChartAdvertiserReturnApi, dataKey: 'grpPieAdvertiserData' },

  { hook: useCallApi.useReachBarChartBrandChannelReturnApi, dataKey: 'reachBarBrandChannelData' },
  { hook: useCallApi.useReachBarChartBrandFirstLevelReturnApi, dataKey: 'reachBarBrandFirstLevelData' },
  { hook: useCallApi.useReachBarChartBrandTimebandReturnApi, dataKey: 'reachBarBrandTimebandData' },

  { hook: useCallApi.useReachPieChartAdvertiserReturnApi, dataKey: 'reachPieAdvertiserData' },
  { hook: useCallApi.useAllTableChartMonitoringReturnApi, dataKey: 'allTableMonitoringData' },

  { hook: useCallApi.useFilterProvinceReturnApi, dataKey: 'filterProvinceData' },
  { hook: useCallApi.useFilterProgramReturnApi, dataKey: 'filterProgramData' },
  { hook: useCallApi.useFilterProductReturnApi, dataKey: 'filterProductData' },
  { hook: useCallApi.useFilterGroupReturnApi, dataKey: 'filterGroupData' },
  { hook: useCallApi.useFilterCampaignReturnApi, dataKey: 'filterCampaignData' },
  { hook: useCallApi.useFilterBrandReturnApi, dataKey: 'filterBrandData' },
  { hook: useCallApi.useFilterAdvertiserReturnApi, dataKey: 'filterAdvertiserData' },
  { hook: useCallApi.useFilterAdcodeReturnApi, dataKey: 'filterAdcodeData' },
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