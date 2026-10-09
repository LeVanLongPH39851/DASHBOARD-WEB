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
    hook: useCallApi.useChart628,
    dataKey: "chart628Data",
  },
  {
    hook: useCallApi.useChart627,
    dataKey: "chart627Data",
  },
  {
    hook: useCallApi.useChart630,
    dataKey: "chart630Data",
  },
  {
    hook: useCallApi.useChart629,
    dataKey: "chart629Data",
  },
  {
    hook: useCallApi.useChart639,
    dataKey: "chart639Data",
  },
  {
    hook: useCallApi.useChart640,
    dataKey: "chart640Data",
  },
  {
    hook: useCallApi.useChart647,
    dataKey: "chart647Data",
  },
  {
    hook: useCallApi.useChart646,
    dataKey: "chart646Data",
  },
  {
    hook: useCallApi.useChart1084,
    dataKey: "chart1084Data",
  },
  {
    hook: useCallApi.useChart656,
    dataKey: "chart656Data",
  },
  {
    hook: useCallApi.useChart655,
    dataKey: "chart655Data",
  },
  {
    hook: useCallApi.useChart657,
    dataKey: "chart657Data",
  },
  {
    hook: useCallApi.useChart1072,
    dataKey: "chart1072Data",
  },
  {
    hook: useCallApi.useChart651,
    dataKey: "chart651Data",
  },
  {
    hook: useCallApi.useChart653,
    dataKey: "chart653Data",
  },
  {
    hook: useCallApi.useChart654,
    dataKey: "chart654Data",
  },
  {
    hook: useCallApi.useChart673,
    dataKey: "chart673Data",
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
    hook: useCallApi.useChart633,
    dataKey: "chart633Data",
  },
  {
    hook: useCallApi.useChart642,
    dataKey: "chart642Data",
  },
  {
    hook: useCallApi.useChart632,
    dataKey: "chart632Data",
  },
  {
    hook: useCallApi.useChart1080,
    dataKey: "chart1080Data",
  },
  {
    hook: useCallApi.useChart634,
    dataKey: "chart634Data",
  },
  {
    hook: useCallApi.useChart1083,
    dataKey: "chart1083Data",
  },
  {
    hook: useCallApi.useChart635,
    dataKey: "chart635Data",
  },
  {
    hook: useCallApi.useChart677,
    dataKey: "chart677Data",
  },
  {
    hook: useCallApi.useChart666,
    dataKey: "chart666Data",
  },
  {
    hook: useCallApi.useChart665,
    dataKey: "chart665Data",
  },
  {
    hook: useCallApi.useChart1089,
    dataKey: "chart1089Data",
  },
  {
    hook: useCallApi.useChart636,
    dataKey: "chart636Data",
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
    hook: useCallApi.useChart669,
    dataKey: "chart669Data",
  },
  {
    hook: useCallApi.useChart670,
    dataKey: "chart670Data",
  },
  {
    hook: useCallApi.useChart671,
    dataKey: "chart671Data",
  },
  {
    hook: useCallApi.useChart672,
    dataKey: "chart672Data",
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
    hook: useCallApi.useChart645,
    dataKey: "chart645Data",
  },
  {
    hook: useCallApi.useChart680,
    dataKey: "chart680Data",
  },
  {
    hook: useCallApi.useChart678,
    dataKey: "chart678Data",
  },
  {
    hook: useCallApi.useChart681,
    dataKey: "chart681Data",
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
