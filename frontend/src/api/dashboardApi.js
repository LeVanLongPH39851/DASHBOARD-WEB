import axiosClient from './axiosClient';
import * as payloads from './payloads';
import { buildPayloadWithFilters } from './payloads/buildPayloadWithFilters';

const apiRoute = import.meta.env.VITE_API_ROUTE;

const postChart = (basePayload, appliedFilters, disibledFilters = []) => {
  const finalPayload = appliedFilters ? buildPayloadWithFilters(basePayload, appliedFilters, disibledFilters) : basePayload;
  return axiosClient.post(apiRoute, finalPayload);
};

// Tab Overview

export const getRatingPercentTrendNumberChart = (appliedFilters) =>
  postChart(payloads.ratingPercentTrendNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingNumberChart = (appliedFilters) =>
  postChart(payloads.ratingNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingPercentNumberChart = (appliedFilters) =>
  postChart(payloads.ratingPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachPercentNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAllTableChartChannel = (appliedFilters) =>
  postChart(payloads.allTableChartChannelPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAllTableChartChannelEvent = (appliedFilters) =>
  postChart(payloads.allTableChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingReachPercentTableChartRegional = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingReachPercentTableChartProvince = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartRegional = (appliedFilters) =>
  postChart(payloads.ratingBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.ratingBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartProvince = (appliedFilters) =>
  postChart(payloads.ratingBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingBarChartOthers = (appliedFilters) =>
  postChart(payloads.ratingBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartRegional = (appliedFilters) =>
  postChart(payloads.aveReachBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.aveReachBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartProvince = (appliedFilters) =>
  postChart(payloads.aveReachBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getAveReachBarChartOthers = (appliedFilters) =>
  postChart(payloads.aveReachBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

export const getRatingReachMixedChartDate = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartDatePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters'])

// Tab Channel

export const getRatingReachPercentMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachPercentMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingPercentLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachPercentTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingReachMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters'])

export const getAveReachLineChartTimebandRegional = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandRegionalPayload, appliedFilters, ['firstLevelFilters'])

export const getRatingTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.ratingTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters'])

// Tab Program

export const getTotalEventDurationPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.totalEventDurationPieChartFirstLevelPayload, appliedFilters, ['timebandFilters'])

export const getTotalViewDurationPieChartFirstLevel = (appliedFilters) =>
  postChart(payloads.totalViewDurationPieChartFirstLevelPayload, appliedFilters, ['timebandFilters'])

export const getAllTableChartRank = (appliedFilters) =>
  postChart(payloads.allTableChartRankPayload, appliedFilters, ['timebandFilters'])

export const getAllTableChartDetail = (appliedFilters) =>
  postChart(payloads.allTableChartDetailPayload, appliedFilters, ['timebandFilters'])

export const getAllTableChartEvent = (appliedFilters) =>
  postChart(payloads.allTableChartEventPayload, appliedFilters, ['timebandFilters'])

// Tab Rating By Minute

export const getRatingLineChartMinuteChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters'])

export const getRatingLineChartMinuteChannelOneDate = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelOneDatePayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters'])

export const getRatingLineChartMinuteChannelDates = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelDatesPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters'])

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)