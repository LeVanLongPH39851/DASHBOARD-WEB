import { useEffect, useState } from 'react';
import NumberCard from '../components/charts/NumberCard';
import Loading from '../components/commons/Loading';
import ErrorState from '../components/commons/ErrorState';
import Filter from '../components/layouts/filters/Filter';
import { METRICS } from '../utils/metricInfor';
import { CUSTOM_CHART } from '../utils/customChart';
import { formatNumber } from '../utils/formatNumber';
import { transformBarChartData } from '../utils/transformApiBartChart';
import BarChart from '../components/charts/BarChart';
import { useDashboardData } from '../hooks/useDashboardData';
import ChildTabs from '../components/layouts/components/ChildTabs';
import { CUSTOM_TAB } from '../utils/customTab';
import TableChart from '../components/charts/TableChart';
import { transformTableChartData } from '../utils/transformApiTableChart';
const Dashboard = () => {
  const dashboard = useDashboardData();

  if (dashboard.isLoading) return <Loading />;
  if (dashboard.hasError) return <ErrorState />;
  
  const scopeNumberData = {
    'ratingNumber': dashboard.ratingNumberData,
    'aveReachNumber': dashboard.aveReachNumberData,
    'ratingPercentNumber': dashboard.ratingPercentNumberData,
    'aveReachPercentNumber': dashboard.aveReachPercentNumberData,
    'ratingBarChannelEventData': dashboard.ratingBarChannelEventData
  }

  return (
    <>
    <div className='flex h-full bg-background-gray font-family-be-vietnam-pro'>
      <Filter />
      <div className='w-full px-10'>
        <div className="w-full grid grid-cols-4 gap-6 py-6">
          {Object.values(METRICS).map(card => (
            <NumberCard
              key={card.name}
              title={card.title}
              value={formatNumber(scopeNumberData?.[card.name]?.data[0]?.[card.metric], { isPercent: card.isPercent })}
              icon={card.icon}
              color={card.color}
              background={card.background}
            />
          ))}
        </div>
        <div className='flex gap-6 pb-6'>
          <div className='w-[60%]'>
            <ChildTabs tabs={[
              {id: CUSTOM_TAB.childTabRatingReach.rating.id, label: CUSTOM_TAB.childTabRatingReach.rating.label,
              content: (
                <BarChart 
                  data={transformBarChartData(dashboard.ratingBarChannelEventData.data, dashboard.ratingBarChannelEventData.colnames)}
                  height={CUSTOM_CHART.barChart.height}
                  fontSize={CUSTOM_CHART.barChart.fontSize}
                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                  colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                  nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart}
                  description={METRICS.rating.description}
                  orientation={CUSTOM_CHART.barChart.barChartChannelEvent.orientation}
                />
              )},
              {id: CUSTOM_TAB.childTabRatingReach.ave_reach.id, label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarChannelEventData.data, dashboard.aveReachBarChannelEventData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.aveReachNameChart}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartChannelEvent.orientation}
                  />
                )}
              ]} />
          </div>
          <div className='w-[40%]'>
            <ChildTabs tabs={[
              {id: CUSTOM_TAB.childTabRatingReach.rating.id, label: CUSTOM_TAB.childTabRatingReach.rating.label,
              content: (
                <BarChart 
                  data={transformBarChartData(dashboard.ratingBarDayEventData.data, dashboard.ratingBarDayEventData.colnames)}
                  height={CUSTOM_CHART.barChart.height}
                  fontSize={CUSTOM_CHART.barChart.fontSize}
                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                  colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                  nameChart={CUSTOM_CHART.barChart.barChartDayEvent.ratingNameChart}
                  description={METRICS.rating.description}
                  orientation={CUSTOM_CHART.barChart.barChartDayEvent.orientation}
                />
              )},
              {id: CUSTOM_TAB.childTabRatingReach.ave_reach.id, label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarDayEventData.data, dashboard.aveReachBarDayEventData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartDayEvent.aveReachNameChart}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartDayEvent.orientation}
                  />
                )}
              ]} />
          </div>
        </div>
        <div className='w-full flex gap-6 pb-6'>
          <div className='w-[60%]'>
          <TableChart data={transformTableChartData(dashboard.allTableChannelData.data, dashboard.allTableChannelData.colnames)}/>
          </div>
          {/* <div className='w-[40%]'>
          <TableChart data={transformTableChartData(dashboard.ratingReachPercentTableRegionalData.data, dashboard.ratingReachPercentTableRegionalData.colnames)}/>
          </div> */}
        </div>
        <div className='w-full grid grid-cols-2 gap-6 pb-6'>
            <div>
              <ChildTabs tabs={[
                {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.ratingBarRegionalData.data, dashboard.ratingBarRegionalData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                    description={METRICS.rating.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.key_city.id, label: CUSTOM_TAB.childTabArea.key_city.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.ratingBarKeyCityData.data, dashboard.ratingBarKeyCityData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                    description={METRICS.rating.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.ratingBarProvinceData.data, dashboard.ratingBarProvinceData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                    description={METRICS.rating.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.others.id, label: CUSTOM_TAB.childTabArea.others.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.ratingBarOthersData.data, dashboard.ratingBarOthersData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                    description={METRICS.rating.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )}
                ]} />
            </div>
            <div>
              <ChildTabs tabs={[
                {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarRegionalData.data, dashboard.aveReachBarRegionalData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.key_city.id, label: CUSTOM_TAB.childTabArea.key_city.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarKeyCityData.data, dashboard.aveReachBarKeyCityData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarProvinceData.data, dashboard.aveReachBarProvinceData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )},
                {id: CUSTOM_TAB.childTabArea.others.id, label: CUSTOM_TAB.childTabArea.others.label,
                content: (
                  <BarChart 
                    data={transformBarChartData(dashboard.aveReachBarOthersData.data, dashboard.aveReachBarOthersData.colnames)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                    colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                    description={METRICS.ave_reach.description}
                    orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                  />
                )}
                ]} />
            </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;