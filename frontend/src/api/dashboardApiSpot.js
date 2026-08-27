import axiosClient from "./axiosClient";
import * as payloads from "./payload_spots";
import { buildPayloadWithFilters } from "./payload_spots/buildPayloadWithFilters";

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

const DISIBLE_OTHER = [
  "provinceFilters",
  "regionalFilters",
  "keyCityFilters",
  "platformFilters",
];
const DISIBLE_EFFECTIVE = ["adCodeFilters", "spotTypeFilters"];

// Tab Overview

// ===== TOP 10 =====
export const getTop10AllTableChartProduct = (appliedFilters, force = false) =>
  postChart(
    payloads.top10AllTableChartProductPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getTop10AllTableChartCampaign = (appliedFilters, force = false) =>
  postChart(
    payloads.top10AllTableChartCampaignPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getTop10AllTableChartBrand = (appliedFilters, force = false) =>
  postChart(
    payloads.top10AllTableChartBrandPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== SPEND VND =====
export const getSpendVNDPieChartFirstLevel = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDPieChartFirstLevelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDPieChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDPieChartChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDNumberChartPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDBarChartDate = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartDatePayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDBarChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDBarChartAdvertiserChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDBarChartAdvertiserChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== SPEND USD =====
export const getSpendUSDNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.spendUSDNumberChartPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendUSDBarChartDate = (appliedFilters, force = false) =>
  postChart(
    payloads.spendUSDBarChartDatePayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendUSDBarChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.spendUSDBarChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendUSDBarChartAdvertiserChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendUSDBarChartAdvertiserChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== GRP =====
export const getGRPPieChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.GRPPieChartChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== DURATION SPOT =====
export const getDurationSpotPieChartLenght = (appliedFilters, force = false) =>
  postChart(
    payloads.durationSpotPieChartLenghtPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getDurationSpotPieChartFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.durationSpotPieChartFirstLevelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getDurationSpotPieChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.durationSpotPieChartChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getDurationSpotNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.durationSpotNumberChartPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== COUNT SPOT =====
export const getCountSpotPieChartFirstLevel = (appliedFilters, force = false) =>
  postChart(
    payloads.countSpotPieChartFirstLevelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getCountSpotPieChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.countSpotPieChartChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getCountSpotNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.countSpotNumberChartPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getCountSpotBarChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.countSpotBarChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getCountSpotBarChartAdvertiserChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.countSpotBarChartAdvertiserChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// Tab Revenue

// ===== ADCODE =====
export const getAdcodeTableChartProduct = (appliedFilters, force = false) =>
  postChart(
    payloads.adcodeTableChartProductPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getAdcodeTableChartProgram = (appliedFilters, force = false) =>
  postChart(
    payloads.adcodeTableChartProgramPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== COUNT =====
export const getCountPieChartTimeband = (appliedFilters, force = false) =>
  postChart(
    payloads.countPieChartTimebandPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== SPEND VND (BỔ SUNG) =====
export const getSpendVNDBarChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartChannelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDBarChartProgram = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartProgramPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDBarChartTimeband = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDBarChartTimebandPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== SPEND VND PIVOT =====
export const getSpendVNDPivotTableChartChannelFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDPivotTableChartChannelFirstLevelPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

export const getSpendVNDPivotTableChartChannelTimeband = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDPivotTableChartChannelTimebandPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// ===== SPEND VND TABLE =====
export const getSpendVNDTableChartAdvertiser = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDTableChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_OTHER,
    force,
  );

// Tab Effective

// ===== COUNT PIVOT =====
export const getCountPivotTableChartCampaignWeek = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.countPivotTableChartCampaignWeekPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// ===== GRP =====
export const getGrpBarChartWeekBrand = (appliedFilters, force = false) =>
  postChart(
    payloads.grpBarChartWeekBrandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpBarChartRegionalBrand = (appliedFilters, force = false) =>
  postChart(
    payloads.grpBarChartRegionalBrandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpPivotTableChartCampaignWeek = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.grpPivotTableChartCampaignWeekPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// ===== REACH =====
export const getReachPivotTableChartCampaignWeek = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.reachPivotTableChartCampaignWeekPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// ===== SPEND VND (BRAND) =====
export const getSpendVNDBarChartBrandChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDBarChartBrandChannelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getSpendVNDBarChartBrandFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDBarChartBrandFirstLevelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getSpendVNDBarChartBrandTimeband = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.spendVNDBarChartBrandTimebandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// ===== SPEND VND PIE =====
export const getSpendVNDPieChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.spendVNDPieChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpBarChartBrandChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.grpBarChartBrandChannelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpBarChartBrandFirstLevel = (appliedFilters, force = false) =>
  postChart(
    payloads.grpBarChartBrandFirstLevelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpBarChartBrandTimeband = (appliedFilters, force = false) =>
  postChart(
    payloads.grpBarChartBrandTimebandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getGrpPieChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.grpPieChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getReachBarChartBrandChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.reachBarChartBrandChannelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getReachBarChartBrandFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.reachBarChartBrandFirstLevelPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getReachBarChartBrandTimeband = (appliedFilters, force = false) =>
  postChart(
    payloads.reachBarChartBrandTimebandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getReachPieChartAdvertiser = (appliedFilters, force = false) =>
  postChart(
    payloads.reachPieChartAdvertiserPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// ===== ALL TABLE =====
export const getAllTableChartBrand = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartBrandPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getAllTableChartBrandProgram = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartBrandProgramPayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

export const getAllTableChartDevice = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartDevicePayload,
    appliedFilters,
    DISIBLE_EFFECTIVE,
    force,
  );

// Tab Ad monitoring report

export const getAllTableChartMonitoring = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartMonitoringPayload,
    appliedFilters,
    ["provinceFilters", "regionalFilters", "keyCityFilters"],
    force,
  );

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
