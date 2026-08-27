import axiosClient from "./axiosClient";
import * as payloads from "./payload_worldcups";
import { buildPayloadWithFilters } from "./payload_worldcups/buildPayloadWithFilters";

const apiRoute = import.meta.env.VITE_API_ROUTE;

const postChart = async (
  basePayload,
  appliedFilters,
  disibledFilters = [],
  force = false,
) => {
  const finalPayload = appliedFilters
    ? buildPayloadWithFilters(basePayload, appliedFilters, disibledFilters)
    : basePayload;

  // Set force parameter if it's a manual refetch
  if (force) {
    finalPayload.payload.force = true;
    if (finalPayload.payload.form_data) {
      finalPayload.payload.form_data.force = true;
    }
  }

  try {
    const userId = sessionStorage.getItem("user_id");
    const requestBody = {
      ...finalPayload,
      user_id: userId,
    };
    return await axiosClient.post(apiRoute, requestBody);
  } catch (error) {
    return { data: {} };
  }
};

// ===== ALL TABLE =====
export const getAllTableChartDetail = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartDetailPayload, appliedFilters, [], force);

export const getAllTableChartProvince = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartProvincePayload, appliedFilters, [], force);

export const getAllTableChartRegional = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartRegionalPayload, appliedFilters, [], force);

export const getAllTableChartShare = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartSharePayload, appliedFilters, [], force);

export const getAllTableChartTeam = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartTeamPayload, appliedFilters, [], force);

// ===== NUMBER CHART =====
export const getAveReachNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.aveReachNumberChartPayload, appliedFilters, [], force);

export const getAveReachPercentNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachPercentNumberChartPayload,
    appliedFilters,
    [],
    force,
  );

export const getCountMatchNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.countMatchNumberChartPayload, appliedFilters, [], force);

export const getDurationNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.durationNumberChartPayload, appliedFilters, [], force);

// ===== RATING =====
export const getRatingLineChartMinuteVTV6 = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingLineChartMinuteVTV6Payload,
    appliedFilters,
    [],
    force,
  );

export const getRatingNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.ratingNumberChartPayload, appliedFilters, [], force);

export const getRatingPercentBarChartChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingPercentBarChartChannelPayload,
    appliedFilters,
    [],
    force,
  );

export const getRatingPercentNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingPercentNumberChartPayload,
    appliedFilters,
    [],
    force,
  );

export const getRatingReachBarChartDate = (appliedFilters, force = false) =>
  postChart(payloads.ratingReachBarChartDatePayload, appliedFilters, [], force);

export const getMaxInsert = () => {
  const userId = sessionStorage.getItem("user_id");
  return axiosClient.post(apiRoute, {
    ...payloads.maxInsertPayload,
    user_id: userId,
  });
};

export const getFilterProvince = () => {
  const userId = sessionStorage.getItem("user_id");
  return axiosClient.post(apiRoute, {
    ...payloads.filterProvincePayload,
    user_id: userId,
  });
};

export const getFilterProgram = (appliedFilters, force = false) =>
  postChart(
    payloads.filterProgramPayload,
    appliedFilters,
    ["allFilters"],
    force,
  );
