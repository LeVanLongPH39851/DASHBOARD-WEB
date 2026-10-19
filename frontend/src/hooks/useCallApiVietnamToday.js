import { useApi } from "./useApi";
import * as getChart from "../api/dashboardApiVietnamToday";
import {
  useDashboardFilters,
  useDashboardCrossFilters,
} from "../context/DashboardFilterContext";

const createChartHook =
  (apiFn, keyMain = "") =>
  () => {
    const { appliedFilters } = useDashboardFilters();
    const { crossFilters } = useDashboardCrossFilters();

    const shouldSkip =
      crossFilters?.skipNext === keyMain ||
      (crossFilters?.main && keyMain === crossFilters.main);

    // Only pass appliedFilters to useApi, not crossFilters
    // crossFilters is only used for shouldSkip logic
    return useApi(apiFn, [appliedFilters], { shouldSkip });
  };

export const useChart1075 = () => createChartHook(getChart.chart1075)();

export const useChart1085 = () => createChartHook(getChart.chart1085)();

export const useChart1076 = () => createChartHook(getChart.chart1076)();

export const useChart1074 = () => createChartHook(getChart.chart1074)();

export const useChart1073 = () => createChartHook(getChart.chart1073)();

export const useChart1065 = () =>
  createChartHook(getChart.chart1065, "chart1065Data")();

export const useChart1027 = () =>
  createChartHook(getChart.chart1027, "chart1027Data")();

export const useChart1091 = () =>
  createChartHook(getChart.chart1091, "chart1091Data")();

export const useChart1108 = () =>
  createChartHook(getChart.chart1108, "chart1108Data")();

export const useChart1107 = () =>
  createChartHook(getChart.chart1107, "chart1107Data")();

export const useChart1105 = () =>
  createChartHook(getChart.chart1105, "chart1105Data")();

export const useChart1104 = () =>
  createChartHook(getChart.chart1104, "chart1104Data")();

export const useChart1103 = () =>
  createChartHook(getChart.chart1103, "chart1103Data")();

export const useChart1090 = () =>
  createChartHook(getChart.chart1090, "chart1090Data")();

export const useChart1102 = () =>
  createChartHook(getChart.chart1102, "chart1102Data")();

export const useChart1097 = () =>
  createChartHook(getChart.chart1097, "chart1097Data")();

export const useChart1093 = () =>
  createChartHook(getChart.chart1093, "chart1093Data")();

export const useChart1092 = () =>
  createChartHook(getChart.chart1092, "chart1092Data")();

export const useChart1109 = () =>
  createChartHook(getChart.chart1109, "chart1109Data")();

export const useChart1208 = () =>
  createChartHook(getChart.chart1208, "chart1208Data")();

export const useChart1211 = () =>
  createChartHook(getChart.chart1211, "chart1211Data")();

export const useChart1205 = () =>
  createChartHook(getChart.chart1205, "chart1205Data")();

export const useChart1212 = () =>
  createChartHook(getChart.chart1212, "chart1212Data")();

export const useChart1088 = () =>
  createChartHook(getChart.chart1088, "chart1088Data")();

export const useChart1079 = () =>
  createChartHook(getChart.chart1079, "chart1079Data")();

export const useChart1086 = () =>
  createChartHook(getChart.chart1086, "chart1086Data")();

export const useChart1087 = () =>
  createChartHook(getChart.chart1087, "chart1087Data")();

export const useChart1042 = () =>
  createChartHook(getChart.chart1042, "chart1042Data")();

export const useChart1066 = () =>
  createChartHook(getChart.chart1066, "chart1066Data")();

export const useChart1044 = () =>
  createChartHook(getChart.chart1044, "chart1044Data")();

export const useChart1037 = () =>
  createChartHook(getChart.chart1037, "chart1037Data")();

export const useChart1038 = () =>
  createChartHook(getChart.chart1038, "chart1038Data")();

export const useChart1045 = () =>
  createChartHook(getChart.chart1045, "chart1045Data")();

export const useChart1084 = () =>
  createChartHook(getChart.chart1084, "chart1084Data")();

export const useChart1036 = () =>
  createChartHook(getChart.chart1036, "chart1036Data")();

export const useChart1043 = () =>
  createChartHook(getChart.chart1043, "chart1043Data")();

export const useChart1032 = () => createChartHook(getChart.chart1032)();

export const useChart1072 = () =>
  createChartHook(getChart.chart1072, "chart1072Data")();

export const useChart1049 = () =>
  createChartHook(getChart.chart1049, "chart1049Data")();

export const useChart1096 = () =>
  createChartHook(getChart.chart1096, "chart1096Data")();

export const useChart1046 = () => createChartHook(getChart.chart1046)();

export const useChart1054 = () => createChartHook(getChart.chart1054)();

export const useChart1081 = () => createChartHook(getChart.chart1081)();

export const useChart1077 = () =>
  createChartHook(getChart.chart1077, "chart1077Data")();

export const useChart1029 = () =>
  createChartHook(getChart.chart1029, "chart1029Data")();

export const useChart1048 = () =>
  createChartHook(getChart.chart1048, "chart1048Data")();

export const useChart1028 = () =>
  createChartHook(getChart.chart1028, "chart1028Data")();

export const useChart1080 = () => createChartHook(getChart.chart1080)();

export const useChart1068 = () =>
  createChartHook(getChart.chart1068, "chart1068Data")();

export const useChart1083 = () =>
  createChartHook(getChart.chart1083, "chart1083Data")();

export const useChart1047 = () =>
  createChartHook(getChart.chart1047, "chart1047Data")();

export const useChart1071 = () =>
  createChartHook(getChart.chart1071, "chart1071Data")();

export const useChart1041 = () => createChartHook(getChart.chart1041)();

export const useChart1040 = () => createChartHook(getChart.chart1040)();

export const useChart1089 = () =>
  createChartHook(getChart.chart1089, "chart1089Data")();

export const useChart1094 = () =>
  createChartHook(getChart.chart1094, "chart1094Data")();

export const useChart1082 = () =>
  createChartHook(getChart.chart1082, "chart1082Data")();

export const useChart1078 = () => createChartHook(getChart.chart1078)();

export const useChart1052 = () =>
  createChartHook(getChart.chart1052, "chart1052Data")();

export const useChart1051 = () =>
  createChartHook(getChart.chart1051, "chart1051Data")();

export const useChart1050 = () =>
  createChartHook(getChart.chart1050, "chart1050Data")();

export const useChart1053 = () =>
  createChartHook(getChart.chart1053, "chart1053Data")();

export const useChart1210 = () =>
  createChartHook(getChart.chart1210, "chart1210Data")();

export const useChart1209 = () =>
  createChartHook(getChart.chart1209, "chart1209Data")();

export const useChart1095 = () =>
  createChartHook(getChart.chart1095, "chart1095Data")();

export const useChart1070 = () =>
  createChartHook(getChart.chart1070, "chart1070Data")();

export const useChart1069 = () =>
  createChartHook(getChart.chart1069, "chart1069Data")();

export const useChart1055 = () => createChartHook(getChart.chart1055)();

export const useChart1056 = () =>
  createChartHook(getChart.chart1056, "chart1056Data")();

export const useChart1057 = () =>
  createChartHook(getChart.chart1057, "chart1057Data")();

export const useChart1058 = () =>
  createChartHook(getChart.chart1058, "chart1058Data")();

export const useChart1059 = () =>
  createChartHook(getChart.chart1059, "chart1059Data")();

export const useChart1060 = () =>
  createChartHook(getChart.chart1060, "chart1060Data")();

export const useChart1061 = () =>
  createChartHook(getChart.chart1061, "chart1061Data")();

export const useChart1062 = () =>
  createChartHook(getChart.chart1062, "chart1062Data")();

export const useChart1063 = () =>
  createChartHook(getChart.chart1063, "chart1063Data")();

export const useChart1064 = () =>
  createChartHook(getChart.chart1064, "chart1064Data")();

export const useChart1067 = () =>
  createChartHook(getChart.chart1067, "chart1067Data")();

export const useChart1213 = () =>
  createChartHook(getChart.chart1213, "chart1213Data")();

export const useChart1214 = () =>
  createChartHook(getChart.chart1214, "chart1214Data")();

export const useChart1215 = () =>
  createChartHook(getChart.chart1215, "chart1215Data")();

export const useChart1124 = () =>
  createChartHook(getChart.chart1124, "chart1124Data")();

export const useMaxInsertReturnApi = () => {
  return useApi(getChart.getMaxInsert);
};

export const useFilterCountryReturnApi = () => {
  return useApi(getChart.getFilterCountry);
};

export const useFilterSourceReturnApi = () => {
  return useApi(getChart.getFilterSource);
};
