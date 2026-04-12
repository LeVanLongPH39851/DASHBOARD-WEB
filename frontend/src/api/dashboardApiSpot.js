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

const DISIBLE_OTHER = ['provinceFilters', 'regionalFilters', 'keyCityFilters', 'platformFilters'];
const DISIBLE_EFFECTIVE = ['adCodeFilters', 'spotTypeFilters'];

// Tab Overview

// ===== TOP 10 =====
export const getTop10AllTableChartProduct = (appliedFilters) =>
  postChart(payloads.top10AllTableChartProductPayload, appliedFilters, DISIBLE_OTHER);

export const getTop10AllTableChartCampaign = (appliedFilters) =>
  postChart(payloads.top10AllTableChartCampaignPayload, appliedFilters, DISIBLE_OTHER);

export const getTop10AllTableChartBrand = (appliedFilters) =>
  postChart(payloads.top10AllTableChartBrandPayload, appliedFilters, DISIBLE_OTHER);

// ===== SPEND VND =====
export const getSpendVNDPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDPieChartFirstLevelPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDPieChartChannel = (appliedFilters) =>
  postChart(payloads.spendVNDPieChartChannelPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDNumberChart = (appliedFilters) =>
  postChart(payloads.spendVNDNumberChartPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDBarChartDate = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartDatePayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartAdvertiserPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartAdvertiserChannelPayload, appliedFilters, DISIBLE_OTHER);

// ===== SPEND USD =====
export const getSpendUSDNumberChart = (appliedFilters) =>
  postChart(payloads.spendUSDNumberChartPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendUSDBarChartDate = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartDatePayload, appliedFilters, DISIBLE_OTHER);

export const getSpendUSDBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartAdvertiserPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendUSDBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.spendUSDBarChartAdvertiserChannelPayload, appliedFilters, DISIBLE_OTHER);

// ===== GRP =====
export const getGRPPieChartChannel = (appliedFilters) =>
  postChart(payloads.GRPPieChartChannelPayload, appliedFilters, DISIBLE_OTHER);

// ===== DURATION SPOT =====
export const getDurationSpotPieChartLenght = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartLenghtPayload, appliedFilters, DISIBLE_OTHER);

export const getDurationSpotPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartFirstLevelPayload, appliedFilters, DISIBLE_OTHER);

export const getDurationSpotPieChartChannel = (appliedFilters) =>
  postChart(payloads.durationSpotPieChartChannelPayload, appliedFilters, DISIBLE_OTHER);

export const getDurationSpotNumberChart = (appliedFilters) =>
  postChart(payloads.durationSpotNumberChartPayload, appliedFilters, DISIBLE_OTHER);

// ===== COUNT SPOT =====
export const getCountSpotPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.countSpotPieChartFirstLevelPayload, appliedFilters, DISIBLE_OTHER);

export const getCountSpotPieChartChannel = (appliedFilters) =>
  postChart(payloads.countSpotPieChartChannelPayload, appliedFilters, DISIBLE_OTHER);

export const getCountSpotNumberChart = (appliedFilters) =>
  postChart(payloads.countSpotNumberChartPayload, appliedFilters, DISIBLE_OTHER);

export const getCountSpotBarChartAdvertiser = (appliedFilters) =>
  postChart(payloads.countSpotBarChartAdvertiserPayload, appliedFilters, DISIBLE_OTHER);

export const getCountSpotBarChartAdvertiserChannel = (appliedFilters) =>
  postChart(payloads.countSpotBarChartAdvertiserChannelPayload, appliedFilters, DISIBLE_OTHER);

// Tab Revenue

// ===== ADCODE =====
export const getAdcodeTableChartProduct = (appliedFilters) =>
  postChart(payloads.adcodeTableChartProductPayload, appliedFilters, DISIBLE_OTHER);

export const getAdcodeTableChartProgram = (appliedFilters) =>
  postChart(payloads.adcodeTableChartProgramPayload, appliedFilters, DISIBLE_OTHER);

// ===== COUNT =====
export const getCountPieChartTimeband = (appliedFilters) =>
  postChart(payloads.countPieChartTimebandPayload, appliedFilters, DISIBLE_OTHER);

// ===== SPEND VND (BỔ SUNG) =====
export const getSpendVNDBarChartChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartChannelPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDBarChartProgram = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartProgramPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDBarChartTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartTimebandPayload, appliedFilters, DISIBLE_OTHER);

// ===== SPEND VND PIVOT =====
export const getSpendVNDPivotTableChartChannelFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDPivotTableChartChannelFirstLevelPayload, appliedFilters, DISIBLE_OTHER);

export const getSpendVNDPivotTableChartChannelTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDPivotTableChartChannelTimebandPayload, appliedFilters, DISIBLE_OTHER);

// ===== SPEND VND TABLE =====
export const getSpendVNDTableChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendVNDTableChartAdvertiserPayload, appliedFilters, DISIBLE_OTHER);

// Tab Effective

// ===== ALL TABLE =====
export const getAllTableChartBrand = (appliedFilters) =>
  postChart(payloads.allTableChartBrandPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getAllTableChartBrandProgram = (appliedFilters) =>
  postChart(payloads.allTableChartBrandProgramPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getAllTableChartDevice = (appliedFilters) =>
  postChart(payloads.allTableChartDevicePayload, appliedFilters, DISIBLE_EFFECTIVE);

// ===== COUNT PIVOT =====
export const getCountPivotTableChartCampaignWeek = (appliedFilters) =>
  postChart(payloads.countPivotTableChartCampaignWeekPayload, appliedFilters, DISIBLE_EFFECTIVE);

// ===== GRP =====
export const getGrpBarChartWeekBrand = (appliedFilters) =>
  postChart(payloads.grpBarChartWeekBrandPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpBarChartRegionalBrand = (appliedFilters) =>
  postChart(payloads.grpBarChartRegionalBrandPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpPivotTableChartCampaignWeek = (appliedFilters) =>
  postChart(payloads.grpPivotTableChartCampaignWeekPayload, appliedFilters, DISIBLE_EFFECTIVE);

// ===== REACH =====
export const getReachPivotTableChartCampaignWeek = (appliedFilters) =>
  postChart(payloads.reachPivotTableChartCampaignWeekPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getReachTableChartCampaignBrand = (appliedFilters) =>
  postChart(payloads.reachTableChartCampaignBrandPayload, appliedFilters, DISIBLE_EFFECTIVE);

// ===== SPEND VND (BRAND) =====
export const getSpendVNDBarChartBrandChannel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartBrandChannelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getSpendVNDBarChartBrandFirstLevel = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartBrandFirstLevelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getSpendVNDBarChartBrandTimeband = (appliedFilters) =>
  postChart(payloads.spendVNDBarChartBrandTimebandPayload, appliedFilters, DISIBLE_EFFECTIVE);

// ===== SPEND VND PIE =====
export const getSpendVNDPieChartAdvertiser = (appliedFilters) =>
  postChart(payloads.spendVNDPieChartAdvertiserPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpBarChartBrandChannel = (appliedFilters) =>
  postChart(payloads.grpBarChartBrandChannelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpBarChartBrandFirstLevel = (appliedFilters) =>
  postChart(payloads.grpBarChartBrandFirstLevelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpBarChartBrandTimeband = (appliedFilters) =>
  postChart(payloads.grpBarChartBrandTimebandPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getGrpPieChartAdvertiser = (appliedFilters) =>
  postChart(payloads.grpPieChartAdvertiserPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getReachBarChartBrandChannel = (appliedFilters) =>
  postChart(payloads.reachBarChartBrandChannelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getReachBarChartBrandFirstLevel = (appliedFilters) =>
  postChart(payloads.reachBarChartBrandFirstLevelPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getReachBarChartBrandTimeband = (appliedFilters) =>
  postChart(payloads.reachBarChartBrandTimebandPayload, appliedFilters, DISIBLE_EFFECTIVE);

export const getReachPieChartAdvertiser = (appliedFilters) =>
  postChart(payloads.reachPieChartAdvertiserPayload, appliedFilters, DISIBLE_EFFECTIVE);

// Tab Ad monitoring report

export const getAllTableChartMonitoring = (appliedFilters) =>
  postChart(payloads.allTableChartMonitoringPayload, appliedFilters, ['provinceFilters', 'regionalFilters', 'keyCityFilters']);

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