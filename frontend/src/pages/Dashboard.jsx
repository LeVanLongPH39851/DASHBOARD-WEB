import React, { useCallback, useEffect, useMemo, useState } from "react";
import NumberCard from "../components/charts/NumberCard";
import Filter from "../components/layouts/filters/Filter";
import { METRICS } from "../utils/metricInfor";
import { CUSTOM_CHART } from "../utils/customChart";
import { formatNumber } from "../utils/formatNumber";
import { transformBarChartData } from "../utils/transformApiBartChart";
import BarChart from "../components/charts/BarChart";
import { useDashboardData } from "../hooks/useDashboardData";
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
      ratingNumber: !dashboard.isLoading.ratingNumberData
        ? dashboard.ratingNumberData.data
          ? dashboard.ratingNumberData.data[0]
          : "-"
        : false,
      aveReachNumber: !dashboard.isLoading.aveReachNumberData
        ? dashboard.aveReachNumberData.data
          ? dashboard.aveReachNumberData.data[0]
          : "-"
        : false,
      ratingPercentNumber: !dashboard.isLoading.ratingPercentNumberData
        ? dashboard.ratingPercentNumberData.data
          ? dashboard.ratingPercentNumberData.data[0]
          : "-"
        : false,
      aveReachPercentNumber: !dashboard.isLoading.aveReachPercentNumberData
        ? dashboard.aveReachPercentNumberData.data
          ? dashboard.aveReachPercentNumberData.data[0]
          : "-"
        : false,
    };
  }, [
    dashboard.isLoading.ratingNumberData,
    dashboard.isLoading.aveReachNumberData,
    dashboard.isLoading.ratingPercentNumberData,
    dashboard.isLoading.aveReachPercentNumberData,
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
          <BreadCrumb />
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
                        inforTab={"Tổng quan - P4+ toàn quốc"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4">
                        <div className="w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <NumberWithTrendChart
                            nameChart={METRICS["rating%"].title}
                            description={METRICS["rating%"].description}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontSize={
                              CUSTOM_CHART.numberWithTrendChart.fontSize
                            }
                            fontWeight={
                              CUSTOM_CHART.numberWithTrendChart.fontWeight
                            }
                            data={useMemo(
                              () =>
                                !dashboard.isLoading
                                  .ratingPercentTrendNumberData
                                  ? transformNumberWithTrendData(
                                      dashboard.ratingPercentTrendNumberData
                                        ?.data,
                                      dashboard.ratingPercentTrendNumberData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [
                                dashboard.isLoading
                                  .ratingPercentTrendNumberData,
                              ],
                            )}
                            icon={METRICS.rating.icon}
                            refetch={useCallback(
                              () =>
                                dashboard.refetch(
                                  "ratingPercentTrendNumberData",
                                ),
                              [
                                dashboard.isLoading
                                  .ratingPercentTrendNumberData,
                              ],
                            )}
                          />
                          <div className="grid grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4">
                            {Object.values(METRICS).map((card) => (
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
                        </div>
                        <div className="w-full flex gap-6 max-lg:gap-5 max-md:gap-4 max-md:flex-wrap pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="w-[60%] max-md:w-full">
                            <div
                              className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                            >
                              <NameChart
                                nameChart={
                                  CUSTOM_CHART.barChart.barChartChannelEvent
                                    .ratingNameChart
                                }
                                description={METRICS.rating.description}
                                opacity={true}
                              />
                              <ChildTabs
                                tabs={[
                                  {
                                    id: CUSTOM_TAB.childTabRatingReach.rating
                                      .id,
                                    label:
                                      CUSTOM_TAB.childTabRatingReach.rating
                                        .label,
                                    content: (
                                      <BarChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingBarChannelEventData
                                              ? transformBarChartData(
                                                  dashboard
                                                    .ratingBarChannelEventData
                                                    ?.data,
                                                  dashboard
                                                    .ratingBarChannelEventData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingBarChannelEventData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={
                                          CUSTOM_CHART.barChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        colors={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.colors
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.barChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent
                                            .ratingNameChart
                                        }
                                        description={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.description
                                        }
                                        orientation={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.orientation
                                        }
                                        displayName={false}
                                        crossFilter="events"
                                        keyChart="barChannelEventData"
                                        stack={true}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingBarChannelEventData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingBarChannelEventData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                  {
                                    id: CUSTOM_TAB.childTabRatingReach.ave_reach
                                      .id,
                                    label:
                                      CUSTOM_TAB.childTabRatingReach.ave_reach
                                        .label,
                                    content: (
                                      <BarChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachBarChannelEventData
                                              ? transformBarChartData(
                                                  dashboard
                                                    .aveReachBarChannelEventData
                                                    ?.data,
                                                  dashboard
                                                    .aveReachBarChannelEventData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachBarChannelEventData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={
                                          CUSTOM_CHART.barChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        colors={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.colors
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.barChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent
                                            .aveReachNameChart
                                        }
                                        description={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.description
                                        }
                                        orientation={
                                          CUSTOM_CHART.barChart
                                            .barChartChannelEvent.orientation
                                        }
                                        displayName={false}
                                        crossFilter="events"
                                        keyChart="barChannelEventData"
                                        stack={true}
                                        refetch={useCallback(() => {
                                          dashboard.refetch(
                                            "aveReachBarChannelEventData",
                                          );
                                        }, [
                                          dashboard.isLoading
                                            .aveReachBarChannelEventData,
                                        ])}
                                      />
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                          <div className="w-[40%] max-md:w-full">
                            <div
                              className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                            >
                              <NameChart
                                nameChart={
                                  CUSTOM_CHART.barChart.barChartChannelEvent
                                    .ratingNameChart
                                }
                                description={METRICS.rating.description}
                                opacity={true}
                              />
                              <ChildTabs
                                tabs={[
                                  {
                                    id: CUSTOM_TAB.childTabRatingReach.rating
                                      .id,
                                    label:
                                      CUSTOM_TAB.childTabRatingReach.rating
                                        .label,
                                    content: (
                                      <BarChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingBarDayEventData
                                              ? transformBarChartData(
                                                  dashboard
                                                    .ratingBarDayEventData
                                                    ?.data,
                                                  dashboard
                                                    .ratingBarDayEventData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingBarDayEventData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={
                                          CUSTOM_CHART.barChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        colors={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .colors
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.barChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .ratingNameChart
                                        }
                                        description={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .description
                                        }
                                        orientation={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .orientation
                                        }
                                        displayName={false}
                                        crossFilter="events"
                                        keyChart="barDayEventData"
                                        stack={true}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingBarDayEventData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingBarDayEventData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                  {
                                    id: CUSTOM_TAB.childTabRatingReach.ave_reach
                                      .id,
                                    label:
                                      CUSTOM_TAB.childTabRatingReach.ave_reach
                                        .label,
                                    content: (
                                      <BarChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachBarDayEventData
                                              ? transformBarChartData(
                                                  dashboard
                                                    .aveReachBarDayEventData
                                                    ?.data,
                                                  dashboard
                                                    .aveReachBarDayEventData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachBarDayEventData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={
                                          CUSTOM_CHART.barChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        colors={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .colors
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.barChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .aveReachNameChart
                                        }
                                        description={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .description
                                        }
                                        orientation={
                                          CUSTOM_CHART.barChart.barChartDayEvent
                                            .orientation
                                        }
                                        displayName={false}
                                        crossFilter="events"
                                        keyChart="barDayEventData"
                                        stack={true}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachBarDayEventData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachBarDayEventData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex gap-6 max-lg:gap-5 max-md:gap-4 max-md:flex-wrap pb-6 max-lg:pb-5 max-md:pb-4">
                          <div className="w-[60%] max-md:w-full">
                            <div
                              className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                            >
                              <NameChart
                                nameChart={
                                  CUSTOM_CHART.tableChart.tableChartChannel.name
                                }
                                description={
                                  CUSTOM_CHART.tableChart.tableChartChannel
                                    .description
                                }
                                opacity={true}
                                fullScreen={true}
                              />
                              <ChildTabs
                                tabs={[
                                  {
                                    id: CUSTOM_TAB.childTabChannel.channel.id,
                                    label:
                                      CUSTOM_TAB.childTabChannel.channel.label,
                                    content: (
                                      <TableChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .allTableChannelData
                                              ? transformTableChartData(
                                                  dashboard.allTableChannelData
                                                    ?.data,
                                                  dashboard.allTableChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .allTableChannelData,
                                          ],
                                        )}
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
                                        nameChart={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.name
                                        }
                                        description={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.description
                                        }
                                        showSTT={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.STT
                                        }
                                        showPagination={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.pagination
                                        }
                                        displayName={false}
                                        customCol={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.customColChannel
                                        }
                                        crossFilter={true}
                                        keyChart={"allTableChannelData"}
                                        fullScreen={true}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "allTableChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .allTableChannelData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                  {
                                    id: CUSTOM_TAB.childTabChannel.event.id,
                                    label:
                                      CUSTOM_TAB.childTabChannel.event.label,
                                    content: (
                                      <TableChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .allTableChannelEventData
                                              ? transformTableChartData(
                                                  dashboard
                                                    .allTableChannelEventData
                                                    ?.data,
                                                  dashboard
                                                    .allTableChannelEventData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .allTableChannelEventData,
                                          ],
                                        )}
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
                                        nameChart={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.name
                                        }
                                        description={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.description
                                        }
                                        showSTT={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.STT
                                        }
                                        showPagination={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel.pagination
                                        }
                                        displayName={false}
                                        customCol={
                                          CUSTOM_CHART.tableChart
                                            .tableChartChannel
                                            .customColChannelEvent
                                        }
                                        crossFilter={true}
                                        keyChart={"allTableChannelData"}
                                        fullScreen={true}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "allTableChannelEventData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .allTableChannelEventData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                          <div className="w-[40%] max-md:w-full">
                            <div
                              className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                            >
                              <NameChart
                                nameChart={
                                  CUSTOM_CHART.tableChart.tableChartArea.name
                                }
                                description={
                                  CUSTOM_CHART.tableChart.tableChartArea
                                    .description
                                }
                                opacity={true}
                              />
                              <ChildTabs
                                tabs={[
                                  {
                                    id: CUSTOM_TAB.childTabArea.regional.id,
                                    label:
                                      CUSTOM_TAB.childTabArea.regional.label,
                                    content: (
                                      <TableChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingReachPercentTableRegionalData
                                              ? transformTableChartData(
                                                  dashboard
                                                    .ratingReachPercentTableRegionalData
                                                    ?.data,
                                                  dashboard
                                                    .ratingReachPercentTableRegionalData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentTableRegionalData,
                                          ],
                                        )}
                                        height={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .height
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
                                        nameChart={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .description
                                        }
                                        showSTT={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .STT
                                        }
                                        showPagination={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .pagination
                                        }
                                        displayName={false}
                                        customCol={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .customColRegional
                                        }
                                        crossFilter={true}
                                        keyChart={
                                          "ratingReachPercentTableRegionalData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingReachPercentTableRegionalData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentTableRegionalData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                  {
                                    id: CUSTOM_TAB.childTabArea.province.id,
                                    label:
                                      CUSTOM_TAB.childTabArea.province.label,
                                    content: (
                                      <TableChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingReachPercentTableProvinceData
                                              ? transformTableChartData(
                                                  dashboard
                                                    .ratingReachPercentTableProvinceData
                                                    ?.data,
                                                  dashboard
                                                    .ratingReachPercentTableProvinceData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentTableProvinceData,
                                          ],
                                        )}
                                        height={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .height
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
                                        nameChart={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .description
                                        }
                                        showSTT={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .STT
                                        }
                                        showPagination={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .pagination
                                        }
                                        displayName={false}
                                        customCol={
                                          CUSTOM_CHART.tableChart.tableChartArea
                                            .customColProvince
                                        }
                                        crossFilter={true}
                                        keyChart={
                                          "ratingReachPercentTableProvinceData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingReachPercentTableProvinceData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentTableProvinceData,
                                          ],
                                        )}
                                      />
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4">
                          <div
                            className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={
                                CUSTOM_CHART.barChart.barChartArea.rating.name
                              }
                              description={METRICS.rating.description}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: CUSTOM_TAB.childTabArea.regional.id,
                                  label: CUSTOM_TAB.childTabArea.regional.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingBarRegionalData
                                            ? transformBarChartData(
                                                dashboard.ratingBarRegionalData
                                                  ?.data,
                                                dashboard.ratingBarRegionalData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingBarRegionalData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
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
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.colorZoom
                                      }
                                      crossFilter="regionals"
                                      keyChart="ratingBarRegionalData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingBarRegionalData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingBarRegionalData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.key_city.id,
                                  label: CUSTOM_TAB.childTabArea.key_city.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingBarKeyCityData
                                            ? transformBarChartData(
                                                dashboard.ratingBarKeyCityData
                                                  ?.data,
                                                dashboard.ratingBarKeyCityData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingBarKeyCityData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
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
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.colorZoom
                                      }
                                      crossFilter="keyCities"
                                      keyChart="ratingBarKeyCityData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingBarKeyCityData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingBarKeyCityData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.province.id,
                                  label: CUSTOM_TAB.childTabArea.province.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingBarProvinceData
                                            ? transformBarChartData(
                                                dashboard.ratingBarProvinceData
                                                  ?.data,
                                                dashboard.ratingBarProvinceData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingBarProvinceData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
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
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.colorZoom
                                      }
                                      crossFilter="provinces"
                                      keyChart="ratingBarProvinceData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingBarProvinceData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingBarProvinceData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.others.id,
                                  label: CUSTOM_TAB.childTabArea.others.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingBarOthersData
                                            ? transformBarChartData(
                                                dashboard.ratingBarOthersData
                                                  ?.data,
                                                dashboard.ratingBarOthersData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingBarOthersData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
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
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .rating.colorZoom
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingBarOthersData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingBarOthersData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                          <div
                            className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}
                          >
                            <NameChart
                              nameChart={
                                CUSTOM_CHART.barChart.barChartArea.aveReach.name
                              }
                              description={METRICS.ave_reach.description}
                              opacity={true}
                            />
                            <ChildTabs
                              tabs={[
                                {
                                  id: CUSTOM_TAB.childTabArea.regional.id,
                                  label: CUSTOM_TAB.childTabArea.regional.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .aveReachBarRegionalData
                                            ? transformBarChartData(
                                                dashboard
                                                  .aveReachBarRegionalData
                                                  ?.data,
                                                dashboard
                                                  .aveReachBarRegionalData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .aveReachBarRegionalData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.color
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.colorZoom
                                      }
                                      crossFilter="regionals"
                                      keyChart="aveReachBarRegionalData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "aveReachBarRegionalData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .aveReachBarRegionalData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.key_city.id,
                                  label: CUSTOM_TAB.childTabArea.key_city.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .aveReachBarKeyCityData
                                            ? transformBarChartData(
                                                dashboard.aveReachBarKeyCityData
                                                  ?.data,
                                                dashboard.aveReachBarKeyCityData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .aveReachBarKeyCityData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.color
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.colorZoom
                                      }
                                      crossFilter="keyCities"
                                      keyChart="aveReachBarKeyCityData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "aveReachBarKeyCityData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .aveReachBarKeyCityData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.province.id,
                                  label: CUSTOM_TAB.childTabArea.province.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .aveReachBarProvinceData
                                            ? transformBarChartData(
                                                dashboard
                                                  .aveReachBarProvinceData
                                                  ?.data,
                                                dashboard
                                                  .aveReachBarProvinceData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .aveReachBarProvinceData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.color
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.colorZoom
                                      }
                                      crossFilter="provinces"
                                      keyChart="aveReachBarProvinceData"
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "aveReachBarProvinceData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .aveReachBarProvinceData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.others.id,
                                  label: CUSTOM_TAB.childTabArea.others.label,
                                  content: (
                                    <BarChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .aveReachBarOthersData
                                            ? transformBarChartData(
                                                dashboard.aveReachBarOthersData
                                                  ?.data,
                                                dashboard.aveReachBarOthersData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .aveReachBarOthersData,
                                        ],
                                      )}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={
                                        CUSTOM_CHART.allChart.fontFamily
                                      }
                                      colors={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.color
                                      }
                                      fontWeight={
                                        CUSTOM_CHART.barChart.fontWeight
                                      }
                                      nameChart={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.name
                                      }
                                      description={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.description
                                      }
                                      orientation={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .orientation
                                      }
                                      displayName={false}
                                      colorZoom={
                                        CUSTOM_CHART.barChart.barChartArea
                                          .aveReach.colorZoom
                                      }
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "aveReachBarOthersData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .aveReachBarOthersData,
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
                          <MixedChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.ratingReachMixedDateData
                                  ? transformMixedChartData(
                                      dashboard.ratingReachMixedDateData?.data,
                                      "date",
                                      dashboard.ratingReachMixedDateData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.ratingReachMixedDateData],
                            )}
                            height={CUSTOM_CHART.mixedChart.height}
                            fontSize={CUSTOM_CHART.mixedChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.mixedChart.mixedChartDate.name
                            }
                            maxVisibleItems={
                              CUSTOM_CHART.mixedChart.mixedChartDate
                                .maxVisibleItems
                            }
                            description={
                              CUSTOM_CHART.mixedChart.mixedChartDate.description
                            }
                            barSeriesKeys={
                              CUSTOM_CHART.mixedChart.mixedChartDate.metrics
                                .aveReach
                            }
                            lineSeriesKeys={
                              CUSTOM_CHART.mixedChart.mixedChartDate.metrics
                                .rating
                            }
                            colors={
                              CUSTOM_CHART.mixedChart.mixedChartDate.colors
                            }
                            barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                            barWidthPercent={
                              CUSTOM_CHART.mixedChart.barWidthPercent
                            }
                            lastDataIndexActive={
                              CUSTOM_CHART.mixedChart.mixedChartDate
                                .lastDataIndexActive
                            }
                            refetch={useCallback(
                              () =>
                                dashboard.refetch("ratingReachMixedDateData"),
                              [dashboard.isLoading.ratingReachMixedDateData],
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
                  id: "channel",
                  label: "Kênh",
                  icon: !darkMode ? iconChannel : iconChannelDark,
                  iconActive: iconChannelActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_channel"
                    >
                      <InforTab
                        inforTab={"Kênh - P4+ toàn quốc"}
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
                                      <MixedChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingReachPercentMixedTimebandData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingReachPercentMixedTimebandData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .ratingReachPercentMixedTimebandData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentMixedTimebandData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.mixedChart.height}
                                        fontSize={
                                          CUSTOM_CHART.mixedChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.mixedChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband.name
                                        }
                                        maxVisibleItems={
                                          !screenMd
                                            ? true
                                            : CUSTOM_CHART.mixedChart
                                                .mixedChartDate.maxVisibleItems
                                        }
                                        description={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband
                                            .description
                                        }
                                        barSeriesKeys={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband.metrics
                                            .aveReachPercent
                                        }
                                        lineSeriesKeys={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband.metrics
                                            .ratingPercent
                                        }
                                        colors={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband.colors
                                        }
                                        barMaxWidth={
                                          CUSTOM_CHART.mixedChart.barMaxWidth
                                        }
                                        barWidthPercent={
                                          CUSTOM_CHART.mixedChart
                                            .barWidthPercent
                                        }
                                        offsetLine={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband
                                            .offsetLine
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartPercentTimeband
                                            .xAxisTitle
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingReachPercentMixedTimebandData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingReachPercentMixedTimebandData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingPercentLineTimebandChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingPercentLineTimebandChannelData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .ratingPercentLineTimebandChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingPercentLineTimebandChannelData,
                                          ],
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
                                            .lineChartPercentTimebandChannel
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartPercentTimebandChannel
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
                                            .lineChartPercentTimebandChannel
                                            .showTopNSeries
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.lineChart.xAxisTitle
                                        }
                                        crossFilter={"channels"}
                                        keyChart={
                                          "ratingPercentLineTimebandChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingPercentLineTimebandChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingPercentLineTimebandChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingPercentLineDateChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingPercentLineDateChannelData
                                                    ?.data,
                                                  "date",
                                                  dashboard
                                                    .ratingPercentLineDateChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingPercentLineDateChannelData,
                                          ],
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
                                        keyChart={
                                          "ratingPercentLineDateChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingPercentLineDateChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingPercentLineDateChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachPercentLineDateChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .aveReachPercentLineDateChannelData
                                                    ?.data,
                                                  "date",
                                                  dashboard
                                                    .aveReachPercentLineDateChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachPercentLineDateChannelData,
                                          ],
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
                                        keyChart={
                                          "aveReachPercentLineDateChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachPercentLineDateChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachPercentLineDateChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-0">
                                      <TreeMapChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachPercentTreemapChannelData
                                              ? transformTreeMapData(
                                                  dashboard
                                                    .aveReachPercentTreemapChannelData
                                                    ?.data,
                                                  dashboard
                                                    .aveReachPercentTreemapChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachPercentTreemapChannelData,
                                          ],
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
                                        keyChart={
                                          "aveReachPercentTreemapChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachPercentTreemapChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachPercentTreemapChannelData,
                                          ],
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
                                      <MixedChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingReachMixedTimebandData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingReachMixedTimebandData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .ratingReachMixedTimebandData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingReachMixedTimebandData,
                                          ],
                                        )}
                                        height={CUSTOM_CHART.mixedChart.height}
                                        fontSize={
                                          CUSTOM_CHART.mixedChart.fontSize
                                        }
                                        fontFamily={
                                          CUSTOM_CHART.allChart.fontFamily
                                        }
                                        fontWeight={
                                          CUSTOM_CHART.mixedChart.fontWeight
                                        }
                                        nameChart={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.name
                                        }
                                        maxVisibleItems={
                                          !screenMd
                                            ? true
                                            : CUSTOM_CHART.mixedChart
                                                .mixedChartDate.maxVisibleItems
                                        }
                                        description={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.description
                                        }
                                        barSeriesKeys={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.metrics.aveReach
                                        }
                                        lineSeriesKeys={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.metrics.rating
                                        }
                                        colors={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.colors
                                        }
                                        barMaxWidth={
                                          CUSTOM_CHART.mixedChart.barMaxWidth
                                        }
                                        barWidthPercent={
                                          CUSTOM_CHART.mixedChart
                                            .barWidthPercent
                                        }
                                        KMB={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.KMB
                                        }
                                        offsetLine={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.offsetLine
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.mixedChart
                                            .mixedChartTimeband.xAxisTitle
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingReachMixedTimebandData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingReachMixedTimebandData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingLineTimebandChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingLineTimebandChannelData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .ratingLineTimebandChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingLineTimebandChannelData,
                                          ],
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
                                        keyChart={
                                          "ratingLineTimebandChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingLineTimebandChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingLineTimebandChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachLineTimebandChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .aveReachLineTimebandChannelData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .aveReachLineTimebandChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandChannelData,
                                          ],
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
                                            .lineChartTimebandChannel.aveReach
                                            .name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandChannel.aveReach
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
                                        keyChart={
                                          "aveReachLineTimebandChannelData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachLineTimebandChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingLineDateChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingLineDateChannelData
                                                    ?.data,
                                                  "date",
                                                  dashboard
                                                    .ratingLineDateChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingLineDateChannelData,
                                          ],
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
                                        keyChart={"ratingLineDateChannelData"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingLineDateChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingLineDateChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachLineDateChannelData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .aveReachLineDateChannelData
                                                    ?.data,
                                                  "date",
                                                  dashboard
                                                    .aveReachLineDateChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachLineDateChannelData,
                                          ],
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
                                        keyChart={"aveReachLineDateChannelData"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachLineDateChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachLineDateChannelData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingLineTimebandDayData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .ratingLineTimebandDayData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .ratingLineTimebandDayData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingLineTimebandDayData,
                                          ],
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
                                            dashboard.refetch(
                                              "ratingLineTimebandDayData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingLineTimebandDayData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachLineTimebandDayData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .aveReachLineTimebandDayData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .aveReachLineTimebandDayData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandDayData,
                                          ],
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
                                            dashboard.refetch(
                                              "aveReachLineTimebandDayData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandDayData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                                      <LineChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .aveReachLineTimebandRegionalData
                                              ? transformMixedChartData(
                                                  dashboard
                                                    .aveReachLineTimebandRegionalData
                                                    ?.data,
                                                  "Khung giờ",
                                                  dashboard
                                                    .aveReachLineTimebandRegionalData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandRegionalData,
                                          ],
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
                                            .lineChartTimebandRegional.name
                                        }
                                        description={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandRegional
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
                                            .lineChartTimebandRegional
                                            .showTopNSeries
                                        }
                                        left={
                                          CUSTOM_CHART.lineChart
                                            .lineChartTimebandRegional.left
                                        }
                                        xAxisTitle={
                                          CUSTOM_CHART.lineChart.xAxisTitle
                                        }
                                        crossFilter={"regionals"}
                                        keyChart={
                                          "aveReachLineTimebandRegionalData"
                                        }
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "aveReachLineTimebandRegionalData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .aveReachLineTimebandRegionalData,
                                          ],
                                        )}
                                      />
                                    </div>
                                    <div className="w-full pb-6 max-lg:pb-5 max-md:pb-0">
                                      <TreeMapChart
                                        data={useMemo(
                                          () =>
                                            !dashboard.isLoading
                                              .ratingTreemapChannelData
                                              ? transformTreeMapData(
                                                  dashboard
                                                    .ratingTreemapChannelData
                                                    ?.data,
                                                  dashboard
                                                    .ratingTreemapChannelData
                                                    ?.colnames,
                                                )
                                              : "isLoading",
                                          [
                                            dashboard.isLoading
                                              .ratingTreemapChannelData,
                                          ],
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
                                        keyChart={"ratingTreemapChannelData"}
                                        refetch={useCallback(
                                          () =>
                                            dashboard.refetch(
                                              "ratingTreemapChannelData",
                                            ),
                                          [
                                            dashboard.isLoading
                                              .ratingTreemapChannelData,
                                          ],
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
                  id: "program",
                  label: "Chương trình",
                  icon: !darkMode ? iconProgram : iconProgramDark,
                  iconActive: iconProgramActive,
                  content: (
                    <section
                      className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                      id="target_capture_program"
                    >
                      <InforTab
                        inforTab={"Chương trình - P4+ toàn quốc"}
                        maxInsert={
                          dashboard?.maxInsertData?.data?.[0]?.[
                            "MAX(check_time)"
                          ]
                        }
                      />
                      <InforFilter filters={scopeFilterData} />
                      <div className="px-6 max-lg:px-5 max-md:px-4">
                        <div className="w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 py-6 max-lg:py-5 max-md:py-4">
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading
                                  .totalEventDurationPieFirstLevelData
                                  ? transformPieChartData(
                                      dashboard
                                        .totalEventDurationPieFirstLevelData
                                        ?.data,
                                      dashboard
                                        .totalEventDurationPieFirstLevelData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [
                                dashboard.isLoading
                                  .totalEventDurationPieFirstLevelData,
                              ],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.pieChart.pieChartFirstLevel
                                .totalEvent.name
                            }
                            description={
                              CUSTOM_CHART.pieChart.pieChartFirstLevel
                                .totalEvent.description
                            }
                            colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            crossFilter="firstLevels"
                            keyChart="totalEventDurationPieFirstLevelData"
                            refetch={useCallback(
                              () =>
                                dashboard.refetch(
                                  "totalEventDurationPieFirstLevelData",
                                ),
                              [
                                dashboard.isLoading
                                  .totalEventDurationPieFirstLevelData,
                              ],
                            )}
                          />
                          <PieChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading
                                  .totalViewDurationPieFirstLevelData
                                  ? transformPieChartData(
                                      dashboard
                                        .totalViewDurationPieFirstLevelData
                                        ?.data,
                                      dashboard
                                        .totalViewDurationPieFirstLevelData
                                        ?.colnames,
                                    )
                                  : "isLoading",
                              [
                                dashboard.isLoading
                                  .totalViewDurationPieFirstLevelData,
                              ],
                            )}
                            height={CUSTOM_CHART.pieChart.height}
                            fontSize={CUSTOM_CHART.pieChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView
                                .name
                            }
                            description={
                              CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView
                                .description
                            }
                            colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                            donut={CUSTOM_CHART.pieChart.donut}
                            innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                            crossFilter="firstLevels"
                            keyChart="totalViewDurationPieFirstLevelData"
                            refetch={useCallback(
                              () =>
                                dashboard.refetch(
                                  "totalViewDurationPieFirstLevelData",
                                ),
                              [
                                dashboard.isLoading
                                  .totalViewDurationPieFirstLevelData,
                              ],
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
                                  id: CUSTOM_TAB.childTabArea.regional.id,
                                  label: CUSTOM_TAB.childTabArea.regional.label,
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingReachTableRegionalData
                                            ? transformTableChartData(
                                                dashboard
                                                  .ratingReachTableRegionalData
                                                  ?.data,
                                                dashboard
                                                  .ratingReachTableRegionalData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableRegionalData,
                                        ],
                                      )}
                                      height={"450px"}
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
                                        "Rating và Ave.Reach của thể loại theo thị trường"
                                      }
                                      description={false}
                                      displayName={false}
                                      showSTT={false}
                                      showPagination={true}
                                      customCol={
                                        CUSTOM_CHART.tableChart
                                          .tableProgramChannel.programArea
                                          .customCol
                                      }
                                      crossFilter={true}
                                      keyChart={"ratingReachTableData"}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingReachTableRegionalData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableRegionalData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.key_city.id,
                                  label: CUSTOM_TAB.childTabArea.key_city.label,
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingReachTableKeyCityData
                                            ? transformTableChartData(
                                                dashboard
                                                  .ratingReachTableKeyCityData
                                                  ?.data,
                                                dashboard
                                                  .ratingReachTableKeyCityData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableKeyCityData,
                                        ],
                                      )}
                                      height={"450px"}
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
                                        "Rating và Ave.Reach của thể loại theo thị trường"
                                      }
                                      description={false}
                                      displayName={false}
                                      showSTT={false}
                                      showPagination={true}
                                      customCol={
                                        CUSTOM_CHART.tableChart
                                          .tableProgramChannel.programArea
                                          .customCol
                                      }
                                      crossFilter={true}
                                      keyChart={"ratingReachTableData"}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingReachTableKeyCityData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableKeyCityData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.province.id,
                                  label: CUSTOM_TAB.childTabArea.province.label,
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingReachTableProvinceData
                                            ? transformTableChartData(
                                                dashboard
                                                  .ratingReachTableProvinceData
                                                  ?.data,
                                                dashboard
                                                  .ratingReachTableProvinceData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableProvinceData,
                                        ],
                                      )}
                                      height={"450px"}
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
                                        "Rating và Ave.Reach của thể loại theo thị trường"
                                      }
                                      description={false}
                                      displayName={false}
                                      showSTT={false}
                                      showPagination={true}
                                      customCol={
                                        CUSTOM_CHART.tableChart
                                          .tableProgramChannel.programArea
                                          .customCol
                                      }
                                      crossFilter={true}
                                      keyChart={"ratingReachTableData"}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingReachTableProvinceData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableProvinceData,
                                        ],
                                      )}
                                    />
                                  ),
                                },
                                {
                                  id: CUSTOM_TAB.childTabArea.others.id,
                                  label: CUSTOM_TAB.childTabArea.others.label,
                                  content: (
                                    <TableChart
                                      data={useMemo(
                                        () =>
                                          !dashboard.isLoading
                                            .ratingReachTableOthersData
                                            ? transformTableChartData(
                                                dashboard
                                                  .ratingReachTableOthersData
                                                  ?.data,
                                                dashboard
                                                  .ratingReachTableOthersData
                                                  ?.colnames,
                                              )
                                            : "isLoading",
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableOthersData,
                                        ],
                                      )}
                                      height={"450px"}
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
                                        "Rating và Ave.Reach của thể loại theo thị trường"
                                      }
                                      description={false}
                                      displayName={false}
                                      showSTT={false}
                                      showPagination={true}
                                      customCol={
                                        CUSTOM_CHART.tableChart
                                          .tableProgramChannel.programArea
                                          .customCol
                                      }
                                      crossFilter={true}
                                      keyChart={"ratingReachTableData"}
                                      refetch={useCallback(
                                        () =>
                                          dashboard.refetch(
                                            "ratingReachTableOthersData",
                                          ),
                                        [
                                          dashboard.isLoading
                                            .ratingReachTableOthersData,
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
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableRankData
                                  ? transformTableChartData(
                                      dashboard.allTableRankData?.data,
                                      dashboard.allTableRankData?.colnames,
                                      CUSTOM_CHART.tableChart
                                        .tableProgramChannel.programRank
                                        .columnSort,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableRankData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableProgramChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programRank.name
                            }
                            description={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programRank.description
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
                            keyChart={"allTableRankData"}
                            refetch={useCallback(
                              () => dashboard.refetch("allTableRankData"),
                              [dashboard.isLoading.allTableRankData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableDetailData
                                  ? transformTableChartData(
                                      dashboard.allTableDetailData?.data,
                                      dashboard.allTableDetailData?.colnames,
                                      CUSTOM_CHART.tableChart
                                        .tableProgramChannel.programDetail
                                        .columnSort,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableDetailData],
                            )}
                            height={
                              CUSTOM_CHART.tableChart.tableProgramChannel.height
                            }
                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                            nameChart={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programDetail.name
                            }
                            description={
                              CUSTOM_CHART.tableChart.tableProgramChannel
                                .programDetail.description
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
                                .programDetail.customCol
                            }
                            crossFilter={true}
                            keyChart={"allTableDetailData"}
                            refetch={useCallback(
                              () => dashboard.refetch("allTableDetailData"),
                              [dashboard.isLoading.allTableDetailData],
                            )}
                          />
                        </div>
                        <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                          <TableChart
                            data={useMemo(
                              () =>
                                !dashboard.isLoading.allTableEventData
                                  ? transformTableChartData(
                                      dashboard.allTableEventData?.data,
                                      dashboard.allTableEventData?.colnames,
                                      CUSTOM_CHART.tableChart
                                        .tableProgramChannel.programEvent
                                        .columnSort,
                                    )
                                  : "isLoading",
                              [dashboard.isLoading.allTableEventData],
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
                            keyChart={"allTableEventData"}
                            refetch={useCallback(
                              () => dashboard.refetch("allTableEventData"),
                              [dashboard.isLoading.allTableEventData],
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
                !userLoading && user?.username !== "vtvguest"
                  ? {
                      id: "rating_by_minute",
                      label: !screenMd ? "Rating theo phút" : "Rating phút",
                      icon: !darkMode
                        ? iconRatingByMinute
                        : iconRatingByMinuteDark,
                      iconActive: iconRatingByMinuteActive,
                      content: (
                        <section
                          className="bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300"
                          id="target_capture_rating_by_minute"
                        >
                          <InforTab
                            inforTab={"Rating theo phút - P4+ toàn quốc"}
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
                                  !dashboard.isLoading
                                    .ratingLineMinuteChannelData
                                    ? transformMixedChartData(
                                        dashboard.ratingLineMinuteChannelData
                                          ?.data,
                                        "event_hour_minute",
                                        dashboard.ratingLineMinuteChannelData
                                          ?.colnames,
                                      )
                                    : "isLoading"
                                }
                                height={CUSTOM_CHART.lineChart.heightMinute}
                                fontSize={CUSTOM_CHART.lineChart.fontSize}
                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                nameChart={
                                  CUSTOM_CHART.lineChart.lineChartMinuteChannel
                                    .name
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
                                xAxisTitle={
                                  CUSTOM_CHART.lineChart.xAxisTitleMinute
                                }
                                fullScreen={true}
                                crossFilter={"channels"}
                                keyChart={"ratingLineMinuteChannelData"}
                                refetch={() =>
                                  dashboard.refetch(
                                    "ratingLineMinuteChannelData",
                                  )
                                }
                              />
                            </div>
                            <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                              <LineChart
                                data={
                                  !dashboard.isLoading
                                    .ratingLineMinuteChannelOneDateData
                                    ? transformMixedChartData(
                                        dashboard
                                          .ratingLineMinuteChannelOneDateData
                                          ?.data,
                                        "event_hour_minute",
                                        dashboard
                                          .ratingLineMinuteChannelOneDateData
                                          ?.colnames,
                                        "full_timeband_minute",
                                      )
                                    : "isLoading"
                                }
                                height={CUSTOM_CHART.lineChart.heightMinute}
                                fontSize={CUSTOM_CHART.lineChart.fontSize}
                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                nameChart={
                                  CUSTOM_CHART.lineChart.lineChartMinuteDay
                                    .name +
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
                                xAxisTitle={
                                  CUSTOM_CHART.lineChart.xAxisTitleMinute
                                }
                                fullScreen={true}
                                textOverflow={true}
                                crossFilter={"programs"}
                                keyChart={"ratingLineMinuteChannelOneDateData"}
                                refetch={() =>
                                  dashboard.refetch(
                                    "ratingLineMinuteChannelOneDateData",
                                  )
                                }
                              />
                            </div>
                            <div className="w-full pb-6 max-lg:pb-5 max-md:pb-4">
                              <LineChart
                                data={
                                  !dashboard.isLoading
                                    .ratingLineMinuteChannelDatesData
                                    ? transformMixedChartData(
                                        dashboard
                                          .ratingLineMinuteChannelDatesData
                                          ?.data,
                                        "event_hour_minute",
                                        dashboard
                                          .ratingLineMinuteChannelDatesData
                                          ?.colnames,
                                      )
                                    : "isLoading"
                                }
                                height={CUSTOM_CHART.lineChart.heightMinute}
                                fontSize={CUSTOM_CHART.lineChart.fontSize}
                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                nameChart={
                                  CUSTOM_CHART.lineChart.lineChartMinuteDays
                                    .name +
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
                                refetch={() =>
                                  dashboard.refetch(
                                    "ratingLineMinuteChannelDatesData",
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
                            <Footer color="text-color-black-100 dark:text-color-white-90" />
                          </div>
                        </section>
                      ),
                    }
                  : null,
              ]}
              countTab={
                !userLoading && user?.username !== "vtvguest"
                  ? "max-md:grid-cols-4"
                  : "max-md:grid-cols-3"
              }
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

export default React.memo(Dashboard);
