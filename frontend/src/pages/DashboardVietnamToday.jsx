import React, { useCallback, useEffect, useMemo, useState } from "react";
import NumberCard from "../components/charts/NumberCard";
import Filter from "../components/layouts/filters/Filter";
import { METRIC_VIETNAMTODAYS } from "../utils/metricInfor";
import { CUSTOM_CHART } from "../utils/customChart";
import { formatNumber } from "../utils/formatNumber";
import { transformBarChartData } from "../utils/transformApiBartChart";
import BarChart from "../components/charts/BarChart";
import { useDashboardData } from "../hooks/useDashboardDataVietnamToday";
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
import PivotTableChart from "../components/charts/PivotTableChart";
import { transformPieChartData } from "../utils/transfromApiPieChart";
import Footer from "../components/layouts/footers/Footer";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
import Header from "../components/layouts/headers/Header";
import BreadCrumb from "../components/layouts/headers/BreadCrumb";
import InforTab from "../components/layouts/headers/InforTab";
import InforFilter from "../components/layouts/headers/InforFilter";
import { LABEL_VIETNAMTODAY } from "../utils/label";
import Title from "../components/layouts/components/Title";
import {
  useDarkMode,
  useIsOpen,
  useScreenMd,
  useHorizontal,
  useDashboardFilters,
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
import { getYesterday, formatDate } from "../helpers/helper";

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: isOpen, setValue: setIsOpen } = useIsOpen();
  const { value: screenMd, setValue: setScreenMd } = useScreenMd();
  const { value: horizontal, setValue: setHorizontal } = useHorizontal();
  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { user, userLoading } = useCurrentUser();
  // console.log("DashboardContent");

  const scopeNumberData = useMemo(() => {
    return {
      ratingNumber: !dashboard.isLoading.chart1085Data
        ? dashboard.chart1085Data.data
          ? dashboard.chart1085Data.data[0]
          : "-"
        : false,
      aveReachNumber: !dashboard.isLoading.chart1076Data
        ? dashboard.chart1076Data.data
          ? dashboard.chart1076Data.data[0]
          : "-"
        : false,
      ratingPercentNumber: !dashboard.isLoading.chart1074Data
        ? dashboard.chart1074Data.data
          ? dashboard.chart1074Data.data[0]
          : "-"
        : false,
      aveReachPercentNumber: !dashboard.isLoading.chart1073Data
        ? dashboard.chart1073Data.data
          ? dashboard.chart1073Data.data[0]
          : "-"
        : false,
      ratingPercentTrendNumber: !dashboard.isLoading.chart1075Data
        ? dashboard.chart1075Data.data
          ? dashboard.chart1075Data.data[0]
          : "-"
        : false,
    };
  }, [
    dashboard.isLoading.chart1085Data,
    dashboard.isLoading.chart1076Data,
    dashboard.isLoading.chart1074Data,
    dashboard.isLoading.chart1073Data,
    dashboard.isLoading.chart1075Data,
  ]);

  const scopeFilterData = useMemo(
    () => ({
      filterProvince: dashboard.isLoading.filterProvinceData
        ? [{ Loading: "Loading" }]
        : dashboard.filterProvinceData?.data,
      filterProgram: dashboard.isLoading.filterProgramData
        ? [{ Loading: "Loading" }]
        : dashboard.filterProgramData?.data,
    }),
    [
      dashboard.isLoading.filterProvinceData,
      dashboard.isLoading.filterProgramData,
    ],
  );

  return (
    <main className="font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip">
      <Header username={user?.username} />
      <div className="flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300">
        <Filter filters={scopeFilterData} />
        <div
          className={`${isOpen && !horizontal ? "w-[84%] max-md:w-full" : "w-full"} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}
        >
          <BreadCrumb dashboardName="VIETNAM TODAY" />
          <div className="bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
            <ParentTabs
              uniqueId="dashboard"
              defaultTab="overview"
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  icon: !darkMode ? iconOverview : iconOverviewDark,
                  iconActive: iconOverviewActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_overview"
                    >
                      <InforTab
                        inforTab={"Overview"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4">
                        <div className="w-full grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          {Object.values(METRIC_VIETNAMTODAYS).map((card) => (
                            <NumberCard
                              key={card.name}
                              title={card.title}
                              description={card.description}
                              value={useMemo(
                                () =>
                                  scopeNumberData?.[card.name]
                                    ? formatNumber(
                                        scopeNumberData?.[card.name]?.[
                                          card.metric
                                        ],
                                        { isPercent: card.isPercent },
                                      )
                                    : "isLoading",
                                [scopeNumberData?.[card.name]],
                              )}
                              icon={card.icon}
                              background={card.background}
                              widthIcon={card.widthIcon}
                              refetch={useCallback(
                                () => dashboard.refetch(card.id),
                                [scopeNumberData?.[card.name]],
                              )}
                            />
                          ))}
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1089Data
                                  ? transformMixedChartData(
                                      dashboard.chart1089Data?.data,
                                      "date",
                                      dashboard.chart1089Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1089Data],
                            )}
                            height={CUSTOM_CHART.lineChart.height}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={"Avg.Reach by Day"}
                            description={
                              CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                .description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={
                              CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                .showTopNSeries
                            }
                            xAxisTitle={"Date"}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1089Data"),
                              [dashboard.isLoading.chart1089Data],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1083Data
                                  ? transformMixedChartData(
                                      dashboard.chart1083Data?.data,
                                      "date",
                                      dashboard.chart1083Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1083Data],
                            )}
                            height={CUSTOM_CHART.lineChart.height}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={"Views by Day"}
                            description={
                              CUSTOM_CHART.lineChart.lineChartTimebandChannel
                                .aveReach.description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={
                              CUSTOM_CHART.lineChart.lineChartTimebandChannel
                                .showTopNSeries
                            }
                            xAxisTitle={"Date"}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1083Data"),
                              [dashboard.isLoading.chart1083Data],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1084Data
                                  ? transformBarChartData(
                                      dashboard.chart1084Data?.data,
                                      dashboard.chart1084Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1084Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Watch Time by App"}
                            description={false}
                            orientation={""}
                            stack={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1084Data"),
                              [dashboard.isLoading.chart1084Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1072Data
                                  ? transformBarChartData(
                                      dashboard.chart1072Data?.data,
                                      dashboard.chart1072Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1072Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Watch Time - Live TV vs. VOD"}
                            description={false}
                            orientation={""}
                            stack={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1072Data"),
                              [dashboard.isLoading.chart1072Data],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1082Data
                                  ? transformPieChartData(
                                      dashboard.chart1082Data?.data,
                                      dashboard.chart1082Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1082Data],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={"Watch Time by Content Category"}
                            description={false}
                            colors={useMemo(
                              () => ({
                                "News & Current Affairs": "#6BD3B3",
                                "Life - Styles": "#EE5960",
                                Documentary: "#408184",
                                Entertainment: "#66CBE2",
                                "Educational & Training": "#5470C6",
                                Sports: "#FF874E",
                                "Events/Specials": "#03748E",
                              }),
                              [],
                            )}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1082Data"),
                              [dashboard.isLoading.chart1082Data],
                            )}
                          />
                          <PivotTableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1078Data
                                  ? dashboard.chart1078Data?.data
                                  : "isLoading",
                              [dashboard.isLoading.chart1078Data],
                            )}
                            nameChart="Performance breakdown by Content Category"
                            description={false}
                            rowField="category_name"
                            columnField="event_category_name"
                            valueField={useMemo(
                              () => ["Avg.Reach", "Views", "Watch Time"],
                              [],
                            )}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            labelTables={LABEL_VIETNAMTODAY}
                            fullScreen={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1078Data"),
                              [dashboard.isLoading.chart1078Data],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <PivotTableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1210Data
                                  ? dashboard.chart1210Data?.data
                                  : "isLoading",
                              [dashboard.isLoading.chart1210Data],
                            )}
                            nameChart="Performance breakdown by Country (International)"
                            description={false}
                            rowField="country"
                            columnField="event_category_name"
                            valueField={useMemo(
                              () => [
                                "ave_reach_1",
                                "Total_Views",
                                "total_time_viewing",
                              ],
                              [],
                            )}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            labelTables={LABEL_VIETNAMTODAY}
                            fullScreen={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1210Data"),
                              [dashboard.isLoading.chart1210Data],
                            )}
                          />
                          <PivotTableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1209Data
                                  ? dashboard.chart1209Data?.data
                                  : "isLoading",
                              [dashboard.isLoading.chart1209Data],
                            )}
                            nameChart="Performance breakdown by Province (Viet Nam)"
                            description={false}
                            rowField="province_name"
                            columnField="event_category_name"
                            valueField={useMemo(
                              () => [
                                "ave_reach_1",
                                "Total_Views",
                                "total_time_viewing",
                              ],
                              [],
                            )}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            labelTables={LABEL_VIETNAMTODAY}
                            fullScreen={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1209Data"),
                              [dashboard.isLoading.chart1209Data],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div
                            className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={"Time Slot"}
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "avg_reach",
                                  label: "Avg.Reach",
                                  content: (
                                    <LineChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.chart1077Data
                                            ? transformMixedChartData(
                                                dashboard.chart1077Data?.data,
                                                "time_band_label",
                                                dashboard.chart1077Data
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.chart1077Data],
                                      )}
                                      height={CUSTOM_CHART.lineChart.height}
                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.lineChart.fontWeight
                                      }
                                      nameChart={"Time Slot"}
                                      description={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .description
                                      }
                                      displayName={false}
                                      colors={
                                        CUSTOM_CHART.lineChart.colorChannel
                                      }
                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                      symbolSize={
                                        CUSTOM_CHART.lineChart.symbolSize
                                      }
                                      lineWidth={
                                        CUSTOM_CHART.lineChart.lineWidth
                                      }
                                      areaStyle={true}
                                      stack={CUSTOM_CHART.lineChart.stack}
                                      showTopNSeries={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .showTopNSeries
                                      }
                                      xAxisTitle={
                                        CUSTOM_CHART.lineChart.xAxisTitle
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch("chart1077Data"),
                                        [dashboard.isLoading.chart1077Data],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "views",
                                  label: "Views",
                                  content: (
                                    <LineChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.chart1080Data
                                            ? transformMixedChartData(
                                                dashboard.chart1080Data?.data,
                                                "time_band_label",
                                                dashboard.chart1080Data
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.chart1080Data],
                                      )}
                                      height={CUSTOM_CHART.lineChart.height}
                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.lineChart.fontWeight
                                      }
                                      nameChart={"Time Slot"}
                                      description={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .description
                                      }
                                      displayName={false}
                                      colors={
                                        CUSTOM_CHART.lineChart.colorChannel
                                      }
                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                      symbolSize={
                                        CUSTOM_CHART.lineChart.symbolSize
                                      }
                                      lineWidth={
                                        CUSTOM_CHART.lineChart.lineWidth
                                      }
                                      areaStyle={true}
                                      stack={CUSTOM_CHART.lineChart.stack}
                                      showTopNSeries={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .showTopNSeries
                                      }
                                      xAxisTitle={
                                        CUSTOM_CHART.lineChart.xAxisTitle
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch("chart1080Data"),
                                        [dashboard.isLoading.chart1080Data],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "watch_time",
                                  label: "Watch Time",
                                  content: (
                                    <LineChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.chart1081Data
                                            ? transformMixedChartData(
                                                dashboard.chart1081Data?.data,
                                                "time_band_label",
                                                dashboard.chart1081Data
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.chart1081Data],
                                      )}
                                      height={CUSTOM_CHART.lineChart.height}
                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.lineChart.fontWeight
                                      }
                                      nameChart={"Time Slot"}
                                      description={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .description
                                      }
                                      displayName={false}
                                      colors={
                                        CUSTOM_CHART.lineChart.colorChannel
                                      }
                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                      symbolSize={
                                        CUSTOM_CHART.lineChart.symbolSize
                                      }
                                      lineWidth={
                                        CUSTOM_CHART.lineChart.lineWidth
                                      }
                                      areaStyle={true}
                                      stack={CUSTOM_CHART.lineChart.stack}
                                      showTopNSeries={
                                        CUSTOM_CHART.lineChart
                                          .lineChartPercentTimebandChannel
                                          .showTopNSeries
                                      }
                                      xAxisTitle={
                                        CUSTOM_CHART.lineChart.xAxisTitle
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch("chart1081Data"),
                                        [dashboard.isLoading.chart1081Data],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
                {
                  id: "live",
                  label: "Live TV",
                  icon: !darkMode ? iconChannel : iconChannelDark,
                  iconActive: iconChannelActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_live"
                    >
                      <InforTab
                        inforTab={"Live TV"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4">
                        <div className="w-full grid grid-cols-4 max-lg:grid-cols-4 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <NumberCard
                            title={"Avg.Reach"}
                            description={
                              "Trung bình mỗi ngày tiếp cận được bao nhiêu khán giả (Chỉ áp dụng Live TV)."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1027Data
                                  ? dashboard.chart1027Data?.data
                                    ? formatNumber(
                                        dashboard.chart1027Data?.data[0]
                                          .ave_reach_1,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1027Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.ave_reach.icon}
                            background={
                              METRIC_VIETNAMTODAYS.ave_reach.background
                            }
                            widthIcon={METRIC_VIETNAMTODAYS.ave_reach.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1027Data"),
                              [dashboard.isLoading.chart1027Data],
                            )}
                          />
                          <NumberCard
                            title={"Total Views"}
                            description={
                              "Tổng số lượt xem hợp lệ phát sinh trong kỳ (Chỉ áp dụng Live TV). (Quy định lượt xem hợp lệ: Live TV >= 30 giây)"
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1065Data
                                  ? dashboard.chart1065Data?.data
                                    ? formatNumber(
                                        dashboard.chart1065Data?.data[0]
                                          .total_view,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1065Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1065Data"),
                              [dashboard.isLoading.chart1065Data],
                            )}
                          />
                          <NumberCard
                            title={"Total Watch Time"}
                            description={
                              "Tổng thời gian thực tế người dùng theo dõi nội dung trong kỳ (Chỉ áp dụng Live TV)."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1066Data
                                  ? dashboard.chart1066Data?.data
                                    ? formatNumber(
                                        dashboard.chart1066Data?.data[0]
                                          .total_time_viewing,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1066Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1066Data"),
                              [dashboard.isLoading.chart1066Data],
                            )}
                          />
                          <NumberCard
                            title={"Minute/Viewer/Day"}
                            description={
                              "Thời lượng xem trung bình thực tế của 1 khán giả trong 1 ngày (Chỉ áp dụng Live TV)."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1042Data
                                  ? dashboard.chart1042Data?.data
                                    ? dashboard.chart1042Data?.data[0]?.[
                                        "minute/user/date"
                                      ]?.toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1042Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1042Data"),
                              [dashboard.isLoading.chart1042Data],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="px-6 max-lg:px-5 max-md:px-0 pt-4 max-lg:pt-3 max-md:pt-0 bg-background-black-4 max-md:bg-background-dashboard dark:bg-background-dark max-md:dark:bg-background-dashboard-dark rounded-2xl">
                            <ChildTabs
                              tabs={[
                                {
                                  id: "avg_reach",
                                  label: "Avg.Reach",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <LineChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1028Data
                                                ? transformMixedChartData(
                                                    dashboard.chart1028Data
                                                      ?.data,
                                                    "date",
                                                    dashboard.chart1028Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1028Data],
                                          )}
                                          height={CUSTOM_CHART.lineChart.height}
                                          fontSize={
                                            CUSTOM_CHART.lineChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.lineChart.fontWeight
                                          }
                                          nameChart={"Avg.Reach by Day"}
                                          description={false}
                                          colors={
                                            CUSTOM_CHART.lineChart.colorChannel
                                          }
                                          smooth={CUSTOM_CHART.lineChart.smooth}
                                          symbolSize={
                                            CUSTOM_CHART.lineChart.symbolSize
                                          }
                                          lineWidth={
                                            CUSTOM_CHART.lineChart.lineWidth
                                          }
                                          areaStyle={true}
                                          stack={CUSTOM_CHART.lineChart.stack}
                                          showTopNSeries={
                                            CUSTOM_CHART.lineChart
                                              .lineChartPercentTimebandChannel
                                              .showTopNSeries
                                          }
                                          xAxisTitle={"Date"}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1028Data",
                                              ),
                                            [dashboard.isLoading.chart1028Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1047Data
                                                ? transformPieChartData(
                                                    dashboard.chart1047Data
                                                      ?.data,
                                                    dashboard.chart1047Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1047Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={
                                            "Watch Time by Content Category"
                                          }
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          border={false}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1047Data",
                                              ),
                                            [dashboard.isLoading.chart1047Data],
                                          )}
                                        />
                                        <TableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1094Data
                                                ? transformTableChartData(
                                                    dashboard.chart1094Data
                                                      ?.data,
                                                    dashboard.chart1094Data
                                                      ?.colnames,
                                                    null,
                                                    [],
                                                    LABEL_VIETNAMTODAY,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1094Data],
                                          )}
                                          height={"400px"}
                                          fontSize={
                                            CUSTOM_CHART.tableChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.tableChart.fontWeight
                                          }
                                          nameChart={
                                            "Avg.Reach by Country - OTT"
                                          }
                                          description={false}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1094Data",
                                              ),
                                            [dashboard.isLoading.chart1094Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1044Data
                                                ? transformPieChartData(
                                                    dashboard.chart1044Data
                                                      ?.data,
                                                    dashboard.chart1044Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1044Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={"Avg.Reach by Device"}
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1044Data",
                                              ),
                                            [dashboard.isLoading.chart1044Data],
                                          )}
                                        />
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1037Data
                                                ? transformBarChartData(
                                                    dashboard.chart1037Data
                                                      ?.data,
                                                    dashboard.chart1037Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1037Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={
                                            "Avg.Reach by Device - OTT"
                                          }
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1037Data",
                                              ),
                                            [dashboard.isLoading.chart1037Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                                {
                                  id: "rating",
                                  label: "Rating",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <LineChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1029Data
                                                ? transformMixedChartData(
                                                    dashboard.chart1029Data
                                                      ?.data,
                                                    "date",
                                                    dashboard.chart1029Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1029Data],
                                          )}
                                          height={CUSTOM_CHART.lineChart.height}
                                          fontSize={
                                            CUSTOM_CHART.lineChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.lineChart.fontWeight
                                          }
                                          nameChart={"Rating by Day"}
                                          description={false}
                                          colors={
                                            CUSTOM_CHART.lineChart.colorChannel
                                          }
                                          smooth={CUSTOM_CHART.lineChart.smooth}
                                          symbolSize={
                                            CUSTOM_CHART.lineChart.symbolSize
                                          }
                                          lineWidth={
                                            CUSTOM_CHART.lineChart.lineWidth
                                          }
                                          areaStyle={true}
                                          stack={CUSTOM_CHART.lineChart.stack}
                                          showTopNSeries={
                                            CUSTOM_CHART.lineChart
                                              .lineChartPercentTimebandChannel
                                              .showTopNSeries
                                          }
                                          xAxisTitle={"Date"}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1029Data",
                                              ),
                                            [dashboard.isLoading.chart1029Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1048Data
                                                ? transformPieChartData(
                                                    dashboard.chart1048Data
                                                      ?.data,
                                                    dashboard.chart1048Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1048Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={"Rating by Country"}
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          border={false}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1048Data",
                                              ),
                                            [dashboard.isLoading.chart1048Data],
                                          )}
                                        />
                                        <TableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1095Data
                                                ? transformTableChartData(
                                                    dashboard.chart1095Data
                                                      ?.data,
                                                    dashboard.chart1095Data
                                                      ?.colnames,
                                                    null,
                                                    [],
                                                    LABEL_VIETNAMTODAY,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1095Data],
                                          )}
                                          height={"400px"}
                                          fontSize={
                                            CUSTOM_CHART.tableChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.tableChart.fontWeight
                                          }
                                          nameChart={"Rating by Country - OTT"}
                                          description={false}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1095Data",
                                              ),
                                            [dashboard.isLoading.chart1095Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1045Data
                                                ? transformPieChartData(
                                                    dashboard.chart1045Data
                                                      ?.data,
                                                    dashboard.chart1045Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1045Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={"Rating by Device"}
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1045Data",
                                              ),
                                            [dashboard.isLoading.chart1045Data],
                                          )}
                                        />
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1038Data
                                                ? transformBarChartData(
                                                    dashboard.chart1038Data
                                                      ?.data,
                                                    dashboard.chart1038Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1038Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={"Rating by Device - OTT"}
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1038Data",
                                              ),
                                            [dashboard.isLoading.chart1038Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                                {
                                  id: "watch_time",
                                  label: "Watch Time",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <LineChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1068Data
                                                ? transformMixedChartData(
                                                    dashboard.chart1068Data
                                                      ?.data,
                                                    "date",
                                                    dashboard.chart1068Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1068Data],
                                          )}
                                          height={CUSTOM_CHART.lineChart.height}
                                          fontSize={
                                            CUSTOM_CHART.lineChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.lineChart.fontWeight
                                          }
                                          nameChart={"Watch Time by Day"}
                                          description={false}
                                          colors={
                                            CUSTOM_CHART.lineChart.colorChannel
                                          }
                                          smooth={CUSTOM_CHART.lineChart.smooth}
                                          symbolSize={
                                            CUSTOM_CHART.lineChart.symbolSize
                                          }
                                          lineWidth={
                                            CUSTOM_CHART.lineChart.lineWidth
                                          }
                                          areaStyle={true}
                                          stack={CUSTOM_CHART.lineChart.stack}
                                          showTopNSeries={
                                            CUSTOM_CHART.lineChart
                                              .lineChartPercentTimebandChannel
                                              .showTopNSeries
                                          }
                                          xAxisTitle={"Date"}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1068Data",
                                              ),
                                            [dashboard.isLoading.chart1068Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1049Data
                                                ? transformPieChartData(
                                                    dashboard.chart1049Data
                                                      ?.data,
                                                    dashboard.chart1049Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1049Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={"Watch Time by Country"}
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          border={false}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1049Data",
                                              ),
                                            [dashboard.isLoading.chart1049Data],
                                          )}
                                        />
                                        <TableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1096Data
                                                ? transformTableChartData(
                                                    dashboard.chart1096Data
                                                      ?.data,
                                                    dashboard.chart1096Data
                                                      ?.colnames,
                                                    null,
                                                    [],
                                                    LABEL_VIETNAMTODAY,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1096Data],
                                          )}
                                          height={"400px"}
                                          fontSize={
                                            CUSTOM_CHART.tableChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.tableChart.fontWeight
                                          }
                                          nameChart={
                                            "Watch Time by Country - OTT"
                                          }
                                          description={false}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1096Data",
                                              ),
                                            [dashboard.isLoading.chart1096Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PieChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1046Data
                                                ? transformPieChartData(
                                                    dashboard.chart1046Data
                                                      ?.data,
                                                    dashboard.chart1046Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1046Data],
                                          )}
                                          height={CUSTOM_CHART.pieChart.height}
                                          fontSize={
                                            CUSTOM_CHART.pieChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.pieChart.fontWeight
                                          }
                                          nameChart={
                                            "Total Minutes Watched by Device"
                                          }
                                          center={true}
                                          description={false}
                                          donut={CUSTOM_CHART.pieChart.donut}
                                          innerRadius={
                                            CUSTOM_CHART.pieChart.innerRadius
                                          }
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1046Data",
                                              ),
                                            [dashboard.isLoading.chart1046Data],
                                          )}
                                        />
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1043Data
                                                ? transformBarChartData(
                                                    dashboard.chart1043Data
                                                      ?.data,
                                                    dashboard.chart1043Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1043Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={
                                            "Watch Time by Device - OTT"
                                          }
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1043Data",
                                              ),
                                            [dashboard.isLoading.chart1043Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1036Data
                                  ? transformPieChartData(
                                      dashboard.chart1036Data?.data,
                                      dashboard.chart1036Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1036Data],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={"Airtime Share by Content Category"}
                            colors={useMemo(
                              () => ({
                                "News & Current Affairs": "#6BD3B3",
                                "Life - Styles": "#EE5960",
                                Documentary: "#408184",
                                Entertainment: "#66CBE2",
                                "Educational & Training": "#5470C6",
                                Sports: "#FF874E",
                                "Events/Specials": "#03748E",
                              }),
                              [],
                            )}
                            description={false}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1036Data"),
                              [dashboard.isLoading.chart1036Data],
                            )}
                          />
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1032Data
                                  ? transformPieChartData(
                                      dashboard.chart1032Data?.data,
                                      dashboard.chart1032Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1032Data],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={"Viewing Time Share by Content Category"}
                            colors={useMemo(
                              () => ({
                                "News & Current Affairs": "#6BD3B3",
                                "Life - Styles": "#EE5960",
                                Documentary: "#408184",
                                Entertainment: "#66CBE2",
                                "Educational & Training": "#5470C6",
                                Sports: "#FF874E",
                                "Events/Specials": "#03748E",
                              }),
                              [],
                            )}
                            description={false}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1032Data"),
                              [dashboard.isLoading.chart1032Data],
                            )}
                          />
                        </div>
                        <div className="w-ful">
                          <div
                            className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={"Program Performance"}
                              description={false}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: "overview",
                                  label: "Overview",
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.chart1040Data
                                            ? transformTableChartData(
                                                dashboard.chart1040Data?.data,
                                                dashboard.chart1040Data
                                                  ?.colnames,
                                                null,
                                                [],
                                                LABEL_VIETNAMTODAY,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.chart1040Data],
                                      )}
                                      height={"400px"}
                                      fontSize={
                                        CUSTOM_CHART.tableChart.fontSize
                                      }
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.tableChart.fontWeight
                                      }
                                      nameChart={"Program Performance"}
                                      description={false}
                                      displayName={false}
                                      fullScreen={true}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch("chart1040Data"),
                                        [dashboard.isLoading.chart1040Data],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: "detail",
                                  label: "Detail",
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading.chart1041Data
                                            ? transformTableChartData(
                                                dashboard.chart1041Data?.data,
                                                dashboard.chart1041Data
                                                  ?.colnames,
                                                null,
                                                [],
                                                LABEL_VIETNAMTODAY,
                                              )
                                            : "isLoading",
                                        [dashboard.isLoading.chart1041Data],
                                      )}
                                      height={"400px"}
                                      fontSize={
                                        CUSTOM_CHART.tableChart.fontSize
                                      }
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.tableChart.fontWeight
                                      }
                                      nameChart={"Program Performance"}
                                      description={false}
                                      displayName={false}
                                      fullScreen={true}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch("chart1041Data"),
                                        [dashboard.isLoading.chart1041Data],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                        <Footer color="text-color-black-100 dark:text-color-white-90" />
                      </div>
                    </section>
                  ),
                },
                {
                  id: "vod",
                  label: "VOD",
                  icon: !darkMode ? iconProgram : iconProgramDark,
                  iconActive: iconProgramActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_vod"
                    >
                      <InforTab
                        inforTab={"VOD"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4">
                        <div className="w-full grid grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 py-6 max-lg:py-5 max-md:py-4">
                          <NumberCard
                            title={"Uni Viewers"}
                            description={
                              "Tổng số khán giả thực tế đã xem VOD trong kỳ (đã loại bỏ trùng lặp)."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1052Data
                                  ? dashboard.chart1052Data?.data
                                    ? formatNumber(
                                        dashboard.chart1052Data?.data[0]?.[
                                          "Unique users"
                                        ],
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1052Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.ave_reach.icon}
                            background={
                              METRIC_VIETNAMTODAYS.ave_reach.background
                            }
                            widthIcon={METRIC_VIETNAMTODAYS.ave_reach.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1052Data"),
                              [dashboard.isLoading.chart1052Data],
                            )}
                          />
                          <NumberCard
                            title={"Total Views"}
                            description={
                              "Tổng số lượt xem VOD hợp lệ trong kỳ (Lượt xem hợp lệ khi xem tối thiểu từ 15 giây)."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1051Data
                                  ? dashboard.chart1051Data?.data
                                    ? formatNumber(
                                        dashboard.chart1051Data?.data[0].Views,
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1051Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1051Data"),
                              [dashboard.isLoading.chart1051Data],
                            )}
                          />
                          <NumberCard
                            title={"View/VOD"}
                            description={
                              "Số lượt xem trung bình đạt được trên mỗi video VOD."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1050Data
                                  ? dashboard.chart1050Data?.data
                                    ? dashboard.chart1050Data?.data[0]?.[
                                        "Avg Views/VOD"
                                      ]?.toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1050Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1050Data"),
                              [dashboard.isLoading.chart1050Data],
                            )}
                          />
                          <NumberCard
                            title={"Time/View"}
                            description={
                              "Thời lượng xem trung bình trên mỗi lượt xem VOD."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1054Data
                                  ? dashboard.chart1054Data?.data
                                    ? dashboard.chart1054Data?.data[0]?.[
                                        "Avg Watch (Viewers)"
                                      ]?.toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1054Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1054Data"),
                              [dashboard.isLoading.chart1054Data],
                            )}
                          />
                          <NumberCard
                            title={"View Duration"}
                            description={
                              "Tỷ lệ phần trăm thời lượng xem trung bình so với tổng độ dài của video VOD."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1053Data
                                  ? dashboard.chart1053Data?.data
                                    ? formatNumber(
                                        dashboard.chart1053Data?.data[0]?.[
                                          "Avg View Duration (%)"
                                        ],
                                        { isPercent: true },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1053Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1053Data"),
                              [dashboard.isLoading.chart1053Data],
                            )}
                          />
                        </div>
                        <div></div>
                        <div></div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1071Data
                                  ? transformMixedChartData(
                                      dashboard.chart1071Data?.data,
                                      "date_local",
                                      dashboard.chart1071Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1071Data],
                            )}
                            height={CUSTOM_CHART.lineChart.height}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={"Views & Users by Day"}
                            description={
                              CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                .description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={
                              CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                .showTopNSeries
                            }
                            xAxisTitle={"Date"}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1071Data"),
                              [dashboard.isLoading.chart1071Data],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1069Data
                                  ? transformTableChartData(
                                      dashboard.chart1069Data?.data,
                                      dashboard.chart1069Data?.colnames,
                                      null,
                                      [],
                                      LABEL_VIETNAMTODAY,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1069Data],
                            )}
                            height={"350px"}
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"VOD Performance by Duration"}
                            description={false}
                            fullScreen={true}
                            showHeader={false}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1069Data"),
                              [dashboard.isLoading.chart1069Data],
                            )}
                          />
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1070Data
                                  ? transformTableChartData(
                                      dashboard.chart1070Data?.data,
                                      dashboard.chart1070Data?.colnames,
                                      null,
                                      [],
                                      LABEL_VIETNAMTODAY,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1070Data],
                            )}
                            height={"350px"}
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"VOD Performance by Duration & Category"}
                            description={false}
                            fullScreen={true}
                            showHeader={false}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1070Data"),
                              [dashboard.isLoading.chart1070Data],
                            )}
                          />
                        </div>
                        <div></div>
                        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1055Data
                                  ? transformBarChartData(
                                      dashboard.chart1055Data?.data,
                                      dashboard.chart1055Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1055Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Category Breakdown by Views"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1055Data"),
                              [dashboard.isLoading.chart1055Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1056Data
                                  ? transformBarChartData(
                                      dashboard.chart1056Data?.data,
                                      dashboard.chart1056Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1056Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.aveReach.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Category Breakdown by Users"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1056Data"),
                              [dashboard.isLoading.chart1056Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1057Data
                                  ? transformBarChartData(
                                      dashboard.chart1057Data?.data,
                                      dashboard.chart1057Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1057Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Category Breakdown by WatchTime"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1057Data"),
                              [dashboard.isLoading.chart1057Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1062Data
                                  ? transformBarChartData(
                                      dashboard.chart1062Data?.data,
                                      dashboard.chart1062Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1062Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Geographic Distribution of Views"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1062Data"),
                              [dashboard.isLoading.chart1062Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1063Data
                                  ? transformBarChartData(
                                      dashboard.chart1063Data?.data,
                                      dashboard.chart1063Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1063Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.aveReach.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Geographic Distribution of Total Users"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.aveReach
                                .colorZoom
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1063Data"),
                              [dashboard.isLoading.chart1063Data],
                            )}
                          />
                          <BarChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1064Data
                                  ? transformBarChartData(
                                      dashboard.chart1064Data?.data,
                                      dashboard.chart1064Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1064Data],
                            )}
                            height={CUSTOM_CHART.barChart.height}
                            fontSize={CUSTOM_CHART.barChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            colors={
                              CUSTOM_CHART.barChart.barChartArea.rating.color
                            }
                            fontWeight={CUSTOM_CHART.barChart.fontWeight}
                            nameChart={"Geographic Distribution of WatchTime"}
                            description={false}
                            orientation={
                              CUSTOM_CHART.barChart.barChartArea.orientation
                            }
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
                            refetch={useCallback(
                              () => dashboard.refetch("chart1064Data"),
                              [dashboard.isLoading.chart1064Data],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="px-6 max-lg:px-5 max-md:px-0 pt-4 max-lg:pt-3 max-md:pt-0 bg-background-black-4 max-md:bg-background-dashboard dark:bg-background-dark max-md:dark:bg-background-dashboard-dark rounded-2xl">
                            <ChildTabs
                              tabs={[
                                {
                                  id: "views",
                                  label: "Views",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PivotTableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1059Data
                                                ? dashboard.chart1059Data?.data
                                                : "isLoading",
                                            [dashboard.isLoading.chart1059Data],
                                          )}
                                          nameChart="View Distribution by Source & Category"
                                          description={false}
                                          rowField="Source_type"
                                          columnField="category"
                                          valueField={"Views"}
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
                                          labelTables={LABEL_VIETNAMTODAY}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1059Data",
                                              ),
                                            [dashboard.isLoading.chart1059Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1213Data
                                                ? transformBarChartData(
                                                    dashboard.chart1213Data
                                                      ?.data,
                                                    dashboard.chart1213Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1213Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={
                                            "Source Breakdown by Country (Views)"
                                          }
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1213Data",
                                              ),
                                            [dashboard.isLoading.chart1213Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                                {
                                  id: "users",
                                  label: "Users",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PivotTableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1060Data
                                                ? dashboard.chart1060Data?.data
                                                : "isLoading",
                                            [dashboard.isLoading.chart1060Data],
                                          )}
                                          nameChart="User Distribution by Source & Category"
                                          description={false}
                                          rowField="Source_type"
                                          columnField="category"
                                          valueField={"Unique users"}
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
                                          labelTables={LABEL_VIETNAMTODAY}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1060Data",
                                              ),
                                            [dashboard.isLoading.chart1060Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1214Data
                                                ? transformBarChartData(
                                                    dashboard.chart1214Data
                                                      ?.data,
                                                    dashboard.chart1214Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1214Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={
                                            "Source Breakdown by Country (Users)"
                                          }
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1214Data",
                                              ),
                                            [dashboard.isLoading.chart1214Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                                {
                                  id: "watch_time",
                                  label: "Watch Time",
                                  content: (
                                    <>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <PivotTableChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1061Data
                                                ? dashboard.chart1061Data?.data
                                                : "isLoading",
                                            [dashboard.isLoading.chart1061Data],
                                          )}
                                          nameChart="Watch Time Distribution by Source & Category"
                                          description={false}
                                          rowField="Source_type"
                                          columnField="category"
                                          valueField={"Duration_View"}
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
                                          labelTables={LABEL_VIETNAMTODAY}
                                          fullScreen={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1061Data",
                                              ),
                                            [dashboard.isLoading.chart1061Data],
                                          )}
                                        />
                                      </div>
                                      <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                        <BarChart
                                          data={useMemo(
                                            () =>
                                              !dashboard.isLoading.chart1215Data
                                                ? transformBarChartData(
                                                    dashboard.chart1215Data
                                                      ?.data,
                                                    dashboard.chart1215Data
                                                      ?.colnames,
                                                  )
                                                : "isLoading",
                                            [dashboard.isLoading.chart1215Data],
                                          )}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={
                                            CUSTOM_CHART.barChart.fontSize
                                          }
                                          fontFamily={
                                            CUSTOM_CHART.allChart.fontFamily
                                          }
                                          colors={
                                            CUSTOM_CHART.barChart.barChartArea
                                              .rating.color
                                          }
                                          fontWeight={
                                            CUSTOM_CHART.barChart.fontWeight
                                          }
                                          nameChart={
                                            "Source Breakdown by Country (Watch Time)"
                                          }
                                          description={false}
                                          orientation={"horizontal"}
                                          stack={true}
                                          refetch={useCallback(
                                            () =>
                                              dashboard.refetch(
                                                "chart1215Data",
                                              ),
                                            [dashboard.isLoading.chart1215Data],
                                          )}
                                        />
                                      </div>
                                    </>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1067Data
                                  ? transformMixedChartData(
                                      dashboard.chart1067Data?.data,
                                      "time_band_local",
                                      dashboard.chart1067Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1067Data],
                            )}
                            height={CUSTOM_CHART.lineChart.height}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={"Views by Time Slot"}
                            description={
                              CUSTOM_CHART.lineChart
                                .lineChartPercentTimebandChannel.description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={true}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={
                              CUSTOM_CHART.lineChart
                                .lineChartPercentTimebandChannel.showTopNSeries
                            }
                            xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1067Data"),
                              [dashboard.isLoading.chart1067Data],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1058Data
                                  ? transformTableChartData(
                                      dashboard.chart1058Data?.data,
                                      dashboard.chart1058Data?.colnames,
                                      null,
                                      [],
                                      LABEL_VIETNAMTODAY,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1058Data],
                            )}
                            height={"450px"}
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"Content Performance"}
                            description={false}
                            fullScreen={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1058Data"),
                              [dashboard.isLoading.chart1058Data],
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
                  id: "social",
                  label: "Social",
                  icon: !darkMode ? iconRatingByMinute : iconRatingByMinuteDark,
                  iconActive: iconRatingByMinuteActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_social"
                    >
                      <InforTab
                        inforTab={"Social"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4">
                        <div className="w-full grid grid-cols-4 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 py-6 max-lg:py-5 max-md:py-4">
                          <NumberCard
                            title={"Total Posts"}
                            description={
                              "Tổng số lượng bài viết đã đăng trong khoảng thời gian được chọn."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1091Data
                                  ? dashboard.chart1091Data?.data
                                    ? formatNumber(
                                        dashboard.chart1091Data?.data[0]?.[
                                          "Total Post"
                                        ],
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1091Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.ave_reach.icon}
                            background={
                              METRIC_VIETNAMTODAYS.ave_reach.background
                            }
                            widthIcon={METRIC_VIETNAMTODAYS.ave_reach.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1091Data"),
                              [dashboard.isLoading.chart1091Data],
                            )}
                          />
                          <NumberCard
                            title={"Engagement"}
                            description={
                              "Tổng số lượt tương tác phát sinh trên các bài viết được đăng trong khoảng thời gian báo cáo."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1092Data
                                  ? dashboard.chart1092Data?.data
                                    ? formatNumber(
                                        dashboard.chart1092Data?.data[0]?.[
                                          "Total Engagement"
                                        ],
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1092Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1092Data"),
                              [dashboard.isLoading.chart1092Data],
                            )}
                          />
                          <NumberCard
                            title={"Impressions"}
                            description={
                              "Tổng số lần nội dung hiển thị trên màn hình của người dùng (bao gồm cả lượt hiển thị lặp lại) trong khoảng thời gian được chọn."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1093Data
                                  ? dashboard.chart1093Data?.data
                                    ? formatNumber(
                                        dashboard.chart1093Data?.data[0]?.[
                                          "Total Impression"
                                        ],
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1093Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1093Data"),
                              [dashboard.isLoading.chart1093Data],
                            )}
                          />
                          <NumberCard
                            title={"Total Shares"}
                            description={
                              "Tổng số lượt chia sẻ của các bài viết được đăng trong khoảng thời gian báo cáo."
                            }
                            value={useMemo(
                              () =>
                                !dashboard.isLoading.chart1097Data
                                  ? dashboard.chart1097Data?.data
                                    ? formatNumber(
                                        dashboard.chart1097Data?.data[0]?.[
                                          "SUM(Shares)"
                                        ],
                                        { isPercent: false },
                                      )
                                    : "-"
                                  : "isLoading",
                              [dashboard.isLoading.chart1097Data],
                            )}
                            icon={METRIC_VIETNAMTODAYS.rating.icon}
                            background={METRIC_VIETNAMTODAYS.rating.background}
                            widthIcon={METRIC_VIETNAMTODAYS.rating.widthIcon}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1097Data"),
                              [dashboard.isLoading.chart1097Data],
                            )}
                          />
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1102Data
                                  ? transformPieChartData(
                                      dashboard.chart1102Data?.data,
                                      dashboard.chart1102Data?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1102Data],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={"Total Posts by Platform"}
                            center={true}
                            description={false}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            border={false}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1102Data"),
                              [dashboard.isLoading.chart1102Data],
                            )}
                          />
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart1090Data
                                  ? transformTableChartData(
                                      dashboard.chart1090Data?.data,
                                      dashboard.chart1090Data?.colnames,
                                      null,
                                      [],
                                      LABEL_VIETNAMTODAY,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart1090Data],
                            )}
                            height={"320px"}
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={"Performance Metrics by Platform"}
                            description={false}
                            fullScreen={true}
                            refetch={useCallback(
                              () => dashboard.refetch("chart1090Data"),
                              [dashboard.isLoading.chart1090Data],
                            )}
                          />
                        </div>
                        <div className="px-6 max-lg:px-5 max-md:px-0 pt-4 max-lg:pt-3 max-md:pt-0 bg-background-black-4 max-md:bg-background-dashboard dark:bg-background-dark max-md:dark:bg-background-dashboard-dark rounded-2xl">
                          <Title title={"Facebook"} />
                          <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                            <TableChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.chart1103Data
                                    ? transformTableChartData(
                                        dashboard.chart1103Data?.data,
                                        dashboard.chart1103Data?.colnames,
                                        null,
                                        [],
                                        LABEL_VIETNAMTODAY,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.chart1103Data],
                              )}
                              height={"100px"}
                              showHeader={false}
                              fontSize={CUSTOM_CHART.tableChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                              nameChart={"Facebook Insight"}
                              description={false}
                              fullScreen={true}
                              refetch={useCallback(
                                () => dashboard.refetch("chart1103Data"),
                                [dashboard.isLoading.chart1103Data],
                              )}
                            />
                          </div>
                          <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                            <LineChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.chart1104Data
                                    ? transformMixedChartData(
                                        dashboard.chart1104Data?.data,
                                        "day",
                                        dashboard.chart1104Data?.colnames,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.chart1104Data],
                              )}
                              height={"350px"}
                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                              nameChart={"Followers Trend - Last 30 days"}
                              description={
                                CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                  .description
                              }
                              colors={CUSTOM_CHART.lineChart.colorChannel}
                              smooth={CUSTOM_CHART.lineChart.smooth}
                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                              stack={CUSTOM_CHART.lineChart.stack}
                              legendTop={true}
                              showLabel={false}
                              showTopNSeries={
                                CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                  .showTopNSeries
                              }
                              xAxisTitle={"Date"}
                              refetch={useCallback(
                                () => dashboard.refetch("chart1104Data"),
                                [dashboard.isLoading.chart1104Data],
                              )}
                            />
                            <LineChart
                              data={useMemo(
                                () =>
                                  !dashboard.isLoading.chart1105Data
                                    ? transformMixedChartData(
                                        dashboard.chart1105Data?.data,
                                        "day",
                                        dashboard.chart1105Data?.colnames,
                                      )
                                    : "isLoading",
                                [dashboard.isLoading.chart1105Data],
                              )}
                              height={"350px"}
                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                              nameChart={"Engagements Trend - Last 30 Days"}
                              description={
                                CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                  .description
                              }
                              colors={CUSTOM_CHART.lineChart.colorChannel}
                              smooth={CUSTOM_CHART.lineChart.smooth}
                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                              legendTop={true}
                              showLabel={false}
                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                              stack={CUSTOM_CHART.lineChart.stack}
                              showTopNSeries={
                                CUSTOM_CHART.lineChart.lineChartTimebandRegional
                                  .showTopNSeries
                              }
                              xAxisTitle={"Date"}
                              refetch={useCallback(
                                () => dashboard.refetch("chart1105Data"),
                                [dashboard.isLoading.chart1105Data],
                              )}
                            />
                          </div>
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
      {/* <ChatBot /> */}
    </DashboardFilterProvider>
  );
};

export default React.memo(Dashboard);
