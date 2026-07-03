import { useEffect, useRef } from 'react';
import * as useCallApi from './useCallApiWorldCup';

const HOOKS = [
    // ===== ALL TABLE =====
    { hook: useCallApi.useAllTableChartDetailReturnApi, dataKey: 'allTableDetailData' },
    { hook: useCallApi.useAllTableChartProvinceReturnApi, dataKey: 'allTableProvinceData' },
    { hook: useCallApi.useAllTableChartRegionalReturnApi, dataKey: 'allTableRegionalData' },
    { hook: useCallApi.useAllTableChartShareReturnApi, dataKey: 'allTableShareData' },
    { hook: useCallApi.useAllTableChartTeamReturnApi, dataKey: 'allTableTeamData' },

    // ===== NUMBER CHART =====
    { hook: useCallApi.useAveReachNumberChartReturnApi, dataKey: 'aveReachNumberData' },
    { hook: useCallApi.useAveReachPercentNumberChartReturnApi, dataKey: 'aveReachPercentNumberData' },
    { hook: useCallApi.useCountMatchNumberChartReturnApi, dataKey: 'countMatchNumberData' },
    { hook: useCallApi.useDurationNumberChartReturnApi, dataKey: 'durationNumberData' },

    // ===== RATING =====
    { hook: useCallApi.useRatingLineChartMinuteVTV6ReturnApi, dataKey: 'ratingLineMinuteVTV6Data' },
    { hook: useCallApi.useRatingNumberChartReturnApi, dataKey: 'ratingNumberData' },
    { hook: useCallApi.useRatingPercentBarChartChannelReturnApi, dataKey: 'ratingPercentBarChannelData' },
    { hook: useCallApi.useRatingPercentNumberChartReturnApi, dataKey: 'ratingPercentNumberData' },
    { hook: useCallApi.useRatingReachBarChartDateReturnApi, dataKey: 'ratingReachBarDateData' },

    { hook: useCallApi.useMaxInsertReturnApi, dataKey: 'maxInsertData' },

    { hook: useCallApi.useFilterProvinceReturnApi, dataKey: 'filterProvinceData' },
    { hook: useCallApi.useFilterProgramReturnApi, dataKey: 'filterProgramData' }
];

export const useDashboardData = () => {
    const hookResults = HOOKS.map(({ hook }) => hook());
    const hasLoggedRef = useRef(false);

    const data = {};
    const isLoading = {};
    const hasError = {};
    const refetchMap = {};

    HOOKS.forEach(({ dataKey }, index) => {
        data[dataKey] = hookResults[index].data;
        isLoading[dataKey] = hookResults[index].loading;
        hasError[dataKey] = hookResults[index].error;
        refetchMap[dataKey] = hookResults[index].refetch;
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

    const refetch = (key) => {
        if (!refetchMap[key]) {
            console.warn(`Không tìm thấy API với key: ${key}`);
            return Promise.resolve(null);
        }

        return refetchMap[key]();
    };

    return {
        ...data,
        isLoading,
        hasError,
        refetch
    };
};