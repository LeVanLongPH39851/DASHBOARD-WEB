import axiosClient from './axiosClient';
import * as payloads from './payloads';
import { buildPayloadWithFilters } from './payloads/buildPayloadWithFilters';

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

export const getRatingPercentTrendNumberChart = (appliedFilters) =>
  postChart(payloads.ratingPercentTrendNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingNumberChart = (appliedFilters) =>
  postChart(payloads.ratingNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingPercentNumberChart = (appliedFilters) =>
  postChart(payloads.ratingPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachPercentNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAllTableChartChannel = (appliedFilters) =>
  postChart(payloads.allTableChartChannelPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAllTableChartChannelEvent = (appliedFilters) =>
  postChart(payloads.allTableChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingReachPercentTableChartRegional = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingReachPercentTableChartProvince = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartRegional = (appliedFilters) =>
  postChart(payloads.ratingBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.ratingBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartProvince = (appliedFilters) =>
  postChart(payloads.ratingBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingBarChartOthers = (appliedFilters) =>
  postChart(payloads.ratingBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartRegional = (appliedFilters) =>
  postChart(payloads.aveReachBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.aveReachBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartProvince = (appliedFilters) =>
  postChart(payloads.aveReachBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachBarChartOthers = (appliedFilters) =>
  postChart(payloads.aveReachBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingReachMixedChartDate = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartDatePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startTimeFilters'])

// Tab Channel

export const getRatingReachPercentMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachPercentMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingPercentLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachPercentTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingReachMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getAveReachLineChartTimebandRegional = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandRegionalPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

export const getRatingTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.ratingTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startTimeFilters'])

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
  postChart(payloads.ratingLineChartMinuteChannelPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startTimeFilters', 'programFilters'])

export const getRatingLineChartMinuteChannelOneDate = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelOneDatePayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startTimeFilters', 'overwriteChannelFilters', 'oneDateFilters'])

export const getRatingLineChartMinuteChannelDates = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelDatesPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startTimeFilters', 'overwriteChannelFilters'])

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)

export const getFilterProgram = (appliedFilters) =>
  postChart(payloads.filterProgramPayload, appliedFilters, ['allFilters'])