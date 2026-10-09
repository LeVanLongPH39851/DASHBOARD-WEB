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

export const useChart628 = () =>
  createChartHook(getChart.chart628, "chart628Data")();

export const useChart627 = () =>
  createChartHook(getChart.chart627, "chart627Data")();

export const useChart630 = () =>
  createChartHook(getChart.chart630, "chart630Data")();

export const useChart629 = () =>
  createChartHook(getChart.chart629, "chart629Data")();

export const useChart639 = () =>
  createChartHook(getChart.chart639, "chart639Data")();

export const useChart640 = () =>
  createChartHook(getChart.chart640, "chart640Data")();

export const useChart647 = () =>
  createChartHook(getChart.chart647, "chart647Data")();

export const useChart646 = () =>
  createChartHook(getChart.chart646, "chart646Data")();

export const useChart1084 = () =>
  createChartHook(getChart.chart1084, "chart1084Data")();

export const useChart656 = () =>
  createChartHook(getChart.chart656, "chart656Data")();

export const useChart655 = () =>
  createChartHook(getChart.chart655, "chart655Data")();

export const useChart657 = () => createChartHook(getChart.chart657)();

export const useChart1072 = () =>
  createChartHook(getChart.chart1072, "chart1072Data")();

export const useChart651 = () =>
  createChartHook(getChart.chart651, "chart651Data")();

export const useChart653 = () =>
  createChartHook(getChart.chart653, "chart653Data")();

export const useChart654 = () => createChartHook(getChart.chart654)();

export const useChart673 = () => createChartHook(getChart.chart673)();

export const useChart1081 = () => createChartHook(getChart.chart1081)();

export const useChart1077 = () =>
  createChartHook(getChart.chart1077, "chart1077Data")();

export const useChart633 = () =>
  createChartHook(getChart.chart633, "chart633Data")();

export const useChart642 = () =>
  createChartHook(getChart.chart642, "chart642Data")();

export const useChart632 = () =>
  createChartHook(getChart.chart632, "chart632Data")();

export const useChart1080 = () => createChartHook(getChart.chart1080)();

export const useChart634 = () =>
  createChartHook(getChart.chart634, "chart634Data")();

export const useChart1083 = () =>
  createChartHook(getChart.chart1083, "chart1083Data")();

export const useChart635 = () =>
  createChartHook(getChart.chart635, "chart635Data")();

export const useChart677 = () =>
  createChartHook(getChart.chart677, "chart677Data")();

export const useChart666 = () => createChartHook(getChart.chart666)();

export const useChart665 = () => createChartHook(getChart.chart665)();

export const useChart1089 = () =>
  createChartHook(getChart.chart1089, "chart1089Data")();

export const useChart636 = () =>
  createChartHook(getChart.chart636, "chart636Data")();

export const useChart1082 = () =>
  createChartHook(getChart.chart1082, "chart1082Data")();

export const useChart1078 = () => createChartHook(getChart.chart1078)();

export const useChart669 = () =>
  createChartHook(getChart.chart669, "chart669Data")();

export const useChart670 = () =>
  createChartHook(getChart.chart670, "chart670Data")();

export const useChart671 = () =>
  createChartHook(getChart.chart671, "chart671Data")();

export const useChart672 = () =>
  createChartHook(getChart.chart672, "chart672Data")();

export const useChart1210 = () =>
  createChartHook(getChart.chart1210, "chart1210Data")();

export const useChart1209 = () =>
  createChartHook(getChart.chart1209, "chart1209Data")();

export const useChart645 = () =>
  createChartHook(getChart.chart645, "chart645Data")();

export const useChart680 = () =>
  createChartHook(getChart.chart680, "chart680Data")();

export const useChart678 = () =>
  createChartHook(getChart.chart678, "chart678Data")();

export const useChart681 = () => createChartHook(getChart.chart681)();

export const useMaxInsertReturnApi = () => {
  return useApi(getChart.getMaxInsert);
};

export const useFilterProvinceReturnApi = () => {
  return useApi(getChart.getFilterProvince);
};

export const useFilterProgramReturnApi = () => {
  return useApi(getChart.getFilterProgram);
};
