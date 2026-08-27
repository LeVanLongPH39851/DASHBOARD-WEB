import axiosClient from "./axiosClient";
import * as payloads from "./payloads";
import { buildPayloadWithFilters } from "./payloads/buildPayloadWithFilters";

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

// Tab Overview

export const getRatingPercentTrendNumberChart = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingPercentTrendNumberChartPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingNumberChartPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachNumberChartPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingPercentNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingPercentNumberChartPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachPercentNumberChart = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachPercentNumberChartPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartChannelEvent = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartChannelEventPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartChannelEvent = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachBarChartChannelEventPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartDayEvent = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartDayEventPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartDayEvent = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachBarChartDayEventPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAllTableChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartChannelPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAllTableChartChannelEvent = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartChannelEventPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingReachPercentTableChartRegional = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachPercentTableChartRegionalPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingReachPercentTableChartProvince = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachPercentTableChartProvincePayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartRegional = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartRegionalPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartKeyCity = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartKeyCityPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartProvince = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartProvincePayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingBarChartOthers = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingBarChartOthersPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartRegional = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachBarChartRegionalPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartKeyCity = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachBarChartKeyCityPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartProvince = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachBarChartProvincePayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getAveReachBarChartOthers = (appliedFilters, force = false) =>
  postChart(
    payloads.aveReachBarChartOthersPayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const getRatingReachMixedChartDate = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingReachMixedChartDatePayload,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

// Tab Channel

export const getRatingReachPercentMixedChartTimeband = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachPercentMixedChartTimebandPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingPercentLineChartTimebandChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingPercentLineChartTimebandChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachPercentLineChartDateChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachPercentLineChartDateChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingPercentLineChartDateChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingPercentLineChartDateChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachPercentTreemapChartChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachPercentTreemapChartChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingReachMixedChartTimeband = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachMixedChartTimebandPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingLineChartTimebandChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingLineChartTimebandChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachLineChartTimebandChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachLineChartTimebandChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingLineChartDateChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingLineChartDateChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachLineChartDateChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachLineChartDateChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingLineChartTimebandDay = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingLineChartTimebandDayPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachLineChartTimebandDay = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachLineChartTimebandDayPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getAveReachLineChartTimebandRegional = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.aveReachLineChartTimebandRegionalPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const getRatingTreemapChartChannel = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingTreemapChartChannelPayload,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

// Tab Program

export const getTotalEventDurationPieChartFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.totalEventDurationPieChartFirstLevelPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getTotalViewDurationPieChartFirstLevel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.totalViewDurationPieChartFirstLevelPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getRatingReachTableChartRegional = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachTableChartRegionalPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getRatingReachTableChartKeyCity = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachTableChartKeyCityPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getRatingReachTableChartProvince = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingReachTableChartProvincePayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getRatingReachTableChartOthers = (appliedFilters, force = false) =>
  postChart(
    payloads.ratingReachTableChartOthersPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getAllTableChartRank = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartRankPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getAllTableChartDetail = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartDetailPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

export const getAllTableChartEvent = (appliedFilters, force = false) =>
  postChart(
    payloads.allTableChartEventPayload,
    appliedFilters,
    ["timebandFilters"],
    force,
  );

// Tab Rating By Minute

export const getRatingLineChartMinuteChannel = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingLineChartMinuteChannelPayload,
    appliedFilters,
    [
      "eventFilters",
      "timebandFilters",
      "firstLevelFilters",
      "startTimeFilters",
      "programFilters",
    ],
    force,
  );

export const getRatingLineChartMinuteChannelOneDate = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingLineChartMinuteChannelOneDatePayload,
    appliedFilters,
    [
      "eventFilters",
      "timebandFilters",
      "firstLevelFilters",
      "startTimeFilters",
      "overwriteChannelFilters",
      "oneDateFilters",
    ],
    force,
  );

export const getRatingLineChartMinuteChannelDates = (
  appliedFilters,
  force = false,
) =>
  postChart(
    payloads.ratingLineChartMinuteChannelDatesPayload,
    appliedFilters,
    [
      "eventFilters",
      "timebandFilters",
      "firstLevelFilters",
      "startTimeFilters",
      "overwriteChannelFilters",
    ],
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
