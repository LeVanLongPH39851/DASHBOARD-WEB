import { useEffect, useState } from "react";
import NumberCard from "../components/charts/NumberCard";
import Loading from "../components/commons/Loading";
import ErrorState from "../components/commons/ErrorState";
import Filter from "../components/layouts/filters/Filter";
import { METRICS } from "../utils/metricInfor";
import { CUSTOM_CHART } from "../utils/customChart_1";
import { formatNumber } from "../utils/formatNumber";
import { transformBarChartData } from "../utils/transformApiBartChart";
import BarChart from "../components/charts/BarChart";
import { useDashboardData } from "../hooks/useDashboardData";
import ChildTabs from "../components/layouts/components/ChildTabs_1";
import { CUSTOM_TAB } from "../utils/customTab";
import { transformMixedChartData } from "../utils/transformApiMixedChart_1";
import MixedChart from "../components/charts/MixedChart_1";

const Dashboard = () => {
  const dashboard = useDashboardData();

  if (dashboard.isLoading) return <Loading />;
  if (dashboard.hasError) return <ErrorState />;

  // Debug để kiểm tra data theo giờ (xem console F12)
  console.log("Dashboard full state:", dashboard);
  console.log(
    "Data cho MixedChart (ratingReachPercentMixedTimebandData):",
    dashboard.ratingReachPercentMixedTimebandData,
  );

  const scopeNumberData = {
    ratingNumber: dashboard.ratingNumberData,
    aveReachNumber: dashboard.aveReachNumberData,
    ratingPercentNumber: dashboard.ratingPercentNumberData,
    aveReachPercentNumber: dashboard.aveReachPercentNumberData,
    ratingBarChannelEventData: dashboard.ratingBarChannelEventData,
  };

  return (
    <div className="flex h-full bg-background-gray font-family-be-vietnam-pro">
      <Filter />
      <div className="w-full px-10">
        {/* Phần Number Cards */}
        <div className="w-full grid grid-cols-4 gap-6 py-6">
          {Object.values(METRICS).map((card) => (
            <NumberCard
              key={card.name}
              title={card.title}
              value={formatNumber(
                scopeNumberData?.[card.name]?.data?.[0]?.[card.metric],
                { isPercent: card.isPercent },
              )}
              icon={card.icon}
              color={card.color}
              background={card.background}
            />
          ))}
        </div>

        {/* Phần 2 khối BarChart bên trái + phải (giữ nguyên như cũ) */}
        <div className="flex gap-6">
          <div className="w-[60%]">
            <ChildTabs
              tabs={[
                {
                  id: CUSTOM_TAB.childTabRatingReach.rating.id,
                  label: CUSTOM_TAB.childTabRatingReach.rating.label,
                  content: (
                    <BarChart
                      data={transformBarChartData(
                        dashboard.ratingBarChannelEventData?.data || [],
                      )}
                      height={CUSTOM_CHART.barChart.height}
                      fontSize={CUSTOM_CHART.barChart.fontSize}
                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                      colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                      nameChart={
                        CUSTOM_CHART.barChart.barChartChannelEvent
                          .ratingNameChart
                      }
                      description={METRICS.rating.description}
                      orientation={
                        CUSTOM_CHART.barChart.barChartChannelEvent.orientation
                      }
                    />
                  ),
                },
                {
                  id: CUSTOM_TAB.childTabRatingReach.ave_reach.id,
                  label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                  content: (
                    <BarChart
                      data={transformBarChartData(
                        dashboard.aveReachBarChannelEventData?.data || [],
                      )}
                      height={CUSTOM_CHART.barChart.height}
                      fontSize={CUSTOM_CHART.barChart.fontSize}
                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                      colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                      nameChart={
                        CUSTOM_CHART.barChart.barChartChannelEvent
                          .aveReachNameChart
                      }
                      description={METRICS.ave_reach.description}
                      orientation={
                        CUSTOM_CHART.barChart.barChartChannelEvent.orientation
                      }
                    />
                  ),
                },
              ]}
            />
          </div>

          <div className="w-[40%]">
            <ChildTabs
              tabs={[
                {
                  id: CUSTOM_TAB.childTabRatingReach.rating.id,
                  label: CUSTOM_TAB.childTabRatingReach.rating.label,
                  content: (
                    <BarChart
                      data={transformBarChartData(
                        dashboard.ratingBarDayEventData?.data || [],
                      )}
                      height={CUSTOM_CHART.barChart.height}
                      fontSize={CUSTOM_CHART.barChart.fontSize}
                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                      colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                      nameChart={
                        CUSTOM_CHART.barChart.barChartDayEvent.ratingNameChart
                      }
                      description={METRICS.rating.description}
                      orientation={
                        CUSTOM_CHART.barChart.barChartDayEvent.orientation
                      }
                    />
                  ),
                },
                {
                  id: CUSTOM_TAB.childTabRatingReach.ave_reach.id,
                  label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                  content: (
                    <BarChart
                      data={transformBarChartData(
                        dashboard.aveReachBarDayEventData?.data || [],
                      )}
                      height={CUSTOM_CHART.barChart.height}
                      fontSize={CUSTOM_CHART.barChart.fontSize}
                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                      colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                      nameChart={
                        CUSTOM_CHART.barChart.barChartDayEvent.aveReachNameChart
                      }
                      description={METRICS.ave_reach.description}
                      orientation={
                        CUSTOM_CHART.barChart.barChartDayEvent.orientation
                      }
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Chỉ 1 MixedChart - dùng key đúng từ hook */}
        <div className="w-[100%] mt-8">
          <ChildTabs
            tabs={[
              {
                id: "rating-reach-by-hour",
                label: "Rating & Reach theo giờ",
                content:
                  dashboard.ratingReachPercentMixedTimebandData?.data?.length >
                  0 ? (
                    <MixedChart
                      data={transformMixedChartData(
                        dashboard.ratingReachPercentMixedTimebandData.data,
                      )}
                      height={CUSTOM_CHART.barChart.height}
                      fontSize={CUSTOM_CHART.barChart.fontSize}
                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                      colors={["#fbbf24", "#ef4444"]} // vàng cho cột reach%, đỏ cho đường rating%
                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                      nameChart="Biến động RATING (%) và REACH (%) theo khung giờ"
                      description="All | Inv"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg">
                      Không có dữ liệu khung giờ hoặc đang tải...
                    </div>
                  ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
