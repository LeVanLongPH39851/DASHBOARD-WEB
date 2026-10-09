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
                            xAxisTitle={"Ngày"}
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
                            xAxisTitle={"Ngày"}
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
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
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
                            colorZoom={
                              CUSTOM_CHART.barChart.barChartArea.rating
                                .colorZoom
                            }
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
                            colors={{
                              "News & Current Affairs": "#6BD3B3",
                              "Life - Styles": "#EE5960",
                              Documentary: "#408184",
                              Entertainment: "#66CBE2",
                              "Educational & Training": "#5470C6",
                              Sports: "#FF874E",
                              "Events/Specials": "#03748E",
                            }}
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
                            valueField={["Avg.Reach", "Views", "Watch Time"]}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
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
                            valueField={[
                              "ave_reach_1",
                              "Total_Views",
                              "total_time_viewing",
                            ]}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
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
                            valueField={[
                              "ave_reach_1",
                              "Total_Views",
                              "total_time_viewing",
                            ]}
                            aggType="sum"
                            height={
                              CUSTOM_CHART.tableChart.tableChartChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
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
                      id="target_capture_channel"
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
                        <div className="px-6 max-lg:px-5 max-md:px-0 pt-4 max-lg:pt-3 max-md:pt-0 bg-background-black-4 max-md:bg-background-dashboard dark:bg-background-dark max-md:dark:bg-background-dashboard-dark rounded-2xl">
                          <NormalTabs
                            tabs={[
                              {
                                id: "%",
                                label: "(%)",
                                content: (
                                  <>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart642Data
                                              ? transformMixedChartData(
                                                  dashboard.chart642Data?.data,
                                                  "date",
                                                  dashboard.chart642Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart642Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartPercentDateChannel.rating
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartPercentDateChannel.rating
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart.showTopNSeries
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart642Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart642Data"),
                                          [dashboard.isLoading.chart642Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart633Data
                                              ? transformMixedChartData(
                                                  dashboard.chart633Data?.data,
                                                  "date",
                                                  dashboard.chart633Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart633Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartPercentDateChannel
                                            .aveReach.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartPercentDateChannel
                                            .aveReach.description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart.showTopNSeries
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart633Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart633Data"),
                                          [dashboard.isLoading.chart633Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-0">
                                      <TreeMapChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart632Data
                                              ? transformTreeMapData(
                                                  dashboard.chart632Data?.data,
                                                  dashboard.chart632Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart632Data],
                                        )}
                                        height={
                                          CUSTOM_CHART.treeMapChart.height
                                        }
                                        fontSize={
                                          CUSTOM_CHART.treeMapChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.treeMapChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.treeMapChart
                                            .treeMapChartPercentChannel.name
                                        }
                                        description={
                                          CUSTOM_CHART.treeMapChart
                                            .treeMapChartPercentChannel
                                            .description
                                        }
                                        colors={
                                          CUSTOM_CHART.treeMapChart.colorChannel
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart632Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart632Data"),
                                          [dashboard.isLoading.chart632Data],
                                        )}
                                      />
                                    </div>
                                  </>
                                ),
                              },
                              {
                                id: "000",
                                label: "(000)",
                                content: (
                                  <>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart634Data
                                              ? transformMixedChartData(
                                                  dashboard.chart634Data?.data,
                                                  "Khung giờ",
                                                  dashboard.chart634Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart634Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandChannel.rating
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandChannel.rating
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandChannel
                                            .showTopNSeries
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.lineChart.xAxisTitle
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart634Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart634Data"),
                                          [dashboard.isLoading.chart634Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart635Data
                                              ? transformMixedChartData(
                                                  dashboard.chart635Data?.data,
                                                  "date",
                                                  dashboard.chart635Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart635Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartDateChannel.rating.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartDateChannel.rating
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart.showTopNSeries
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart635Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart635Data"),
                                          [dashboard.isLoading.chart635Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart677Data
                                              ? transformMixedChartData(
                                                  dashboard.chart677Data?.data,
                                                  "date",
                                                  dashboard.chart677Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart677Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartDateChannel.aveReach.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartDateChannel.aveReach
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart.showTopNSeries
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart677Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart677Data"),
                                          [dashboard.isLoading.chart677Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <div
                                        className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                                      >
                                        <NameChart
                                          nameChart={
                                            "Rating và Ave.Reach của thể loại theo thị trường"
                                          }
                                          description={false}
                                          opacity={true}
                                        />
                                        <ChildTabs
                                          tabs={[
                                            {
                                              id: CUSTOM_TAB.childTabArea
                                                .regional.id,
                                              label:
                                                CUSTOM_TAB.childTabArea.regional
                                                  .label,
                                              content: (
                                                <TableChart
                                                  data={useMemo(
                                                    () =>
                                                      !dashboard.isLoading
                                                        .chart669Data
                                                        ? transformTableChartData(
                                                            dashboard
                                                              .chart669Data
                                                              ?.data,
                                                            dashboard
                                                              .chart669Data
                                                              ?.colnames,
                                                          )
                                                        : "isLoading",
                                                    [
                                                      dashboard.isLoading
                                                        .chart669Data,
                                                    ],
                                                  )}
                                                  height={"450px"}
                                                  fontSize={
                                                    CUSTOM_CHART.tableChart
                                                      .fontSize
                                                  }
                                                  fontFamily={
                                                    CUSTOM_CHART.allChart
                                                      .fontFamily
                                                  }
                                                  fontWeight={
                                                    CUSTOM_CHART.tableChart
                                                      .fontWeight
                                                  }
                                                  nameChart={
                                                    "Rating và Ave.Reach của thể loại theo thị trường"
                                                  }
                                                  description={false}
                                                  displayName={false}
                                                  showSTT={false}
                                                  showPagination={true}
                                                  customCol={
                                                    CUSTOM_CHART.tableChart
                                                      .tableProgramChannel
                                                      .programArea.customCol
                                                  }
                                                  crossFilter={true}
                                                  keyChart={"chart669Data"}
                                                  refetch={useCallback(
                                                    () =>
                                                      dashboard.refetch(
                                                        "chart669Data",
                                                      ),
                                                    [
                                                      dashboard.isLoading
                                                        .chart669Data,
                                                    ],
                                                  )}
                                                />
                                              ),
                                            },
                                            {
                                              id: CUSTOM_TAB.childTabArea
                                                .key_city.id,
                                              label:
                                                CUSTOM_TAB.childTabArea.key_city
                                                  .label,
                                              content: (
                                                <TableChart
                                                  data={useMemo(
                                                    () =>
                                                      !dashboard.isLoading
                                                        .chart670Data
                                                        ? transformTableChartData(
                                                            dashboard
                                                              .chart670Data
                                                              ?.data,
                                                            dashboard
                                                              .chart670Data
                                                              ?.colnames,
                                                          )
                                                        : "isLoading",
                                                    [
                                                      dashboard.isLoading
                                                        .chart670Data,
                                                    ],
                                                  )}
                                                  height={"450px"}
                                                  fontSize={
                                                    CUSTOM_CHART.tableChart
                                                      .fontSize
                                                  }
                                                  fontFamily={
                                                    CUSTOM_CHART.allChart
                                                      .fontFamily
                                                  }
                                                  fontWeight={
                                                    CUSTOM_CHART.tableChart
                                                      .fontWeight
                                                  }
                                                  nameChart={
                                                    "Rating và Ave.Reach của thể loại theo thị trường"
                                                  }
                                                  description={false}
                                                  displayName={false}
                                                  showSTT={false}
                                                  showPagination={true}
                                                  customCol={
                                                    CUSTOM_CHART.tableChart
                                                      .tableProgramChannel
                                                      .programArea.customCol
                                                  }
                                                  crossFilter={true}
                                                  keyChart={"chart669Data"}
                                                  refetch={useCallback(
                                                    () =>
                                                      dashboard.refetch(
                                                        "chart670Data",
                                                      ),
                                                    [
                                                      dashboard.isLoading
                                                        .chart670Data,
                                                    ],
                                                  )}
                                                />
                                              ),
                                            },
                                            {
                                              id: CUSTOM_TAB.childTabArea
                                                .province.id,
                                              label:
                                                CUSTOM_TAB.childTabArea.province
                                                  .label,
                                              content: (
                                                <TableChart
                                                  data={useMemo(
                                                    () =>
                                                      !dashboard.isLoading
                                                        .chart671Data
                                                        ? transformTableChartData(
                                                            dashboard
                                                              .chart671Data
                                                              ?.data,
                                                            dashboard
                                                              .chart671Data
                                                              ?.colnames,
                                                          )
                                                        : "isLoading",
                                                    [
                                                      dashboard.isLoading
                                                        .chart671Data,
                                                    ],
                                                  )}
                                                  height={"450px"}
                                                  fontSize={
                                                    CUSTOM_CHART.tableChart
                                                      .fontSize
                                                  }
                                                  fontFamily={
                                                    CUSTOM_CHART.allChart
                                                      .fontFamily
                                                  }
                                                  fontWeight={
                                                    CUSTOM_CHART.tableChart
                                                      .fontWeight
                                                  }
                                                  nameChart={
                                                    "Rating và Ave.Reach của thể loại theo thị trường"
                                                  }
                                                  description={false}
                                                  displayName={false}
                                                  showSTT={false}
                                                  showPagination={true}
                                                  customCol={
                                                    CUSTOM_CHART.tableChart
                                                      .tableProgramChannel
                                                      .programArea.customCol
                                                  }
                                                  crossFilter={true}
                                                  keyChart={"chart670Data"}
                                                  refetch={useCallback(
                                                    () =>
                                                      dashboard.refetch(
                                                        "chart671Data",
                                                      ),
                                                    [
                                                      dashboard.isLoading
                                                        .chart671Data,
                                                    ],
                                                  )}
                                                />
                                              ),
                                            },
                                            {
                                              id: CUSTOM_TAB.childTabArea.others
                                                .id,
                                              label:
                                                CUSTOM_TAB.childTabArea.others
                                                  .label,
                                              content: (
                                                <TableChart
                                                  data={useMemo(
                                                    () =>
                                                      !dashboard.isLoading
                                                        .chart672Data
                                                        ? transformTableChartData(
                                                            dashboard
                                                              .chart672Data
                                                              ?.data,
                                                            dashboard
                                                              .chart672Data
                                                              ?.colnames,
                                                          )
                                                        : "isLoading",
                                                    [
                                                      dashboard.isLoading
                                                        .chart672Data,
                                                    ],
                                                  )}
                                                  height={"450px"}
                                                  fontSize={
                                                    CUSTOM_CHART.tableChart
                                                      .fontSize
                                                  }
                                                  fontFamily={
                                                    CUSTOM_CHART.allChart
                                                      .fontFamily
                                                  }
                                                  fontWeight={
                                                    CUSTOM_CHART.tableChart
                                                      .fontWeight
                                                  }
                                                  nameChart={
                                                    "Rating và Ave.Reach của thể loại theo thị trường"
                                                  }
                                                  description={false}
                                                  displayName={false}
                                                  showSTT={false}
                                                  showPagination={true}
                                                  customCol={
                                                    CUSTOM_CHART.tableChart
                                                      .tableProgramChannel
                                                      .programArea.customCol
                                                  }
                                                  crossFilter={true}
                                                  keyChart={"chart671Data"}
                                                  refetch={useCallback(
                                                    () =>
                                                      dashboard.refetch(
                                                        "chart672Data",
                                                      ),
                                                    [
                                                      dashboard.isLoading
                                                        .chart672Data,
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
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart666Data
                                              ? transformMixedChartData(
                                                  dashboard.chart666Data?.data,
                                                  "Khung giờ",
                                                  dashboard.chart666Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart666Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.rating.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.rating
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.showTopNSeries
                                        }
                                        left={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.left
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.lineChart.xAxisTitle
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart666Data"),
                                          [dashboard.isLoading.chart666Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart665Data
                                              ? transformMixedChartData(
                                                  dashboard.chart665Data?.data,
                                                  "Khung giờ",
                                                  dashboard.chart665Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart665Data],
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
                                        nameChart={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.aveReach.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.aveReach
                                            .description
                                        }
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
                                        areaStyle={
                                          CUSTOM_CHART.lineChart.areaStyle
                                        }
                                        stack={CUSTOM_CHART.lineChart.stack}
                                        showTopNSeries={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.showTopNSeries
                                        }
                                        left={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandDay.left
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.lineChart.xAxisTitle
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart665Data"),
                                          [dashboard.isLoading.chart665Data],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-0">
                                      <TreeMapChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading.chart636Data
                                              ? transformTreeMapData(
                                                  dashboard.chart636Data?.data,
                                                  dashboard.chart636Data
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [dashboard.isLoading.chart636Data],
                                        )}
                                        height={
                                          CUSTOM_CHART.treeMapChart.height
                                        }
                                        fontSize={
                                          CUSTOM_CHART.treeMapChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.treeMapChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.treeMapChart
                                            .treeMapChartChannel.name
                                        }
                                        description={
                                          CUSTOM_CHART.treeMapChart
                                            .treeMapChartChannel.description
                                        }
                                        colors={
                                          CUSTOM_CHART.treeMapChart.colorChannel
                                        }
                                        crossFilter={"channels"}
                                        keyChart={"chart636Data"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch("chart636Data"),
                                          [dashboard.isLoading.chart636Data],
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
                      id="target_capture_program"
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
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.chart645Data
                                  ? transformTableChartData(
                                      dashboard.chart645Data?.data,
                                      dashboard.chart645Data?.colnames,
                                      CUSTOM_CHART.tableChart
                                        .tableProgramChannel.programEvent
                                        .columnSort,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.chart645Data],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableProgramChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programEvent.name
                            }
                            description={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programEvent.description
                            }
                            showSTT={
                              CUSTOM_CHART.tableChart.tableProgramChannel.STT
                            }
                            showPagination={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .pagination
                            }
                            fullScreen={true}
                            customCol={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .customCol
                            }
                            crossFilter={true}
                            keyChart={"chart645Data"}
                            refetch={useCallback(
                              () => dashboard.refetch("chart645Data"),
                              [dashboard.isLoading.chart645Data],
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
                      id="target_capture_rating_by_minute"
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
                        <div className="w-full py-6 max-lg:py-5 max-md:pb-4">
                          <LineChart
                            data={
                              !dashboard.isLoading.chart680Data
                                ? transformMixedChartData(
                                    dashboard.chart680Data?.data,
                                    "event_hour_minute",
                                    dashboard.chart680Data?.colnames,
                                  )
                                : "isLoading"
                            }
                            height={CUSTOM_CHART.lineChart.heightMinute}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.lineChart.lineChartMinuteChannel.name
                            }
                            description={
                              CUSTOM_CHART.lineChart.lineChartMinuteChannel
                                .description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={0}
                            legendTop={
                              CUSTOM_CHART.lineChart.lineChartMinuteChannel
                                .legendTop
                            }
                            xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitleMinute}
                            fullScreen={true}
                            crossFilter={"channels"}
                            keyChart={"chart680Data"}
                            refetch={() => dashboard.refetch("chart680Data")}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={
                              !dashboard.isLoading.chart678Data
                                ? transformMixedChartData(
                                    dashboard.chart678Data?.data,
                                    "event_hour_minute",
                                    dashboard.chart678Data?.colnames,
                                    "full_timeband_minute",
                                  )
                                : "isLoading"
                            }
                            height={CUSTOM_CHART.lineChart.heightMinute}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.lineChart.lineChartMinuteDay.name +
                              " (" +
                              formatDate(
                                appliedFilters?.endDate || getYesterday(),
                              ) +
                              (appliedFilters?.channels?.length > 0
                                ? " - " + appliedFilters?.channels[0]
                                : " - VTV1") +
                              ")"
                            }
                            description={
                              CUSTOM_CHART.lineChart.lineChartMinuteDay
                                .description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={0}
                            legendTop={
                              CUSTOM_CHART.lineChart.lineChartMinuteChannel
                                .legendTop
                            }
                            xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitleMinute}
                            fullScreen={true}
                            textOverflow={true}
                            crossFilter={"programs"}
                            keyChart={"chart678Data"}
                            refetch={() => dashboard.refetch("chart678Data")}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <LineChart
                            data={
                              !dashboard.isLoading.chart681Data
                                ? transformMixedChartData(
                                    dashboard.chart681Data?.data,
                                    "event_hour_minute",
                                    dashboard.chart681Data?.colnames,
                                  )
                                : "isLoading"
                            }
                            height={CUSTOM_CHART.lineChart.heightMinute}
                            fontSize={CUSTOM_CHART.lineChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.lineChart.lineChartMinuteDays.name +
                              " (" +
                              "nhiều ngày " +
                              (appliedFilters?.channels?.length > 0
                                ? " - " + appliedFilters?.channels[0]
                                : " - VTV1") +
                              ")"
                            }
                            description={
                              CUSTOM_CHART.lineChart.lineChartMinuteDays
                                .description
                            }
                            colors={CUSTOM_CHART.lineChart.colorChannel}
                            smooth={CUSTOM_CHART.lineChart.smooth}
                            symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                            lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                            areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                            stack={CUSTOM_CHART.lineChart.stack}
                            showTopNSeries={0}
                            legendTop={
                              CUSTOM_CHART.lineChart.lineChartMinuteChannel
                                .legendTop
                            }
                            fullScreen={true}
                            textOverflow={true}
                            refetch={() => dashboard.refetch("chart681Data")}
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
      {/* <ChatBot /> */}
    </DashboardFilterProvider>
  );
};

export default React.memo(Dashboard);
