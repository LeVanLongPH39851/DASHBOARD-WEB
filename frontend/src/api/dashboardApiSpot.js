import axiosClient from './axiosClient';
import * as payloads from './payload_spots';
import { buildPayloadWithFilters } from './payload_spots/buildPayloadWithFilters';

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

// Tab Overview

// ===== TOP 10 =====
export const getTop10AllTableChartProduct = (appliedFilters) =>
  postChart(payloads.top10AllTableChartProductPayload, appliedFilters);

export const getTop10AllTableChartCampaign = (appliedFilters) =>
  postChart(payloads.top10AllTableChartCampaignPayload, appliedFilters);

export const getTop10AllTableChartBrand = (appliedFilters) =>
  postChart(payloads.top10AllTableChartBrandPayload, appliedFilters);

// ===== SPEND VND =====
export const getSpendVNDPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDPieChartFirstLevelPayload, appliedFilters);

export const getSpendVNDPieChartChannel = (appliedFilters) =>
  postChart(payloads.spendVNDPieChartChannelPayload, appliedFilters);

export const getSpendVNDNumberChart = (appliedFilters) =>
  postChart(payloads.spendVNDNumberChartPayload, appliedFilters);

export const getSpendVNDBarChartDate = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartDatePayload, appliedFilters);

export const getSpendVNDBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartAdvertiserPayload, appliedFilters);

export const getSpendVNDBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartAdvertiserChannelPayload, appliedFilters);

// ===== SPEND USD =====
export const getSpendUSDNumberChart = (appliedFilters) =>
  postChart(payloads.spendUSDNumberChartPayload, appliedFilters);

export const getSpendUSDBarChartDate = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartDatePayload, appliedFilters);

export const getSpendUSDBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartAdvertiserPayload, appliedFilters);

export const getSpendUSDBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartAdvertiserChannelPayload, appliedFilters);

// ===== GRP =====
export const getGRPPieChartChannel = (appliedFilters) =>
  postChart(payloads.GRPPieChartChannelPayload, appliedFilters);

// ===== DURATION SPOT =====
export const getDurationSpotPieChartLenght = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartLenghtPayload, appliedFilters);

export const getDurationSpotPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartFirstLevelPayload, appliedFilters);

export const getDurationSpotPieChartChannel = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartChannelPayload, appliedFilters);

export const getDurationSpotNumberChart = (appliedFilters) =>
  postChart(payloads.durationSpotNumberChartPayload, appliedFilters);

// ===== COUNT SPOT =====
export const getCountSpotPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.countSpotPieChartFirstLevelPayload, appliedFilters);

export const getCountSpotPieChartChannel = (appliedFilters) =>
  postChart(payloads.countSpotPieChartChannelPayload, appliedFilters);

export const getCountSpotNumberChart = (appliedFilters) =>
  postChart(payloads.countSpotNumberChartPayload, appliedFilters);

export const getCountSpotBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.countSpotBarChartAdvertiserPayload, appliedFilters);

export const getCountSpotBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.countSpotBarChartAdvertiserChannelPayload, appliedFilters);

// Tab Revenue

// ===== ADCODE =====
export const getAdcodeTableChartProduct = (appliedFilters) =>
  postChart(payloads.adcodeTableChartProductPayload, appliedFilters);

export const getAdcodeTableChartProgram = (appliedFilters) =>
  postChart(payloads.adcodeTableChartProgramPayload, appliedFilters);

// ===== COUNT =====
export const getCountPieChartTimeband = (appliedFilters) =>
  postChart(payloads.countPieChartTimebandPayload, appliedFilters);

// ===== SPEND VND (BỔ SUNG) =====
export const getSpendVNDBarChartChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartChannelPayload, appliedFilters);

export const getSpendVNDBarChartProgram = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartProgramPayload, appliedFilters);

export const getSpendVNDBarChartTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartTimebandPayload, appliedFilters);

// ===== SPEND VND PIVOT =====
export const getSpendVNDPivotTableChartChannelFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDPivotTableChartChannelFirstLevelPayload, appliedFilters);

export const getSpendVNDPivotTableChartChannelTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDPivotTableChartChannelTimebandPayload, appliedFilters);

// ===== SPEND VND TABLE =====
export const getSpendVNDTableChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendVNDTableChartAdvertiserPayload, appliedFilters);

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)