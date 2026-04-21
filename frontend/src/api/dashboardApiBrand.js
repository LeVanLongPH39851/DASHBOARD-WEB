import axiosClient from './axiosClient';
import * as payloads from './payload_brands';
import { buildPayloadWithFilters } from './payload_brands/buildPayloadWithFilters';

const apiRoute = import.meta.env.VITE_API_ROUTE;

const postChart = async (basePayload, appliedFilters, disibledFilters = []) => {
  const finalPayload = appliedFilters
    ? buildPayloadWithFilters(basePayload, appliedFilters, disibledFilters)
    : basePayload;

  try {
    return await axiosClient.post(apiRoute, finalPayload);
  } catch (error) {
    return { data: {} };
  }
};

// ===== ADCODE =====
export const getAdcodeTableChartProgram = (appliedFilters) =>
  postChart(payloads.adcodeTableChartProgramPayload, appliedFilters);

// ===== ALL TABLE =====
export const getAllTableChartBrand = (appliedFilters) =>
  postChart(payloads.allTableChartBrandPayload, appliedFilters);

export const getAllTableChartCampaign = (appliedFilters) =>
  postChart(payloads.allTableChartCampaignPayload, appliedFilters);

export const getAllTableChartDevice = (appliedFilters) =>
  postChart(payloads.allTableChartDevicePayload, appliedFilters);

export const getAllTableChartPlatform = (appliedFilters) =>
  postChart(payloads.allTableChartPlatformPayload, appliedFilters);

export const getAllTableChartTopProgram = (appliedFilters) =>
  postChart(payloads.allTableChartTopProgramPayload, appliedFilters);

// ===== GRP =====
export const getGrpBarChartBrand = (appliedFilters) =>
  postChart(payloads.grpBarChartBrandPayload, appliedFilters);

// ===== PERCENT =====
export const getPercentBartChartPlatformView = (appliedFilters) =>
  postChart(payloads.percentBartChartPlatformViewPayload, appliedFilters);

// ===== REACH =====
export const getReachBarChartChannel = (appliedFilters) =>
  postChart(payloads.reachBarChartChannelPayload, appliedFilters);

export const getReachBarChartFirstLevel = (appliedFilters) =>
  postChart(payloads.reachBarChartFirstLevelPayload, appliedFilters);

// ===== SOS =====
export const getSosPieChartBrandGroup = (appliedFilters) =>
  postChart(payloads.sosPieChartBrandGroupPayload, appliedFilters);

export const getSosPieChartBrandProduct = (appliedFilters) =>
  postChart(payloads.sosPieChartBrandProductPayload, appliedFilters);

// ===== SOV =====
export const getSovPieChartBrandGroup = (appliedFilters) =>
  postChart(payloads.sovPieChartBrandGroupPayload, appliedFilters);

export const getSovPieChartBrandProduct = (appliedFilters) =>
  postChart(payloads.sovPieChartBrandProductPayload, appliedFilters);

// ===== SPEND VND =====
export const getSpendVNDBarChartChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartChannelPayload, appliedFilters);

export const getSpendVNDBarChartDate = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartDatePayload, appliedFilters);

export const getSpendVNDBarChartFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartFirstLevelPayload, appliedFilters);

export const getSpendVNDBarChartTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartTimebandPayload, appliedFilters);

// ===== VIEW =====
export const getViewPieChartPlatform = (appliedFilters) =>
  postChart(payloads.viewPieChartPlatformPayload, appliedFilters);

export const getCountCampaignNumberChart = (appliedFilters) =>
  postChart(payloads.countCampaignNumberChartPayload, appliedFilters);

export const getCountSpotNumberChart = (appliedFilters) =>
  postChart(payloads.countSpotNumberChartPayload, appliedFilters);

export const getDurationSpotNumberChart = (appliedFilters) =>
  postChart(payloads.durationSpotNumberChartPayload, appliedFilters);

export const getFrequencyNumberChart = (appliedFilters) =>
  postChart(payloads.frequencyNumberChartPayload, appliedFilters);

export const getReachNumberChart = (appliedFilters) =>
  postChart(payloads.reachNumberChartPayload, appliedFilters);

export const getSpendVNDNumberChart = (appliedFilters) =>
  postChart(payloads.spendVNDNumberChartPayload, appliedFilters);

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)

export const getFilterProgram = (appliedFilters) =>
  postChart(payloads.filterProgramPayload, appliedFilters, ['allFilters']);

export const getFilterProduct = (appliedFilters) =>
  postChart(payloads.filterProductPayload, appliedFilters, ['allFilters']);

export const getFilterGroup = (appliedFilters) =>
  postChart(payloads.filterGroupPayload, appliedFilters, ['allFilters']);

export const getFilterCampaign = (appliedFilters) =>
  postChart(payloads.filterCampaignPayload, appliedFilters, ['allFilters']);

export const getFilterBrand = (appliedFilters) =>
  postChart(payloads.filterBrandPayload, appliedFilters, ['allFilters']);

export const getFilterAdvertiser = (appliedFilters) =>
  postChart(payloads.filterAdvertiserPayload, appliedFilters, ['allFilters']);

export const getFilterAdcode = () =>
  axiosClient.post(apiRoute, payloads.filterAdcodePayload)