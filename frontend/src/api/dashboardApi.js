import axiosClient from './axiosClient';
import * as payloads from './payloads';
import { buildPayloadWithFilters } from './payloads/buildPayloadWithFilters';

const apiRoute = '/api/superset'

const postChart = (basePayload, appliedFilters, disibledFilters = []) => {
  const finalPayload = appliedFilters ? buildPayloadWithFilters(basePayload, appliedFilters, disibledFilters) : basePayload;
  return axiosClient.post(apiRoute, finalPayload);
};

export const getRatingPercentTrendNumberChart = (appendFilters) =>
  postChart(payloads.ratingPercentTrendNumberChartPayload, appendFilters)

export const getRatingNumberChart = (appliedFilters) =>
  postChart(payloads.ratingNumberChartPayload, appliedFilters)

export const getAveReachNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachNumberChartPayload, appliedFilters)

export const getRatingPercentNumberChart = (appendFilters) =>
  postChart(payloads.ratingPercentNumberChartPayload, appendFilters)

export const getAveReachPercentNumberChart = (appendFilters) =>
  postChart(payloads.aveReachPercentNumberChartPayload, appendFilters)

export const getRatingBarChartChannelEvent = (appendFilters) =>
  postChart(payloads.ratingBarChartChannelEventPayload, appendFilters)

export const getAveReachBarChartChannelEvent = (appendFilters) =>
  postChart(payloads.aveReachBarChartChannelEventPayload, appendFilters)

export const getRatingBarChartDayEvent = (appendFilters) =>
  postChart(payloads.ratingBarChartDayEventPayload, appendFilters)

export const getAveReachBarChartDayEvent = (appendFilters) =>
  postChart(payloads.aveReachBarChartDayEventPayload, appendFilters)

export const getAllTableChartChannel = (appendFilters) =>
  postChart(payloads.allTableChartChannelPayload, appendFilters)

export const getAllTableChartChannelEvent = (appendFilters) =>
  postChart(payloads.allTableChartChannelEventPayload, appendFilters)

export const getRatingReachPercentTableChartRegional = (appendFilters) =>
  postChart(payloads.ratingReachPercentTableChartRegionalPayload, appendFilters)

export const getRatingReachPercentTableChartProvince = (appendFilters) =>
  postChart(payloads.ratingReachPercentTableChartProvincePayload, appendFilters)

export const getRatingBarChartRegional = (appendFilters) =>
  postChart(payloads.ratingBarChartRegionalPayload, appendFilters)

export const getRatingBarChartKeyCity = (appendFilters) =>
  postChart(payloads.ratingBarChartKeyCityPayload, appendFilters)

export const getRatingBarChartProvince = (appendFilters) =>
  postChart(payloads.ratingBarChartProvincePayload, appendFilters)

export const getRatingBarChartOthers = (appendFilters) =>
  postChart(payloads.ratingBarChartOthersPayload, appendFilters)

export const getAveReachBarChartRegional = (appendFilters) =>
  postChart(payloads.aveReachBarChartRegionalPayload, appendFilters)

export const getAveReachBarChartKeyCity = (appendFilters) =>
  postChart(payloads.aveReachBarChartKeyCityPayload, appendFilters)

export const getAveReachBarChartProvince = (appendFilters) =>
  postChart(payloads.aveReachBarChartProvincePayload, appendFilters)

export const getAveReachBarChartOthers = (appendFilters) =>
  postChart(payloads.aveReachBarChartOthersPayload, appendFilters)

export const getRatingReachMixedChartDate = (appendFilters) =>
  postChart(payloads.ratingReachMixedChartDatePayload, appendFilters)

export const getRatingReachPercentMixedChartTimeband = (appendFilters) =>
  postChart(payloads.ratingReachPercentMixedChartTimebandPayload, appendFilters)

export const getRatingPercentLineChartTimebandChannel = (appendFilters) =>
  postChart(payloads.ratingPercentLineChartTimebandChannelPayload, appendFilters)

export const getAveReachPercentLineChartDateChannel = (appendFilters) =>
  postChart(payloads.aveReachPercentLineChartDateChannelPayload, appendFilters)

export const getRatingPercentLineChartDateChannel = (appendFilters) =>
  postChart(payloads.ratingPercentLineChartDateChannelPayload, appendFilters)

export const getAveReachPercentTreemapChartChannel = (appendFilters) =>
  postChart(payloads.aveReachPercentTreemapChartChannelPayload, appendFilters)

export const getRatingReachMixedChartTimeband = (appendFilters) =>
  postChart(payloads.ratingReachMixedChartTimebandPayload, appendFilters)

export const getRatingLineChartTimebandChannel = (appendFilters) =>
  postChart(payloads.ratingLineChartTimebandChannelPayload, appendFilters)

export const getAveReachLineChartTimebandChannel = (appendFilters) =>
  postChart(payloads.aveReachLineChartTimebandChannelPayload, appendFilters)

export const getRatingLineChartDateChannel = (appendFilters) =>
  postChart(payloads.ratingLineChartDateChannelPayload, appendFilters)

export const getAveReachLineChartDateChannel = (appendFilters) =>
  postChart(payloads.aveReachLineChartDateChannelPayload, appendFilters)

export const getRatingLineChartTimebandDay = (appendFilters) =>
  postChart(payloads.ratingLineChartTimebandDayPayload, appendFilters)

export const getAveReachLineChartTimebandDay = (appendFilters) =>
  postChart(payloads.aveReachLineChartTimebandDayPayload, appendFilters)

export const getAveReachLineChartTimebandRegional = (appendFilters) =>
  postChart(payloads.aveReachLineChartTimebandRegionalPayload, appendFilters)

export const getRatingTreemapChartChannel = (appendFilters) =>
  postChart(payloads.ratingTreemapChartChannelPayload, appendFilters)

export const getTotalEventDurationPieChartFirstLevel = (appendFilters) =>
  postChart(payloads.totalEventDurationPieChartFirstLevelPayload, appendFilters)

export const getTotalViewDurationPieChartFirstLevel = (appendFilters) =>
  postChart(payloads.totalViewDurationPieChartFirstLevelPayload, appendFilters)

export const getAllTableChartRank = (appendFilters) =>
  postChart(payloads.allTableChartRankPayload, appendFilters)

export const getAllTableChartDetail = (appendFilters) =>
  postChart(payloads.allTableChartDetailPayload, appendFilters)

export const getAllTableChartEvent = (appendFilters) =>
  postChart(payloads.allTableChartEventPayload, appendFilters)

export const getRatingLineChartMinuteChannel = (appendFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelPayload, appendFilters, ['eventFilters'])

export const getRatingLineChartMinuteChannelOneDate = (appendFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelOneDatePayload, appendFilters, ['eventFilters'])

export const getRatingLineChartMinuteChannelDates = (appendFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelDatesPayload, appendFilters, ['eventFilters'])

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)