import axiosClient from './axiosClient';
import * as payloads from './payload_worldcups';
import { buildPayloadWithFilters } from './payload_worldcups/buildPayloadWithFilters';

const apiRoute = import.meta.env.VITE_API_ROUTE;

const postChart = async (basePayload, appliedFilters, disibledFilters = []) => {
    const finalPayload = appliedFilters
        ? buildPayloadWithFilters(basePayload, appliedFilters, disibledFilters)
        : basePayload;

    try {
        const userId = sessionStorage.getItem('user_id');
        const requestBody = {
            ...finalPayload,
            user_id: userId
        };
        return await axiosClient.post(apiRoute, requestBody);
    } catch (error) {
        return { data: {} };
    }
};

// ===== ALL TABLE =====
export const getAllTableChartDetail = (appliedFilters) =>
    postChart(payloads.allTableChartDetailPayload, appliedFilters);

export const getAllTableChartProvince = (appliedFilters) =>
    postChart(payloads.allTableChartProvincePayload, appliedFilters);

export const getAllTableChartRegional = (appliedFilters) =>
    postChart(payloads.allTableChartRegionalPayload, appliedFilters);

export const getAllTableChartShare = (appliedFilters) =>
    postChart(payloads.allTableChartSharePayload, appliedFilters);

export const getAllTableChartTeam = (appliedFilters) =>
    postChart(payloads.allTableChartTeamPayload, appliedFilters);

// ===== NUMBER CHART =====
export const getAveReachNumberChart = (appliedFilters) =>
    postChart(payloads.aveReachNumberChartPayload, appliedFilters);

export const getAveReachPercentNumberChart = (appliedFilters) =>
    postChart(payloads.aveReachPercentNumberChartPayload, appliedFilters);

export const getCountMatchNumberChart = (appliedFilters) =>
    postChart(payloads.countMatchNumberChartPayload, appliedFilters);

export const getDurationNumberChart = (appliedFilters) =>
    postChart(payloads.durationNumberChartPayload, appliedFilters);

// ===== RATING =====
export const getRatingLineChartMinuteVTV6 = (appliedFilters) =>
    postChart(payloads.ratingLineChartMinuteVTV6Payload, appliedFilters);

export const getRatingNumberChart = (appliedFilters) =>
    postChart(payloads.ratingNumberChartPayload, appliedFilters);

export const getRatingPercentBarChartChannel = (appliedFilters) =>
    postChart(payloads.ratingPercentBarChartChannelPayload, appliedFilters);

export const getRatingPercentNumberChart = (appliedFilters) =>
    postChart(payloads.ratingPercentNumberChartPayload, appliedFilters);

export const getRatingReachBarChartDate = (appliedFilters) =>
    postChart(payloads.ratingReachBarChartDatePayload, appliedFilters);

export const getMaxInsert = () => {
    const userId = sessionStorage.getItem('user_id');
    return axiosClient.post(apiRoute, { ...payloads.maxInsertPayload, user_id: userId });
}

export const getFilterProvince = () => {
    const userId = sessionStorage.getItem('user_id');
    return axiosClient.post(apiRoute, { ...payloads.filterProvincePayload, user_id: userId });
}

export const getFilterProgram = (appliedFilters) =>
    postChart(payloads.filterProgramPayload, appliedFilters, ['allFilters']);