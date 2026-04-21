import { useEffect, useRef } from 'react';
import * as useCallApi from './useCallApiBrand';

const HOOKS = [
  // ===== ADCODE =====
    { hook: useCallApi.useAdcodeTableChartProgramReturnApi, dataKey: 'adcodeProgramData' },

    // ===== ALL TABLE =====
    { hook: useCallApi.useAllTableChartBrandReturnApi, dataKey: 'allTableBrandData' },
    { hook: useCallApi.useAllTableChartCampaignReturnApi, dataKey: 'allTableCampaignData' },
    { hook: useCallApi.useAllTableChartDeviceReturnApi, dataKey: 'allTableDeviceData' },
    { hook: useCallApi.useAllTableChartPlatformReturnApi, dataKey: 'allTablePlatformData' },
    { hook: useCallApi.useAllTableChartTopProgramReturnApi, dataKey: 'allTableTopProgramData' },

    // ===== GRP =====
    { hook: useCallApi.useGrpBarChartBrandReturnApi, dataKey: 'grpBarBrandData' },

    // ===== PERCENT =====
    { hook: useCallApi.usePercentBartChartPlatformViewReturnApi, dataKey: 'percentPlatformViewData' },

    // ===== REACH =====
    { hook: useCallApi.useReachBarChartChannelReturnApi, dataKey: 'reachBarChannelData' },
    { hook: useCallApi.useReachBarChartFirstLevelReturnApi, dataKey: 'reachBarFirstLevelData' },

    // ===== SOS =====
    { hook: useCallApi.useSosPieChartBrandGroupReturnApi, dataKey: 'sosPieBrandGroupData' },
    { hook: useCallApi.useSosPieChartBrandProductReturnApi, dataKey: 'sosPieBrandProductData' },

    // ===== SOV =====
    { hook: useCallApi.useSovPieChartBrandGroupReturnApi, dataKey: 'sovPieBrandGroupData' },
    { hook: useCallApi.useSovPieChartBrandProductReturnApi, dataKey: 'sovPieBrandProductData' },

    // ===== SPEND VND =====
    { hook: useCallApi.useSpendVNDBarChartChannelReturnApi, dataKey: 'spendVNDBarChannelData' },
    { hook: useCallApi.useSpendVNDBarChartDateReturnApi, dataKey: 'spendVNDBarDateData' },
    { hook: useCallApi.useSpendVNDBarChartFirstLevelReturnApi, dataKey: 'spendVNDBarFirstLevelData' },
    { hook: useCallApi.useSpendVNDBarChartTimebandReturnApi, dataKey: 'spendVNDBarTimebandData' },

    // ===== VIEW =====
    { hook: useCallApi.useViewPieChartPlatformReturnApi, dataKey: 'viewPiePlatformData' },

    { hook: useCallApi.useCountCampaignNumberChartReturnApi, dataKey: 'countCampaignNumberData' },
    { hook: useCallApi.useCountSpotNumberChartReturnApi, dataKey: 'countSpotNumberData' },
    { hook: useCallApi.useDurationSpotNumberChartReturnApi, dataKey: 'durationSpotNumberData' },
    { hook: useCallApi.useFrequencyNumberChartReturnApi, dataKey: 'frequencyNumberData' },
    { hook: useCallApi.useReachNumberChartReturnApi, dataKey: 'reachNumberData' },
    { hook: useCallApi.useSpendVNDNumberChartReturnApi, dataKey: 'spendVNDNumberData' },

    { hook: useCallApi.useFilterProvinceReturnApi, dataKey: 'filterProvinceData' },
    { hook: useCallApi.useFilterProgramReturnApi, dataKey: 'filterProgramData' },
    { hook: useCallApi.useFilterProductReturnApi, dataKey: 'filterProductData' },
    { hook: useCallApi.useFilterGroupReturnApi, dataKey: 'filterGroupData' },
    { hook: useCallApi.useFilterCampaignReturnApi, dataKey: 'filterCampaignData' },
    { hook: useCallApi.useFilterBrandReturnApi, dataKey: 'filterBrandData' },
    { hook: useCallApi.useFilterAdvertiserReturnApi, dataKey: 'filterAdvertiserData' },
    { hook: useCallApi.useFilterAdcodeReturnApi, dataKey: 'filterAdcodeData' }
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