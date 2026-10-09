import axiosClient from "./axiosClient";
import * as payloads from "./payload_vietnamtodays";
import { buildPayloadWithFilters } from "./payload_vietnamtodays/buildPayloadWithFilters";

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

export const chart1075 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1075,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1085 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1085,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1076 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1076,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1074 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1074,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1073 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1073,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart628 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart628,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart627 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart627,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart630 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart630,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart629 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart629,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart639 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart639,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart640 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart640,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart647 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart647,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart646 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart646,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1084 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1084,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart656 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart656,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart655 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart655,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart657 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart657,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1072 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1072,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart651 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart651,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart653 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart653,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart654 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart654,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart673 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart673,
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

export const chart1081 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1081,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1077 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1077,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart633 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart633,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart642 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart642,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart632 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart632,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1080 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1080,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart634 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart634,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1083 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1083,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart635 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart635,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart677 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart677,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart666 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart666,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart665 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart665,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1089 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1089,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart636 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart636,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

// Tab Program

export const chart1082 = (appliedFilters, force = false) =>
  postChart(payloads.chart1082, appliedFilters, ["timebandFilters"], force);

export const chart1078 = (appliedFilters, force = false) =>
  postChart(payloads.chart1078, appliedFilters, ["timebandFilters"], force);

export const chart669 = (appliedFilters, force = false) =>
  postChart(payloads.chart669, appliedFilters, ["timebandFilters"], force);

export const chart670 = (appliedFilters, force = false) =>
  postChart(payloads.chart670, appliedFilters, ["timebandFilters"], force);

export const chart671 = (appliedFilters, force = false) =>
  postChart(payloads.chart671, appliedFilters, ["timebandFilters"], force);

export const chart672 = (appliedFilters, force = false) =>
  postChart(payloads.chart672, appliedFilters, ["timebandFilters"], force);

export const chart1210 = (appliedFilters, force = false) =>
  postChart(payloads.chart1210, appliedFilters, ["timebandFilters"], force);

export const chart1209 = (appliedFilters, force = false) =>
  postChart(payloads.chart1209, appliedFilters, ["timebandFilters"], force);

export const chart645 = (appliedFilters, force = false) =>
  postChart(payloads.chart645, appliedFilters, ["timebandFilters"], force);

// Tab Rating By Minute

export const chart680 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart680,
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

export const chart678 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart678,
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

export const chart681 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart681,
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

export const getFilterProgram = () => {
  const userId = sessionStorage.getItem("user_id");
  return axiosClient.post(apiRoute, {
    ...payloads.filterProgramPayload,
    user_id: userId,
  });
};
