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
  postChart(payloads.ratingPercentTrendNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingNumberChart = (appliedFilters) =>
  postChart(payloads.ratingNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingPercentNumberChart = (appliedFilters) =>
  postChart(payloads.ratingPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachPercentNumberChart = (appliedFilters) =>
  postChart(payloads.aveReachPercentNumberChartPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartChannelEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.ratingBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartDayEvent = (appliedFilters) =>
  postChart(payloads.aveReachBarChartDayEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAllTableChartChannel = (appliedFilters) =>
  postChart(payloads.allTableChartChannelPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAllTableChartChannelEvent = (appliedFilters) =>
  postChart(payloads.allTableChartChannelEventPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingReachPercentTableChartRegional = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingReachPercentTableChartProvince = (appliedFilters) =>
  postChart(payloads.ratingReachPercentTableChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartRegional = (appliedFilters) =>
  postChart(payloads.ratingBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.ratingBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartProvince = (appliedFilters) =>
  postChart(payloads.ratingBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingBarChartOthers = (appliedFilters) =>
  postChart(payloads.ratingBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartRegional = (appliedFilters) =>
  postChart(payloads.aveReachBarChartRegionalPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartKeyCity = (appliedFilters) =>
  postChart(payloads.aveReachBarChartKeyCityPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartProvince = (appliedFilters) =>
  postChart(payloads.aveReachBarChartProvincePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachBarChartOthers = (appliedFilters) =>
  postChart(payloads.aveReachBarChartOthersPayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingReachMixedChartDate = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartDatePayload, appliedFilters, ['timebandFilters', 'firstLevelFilters', 'programFilters', 'startHourFilters'])

// Tab Channel

export const getRatingReachPercentMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachPercentMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingPercentLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingPercentLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingPercentLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachPercentTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.aveReachPercentTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingReachMixedChartTimeband = (appliedFilters) =>
  postChart(payloads.ratingReachMixedChartTimebandPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachLineChartTimebandChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.ratingLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachLineChartDateChannel = (appliedFilters) =>
  postChart(payloads.aveReachLineChartDateChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.ratingLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachLineChartTimebandDay = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandDayPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getAveReachLineChartTimebandRegional = (appliedFilters) =>
  postChart(payloads.aveReachLineChartTimebandRegionalPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

export const getRatingTreemapChartChannel = (appliedFilters) =>
  postChart(payloads.ratingTreemapChartChannelPayload, appliedFilters, ['firstLevelFilters', 'programFilters', 'startHourFilters'])

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
  postChart(payloads.ratingLineChartMinuteChannelPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startHourFilters'])

export const getRatingLineChartMinuteChannelOneDate = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelOneDatePayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startHourFilters'])

export const getRatingLineChartMinuteChannelDates = (appliedFilters) =>
  postChart(payloads.ratingLineChartMinuteChannelDatesPayload, appliedFilters, ['eventFilters', 'timebandFilters', 'firstLevelFilters', 'startHourFilters'])

export const getFilterProvince = () =>
  axiosClient.post(apiRoute, payloads.filterProvincePayload)

export const getFilterProgram = (appliedFilters) =>
  postChart(payloads.filterProgramPayload, appliedFilters, ['allFilters'])