import { useEffect, useState, useMemo, useCallback } from "react";
import NumberCard from "../components/charts/NumberCard";
import Filter from "../components/layouts/filters/Filter";
import { METRIC_SPOTS } from "../utils/metricInfor";
import { CUSTOM_CHART } from "../utils/customChart";
import { formatNumber } from "../utils/formatNumber";
import { transformBarChartData } from "../utils/transformApiBartChart";
import BarChart from "../components/charts/BarChart";
import { useDashboardData } from "../hooks/useDashboardDataSpot";
import ChildTabs from "../components/layouts/components/ChildTabs";
import { CUSTOM_TAB } from "../utils/customTab";
import TableChart from "../components/charts/TableChart";
import { transformTableChartData } from "../utils/transformApiTableChart";
import MixedChart from "../components/charts/MixedChart";
import { transformMixedChartData } from "../utils/transformApiMixedChart";
import ParentTabs from "../components/layouts/components/ParentTabs";
import LineChart from "../components/charts/LineChart";
import NormalTabs from "../components/layouts/components/NormalTabs";
import { transformTreeMapData } from "../utils/transformApiTreeMapChart";
import TreeMapChart from "../components/charts/TreeMapChart";
import PieChart from "../components/charts/PieChart";
import { transformPieChartData } from "../utils/transfromApiPieChart";
import Footer from "../components/layouts/footers/Footer";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
import Header from "../components/layouts/headers/Header";
import BreadCrumb from "../components/layouts/headers/BreadCrumb";
import InforTab from "../components/layouts/headers/InforTab";
import InforFilter from "../components/layouts/headers/InforFilter";
import {
  useDarkMode,
  useIsOpen,
  useScreenMd,
  useHorizontal,
} from "../context/DashboardFilterContext";
import NumberWithTrendChart from "../components/charts/NumberWithTrendChart";
import NameChart from "../components/layouts/components/NameChart";
import { transformNumberWithTrendData } from "../utils/transfromApiNumberWithTrendChart";
import iconOverview from "../assets/icon_overview.png";
import iconChannel from "../assets/icon_channel.png";
import iconProgram from "../assets/icon_program.png";
import iconRatingByMinute from "../assets/icon_rating_by_minute.png";
import iconOverviewDark from "../assets/icon_overview_dark.png";
import iconChannelDark from "../assets/icon_channel_dark.png";
import iconProgramDark from "../assets/icon_program_dark.png";
import iconRatingByMinuteDark from "../assets/icon_rating_by_minute_dark.png";
import iconOverviewActive from "../assets/icon_overview_active.png";
import iconChannelActive from "../assets/icon_channel_active.png";
import iconProgramActive from "../assets/icon_program_active.png";
import iconRatingByMinuteActive from "../assets/icon_rating_by_minute_active.png";
import { useCurrentUser } from "../hooks/useCurrentUser";
import PivotTableChart from "../components/charts/PivotTableChart";
import FilterSpot from "../components/layouts/filters/FilterSpot";
import { LABEL_SPOT } from "../utils/label";

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: isOpen, setValue: setIsOpen } = useIsOpen();
  const { value: screenMd, setValue: setScreenMd } = useScreenMd();
  const { value: horizontal, setValue: setHorizontal } = useHorizontal();
  const { user, userLoading } = useCurrentUser();

  const scopeFilterData = useMemo(() => {
    return {
      filterProvince: dashboard.isLoading.filterProvinceData
        ? [{ Loading: "Loading" }]
        : dashboard.filterProvinceData?.data,
      filterProgram: dashboard.isLoading.filterProgramData
        ? [{ Loading: "Loading" }]
        : dashboard.filterProgramData?.data,
      filterProduct: dashboard.isLoading.filterProductData
        ? [{ Loading: "Loading" }]
        : dashboard.filterProductData?.data,
      filterGroup: dashboard.isLoading.filterGroupData
        ? [{ Loading: "Loading" }]
        : dashboard.filterGroupData?.data,
      filterCampaign: dashboard.isLoading.filterCampaignData
        ? [{ Loading: "Loading" }]
        : dashboard.filterCampaignData?.data,
      filterBrand: dashboard.isLoading.filterBrandData
        ? [{ Loading: "Loading" }]
        : dashboard.filterBrandData?.data,
      filterAdvertiser: dashboard.isLoading.filterAdvertiserData
        ? [{ Loading: "Loading" }]
        : dashboard.filterAdvertiserData?.data,
      filterAdcode: dashboard.isLoading.filterAdcodeData
        ? [{ Loading: "Loading" }]
        : dashboard.filterAdcodeData?.data,
    };
  }, [
    dashboard.isLoading.filterProvinceData,
    dashboard.isLoading.filterProgramData,
    dashboard.isLoading.filterProductData,
    dashboard.isLoading.filterGroupData,
    dashboard.isLoading.filterCampaignData,
    dashboard.isLoading.filterBrandData,
    dashboard.isLoading.filterAdvertiserData,
    dashboard.isLoading.filterAdcodeData,
  ]);

  console.log(dashboard.isLoading.spendVNDNumberData);

  return (
    <main className="font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip">
      <Header username={user?.username} />
      <div className="flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300">
        <FilterSpot filters={scopeFilterData} />
        <div
          className={`${isOpen && !horizontal ? "w-[84%] max-md:w-full" : "w-full"} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}
        >
          <BreadCrumb dashboardName="GIÁM SÁT QUẢNG CÁO" />
          <div className="bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
            <ParentTabs
              uniqueId="dashboard"
              defaultTab="overview"
              tabs={[
                {
                  id: "overview",
                  label: "Tổng quan",
                  icon: !darkMode ? iconOverview : iconOverviewDark,
                  iconActive: iconOverviewActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_overview"
                    >
                      <InforTab
                        inforTab={"Tổng quan"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter
                        filters={scopeFilterData}
                        FilterComponent={FilterSpot}
                        nameFilter="FilterSpot"
                      />
                      <div className="px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4">
                        <div className="w-full grid grid-cols-4 max-lg:grid-cols-4 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          {/* <div className='col-span-2 max-lg:col-span-3'>
                                        <NumberWithTrendChart nameChart={'Chi phí (Triệu VND)'} description={false} data={!dashboard.isLoading.spendVNDNumberData ? transformNumberWithTrendData(dashboard.spendVNDNumberData?.data, dashboard.spendVNDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRIC_SPOTS.spend_vnd.icon} />
                                      </div>
                                      <div className='col-span-2 max-lg:col-span-3'>
                                        <NumberWithTrendChart nameChart={'Chi phí (USD)'} description={false} data={!dashboard.isLoading.spendUSDNumberData ? transformNumberWithTrendData(dashboard.spendUSDNumberData?.data, dashboard.spendUSDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRIC_SPOTS.spend_usd.icon} suffix='$' />
                                      </div> */}
                          <NumberCard
                            title={"Chi phí (Triệu VND)"}
                            description={false}
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.spendVNDNumberData
                                  ? dashboard.spendVNDNumberData?.data
                                    ? formatNumber(
                                        dashboard.spendVNDNumberData?.data[0]
                                          .price,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.spendVNDNumberData],
                            )}
                            icon={METRIC_SPOTS.spend_vnd.icon}
                            background={METRIC_SPOTS.spend_vnd.background}
                            widthIcon={METRIC_SPOTS.spend_vnd.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("spendVNDNumberData"),
                              [dashboard.isLoading.spendVNDNumberData],
                            )}
                          />
                          <NumberCard
                            title={"Chi phí (USD)"}
                            description={false}
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.spendUSDNumberData
                                  ? dashboard.spendUSDNumberData?.data
                                    ? formatNumber(
                                        dashboard.spendUSDNumberData?.data[0]
                                          .price_usd,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.spendUSDNumberData],
                            )}
                            icon={METRIC_SPOTS.spend_usd.icon}
                            background={METRIC_SPOTS.spend_usd.background}
                            widthIcon={METRIC_SPOTS.spend_usd.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("spendUSDNumberData"),
                              [dashboard.isLoading.spendUSDNumberData],
                            )}
                          />
                          <NumberCard
                            title={"Số lượng Spot"}
                            description={false}
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.countNumberData
                                  ? dashboard.countNumberData?.data
                                    ? formatNumber(
                                        dashboard.countNumberData?.data[0]
                                          .count,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.countNumberData],
                            )}
                            icon={METRIC_SPOTS.count.icon}
                            background={METRIC_SPOTS.count.background}
                            widthIcon={METRIC_SPOTS.count.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("countNumberData"),
                              [dashboard.isLoading.countNumberData],
                            )}
                          />
                          <NumberCard
                            title={"Thời lượng Spot"}
                            description={false}
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.durationNumberData
                                  ? dashboard.durationNumberData?.data
                                    ? dashboard.durationNumberData?.data[0]?.total_duration?.toLocaleString(
                                        undefined,
                                        { maximumFractionDigits: 2 },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.durationNumberData],
                            )}
                            icon={METRIC_SPOTS.duration.icon}
                            background={METRIC_SPOTS.duration.background}
                            widthIcon={METRIC_SPOTS.duration.widthIcon}
                            suffix="phút"
                            refetch={useCallback(
                              () => dashboard.refetch("durationNumberData"),
                              [dashboard.isLoading.durationNumberData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div
                            className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={"Xu hướng quảng cáo THEO NGÀY"}
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "vnd",
                                  label: "Triệu VND",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarDateData
                                            ? transformBarChartData(
                                                dashboard.spendVNDBarDateData
                                                  ?.data,
                                                dashboard.spendVNDBarDateData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarDateData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={["rgba(255, 204, 0, 1)"]}
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Xu hướng quảng cáo THEO NGÀY"}
                                      description={false}
                                      orientation={""}
                                      displayName={false}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarDateData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarDateData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "usd",
                                  label: "USD",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendUSDBarDateData
                                            ? transformBarChartData(
                                                dashboard.spendUSDBarDateData
                                                  ?.data,
                                                dashboard.spendUSDBarDateData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarDateData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={["rgba(255, 204, 0, 1)"]}
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Xu hướng quảng cáo THEO NGÀY"}
                                      description={false}
                                      orientation={""}
                                      displayName={false}
                                      suffix={"$"}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendUSDBarDateData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarDateData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <ChildTabs
                            tabs={[
                              {
                                id: "spend",
                                label: "Share of spend",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4">
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDPieChannelData
                                            ? transformPieChartData(
                                                dashboard.spendVNDPieChannelData
                                                  ?.data,
                                                dashboard.spendVNDPieChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ chi phí quảng cáo theo kênh"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorChannel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      crossFilter="channels"
                                      keyChart="pieChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDPieChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieChannelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDPieFirstLevelData
                                            ? transformPieChartData(
                                                dashboard
                                                  .spendVNDPieFirstLevelData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDPieFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ chi phí quảng cáo theo thể loại nội dung"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorFirstLevel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      crossFilter="firstLevels"
                                      keyChart="pieFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDPieFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieFirstLevelData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                              {
                                id: "spot",
                                label: "Share of spot",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4">
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .countPieChannelData
                                            ? transformPieChartData(
                                                dashboard.countPieChannelData
                                                  ?.data,
                                                dashboard.countPieChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .countPieChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ số lượng quảng cáo theo kênh"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorChannel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      crossFilter="channels"
                                      keyChart="pieChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "countPieChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .countPieChannelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .countPieFirstLevelData
                                            ? transformPieChartData(
                                                dashboard.countPieFirstLevelData
                                                  ?.data,
                                                dashboard.countPieFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .countPieFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ số lượng quảng cáo theo thể loại nội dung"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorFirstLevel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      crossFilter="firstLevels"
                                      keyChart="pieFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "countPieFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .countPieFirstLevelData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                              {
                                id: "duration",
                                label: "Share of airtime",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4">
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .durationPieChannelData
                                            ? transformPieChartData(
                                                dashboard.durationPieChannelData
                                                  ?.data,
                                                dashboard.durationPieChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .durationPieChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ thời lượng quảng cáo theo kênh"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorChannel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      suffix="phút"
                                      formatterValue={2}
                                      crossFilter="channels"
                                      keyChart="pieChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "durationPieChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .durationPieChannelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .durationPieFirstLevelData
                                            ? transformPieChartData(
                                                dashboard
                                                  .durationPieFirstLevelData
                                                  ?.data,
                                                dashboard
                                                  .durationPieFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .durationPieFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ thời lượng quảng cáo theo thể loại nội dung"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorFirstLevel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      suffix="phút"
                                      formatterValue={2}
                                      crossFilter="firstLevels"
                                      keyChart="pieFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "durationPieFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .durationPieFirstLevelData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                              {
                                id: "length_voice",
                                label: "Share of spot voice/lengths",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4">
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.grpPieChannelData
                                            ? transformPieChartData(
                                                dashboard.grpPieChannelData
                                                  ?.data,
                                                dashboard.grpPieChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.grpPieChannelData],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ GRP quảng cáo theo kênh"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorChannel
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      formatterValue={2}
                                      crossFilter="channels"
                                      keyChart="pieChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpPieChannelData",
                                          ),
                                        [dashboard.isLoading.grpPieChannelData],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .durationPieLengthData
                                            ? transformPieChartData(
                                                dashboard.durationPieLengthData
                                                  ?.data,
                                                dashboard.durationPieLengthData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .durationPieLengthData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ độ dài của quảng cáo theo kênh"
                                      }
                                      description={false}
                                      colors={
                                        CUSTOM_CHART.pieChart.colorDuration
                                      }
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "durationPieLengthData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .durationPieLengthData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                            ]}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div
                            className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={"Top 20 nhà quảng cáo"}
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "vnd",
                                  label: "Triệu VND",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarAdvertiserData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendVNDBarAdvertiserData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDBarAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={["rgba(255, 204, 0, 1)"]}
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Top 20 nhà quảng cáo"}
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      overflow={true}
                                      heightPlus={35}
                                      crossFilter="advertisers"
                                      keyChart="barAdvertiserData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarAdvertiserData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "usd",
                                  label: "USD",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendUSDBarAdvertiserData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendUSDBarAdvertiserData
                                                  ?.data,
                                                dashboard
                                                  .spendUSDBarAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={["rgba(255, 204, 0, 1)"]}
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Top 20 nhà quảng cáo"}
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      suffix={"$"}
                                      overflow={true}
                                      heightPlus={35}
                                      crossFilter="advertisers"
                                      keyChart="barAdvertiserData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendUSDBarAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarAdvertiserData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "spot",
                                  label: "SPOT",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .countBarAdvertiserData
                                            ? transformBarChartData(
                                                dashboard.countBarAdvertiserData
                                                  ?.data,
                                                dashboard.countBarAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .countBarAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={["rgba(255, 204, 0, 1)"]}
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Top 20 nhà quảng cáo"}
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      overflow={true}
                                      heightPlus={35}
                                      crossFilter="advertisers"
                                      keyChart="barAdvertiserData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "countBarAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .countBarAdvertiserData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div
                            className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={
                                "Top 20 nhà quảng cáo - phân bổ theo kênh"
                              }
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "vnd",
                                  label: "Triệu VND",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarAdvertiserChannelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendVNDBarAdvertiserChannelData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDBarAdvertiserChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarAdvertiserChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Top 20 nhà quảng cáo - phân bổ theo kênh"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      overflow={true}
                                      heightPlus={50}
                                      crossFilter="channels"
                                      keyChart="barAdvertiserChannelData"
                                      stack={true}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarAdvertiserChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarAdvertiserChannelData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "usd",
                                  label: "USD",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendUSDBarAdvertiserChannelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendUSDBarAdvertiserChannelData
                                                  ?.data,
                                                dashboard
                                                  .spendUSDBarAdvertiserChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarAdvertiserChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Top 20 nhà quảng cáo - phân bổ theo kênh"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      suffix={"$"}
                                      overflow={true}
                                      heightPlus={50}
                                      crossFilter="channels"
                                      keyChart="barAdvertiserChannelData"
                                      stack={true}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendUSDBarAdvertiserChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendUSDBarAdvertiserChannelData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "spot",
                                  label: "SPOT",
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .countBarAdvertiserChannelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .countBarAdvertiserChannelData
                                                  ?.data,
                                                dashboard
                                                  .countBarAdvertiserChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .countBarAdvertiserChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Top 20 nhà quảng cáo - phân bổ theo kênh"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      displayName={false}
                                      overflow={true}
                                      heightPlus={50}
                                      crossFilter="channels"
                                      keyChart="barAdvertiserChannelData"
                                      stack={true}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "countBarAdvertiserChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .countBarAdvertiserChannelData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <ChildTabs
                            tabs={[
                              {
                                id: "brand",
                                label: "Top 10 nhãn",
                                content: (
                                  <TableChart
                                    data={useMemo(
                                      () =>
                                        !dashboard.isLoading.top10BrandData
                                          ? transformTableChartData(
                                              dashboard.top10BrandData?.data,
                                              dashboard.top10BrandData
                                                ?.colnames,
                                              null,
                                              [
                                                "percent_price",
                                                "percent_count",
                                                "percent_duration",
                                                "percent_grp",
                                              ],
                                            )
                                          : "isLoading",
                                      [dashboard.isLoading.top10BrandData],
                                    )}
                                    height={
                                      CUSTOM_CHART.tableChart.tableChartChannel
                                        .height
                                    }
                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                    fontFamily={
                                      CUSTOM_CHART.allChart.fontFamily
                                    }
                                    fontWeight={
                                      CUSTOM_CHART.tableChart.fontWeight
                                    }
                                    nameChart={"Top 10 nhãn"}
                                    description={false}
                                    showSTT={false}
                                    showPagination={false}
                                    crossFilter={true}
                                    keyChart="top10BrandData"
                                    refetch={useCallback(
                                      () => dashboard.refetch("top10BrandData"),
                                      [dashboard.isLoading.top10BrandData],
                                    )}
                                    customCol={useMemo(() => {
                                      return {
                                        Nhãn: {
                                          minSize: 100,
                                          maxSize: 170,
                                          weight: 600,
                                          sticky: true,
                                          crossFilter: "brands",
                                        },
                                        "Chi phí (USD)": { suffix: "$" },
                                      };
                                    }, [])}
                                  />
                                ),
                              },
                              {
                                id: "product",
                                label: "Top 10 dòng sản phẩm",
                                content: (
                                  <TableChart
                                    data={useMemo(
                                      () =>
                                        !dashboard.isLoading.top10ProductData
                                          ? transformTableChartData(
                                              dashboard.top10ProductData?.data,
                                              dashboard.top10ProductData
                                                ?.colnames,
                                              null,
                                              [
                                                "percent_price",
                                                "percent_count",
                                                "percent_duration",
                                                "percent_grp",
                                              ],
                                            )
                                          : "isLoading",
                                      [dashboard.isLoading.top10ProductData],
                                    )}
                                    height={
                                      CUSTOM_CHART.tableChart.tableChartChannel
                                        .height
                                    }
                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                    fontFamily={
                                      CUSTOM_CHART.allChart.fontFamily
                                    }
                                    fontWeight={
                                      CUSTOM_CHART.tableChart.fontWeight
                                    }
                                    nameChart={"Top 10 dòng sản phẩm"}
                                    description={false}
                                    showSTT={false}
                                    showPagination={false}
                                    crossFilter={true}
                                    keyChart="top10ProductData"
                                    refetch={useCallback(
                                      () =>
                                        dashboard.refetch("top10ProductData"),
                                      [dashboard.isLoading.top10ProductData],
                                    )}
                                    customCol={useMemo(() => {
                                      return {
                                        "Sản phẩm": {
                                          minSize: 100,
                                          maxSize: 170,
                                          weight: 600,
                                          sticky: true,
                                          crossFilter: "products",
                                        },
                                        "Chi phí (USD)": { suffix: "$" },
                                      };
                                    }, [])}
                                  />
                                ),
                              },
                              {
                                id: "campaign",
                                label: "Top 10 Chiến dịch",
                                content: (
                                  <TableChart
                                    data={useMemo(
                                      () =>
                                        !dashboard.isLoading.top10CampaignData
                                          ? transformTableChartData(
                                              dashboard.top10CampaignData?.data,
                                              dashboard.top10CampaignData
                                                ?.colnames,
                                              null,
                                              [
                                                "percent_price",
                                                "percent_count",
                                                "percent_duration",
                                                "percent_grp",
                                              ],
                                            )
                                          : "isLoading",
                                      [dashboard.isLoading.top10CampaignData],
                                    )}
                                    height={
                                      CUSTOM_CHART.tableChart.tableChartChannel
                                        .height
                                    }
                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                    fontFamily={
                                      CUSTOM_CHART.allChart.fontFamily
                                    }
                                    fontWeight={
                                      CUSTOM_CHART.tableChart.fontWeight
                                    }
                                    nameChart={"Top 10 chiến dịch"}
                                    description={false}
                                    showSTT={false}
                                    showPagination={false}
                                    crossFilter={true}
                                    keyChart={"top10CampaignData"}
                                    refetch={useCallback(
                                      () =>
                                        dashboard.refetch("top10CampaignData"),
                                      [dashboard.isLoading.top10CampaignData],
                                    )}
                                    customCol={useMemo(() => {
                                      return {
                                        "Chiến dịch": {
                                          minSize: 100,
                                          maxSize: 170,
                                          weight: 600,
                                          sticky: true,
                                          crossFilter: "campaigns",
                                        },
                                        "Chi phí (USD)": { suffix: "$" },
                                      };
                                    }, [])}
                                  />
                                ),
                              },
                            ]}
                          />
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
                {
                  id: "revenue",
                  label: "Doanh thu",
                  icon: !darkMode ? iconChannel : iconChannelDark,
                  iconActive: iconChannelActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_revenue"
                    >
                      <InforTab
                        inforTab={"Doanh thu"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter
                        filters={scopeFilterData}
                        FilterComponent={FilterSpot}
                        nameFilter="FilterSpot"
                      />
                      <div className="px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4">
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.spendVNDBarTimebandData
                                  ? transformBarChartData(
                                      dashboard.spendVNDBarTimebandData?.data,
                                      dashboard.spendVNDBarTimebandData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.spendVNDBarTimebandData],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={["rgba(255, 204, 0, 1)"]}
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={
                              "Xu hướng quảng cáo theo khung giờ (Triệu VND)"
                            }
                            description={false}
                            orientation={""}
                            maxVisibleItems={true}
                            crossFilter="timebands"
                            keyChart="spendVNDBarTimebandData"
                            refetch={useCallback(
                              () =>
                                dashboard.refetch("spendVNDBarTimebandData"),
                              [dashboard.isLoading.spendVNDBarTimebandData],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-10 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="col-span-6 max-md:col-span-10">
                            <TableChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.adcodeProgramData
                                    ? transformTableChartData(
                                        dashboard.adcodeProgramData?.data,
                                        dashboard.adcodeProgramData?.colnames,
                                        null,
                                        [],
                                        LABEL_SPOT,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.adcodeProgramData],
                              )}
                              height={
                                CUSTOM_CHART.tableChart.tableChartChannel.height
                              }
                              fontSize={CUSTOM_CHART.tableChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                              nameChart={"Chi phí quảng cáo theo Adcode"}
                              description={false}
                              showSTT={false}
                              showPagination={false}
                              crossFilter={true}
                              keyChart="adcodeProgramData"
                              refetch={useCallback(
                                () => dashboard.refetch("adcodeProgramData"),
                                [dashboard.isLoading.adcodeProgramData],
                              )}
                              customCol={useMemo(() => {
                                return {
                                  Adcode: {
                                    weight: 600,
                                    crossFilter: "adCodes",
                                  },
                                  "Khung giờ": { crossFilter: "timebands" },
                                  "Chương trình": {
                                    minSize: 100,
                                    maxSize: 170,
                                    crossFilter: "programs",
                                  },
                                  Kênh: {
                                    minSize: 0,
                                    maxSize: 10,
                                    crossFilter: "channels",
                                  },
                                };
                              }, [])}
                            />
                          </div>
                          <div className="col-span-4 max-md:col-span-10">
                            <TableChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.adcodeProductData
                                    ? transformTableChartData(
                                        dashboard.adcodeProductData?.data,
                                        dashboard.adcodeProductData?.colnames,
                                        null,
                                        [],
                                        LABEL_SPOT,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.adcodeProductData],
                              )}
                              height={
                                CUSTOM_CHART.tableChart.tableChartChannel.height
                              }
                              fontSize={CUSTOM_CHART.tableChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                              nameChart={"Chi phí quảng cáo theo dòng sản phẩm"}
                              description={false}
                              showSTT={false}
                              showPagination={false}
                              crossFilter={true}
                              keyChart="adcodeProductData"
                              refetch={useCallback(
                                () => dashboard.refetch("adcodeProductData"),
                                [dashboard.isLoading.adcodeProductData],
                              )}
                              customCol={useMemo(() => {
                                return {
                                  "Sản phẩm": {
                                    weight: 600,
                                    crossFilter: "products",
                                  },
                                };
                              }, [])}
                            />
                          </div>
                        </div>
                        <div className="w-full grid grid-cols-10 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="col-span-6 max-md:col-span-10">
                            <PivotTableChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading
                                    .spendVNDPivotChannelFirstLevelData
                                    ? dashboard
                                        .spendVNDPivotChannelFirstLevelData
                                        ?.data
                                    : "isLoading",
                                [
                                  dashboard.isLoading
                                    .spendVNDPivotChannelFirstLevelData,
                                ],
                              )}
                              nameChart="Doanh thu quảng cáo theo kênh (Triệu VND)"
                              description={false}
                              rowField="channel_name_tvd"
                              columnField="firstlevel_vn"
                              valueField="price"
                              aggType="sum"
                              height={
                                CUSTOM_CHART.tableChart.tableChartChannel.height
                              }
                              fontSize={CUSTOM_CHART.tableChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                              labelTables={LABEL_SPOT}
                              fullScreen={true}
                              customCol={{
                                channel_name_tvd: { crossFilter: "channels" },
                              }}
                              crossFilter={true}
                              keyChart="spendVNDPivotChannelFirstLevelData"
                              refetch={useCallback(
                                () =>
                                  dashboard.refetch(
                                    "spendVNDPivotChannelFirstLevelData",
                                  ),
                                [
                                  dashboard.isLoading
                                    .spendVNDPivotChannelFirstLevelData,
                                ],
                              )}
                            />
                          </div>
                          <div className="col-span-4 max-md:col-span-10 grid">
                            <PieChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.countPieTimebandData
                                    ? transformPieChartData(
                                        dashboard.countPieTimebandData?.data,
                                        dashboard.countPieTimebandData
                                          ?.colnames,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.countPieTimebandData],
                              )}
                              height={CUSTOM_CHART.pieChart.height}
                              fontSize={CUSTOM_CHART.pieChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                              nameChart={"Xu hướng quảng cáo theo khung giờ"}
                              description={false}
                              colors={useMemo(() => {
                                return {
                                  "1.Sáng (00h - 11h)": "rgba(217, 31, 38, 1)",
                                  "2.Trưa (11h - 14h)": "rgba(86, 154, 255, 1)",
                                  "3.Chiều (14h - 18h)":
                                    "rgba(128, 212, 27, 1)",
                                  "4.Tối (18h - 24h)": "rgba(2, 147, 113, 1)",
                                };
                              }, [])}
                              donut={CUSTOM_CHART.pieChart.donut}
                              innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                              legendHorizontal={true}
                              refetch={useCallback(
                                () => dashboard.refetch("countPieTimebandData"),
                                [dashboard.isLoading.countPieTimebandData],
                              )}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.spendVNDBarProgramData
                                  ? transformBarChartData(
                                      dashboard.spendVNDBarProgramData?.data,
                                      dashboard.spendVNDBarProgramData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.spendVNDBarProgramData],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={useMemo(() => {
                              return ["rgba(255, 204, 0, 1)"];
                            }, [])}
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={
                              "Top 20 chương trình có doanh thu cao nhất (Triệu VND)"
                            }
                            description={false}
                            orientation={"horizontal"}
                            overflow={true}
                            heightPlus={35}
                            crossFilter="programs"
                            keyChart="spendVNDBarProgramData"
                            refetch={useCallback(
                              () => dashboard.refetch("spendVNDBarProgramData"),
                              [dashboard.isLoading.spendVNDBarProgramData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.spendVNDBarChannelData
                                  ? transformBarChartData(
                                      dashboard.spendVNDBarChannelData?.data,
                                      dashboard.spendVNDBarChannelData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.spendVNDBarChannelData],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={useMemo(() => {
                              return ["rgba(255, 204, 0, 1)"];
                            }, [])}
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={
                              "Chi phí quảng cáo theo kênh (Triệu VND)"
                            }
                            description={false}
                            orientation={""}
                            crossFilter="channels"
                            keyChart="spendVNDBarChannelData"
                            refetch={useCallback(
                              () => dashboard.refetch("spendVNDBarChannelData"),
                              [dashboard.isLoading.spendVNDBarChannelData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <PivotTableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading
                                  .spendVNDPivotChannelTimebandData
                                  ? dashboard.spendVNDPivotChannelTimebandData
                                      ?.data
                                  : "isLoading",
                              [
                                dashboard.isLoading
                                  .spendVNDPivotChannelTimebandData,
                              ],
                            )}
                            nameChart="Xu hướng quảng cáo theo khung giờ (Triệu VND)"
                            description={false}
                            rowField="channel_name_tvd"
                            columnField="time_band"
                            valueField="price"
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            sortColTimeband={true}
                            labelTables={LABEL_SPOT}
                            fullScreen={true}
                            customCol={useMemo(() => {
                              return {
                                channel_name_tvd: { crossFilter: "channels" },
                              };
                            }, [])}
                            crossFilter={true}
                            keyChart="spendVNDPivotChannelTimebandData"
                            refetch={useCallback(
                              () =>
                                dashboard.refetch(
                                  "spendVNDPivotChannelTimebandData",
                                ),
                              [
                                dashboard.isLoading
                                  .spendVNDPivotChannelTimebandData,
                              ],
                            )}
                          />
                        </div>
                        <div className="w-full">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.spendVNDTableAdvertiserData
                                  ? transformTableChartData(
                                      dashboard.spendVNDTableAdvertiserData
                                        ?.data,
                                      dashboard.spendVNDTableAdvertiserData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.spendVNDTableAdvertiserData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"Chi phí quảng cáo theo nhà quảng cáo"}
                            description={false}
                            showSTT={false}
                            showPagination={false}
                            crossFilter={true}
                            keyChart="spendVNDTableAdvertiserData"
                            refetch={useCallback(
                              () =>
                                dashboard.refetch(
                                  "spendVNDTableAdvertiserData",
                                ),
                              [dashboard.isLoading.spendVNDTableAdvertiserData],
                            )}
                            customCol={useMemo(() => {
                              return {
                                "Nhà quảng cáo": {
                                  weight: 600,
                                  crossFilter: "advertisers",
                                },
                              };
                            }, [])}
                          />
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
                {
                  id: "effective",
                  label: "Hiệu quả",
                  icon: !darkMode ? iconProgram : iconProgramDark,
                  iconActive: iconProgramActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_effective"
                    >
                      <InforTab
                        inforTab={"Hiệu quả"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter
                        filters={scopeFilterData}
                        FilterComponent={FilterSpot}
                        nameFilter="FilterSpot"
                      />
                      <div className="px-6 max-lg:px-5 max-md:px-4">
                        <div className="w-full py-6 max-lg:py-5 max-md:py-4">
                          <div
                            className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={"Top 20 nhà quảng cáo"}
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "grp",
                                  label: "GRP",
                                  content: (
                                    <PivotTableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .grpPivotCampaignWeekData
                                            ? dashboard.grpPivotCampaignWeekData
                                                ?.data
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .grpPivotCampaignWeekData,
                                        ],
                                      )}
                                      nameChart={
                                        "Chỉ số về hiệu quả chiến dịch (GRP, REACH và SỐ LƯỢNG SPOT)"
                                      }
                                      description={false}
                                      displayName={false}
                                      rowField="campaign_name"
                                      columnField="week"
                                      valueField="grp"
                                      aggType="sum"
                                      height={
                                        CUSTOM_CHART.tableChart
                                          .tableChartChannel.height
                                      }
                                      fontSize={
                                        CUSTOM_CHART.tableChart.fontSize
                                      }
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.tableChart.fontWeight
                                      }
                                      formatterValue={2}
                                      suffixHeader="Tuần"
                                      customCol={useMemo(() => {
                                        return {
                                          campaign_name: {
                                            crossFilter: "campaigns",
                                          },
                                        };
                                      }, [])}
                                      crossFilter={true}
                                      keyChart="pivotCampaignWeekData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpPivotCampaignWeekData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .grpPivotCampaignWeekData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "reach",
                                  label: "REACH",
                                  content: (
                                    <PivotTableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .reachPivotCampaignWeekData
                                            ? dashboard
                                                .reachPivotCampaignWeekData
                                                ?.data
                                            : "isLoading",

                                        [
                                          dashboard.isLoading
                                            .reachPivotCampaignWeekData,
                                        ],
                                      )}
                                      nameChart={
                                        "Chỉ số về hiệu quả chiến dịch (GRP, REACH và SỐ LƯỢNG SPOT)"
                                      }
                                      description={false}
                                      displayName={false}
                                      rowField="campaign_name"
                                      columnField="week"
                                      valueField="reach"
                                      aggType="sum"
                                      height={
                                        CUSTOM_CHART.tableChart
                                          .tableChartChannel.height
                                      }
                                      fontSize={
                                        CUSTOM_CHART.tableChart.fontSize
                                      }
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.tableChart.fontWeight
                                      }
                                      suffixHeader="Tuần"
                                      customCol={useMemo(() => {
                                        return {
                                          campaign_name: {
                                            crossFilter: "campaigns",
                                          },
                                        };
                                      }, [])}
                                      crossFilter={true}
                                      keyChart="pivotCampaignWeekData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "reachPivotCampaignWeekData",
                                          ),
                                        [],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "spot",
                                  label: "SPOT",
                                  content: (
                                    <PivotTableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .countPivotCampaignWeekData
                                            ? dashboard
                                                .countPivotCampaignWeekData
                                                ?.data
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .countPivotCampaignWeekData,
                                        ],
                                      )}
                                      nameChart={
                                        "Chỉ số về hiệu quả chiến dịch (GRP, REACH và SỐ LƯỢNG SPOT)"
                                      }
                                      description={false}
                                      displayName={false}
                                      rowField="campaign_name"
                                      columnField="week"
                                      valueField="count"
                                      aggType="sum"
                                      height={
                                        CUSTOM_CHART.tableChart
                                          .tableChartChannel.height
                                      }
                                      fontSize={
                                        CUSTOM_CHART.tableChart.fontSize
                                      }
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.tableChart.fontWeight
                                      }
                                      suffixHeader="Tuần"
                                      customCol={useMemo(() => {
                                        return {
                                          campaign_name: {
                                            crossFilter: "campaigns",
                                          },
                                        };
                                      }, [])}
                                      crossFilter={true}
                                      keyChart="pivotCampaignWeekData"
                                      refetch={useCallback(() => {
                                        dashboard.refetch(
                                          "countPivotCampaignWeekData",
                                        );
                                      }, [])}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4 flex max-md:flex-wrap gap-6 max-lg:gap-5 max-md:gap-4">
                          <div className="w-[60%] max-md:w-full">
                            <BarChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.grpBarRegionalBrandData
                                    ? transformBarChartData(
                                        dashboard.grpBarRegionalBrandData?.data,
                                        dashboard.grpBarRegionalBrandData
                                          ?.colnames,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.grpBarRegionalBrandData],
                              )}
                              height={CUSTOM_CHART.barChart.height}
                              fontSize={CUSTOM_CHART.barChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                              nameChart={"GRP (%) theo thị trường"}
                              description={false}
                              orientation={""}
                              formatterValue={2}
                              stack={true}
                              crossFilter="brands"
                              keyChart="grpBarRegionalBrandData"
                              refetch={useCallback(
                                () =>
                                  dashboard.refetch("grpBarRegionalBrandData"),
                                [dashboard.isLoading.grpBarRegionalBrandData],
                              )}
                            />
                          </div>
                          <div className="w-[40%] max-md:w-full">
                            <BarChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.grpBarWeekBrandData
                                    ? transformBarChartData(
                                        dashboard.grpBarWeekBrandData?.data,
                                        dashboard.grpBarWeekBrandData?.colnames,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.grpBarWeekBrandData],
                              )}
                              height={CUSTOM_CHART.barChart.height}
                              fontSize={CUSTOM_CHART.barChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                              nameChart={
                                "GRP (%) trong tuần theo nhà quảng cáo"
                              }
                              description={false}
                              orientation={""}
                              formatterValue={2}
                              stack={true}
                              crossFilter="brands"
                              keyChart="grpBarWeekBrandData"
                              refetch={useCallback(
                                () => dashboard.refetch("grpBarWeekBrandData"),
                                [dashboard.isLoading.grpBarWeekBrandData],
                              )}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <ChildTabs
                            tabs={[
                              {
                                id: "spend",
                                label: "AD SPEND",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4">
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarBrandChannelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendVNDBarBrandChannelData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDBarBrandChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Phân bổ quảng cáo theo kênh"}
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      stack={true}
                                      crossFilter="channels"
                                      keyChart="barBrandChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarBrandChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandChannelData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarBrandTimebandData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendVNDBarBrandTimebandData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDBarBrandTimebandData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandTimebandData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorTimeband
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo khung giờ"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarBrandTimebandData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandTimebandData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDBarBrandFirstLevelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .spendVNDBarBrandFirstLevelData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDBarBrandFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorFirstLevel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo Thể loại nội dung"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      stack={true}
                                      crossFilter="firstLevels"
                                      keyChart="barBrandFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDBarBrandFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDBarBrandFirstLevelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .spendVNDPieAdvertiserData
                                            ? transformPieChartData(
                                                dashboard
                                                  .spendVNDPieAdvertiserData
                                                  ?.data,
                                                dashboard
                                                  .spendVNDPieAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={"Thị phần các nhà quảng cáo"}
                                      description={false}
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      border={false}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "spendVNDPieAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .spendVNDPieAdvertiserData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                              {
                                id: "grp",
                                label: "GRP",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4">
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .grpBarBrandChannelData
                                            ? transformBarChartData(
                                                dashboard.grpBarBrandChannelData
                                                  ?.data,
                                                dashboard.grpBarBrandChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Phân bổ quảng cáo theo kênh"}
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      formatterValue={2}
                                      stack={true}
                                      crossFilter="channels"
                                      keyChart="barBrandChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpBarBrandChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandChannelData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .grpBarBrandTimebandData
                                            ? transformBarChartData(
                                                dashboard
                                                  .grpBarBrandTimebandData
                                                  ?.data,
                                                dashboard
                                                  .grpBarBrandTimebandData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandTimebandData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorTimeband
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo khung giờ"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      formatterValue={2}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpBarBrandTimebandData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandTimebandData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .grpBarBrandFirstLevelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .grpBarBrandFirstLevelData
                                                  ?.data,
                                                dashboard
                                                  .grpBarBrandFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorFirstLevel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo Thể loại nội dung"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      formatterValue={2}
                                      stack={true}
                                      crossFilter="firstLevels"
                                      keyChart="barBrandFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpBarBrandFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .grpBarBrandFirstLevelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .grpPieAdvertiserData
                                            ? transformPieChartData(
                                                dashboard.grpPieAdvertiserData
                                                  ?.data,
                                                dashboard.grpPieAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .grpPieAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={"Thị phần các nhà quảng cáo"}
                                      description={false}
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      border={false}
                                      formatterValue={2}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "grpPieAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .grpPieAdvertiserData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                              {
                                id: "reach",
                                label: "REACH",
                                content: (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4">
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .reachBarBrandChannelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .reachBarBrandChannelData
                                                  ?.data,
                                                dashboard
                                                  .reachBarBrandChannelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandChannelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorChannel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={"Phân bổ quảng cáo theo kênh"}
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      stack={true}
                                      crossFilter="channels"
                                      keyChart="barBrandChannelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "reachBarBrandChannelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandChannelData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .reachBarBrandTimebandData
                                            ? transformBarChartData(
                                                dashboard
                                                  .reachBarBrandTimebandData
                                                  ?.data,
                                                dashboard
                                                  .reachBarBrandTimebandData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandTimebandData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorTimeband
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo khung giờ"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "reachBarBrandTimebandData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandTimebandData,
                                        ],
                                      )}
                                    />
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .reachBarBrandFirstLevelData
                                            ? transformBarChartData(
                                                dashboard
                                                  .reachBarBrandFirstLevelData
                                                  ?.data,
                                                dashboard
                                                  .reachBarBrandFirstLevelData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandFirstLevelData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.colorFirstLevel
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        "Phân bổ quảng cáo theo Thể loại nội dung"
                                      }
                                      description={false}
                                      orientation={"horizontal"}
                                      colorZoom="red"
                                      stack={true}
                                      crossFilter="firstLevels"
                                      keyChart="barBrandFirstLevelData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "reachBarBrandFirstLevelData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .reachBarBrandFirstLevelData,
                                        ],
                                      )}
                                    />
                                    <PieChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .reachPieAdvertiserData
                                            ? transformPieChartData(
                                                dashboard.reachPieAdvertiserData
                                                  ?.data,
                                                dashboard.reachPieAdvertiserData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .reachPieAdvertiserData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.pieChart.height}
                                      fontSize={CUSTOM_CHART.pieChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.pieChart.fontWeight
                                      }
                                      nameChart={"Thị phần các nhà quảng cáo"}
                                      description={false}
                                      donut={CUSTOM_CHART.pieChart.donut}
                                      innerRadius={
                                        CUSTOM_CHART.pieChart.innerRadius
                                      }
                                      border={false}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "reachPieAdvertiserData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .reachPieAdvertiserData,
                                        ],
                                      )}
                                    />
                                  </div>
                                ),
                              },
                            ]}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableBrandData
                                  ? transformTableChartData(
                                      dashboard.allTableBrandData?.data,
                                      dashboard.allTableBrandData?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableBrandData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"Hiệu quả quảng cáo theo nhãn"}
                            description={false}
                            showSTT={false}
                            showPagination={false}
                            crossFilter={true}
                            keyChart="allTableBrandData"
                            customCol={useMemo(() => {
                              return {
                                Nhãn: {
                                  weight: 600,
                                  minSize: 100,
                                  maxSize: 170,
                                  sticky: true,
                                  crossFilter: "brands",
                                },
                              };
                            }, [])}
                            refetch={useCallback(
                              () => dashboard.refetch("allTableBrandData"),
                              [dashboard.isLoading.allTableBrandData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableBrandProgramData
                                  ? transformTableChartData(
                                      dashboard.allTableBrandProgramData?.data,
                                      dashboard.allTableBrandProgramData
                                        ?.colnames,
                                      null,
                                      [],
                                      LABEL_SPOT,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableBrandProgramData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={
                              "Hiệu quả quảng cáo của nhãn theo chương trình"
                            }
                            description={false}
                            showSTT={false}
                            showPagination={false}
                            crossFilter={true}
                            keyChart="allTableBrandProgramData"
                            refetch={() =>
                              dashboard.refetch("allTableBrandProgramData")
                            }
                            customCol={useMemo(() => {
                              return {
                                Nhãn: {
                                  weight: 600,
                                  minSize: 100,
                                  maxSize: 170,
                                  sticky: true,
                                  crossFilter: "brands",
                                },
                                "Chương trình": {
                                  minSize: 100,
                                  maxSize: 170,
                                  crossFilter: "programs",
                                },
                              };
                            }, [])}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableDeviceData
                                  ? transformTableChartData(
                                      dashboard.allTableDeviceData?.data,
                                      dashboard.allTableDeviceData?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableDeviceData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={
                              "Tỉ lệ tiếp cận Reach (1+, 2+, 3+) theo ngày"
                            }
                            description={false}
                            showSTT={false}
                            customCol={useMemo(() => {
                              return { Ngày: { sticky: true } };
                            }, [])}
                            refetch={useCallback(
                              () => dashboard.refetch("allTableDeviceData"),
                              [dashboard.isLoading.allTableDeviceData],
                            )}
                          />
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
                {
                  id: "ad_monitoring_report",
                  label: !screenMd ? "Ad monitoring report" : "Ad monitoring",
                  icon: !darkMode ? iconRatingByMinute : iconRatingByMinuteDark,
                  iconActive: iconRatingByMinuteActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_ad_monitoring_report"
                    >
                      <InforTab
                        inforTab={"Ad monitoring report"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter
                        filters={scopeFilterData}
                        FilterComponent={FilterSpot}
                        nameFilter="FilterSpot"
                      />
                      <div className="px-6 max-lg:px-5 max-md:px-4">
                        <div className="w-full py-6 max-lg:py-5 max-md:py-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableMonitoringData
                                  ? transformTableChartData(
                                      dashboard.allTableMonitoringData?.data,
                                      dashboard.allTableMonitoringData
                                        ?.colnames,
                                      null,
                                      [],
                                      LABEL_SPOT,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableMonitoringData],
                            )}
                            height={"600px"}
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"MONITORING REPORT"}
                            description={false}
                            showPagination={true}
                            fullScreen={true}
                            crossFilter={true}
                            keyChart="allTableMonitoringData"
                            refetch={useCallback(
                              () => dashboard.refetch("allTableMonitoringData"),
                              [dashboard.isLoading.allTableMonitoringData],
                            )}
                            customCol={useMemo(() => {
                              return {
                                Tuần: {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                "Chương trình": {
                                  minSize: 200,
                                  maxSize: 300,
                                  overflow: true,
                                  justify: "justify-center",
                                  align: "text-center",
                                  weight: 600,
                                  crossFilter: "programs",
                                },
                                "Thời lượng Spot": {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                Break: {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                Position: {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                "Chi phí (Triệu VND)": {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                Reach: {
                                  align: "text-center",
                                  justify: "justify-center",
                                },
                                "Chiến dịch": {
                                  minSize: 220,
                                  maxSize: 320,
                                  overflow: true,
                                  crossFilter: "campaigns",
                                },
                                "Loại Spot": {
                                  minSize: 120,
                                  maxSize: 150,
                                  overflow: true,
                                  crossFilter: "spotTypes",
                                },
                                "Ngành hàng": {
                                  minSize: 120,
                                  maxSize: 190,
                                  overflow: true,
                                  crossFilter: "groups",
                                },
                                "Sản phẩm": {
                                  minSize: 120,
                                  maxSize: 190,
                                  overflow: true,
                                  crossFilter: "products",
                                },
                                "Nhãn hàng": {
                                  minSize: 180,
                                  maxSize: 240,
                                  overflow: true,
                                  crossFilter: "brands",
                                },
                                "Nhà quảng cáo": {
                                  minSize: 180,
                                  maxSize: 240,
                                  overflow: true,
                                  crossFilter: "advertisers",
                                },
                              };
                            }, [])}
                          />
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const Dashboard = () => {
  return (
    <DashboardFilterProvider>
      <DashboardContent />
    </DashboardFilterProvider>
  );
};

export default Dashboard;
