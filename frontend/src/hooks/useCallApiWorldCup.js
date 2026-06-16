import { useApi } from './useApi';
import * as getChart from '../api/dashboardApiWorldCup';
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

// ===== ALL TABLE =====
export const useAllTableChartDetailReturnApi = () =>
    createChartHook(getChart.getAllTableChartDetail)();

export const useAllTableChartProvinceReturnApi = () =>
    createChartHook(getChart.getAllTableChartProvince)();

export const useAllTableChartRegionalReturnApi = () =>
    createChartHook(getChart.getAllTableChartRegional)();

export const useAllTableChartShareReturnApi = () =>
    createChartHook(getChart.getAllTableChartShare)();

export const useAllTableChartTeamReturnApi = () =>
    createChartHook(getChart.getAllTableChartTeam)();

// ===== NUMBER CHART =====
export const useAveReachNumberChartReturnApi = () =>
    createChartHook(getChart.getAveReachNumberChart)();

export const useAveReachPercentNumberChartReturnApi = () =>
    createChartHook(getChart.getAveReachPercentNumberChart)();

export const useCountMatchNumberChartReturnApi = () =>
    createChartHook(getChart.getCountMatchNumberChart)();

export const useDurationNumberChartReturnApi = () =>
    createChartHook(getChart.getDurationNumberChart)();

// ===== RATING =====
export const useRatingLineChartMinuteVTV6ReturnApi = () =>
    createChartHook(getChart.getRatingLineChartMinuteVTV6)();

export const useRatingNumberChartReturnApi = () =>
    createChartHook(getChart.getRatingNumberChart)();

export const useRatingPercentBarChartChannelReturnApi = () =>
    createChartHook(getChart.getRatingPercentBarChartChannel)();

export const useRatingPercentNumberChartReturnApi = () =>
    createChartHook(getChart.getRatingPercentNumberChart)();

export const useRatingReachBarChartDateReturnApi = () =>
    createChartHook(getChart.getRatingReachBarChartDate)();

export const useMaxInsertReturnApi = () => {
    return useApi(getChart.getMaxInsert);
};

export const useFilterProvinceReturnApi = () => {
    return useApi(getChart.getFilterProvince);
};

export const useFilterProgramReturnApi = () =>
    createChartHook(getChart.getFilterProgram)();