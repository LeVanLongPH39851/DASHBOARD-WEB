import axiosClient from "./axiosClient";
import * as payloads from "./payload_vietnamtodays";
import { buildPayloadWithFilters } from "./payload_vietnamtodays/buildPayloadWithFilters";

const apiRoute = import.meta.env.VITE_API_ROUTE;

const copiedChartsDisabledFilters = [
  "timebandFilters",
  "firstLevelFilters",
  "programFilters",
  "startTimeFilters",
];

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

export const chart1065 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1065,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1027 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1027,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1091 = (appliedFilters, force = false) =>
  postChart(payloads.chart1091, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1108 = (appliedFilters, force = false) =>
  postChart(payloads.chart1108, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1107 = (appliedFilters, force = false) =>
  postChart(payloads.chart1107, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1105 = (appliedFilters, force = false) =>
  postChart(payloads.chart1105, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1104 = (appliedFilters, force = false) =>
  postChart(payloads.chart1104, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1103 = (appliedFilters, force = false) =>
  postChart(payloads.chart1103, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1090 = (appliedFilters, force = false) =>
  postChart(payloads.chart1090, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1102 = (appliedFilters, force = false) =>
  postChart(payloads.chart1102, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1097 = (appliedFilters, force = false) =>
  postChart(payloads.chart1097, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1093 = (appliedFilters, force = false) =>
  postChart(payloads.chart1093, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1092 = (appliedFilters, force = false) =>
  postChart(payloads.chart1092, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1109 = (appliedFilters, force = false) =>
  postChart(payloads.chart1109, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1208 = (appliedFilters, force = false) =>
  postChart(payloads.chart1208, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1211 = (appliedFilters, force = false) =>
  postChart(payloads.chart1211, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1205 = (appliedFilters, force = false) =>
  postChart(payloads.chart1205, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1212 = (appliedFilters, force = false) =>
  postChart(payloads.chart1212, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1088 = (appliedFilters, force = false) =>
  postChart(payloads.chart1088, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1079 = (appliedFilters, force = false) =>
  postChart(payloads.chart1079, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1086 = (appliedFilters, force = false) =>
  postChart(payloads.chart1086, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1087 = (appliedFilters, force = false) =>
  postChart(payloads.chart1087, appliedFilters, copiedChartsDisabledFilters, force);

export const chart1042 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1042,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1066 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1066,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1044 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1044,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1037 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1037,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1038 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1038,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1045 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1045,
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

export const chart1036 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1036,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1043 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1043,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1032 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1032,
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

export const chart1049 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1049,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1096 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1096,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1046 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1046,
    appliedFilters,
    [
      "timebandFilters",
      "firstLevelFilters",
      "programFilters",
      "startTimeFilters",
    ],
    force,
  );

export const chart1054 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1054,
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

export const chart1029 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1029,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1048 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1048,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1028 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1028,
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

export const chart1068 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1068,
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

export const chart1047 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1047,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1071 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1071,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1041 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1041,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

export const chart1040 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1040,
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

export const chart1094 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1094,
    appliedFilters,
    ["firstLevelFilters", "programFilters", "startTimeFilters"],
    force,
  );

// Tab Program

export const chart1082 = (appliedFilters, force = false) =>
  postChart(payloads.chart1082, appliedFilters, ["timebandFilters"], force);

export const chart1078 = (appliedFilters, force = false) =>
  postChart(payloads.chart1078, appliedFilters, ["timebandFilters"], force);

export const chart1052 = (appliedFilters, force = false) =>
  postChart(payloads.chart1052, appliedFilters, ["timebandFilters"], force);

export const chart1051 = (appliedFilters, force = false) =>
  postChart(payloads.chart1051, appliedFilters, ["timebandFilters"], force);

export const chart1050 = (appliedFilters, force = false) =>
  postChart(payloads.chart1050, appliedFilters, ["timebandFilters"], force);

export const chart1053 = (appliedFilters, force = false) =>
  postChart(payloads.chart1053, appliedFilters, ["timebandFilters"], force);

export const chart1210 = (appliedFilters, force = false) =>
  postChart(payloads.chart1210, appliedFilters, ["timebandFilters"], force);

export const chart1209 = (appliedFilters, force = false) =>
  postChart(payloads.chart1209, appliedFilters, ["timebandFilters"], force);

export const chart1095 = (appliedFilters, force = false) =>
  postChart(payloads.chart1095, appliedFilters, ["timebandFilters"], force);

// Tab Rating By Minute

export const chart1070 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1070,
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

export const chart1069 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1069,
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

export const chart1055 = (appliedFilters, force = false) =>
  postChart(
    payloads.chart1055,
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

export const chart1056 = (appliedFilters, force = false) =>
  postChart(payloads.chart1056, appliedFilters, ["timebandFilters"], force);

export const chart1057 = (appliedFilters, force = false) =>
  postChart(payloads.chart1057, appliedFilters, ["timebandFilters"], force);

export const chart1058 = (appliedFilters, force = false) =>
  postChart(payloads.chart1058, appliedFilters, ["timebandFilters"], force);

export const chart1059 = (appliedFilters, force = false) =>
  postChart(payloads.chart1059, appliedFilters, ["timebandFilters"], force);

export const chart1060 = (appliedFilters, force = false) =>
  postChart(payloads.chart1060, appliedFilters, ["timebandFilters"], force);

export const chart1061 = (appliedFilters, force = false) =>
  postChart(payloads.chart1061, appliedFilters, ["timebandFilters"], force);

export const chart1062 = (appliedFilters, force = false) =>
  postChart(payloads.chart1062, appliedFilters, ["timebandFilters"], force);

export const chart1063 = (appliedFilters, force = false) =>
  postChart(payloads.chart1063, appliedFilters, ["timebandFilters"], force);

export const chart1064 = (appliedFilters, force = false) =>
  postChart(payloads.chart1064, appliedFilters, ["timebandFilters"], force);

export const chart1067 = (appliedFilters, force = false) =>
  postChart(payloads.chart1067, appliedFilters, ["timebandFilters"], force);

export const chart1213 = (appliedFilters, force = false) =>
  postChart(payloads.chart1213, appliedFilters, ["timebandFilters"], force);

export const chart1214 = (appliedFilters, force = false) =>
  postChart(payloads.chart1214, appliedFilters, ["timebandFilters"], force);

export const chart1215 = (appliedFilters, force = false) =>
  postChart(payloads.chart1215, appliedFilters, ["timebandFilters"], force);

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
