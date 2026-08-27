import axiosClient from "./axiosClient";
import * as payloads from "./payload_brands";
import { buildPayloadWithFilters } from "./payload_brands/buildPayloadWithFilters";

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

// ===== ADCODE =====
export const getAdcodeTableChartProgram = (appliedFilters, force = false) =>
  postChart(payloads.adcodeTableChartProgramPayload, appliedFilters, [], force);

// ===== ALL TABLE =====
export const getAllTableChartBrand = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartBrandPayload, appliedFilters, [], force);

export const getAllTableChartDevice = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartDevicePayload, appliedFilters, [], force);

export const getAllTableChartPlatform = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartPlatformPayload, appliedFilters, [], force);

export const getAllTableChartTopProgram = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartTopProgramPayload, appliedFilters, [], force);

// ===== GRP =====
export const getGrpBarChartBrand = (appliedFilters, force = false) =>
  postChart(payloads.grpBarChartBrandPayload, appliedFilters, [], force);

// ===== PERCENT =====
export const getPercentBartChartPlatformView = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.percentBartChartPlatformViewPayload,
    appliedFilters,
    [],
    force,
  );

// ===== REACH =====
export const getReachBarChartChannel = (appliedFilters, force = false) =>
  postChart(payloads.reachBarChartChannelPayload, appliedFilters, [], force);

export const getReachBarChartFirstLevel = (appliedFilters, force = false) =>
  postChart(payloads.reachBarChartFirstLevelPayload, appliedFilters, [], force);

// ===== SOS =====
export const getSosPieChartBrandGroup = (appliedFilters, force = false) =>
  postChart(payloads.sosPieChartBrandGroupPayload, appliedFilters, [], force);

export const getSosPieChartBrandProduct = (appliedFilters, force = false) =>
  postChart(payloads.sosPieChartBrandProductPayload, appliedFilters, [], force);

// ===== SOV =====
export const getSovPieChartBrandGroup = (appliedFilters, force = false) =>
  postChart(payloads.sovPieChartBrandGroupPayload, appliedFilters, [], force);

export const getSovPieChartBrandProduct = (appliedFilters, force = false) =>
  postChart(payloads.sovPieChartBrandProductPayload, appliedFilters, [], force);

// ===== SPEND VND =====
export const getSpendVNDBarChartChannel = (appliedFilters, force = false) =>
  postChart(payloads.spendVNDBarChartChannelPayload, appliedFilters, [], force);

export const getSpendVNDBarChartDate = (appliedFilters, force = false) =>
  postChart(payloads.spendVNDBarChartDatePayload, appliedFilters, [], force);

export const getSpendVNDBarChartFirstLevel = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartFirstLevelPayload,
    appliedFilters,
    [],
    force,
  );

export const getSpendVNDBarChartTimeband = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartTimebandPayload,
    appliedFilters,
    [],
    force,
  );

// ===== VIEW =====
export const getViewPieChartPlatform = (appliedFilters, force = false) =>
  postChart(payloads.viewPieChartPlatformPayload, appliedFilters, [], force);

export const getCountCampaignNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.countCampaignNumberChartPayload,
    appliedFilters,
    [],
    force,
  );

export const getCountSpotNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.countSpotNumberChartPayload, appliedFilters, [], force);

export const getDurationSpotNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.durationSpotNumberChartPayload, appliedFilters, [], force);

export const getFrequencyNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.frequencyNumberChartPayload, appliedFilters, [], force);

export const getReachNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.reachNumberChartPayload, appliedFilters, [], force);

export const getSpendVNDNumberChart = (appliedFilters, force = false) =>
  postChart(payloads.spendVNDNumberChartPayload, appliedFilters, [], force);

export const getAllTableChartMonitoring = (appliedFilters, force = false) =>
  postChart(payloads.allTableChartMonitoringPayload, appliedFilters, [], force);

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

export const getFilterProduct = (appliedFilters, force = false) =>
  postChart(
    payloads.filterProductPayload,
    appliedFilters,
    ["allFilters"],
    force,
  );

export const getFilterGroup = (appliedFilters, force = false) =>
  postChart(payloads.filterGroupPayload, appliedFilters, ["allFilters"], force);

export const getFilterCampaign = (appliedFilters, force = false) =>
  postChart(
    payloads.filterCampaignPayload,
    appliedFilters,
    ["allFilters"],
    force,
  );

export const getFilterBrand = (appliedFilters, force = false) =>
  postChart(payloads.filterBrandPayload, appliedFilters, ["allFilters"], force);

export const getFilterAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.filterAdvertiserPayload,
    appliedFilters,
    ["allFilters"],
    force,
  );

export const getFilterAdcode = () => {
  const userId = sessionStorage.getItem("user_id");
  return axiosClient.post(apiRoute, {
    ...payloads.filterAdcodePayload,
    user_id: userId,
  });
};
