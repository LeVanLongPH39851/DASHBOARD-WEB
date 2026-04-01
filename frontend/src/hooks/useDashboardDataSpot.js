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

  // ===== COUNT SPOT =====
  { hook: useCallApi.useCountSpotPieChartFirstLevelReturnApi, dataKey: 'countPieFirstLevelData' },
  { hook: useCallApi.useCountSpotPieChartChannelReturnApi, dataKey: 'countPieChannelData' },
  { hook: useCallApi.useCountSpotNumberChartReturnApi, dataKey: 'countNumberData' },
  { hook: useCallApi.useCountSpotBarChartAdvertiserReturnApi, dataKey: 'countBarAdvertiserData' },
  { hook: useCallApi.useCountSpotBarChartAdvertiserChannelReturnApi, dataKey: 'countBarAdvertiserChannelData' },
  { hook: useCallApi.useFilterProvinceReturnApi, dataKey: 'filterProvinceData' }
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