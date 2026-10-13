import { useCallback, useEffect, useRef } from "react";
import * as useCallApi from "./useCallApiVietnamToday";

const HOOKS = [
  {
    hook: useCallApi.useChart1075,
    dataKey: "chart1075Data",
  },
  {
    hook: useCallApi.useChart1085,
    dataKey: "chart1085Data",
  },
  {
    hook: useCallApi.useChart1076,
    dataKey: "chart1076Data",
  },
  {
    hook: useCallApi.useChart1074,
    dataKey: "chart1074Data",
  },
  {
    hook: useCallApi.useChart1073,
    dataKey: "chart1073Data",
  },
  {
    hook: useCallApi.useChart1065,
    dataKey: "chart1065Data",
  },
  {
    hook: useCallApi.useChart1027,
    dataKey: "chart1027Data",
  },
  {
    hook: useCallApi.useChart1091,
    dataKey: "chart1091Data",
  },
  {
    hook: useCallApi.useChart1108,
    dataKey: "chart1108Data",
  },
  {
    hook: useCallApi.useChart1107,
    dataKey: "chart1107Data",
  },
  {
    hook: useCallApi.useChart1105,
    dataKey: "chart1105Data",
  },
  {
    hook: useCallApi.useChart1104,
    dataKey: "chart1104Data",
  },
  {
    hook: useCallApi.useChart1103,
    dataKey: "chart1103Data",
  },
  {
    hook: useCallApi.useChart1090,
    dataKey: "chart1090Data",
  },
  {
    hook: useCallApi.useChart1102,
    dataKey: "chart1102Data",
  },
  {
    hook: useCallApi.useChart1097,
    dataKey: "chart1097Data",
  },
  {
    hook: useCallApi.useChart1093,
    dataKey: "chart1093Data",
  },
  {
    hook: useCallApi.useChart1092,
    dataKey: "chart1092Data",
  },
  {
    hook: useCallApi.useChart1109,
    dataKey: "chart1109Data",
  },
  {
    hook: useCallApi.useChart1208,
    dataKey: "chart1208Data",
  },
  {
    hook: useCallApi.useChart1211,
    dataKey: "chart1211Data",
  },
  {
    hook: useCallApi.useChart1205,
    dataKey: "chart1205Data",
  },
  {
    hook: useCallApi.useChart1212,
    dataKey: "chart1212Data",
  },
  {
    hook: useCallApi.useChart1088,
    dataKey: "chart1088Data",
  },
  {
    hook: useCallApi.useChart1079,
    dataKey: "chart1079Data",
  },
  {
    hook: useCallApi.useChart1086,
    dataKey: "chart1086Data",
  },
  {
    hook: useCallApi.useChart1087,
    dataKey: "chart1087Data",
  },
  {
    hook: useCallApi.useChart1042,
    dataKey: "chart1042Data",
  },
  {
    hook: useCallApi.useChart1066,
    dataKey: "chart1066Data",
  },
  {
    hook: useCallApi.useChart1044,
    dataKey: "chart1044Data",
  },
  {
    hook: useCallApi.useChart1037,
    dataKey: "chart1037Data",
  },
  {
    hook: useCallApi.useChart1038,
    dataKey: "chart1038Data",
  },
  {
    hook: useCallApi.useChart1045,
    dataKey: "chart1045Data",
  },
  {
    hook: useCallApi.useChart1084,
    dataKey: "chart1084Data",
  },
  {
    hook: useCallApi.useChart1036,
    dataKey: "chart1036Data",
  },
  {
    hook: useCallApi.useChart1043,
    dataKey: "chart1043Data",
  },
  {
    hook: useCallApi.useChart1032,
    dataKey: "chart1032Data",
  },
  {
    hook: useCallApi.useChart1072,
    dataKey: "chart1072Data",
  },
  {
    hook: useCallApi.useChart1049,
    dataKey: "chart1049Data",
  },
  {
    hook: useCallApi.useChart1096,
    dataKey: "chart1096Data",
  },
  {
    hook: useCallApi.useChart1046,
    dataKey: "chart1046Data",
  },
  {
    hook: useCallApi.useChart1054,
    dataKey: "chart1054Data",
  },
  {
    hook: useCallApi.useChart1081,
    dataKey: "chart1081Data",
  },
  {
    hook: useCallApi.useChart1077,
    dataKey: "chart1077Data",
  },
  {
    hook: useCallApi.useChart1029,
    dataKey: "chart1029Data",
  },
  {
    hook: useCallApi.useChart1048,
    dataKey: "chart1048Data",
  },
  {
    hook: useCallApi.useChart1028,
    dataKey: "chart1028Data",
  },
  {
    hook: useCallApi.useChart1080,
    dataKey: "chart1080Data",
  },
  {
    hook: useCallApi.useChart1068,
    dataKey: "chart1068Data",
  },
  {
    hook: useCallApi.useChart1083,
    dataKey: "chart1083Data",
  },
  {
    hook: useCallApi.useChart1047,
    dataKey: "chart1047Data",
  },
  {
    hook: useCallApi.useChart1071,
    dataKey: "chart1071Data",
  },
  {
    hook: useCallApi.useChart1041,
    dataKey: "chart1041Data",
  },
  {
    hook: useCallApi.useChart1040,
    dataKey: "chart1040Data",
  },
  {
    hook: useCallApi.useChart1089,
    dataKey: "chart1089Data",
  },
  {
    hook: useCallApi.useChart1094,
    dataKey: "chart1094Data",
  },
  {
    hook: useCallApi.useChart1082,
    dataKey: "chart1082Data",
  },
  {
    hook: useCallApi.useChart1078,
    dataKey: "chart1078Data",
  },
  {
    hook: useCallApi.useChart1052,
    dataKey: "chart1052Data",
  },
  {
    hook: useCallApi.useChart1051,
    dataKey: "chart1051Data",
  },
  {
    hook: useCallApi.useChart1050,
    dataKey: "chart1050Data",
  },
  {
    hook: useCallApi.useChart1053,
    dataKey: "chart1053Data",
  },
  {
    hook: useCallApi.useChart1056,
    dataKey: "chart1056Data",
  },
  {
    hook: useCallApi.useChart1057,
    dataKey: "chart1057Data",
  },
  {
    hook: useCallApi.useChart1210,
    dataKey: "chart1210Data",
  },
  {
    hook: useCallApi.useChart1209,
    dataKey: "chart1209Data",
  },
  {
    hook: useCallApi.useChart1095,
    dataKey: "chart1095Data",
  },
  {
    hook: useCallApi.useChart1070,
    dataKey: "chart1070Data",
  },
  {
    hook: useCallApi.useChart1069,
    dataKey: "chart1069Data",
  },
  {
    hook: useCallApi.useChart1055,
    dataKey: "chart1055Data",
  },
  {
    hook: useCallApi.useChart1062,
    dataKey: "chart1062Data",
  },
  {
    hook: useCallApi.useChart1063,
    dataKey: "chart1063Data",
  },
  {
    hook: useCallApi.useChart1064,
    dataKey: "chart1064Data",
  },
  {
    hook: useCallApi.useChart1059,
    dataKey: "chart1059Data",
  },
  {
    hook: useCallApi.useChart1060,
    dataKey: "chart1060Data",
  },
  {
    hook: useCallApi.useChart1061,
    dataKey: "chart1061Data",
  },
  {
    hook: useCallApi.useChart1213,
    dataKey: "chart1213Data",
  },
  {
    hook: useCallApi.useChart1214,
    dataKey: "chart1214Data",
  },
  {
    hook: useCallApi.useChart1215,
    dataKey: "chart1215Data",
  },
  {
    hook: useCallApi.useChart1067,
    dataKey: "chart1067Data",
  },
  {
    hook: useCallApi.useChart1058,
    dataKey: "chart1058Data",
  },
  { hook: useCallApi.useMaxInsertReturnApi, dataKey: "maxInsertData" },
  {
    hook: useCallApi.useFilterProvinceReturnApi,
    dataKey: "filterProvinceData",
  },
  { hook: useCallApi.useFilterProgramReturnApi, dataKey: "filterProgramData" },
];

export const useDashboardData = () => {
  // console.log("useDashboardData");

  const hookResults = HOOKS.map(({ hook }) => hook());
  const hasLoggedRef = useRef(false);

  const data = {};
  const isLoading = {};
  const hasError = {};
  const refetchMap = {};

  HOOKS.forEach(({ dataKey }, index) => {
    data[dataKey] = hookResults[index].data;
    isLoading[dataKey] = hookResults[index].loading;
    hasError[dataKey] = hookResults[index].error;
    refetchMap[dataKey] = hookResults[index].refetch;
  });

  const anyLoading = Object.values(isLoading).some(Boolean);
  const allDataLoaded = Object.values(data).every((value) => value != null);

  useEffect(() => {
    if (!hasLoggedRef.current && allDataLoaded && !anyLoading) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      hasLoggedRef.current = true;
    }
  }, [allDataLoaded, anyLoading]);

  const refetch = (key) => {
    if (!refetchMap[key]) {
      console.warn(`Không tìm thấy API với key: ${key}`);
      return Promise.resolve(null);
    }
    return refetchMap[key](true).catch((err) => {
      console.error(`Lỗi khi refetch ${key}:`, err);
      return null;
    });
  };

  return {
    ...data,
    isLoading,
    hasError,
    refetch,
  };
};
