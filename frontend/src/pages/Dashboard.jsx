import { useEffect, useState } from 'react';
import NumberCard from '../components/charts/NumberCard';
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
import MixedChart from '../components/charts/MixedChart';
import { transformMixedChartData } from '../utils/transformApiMixedChart';
import ParentTabs from '../components/layouts/components/ParentTabs';
import LineChart from '../components/charts/LineChart';
import NormalTabs from '../components/layouts/components/NormalTabs';
import { transformTreeMapData } from '../utils/transformApiTreeMapChart';
import TreeMapChart from '../components/charts/TreeMapChart';
import PieChart from '../components/charts/PieChart';
import { transformPieChartData } from '../utils/transfromApiPieChart';
import Footer from '../components/layouts/footers/Footer';
import { DashboardFilterProvider } from '../context/DashboardFilterContext';
import Header from '../components/layouts/headers/Header';
import BreadCrumb from '../components/layouts/headers/BreadCrumb';
import InforTab from '../components/layouts/headers/InforTab';
import InforFilter from '../components/layouts/headers/InforFilter';
import { useDashboardStateGlobals, useDashboardFilters } from '../context/DashboardFilterContext';
import NumberWithTrendChart from '../components/charts/NumberWithTrendChart';
import NameChart from '../components/layouts/components/NameChart';
import { transformNumberWithTrendData } from '../utils/transfromApiNumberWithTrendChart';
import iconOverview from '../assets/icon_overview.png';
import iconChannel from '../assets/icon_channel.png';
import iconProgram from '../assets/icon_program.png';
import iconRatingByMinute from '../assets/icon_rating_by_minute.png';
import iconOverviewDark from '../assets/icon_overview_dark.png';
import iconChannelDark from '../assets/icon_channel_dark.png';
import iconProgramDark from '../assets/icon_program_dark.png';
import iconRatingByMinuteDark from '../assets/icon_rating_by_minute_dark.png';
import iconOverviewActive from '../assets/icon_overview_active.png';
import iconChannelActive from '../assets/icon_channel_active.png';
import iconProgramActive from '../assets/icon_program_active.png';
import iconRatingByMinuteActive from '../assets/icon_rating_by_minute_active.png';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getYesterday, formatDate } from '../helpers/helper';

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  const { appliedFilters, setAppliedFilters} = useDashboardFilters();
  const { user, userLoading } = useCurrentUser();
  
  const scopeNumberData = {
    'ratingNumber': !dashboard.isLoading.ratingNumberData ? dashboard.ratingNumberData.data ? dashboard.ratingNumberData.data[0] : '-' : false,
    'aveReachNumber': !dashboard.isLoading.aveReachNumberData ? dashboard.aveReachNumberData.data ? dashboard.aveReachNumberData.data[0] : '-' : false,
    'ratingPercentNumber': !dashboard.isLoading.ratingPercentNumberData ? dashboard.ratingPercentNumberData.data ? dashboard.ratingPercentNumberData.data[0] : '-' : false,
    'aveReachPercentNumber': !dashboard.isLoading.aveReachPercentNumberData ? dashboard.aveReachPercentNumberData.data ? dashboard.aveReachPercentNumberData.data[0] : '-' : false
  }

  const scopeFilterData = {
    filterProvince: dashboard.isLoading.filterProvinceData ? [{'Loading': 'Loading'}] : dashboard.filterProvinceData?.data,
    filterProgram: dashboard.isLoading.filterProgramData ? [{'Loading': 'Loading'}] : dashboard.filterProgramData?.data
  }

  return (
    <main className='font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip'>
      <Header username={user?.username} />
      <div className='flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300'>
        <Filter filters={scopeFilterData} />
        <div className={`${stateGlobals.isOpen && !stateGlobals.horizontal ? 'w-[84%] max-md:w-full' : 'w-full'} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}>
          <BreadCrumb />
          <div className='bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
            <ParentTabs uniqueId='dashboard'
                        defaultTab='overview'
                        tabs={[
                          {id: 'overview', label: 'Tổng quan', icon: !stateGlobals.darkMode ? iconOverview : iconOverviewDark, iconActive: iconOverviewActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_overview">
                                <InforTab inforTab={"Tổng quan - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4'>
                                  <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <NumberWithTrendChart nameChart={METRICS['rating%'].title} description={METRICS['rating%'].description} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight}
                                                          data={!dashboard.isLoading.ratingPercentTrendNumberData ? transformNumberWithTrendData(dashboard.ratingPercentTrendNumberData?.data, dashboard.ratingPercentTrendNumberData?.colnames) : 'isLoading'} icon={METRICS.rating.icon} />
                                    <div className="grid grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4">
                                    {Object.values(METRICS).map(card => (
                                      <NumberCard
                                        key={card.name}
                                        title={card.title}
                                        description={card.description}
                                        value={scopeNumberData?.[card.name] ? formatNumber(scopeNumberData?.[card.name]?.[card.metric], { isPercent: card.isPercent }) : 'isLoading'}
                                        icon={card.icon}
                                        background={card.background}
                                        widthIcon={card.widthIcon}
                                      />
                                    ))}
                                    </div>
                                  </div>
                                  <div className='w-full flex gap-6 max-lg:gap-5 max-md:gap-4 max-md:flex-wrap pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <div className='w-[60%] max-md:w-full'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart} description={METRICS.rating.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabRatingReach.rating.id, label: CUSTOM_TAB.childTabRatingReach.rating.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarChannelEventData ? transformBarChartData(dashboard.ratingBarChannelEventData?.data, dashboard.ratingBarChannelEventData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart}
                                              description={CUSTOM_CHART.barChart.barChartChannelEvent.description}
                                              orientation={CUSTOM_CHART.barChart.barChartChannelEvent.orientation}
                                              displayName={false}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabRatingReach.ave_reach.id, label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                                            content: (
                                              <BarChart 
                                                data={!dashboard.isLoading.aveReachBarChannelEventData ? transformBarChartData(dashboard.aveReachBarChannelEventData?.data, dashboard.aveReachBarChannelEventData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.barChart.height}
                                                fontSize={CUSTOM_CHART.barChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                                                fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.aveReachNameChart}
                                                description={CUSTOM_CHART.barChart.barChartChannelEvent.description}
                                                orientation={CUSTOM_CHART.barChart.barChartChannelEvent.orientation}
                                                displayName={false}
                                              />
                                            )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-[40%] max-md:w-full'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart} description={METRICS.rating.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabRatingReach.rating.id, label: CUSTOM_TAB.childTabRatingReach.rating.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarDayEventData ? transformBarChartData(dashboard.ratingBarDayEventData?.data, dashboard.ratingBarDayEventData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartDayEvent.ratingNameChart}
                                              description={CUSTOM_CHART.barChart.barChartDayEvent.description}
                                              orientation={CUSTOM_CHART.barChart.barChartDayEvent.orientation}
                                              displayName={false}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabRatingReach.ave_reach.id, label: CUSTOM_TAB.childTabRatingReach.ave_reach.label,
                                            content: (
                                              <BarChart 
                                                data={!dashboard.isLoading.aveReachBarDayEventData ? transformBarChartData(dashboard.aveReachBarDayEventData?.data, dashboard.aveReachBarDayEventData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.barChart.height}
                                                fontSize={CUSTOM_CHART.barChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                colors={CUSTOM_CHART.barChart.barChartDayEvent.colors}
                                                fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                nameChart={CUSTOM_CHART.barChart.barChartDayEvent.aveReachNameChart}
                                                description={CUSTOM_CHART.barChart.barChartDayEvent.description}
                                                orientation={CUSTOM_CHART.barChart.barChartDayEvent.orientation}
                                                displayName={false}
                                              />
                                            )}
                                          ]} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className='w-full flex gap-6 max-lg:gap-5 max-md:gap-4 max-md:flex-wrap pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <div className='w-[60%] max-md:w-full'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.tableChart.tableChartChannel.name} description={CUSTOM_CHART.tableChart.tableChartChannel.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabChannel.channel.id, label: CUSTOM_TAB.childTabChannel.channel.label,
                                          content: (
                                            <TableChart data={!dashboard.isLoading.allTableChannelData ? transformTableChartData(dashboard.allTableChannelData?.data, dashboard.allTableChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={CUSTOM_CHART.tableChart.tableChartChannel.name}
                                                  description={CUSTOM_CHART.tableChart.tableChartChannel.description}
                                                  showSTT={CUSTOM_CHART.tableChart.tableChartChannel.STT}
                                                  showPagination={CUSTOM_CHART.tableChart.tableChartChannel.pagination}
                                                  displayName={false}
                                                  customCol={CUSTOM_CHART.tableChart.tableChartChannel.customColChannel} />
                                          )},
                                          {id: CUSTOM_TAB.childTabChannel.event.id, label: CUSTOM_TAB.childTabChannel.event.label,
                                            content: (
                                              <TableChart data={!dashboard.isLoading.allTableChannelEventData ? transformTableChartData(dashboard.allTableChannelEventData?.data, dashboard.allTableChannelEventData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={CUSTOM_CHART.tableChart.tableChartChannel.name}
                                                  description={CUSTOM_CHART.tableChart.tableChartChannel.description}
                                                  showSTT={CUSTOM_CHART.tableChart.tableChartChannel.STT}
                                                  showPagination={CUSTOM_CHART.tableChart.tableChartChannel.pagination}
                                                  displayName={false}
                                                  customCol={CUSTOM_CHART.tableChart.tableChartChannel.customColChannelEvent} />
                                            )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-[40%] max-md:w-full'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.tableChart.tableChartArea.name} description={CUSTOM_CHART.tableChart.tableChartArea.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                                          content: (
                                            <TableChart data={!dashboard.isLoading.ratingReachPercentTableRegionalData ? transformTableChartData(dashboard.ratingReachPercentTableRegionalData?.data, dashboard.ratingReachPercentTableRegionalData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartArea.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={CUSTOM_CHART.tableChart.tableChartArea.name}
                                                  description={CUSTOM_CHART.tableChart.tableChartArea.description}
                                                  showSTT={CUSTOM_CHART.tableChart.tableChartArea.STT}
                                                  showPagination={CUSTOM_CHART.tableChart.tableChartArea.pagination}
                                                  displayName={false} />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                                            content: (
                                              <TableChart data={!dashboard.isLoading.ratingReachPercentTableProvinceData ? transformTableChartData(dashboard.ratingReachPercentTableProvinceData?.data, dashboard.ratingReachPercentTableProvinceData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartArea.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={CUSTOM_CHART.tableChart.tableChartArea.name}
                                                  description={CUSTOM_CHART.tableChart.tableChartArea.description}
                                                  showSTT={CUSTOM_CHART.tableChart.tableChartArea.STT}
                                                  showPagination={CUSTOM_CHART.tableChart.tableChartArea.pagination}
                                                  displayName={false} />
                                            )}
                                        ]}/>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='w-full grid grid-cols-2 max-md:flex-wrap max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name} description={METRICS.rating.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarRegionalData ? transformBarChartData(dashboard.ratingBarRegionalData?.data, dashboard.ratingBarRegionalData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.rating.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.rating.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.key_city.id, label: CUSTOM_TAB.childTabArea.key_city.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarKeyCityData ? transformBarChartData(dashboard.ratingBarKeyCityData?.data, dashboard.ratingBarKeyCityData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.rating.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.rating.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarProvinceData ? transformBarChartData(dashboard.ratingBarProvinceData?.data, dashboard.ratingBarProvinceData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.rating.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.rating.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.others.id, label: CUSTOM_TAB.childTabArea.others.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.ratingBarOthersData ? transformBarChartData(dashboard.ratingBarOthersData?.data, dashboard.ratingBarOthersData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.rating.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.rating.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.rating.colorZoom}
                                            />
                                          )}
                                          ]} />
                                      </div>
                                      <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name} description={METRICS.ave_reach.description} opacity={true} />
                                        <ChildTabs tabs={[
                                          {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.aveReachBarRegionalData ? transformBarChartData(dashboard.aveReachBarRegionalData?.data, dashboard.aveReachBarRegionalData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.aveReach.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.aveReach.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.key_city.id, label: CUSTOM_TAB.childTabArea.key_city.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.aveReachBarKeyCityData ? transformBarChartData(dashboard.aveReachBarKeyCityData?.data, dashboard.aveReachBarKeyCityData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.aveReach.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.aveReach.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.aveReachBarProvinceData ? transformBarChartData(dashboard.aveReachBarProvinceData?.data, dashboard.aveReachBarProvinceData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.aveReach.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.aveReach.colorZoom}
                                            />
                                          )},
                                          {id: CUSTOM_TAB.childTabArea.others.id, label: CUSTOM_TAB.childTabArea.others.label,
                                          content: (
                                            <BarChart 
                                              data={!dashboard.isLoading.aveReachBarOthersData ? transformBarChartData(dashboard.aveReachBarOthersData?.data, dashboard.aveReachBarOthersData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.barChart.height}
                                              fontSize={CUSTOM_CHART.barChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              colors={CUSTOM_CHART.barChart.barChartArea.aveReach.color}
                                              fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                              nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name}
                                              description={CUSTOM_CHART.barChart.barChartArea.aveReach.description}
                                              orientation={CUSTOM_CHART.barChart.barChartArea.orientation}
                                              displayName={false}
                                              colorZoom={CUSTOM_CHART.barChart.barChartArea.aveReach.colorZoom}
                                            />
                                          )}
                                          ]} />
                                      </div>
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <MixedChart data={!dashboard.isLoading.ratingReachMixedDateData ? transformMixedChartData(dashboard.ratingReachMixedDateData?.data, 'date', dashboard.ratingReachMixedDateData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.mixedChart.height}
                                                fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                nameChart={CUSTOM_CHART.mixedChart.mixedChartDate.name}
                                                maxVisibleItems={CUSTOM_CHART.mixedChart.mixedChartDate.maxVisibleItems}
                                                description={CUSTOM_CHART.mixedChart.mixedChartDate.description}
                                                barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.aveReach}
                                                lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.rating}
                                                colors={CUSTOM_CHART.mixedChart.mixedChartDate.colors}
                                                barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent} 
                                                lastDataIndexActive={CUSTOM_CHART.mixedChart.mixedChartDate.lastDataIndexActive} />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          {id: 'channel', label: 'Kênh', icon: !stateGlobals.darkMode ? iconChannel : iconChannelDark, iconActive: iconChannelActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_channel">
                                <InforTab inforTab={"Kênh - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4'>
                                  <div className='px-6 max-lg:px-5 max-md:px-0 pt-4 max-lg:pt-3 max-md:pt-0 bg-background-black-4 max-md:bg-background-dashboard dark:bg-background-dark max-md:dark:bg-background-dashboard-dark rounded-2xl'>
                                    <NormalTabs tabs={[
                                      {id: '%', label: '(%)',
                                        content: (
                                          <>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <MixedChart data={!dashboard.isLoading.ratingReachPercentMixedTimebandData ? transformMixedChartData(dashboard.ratingReachPercentMixedTimebandData?.data, 'Khung giờ', dashboard.ratingReachPercentMixedTimebandData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.mixedChart.height}
                                                          fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                          nameChart={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.name}
                                                          maxVisibleItems={!stateGlobals.screen_md ? true : CUSTOM_CHART.mixedChart.mixedChartDate.maxVisibleItems}
                                                          description={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.description}
                                                          barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.metrics.aveReachPercent}
                                                          lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.metrics.ratingPercent}
                                                          colors={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.colors}
                                                          barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                          barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                                                          offsetLine={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.offsetLine}
                                                          xAxisTitle={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.ratingPercentLineTimebandChannelData ? transformMixedChartData(dashboard.ratingPercentLineTimebandChannelData?.data, 'Khung giờ', dashboard.ratingPercentLineTimebandChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.showTopNSeries}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.aveReachPercentLineDateChannelData ? transformMixedChartData(dashboard.aveReachPercentLineDateChannelData?.data, 'date', dashboard.aveReachPercentLineDateChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.aveReach.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.aveReach.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.ratingPercentLineDateChannelData ? transformMixedChartData(dashboard.ratingPercentLineDateChannelData?.data, 'date', dashboard.ratingPercentLineDateChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.rating.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.rating.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-0'>
                                              <TreeMapChart data={!dashboard.isLoading.aveReachPercentTreemapChannelData ? transformTreeMapData(dashboard.aveReachPercentTreemapChannelData?.data, dashboard.aveReachPercentTreemapChannelData?.colnames) : 'isLoading'}
                                                            height={CUSTOM_CHART.treeMapChart.height}
                                                            fontSize={CUSTOM_CHART.treeMapChart.fontSize}
                                                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                            fontWeight={CUSTOM_CHART.treeMapChart.fontWeight}
                                                            nameChart={CUSTOM_CHART.treeMapChart.treeMapChartPercentChannel.name}
                                                            description={CUSTOM_CHART.treeMapChart.treeMapChartPercentChannel.description}
                                                            colors={CUSTOM_CHART.treeMapChart.colorChannel}
                                              />
                                            </div>
                                          </>
                                        )
                                      },
                                      {id: '000', label: '(000)',
                                        content: (
                                          <>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <MixedChart data={!dashboard.isLoading.ratingReachMixedTimebandData ? transformMixedChartData(dashboard.ratingReachMixedTimebandData?.data, 'Khung giờ', dashboard.ratingReachMixedTimebandData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.mixedChart.height}
                                                          fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                          nameChart={CUSTOM_CHART.mixedChart.mixedChartTimeband.name}
                                                          maxVisibleItems={!stateGlobals.screen_md ? true : CUSTOM_CHART.mixedChart.mixedChartDate.maxVisibleItems}
                                                          description={CUSTOM_CHART.mixedChart.mixedChartTimeband.description}
                                                          barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartTimeband.metrics.aveReach}
                                                          lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartTimeband.metrics.rating}
                                                          colors={CUSTOM_CHART.mixedChart.mixedChartTimeband.colors}
                                                          barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                          barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                                                          KMB={CUSTOM_CHART.mixedChart.mixedChartTimeband.KMB}
                                                          offsetLine={CUSTOM_CHART.mixedChart.mixedChartTimeband.offsetLine}
                                                          xAxisTitle={CUSTOM_CHART.mixedChart.mixedChartTimeband.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.ratingLineTimebandChannelData ? transformMixedChartData(dashboard.ratingLineTimebandChannelData?.data, 'Khung giờ', dashboard.ratingLineTimebandChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartTimebandChannel.rating.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartTimebandChannel.rating.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandChannel.showTopNSeries}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.aveReachLineTimebandChannelData ? transformMixedChartData(dashboard.aveReachLineTimebandChannelData?.data, 'Khung giờ', dashboard.aveReachLineTimebandChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartTimebandChannel.aveReach.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartTimebandChannel.aveReach.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandChannel.showTopNSeries}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.ratingLineDateChannelData ? transformMixedChartData(dashboard.ratingLineDateChannelData?.data, 'date', dashboard.ratingLineDateChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartDateChannel.rating.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartDateChannel.rating.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.aveReachLineDateChannelData ? transformMixedChartData(dashboard.aveReachLineDateChannelData?.data, 'date', dashboard.aveReachLineDateChannelData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.ratingLineTimebandDayData ? transformMixedChartData(dashboard.ratingLineTimebandDayData?.data, 'Khung giờ', dashboard.ratingLineTimebandDayData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartTimebandDay.rating.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartTimebandDay.rating.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandDay.showTopNSeries}
                                                        left={CUSTOM_CHART.lineChart.lineChartTimebandDay.left}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.aveReachLineTimebandDayData ? transformMixedChartData(dashboard.aveReachLineTimebandDayData?.data, 'Khung giờ', dashboard.aveReachLineTimebandDayData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartTimebandDay.aveReach.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartTimebandDay.aveReach.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandDay.showTopNSeries}
                                                        left={CUSTOM_CHART.lineChart.lineChartTimebandDay.left}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                              <LineChart data={!dashboard.isLoading.aveReachLineTimebandRegionalData ? transformMixedChartData(dashboard.aveReachLineTimebandRegionalData?.data, 'Khung giờ', dashboard.aveReachLineTimebandRegionalData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.height}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.lineChart.lineChartTimebandRegional.name}
                                                        description={CUSTOM_CHART.lineChart.lineChartTimebandRegional.description}
                                                        colors={CUSTOM_CHART.lineChart.colorChannel}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandRegional.showTopNSeries}
                                                        left={CUSTOM_CHART.lineChart.lineChartTimebandRegional.left}
                                                        xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitle}
                                              />
                                            </div>
                                            <div className='w-full pb-6 max-lg:pb-5 max-md:pb-0'>
                                              <TreeMapChart data={!dashboard.isLoading.ratingTreemapChannelData ? transformTreeMapData(dashboard.ratingTreemapChannelData?.data, dashboard.ratingTreemapChannelData?.colnames) : 'isLoading'}
                                                            height={CUSTOM_CHART.treeMapChart.height}
                                                            fontSize={CUSTOM_CHART.treeMapChart.fontSize}
                                                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                            fontWeight={CUSTOM_CHART.treeMapChart.fontWeight}
                                                            nameChart={CUSTOM_CHART.treeMapChart.treeMapChartChannel.name}
                                                            description={CUSTOM_CHART.treeMapChart.treeMapChartChannel.description}
                                                            colors={CUSTOM_CHART.treeMapChart.colorChannel}
                                              />
                                            </div>
                                          </>
                                        )
                                      }
                                    ]}/>
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          {id: 'program', label: 'Chương trình', icon: !stateGlobals.darkMode ? iconProgram : iconProgramDark, iconActive: iconProgramActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_program">
                                <InforTab inforTab={"Chương trình - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 py-6 max-lg:py-5 max-md:py-4'>
                                    <PieChart data={!dashboard.isLoading.totalEventDurationPieFirstLevelData ? transformPieChartData(dashboard.totalEventDurationPieFirstLevelData?.data, dashboard.totalEventDurationPieFirstLevelData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.pieChart.height}
                                              fontSize={CUSTOM_CHART.pieChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                              nameChart={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalEvent.name}
                                              description={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalEvent.description}
                                              colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                              donut={CUSTOM_CHART.pieChart.donut}
                                              innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                    />
                                    <PieChart data={!dashboard.isLoading.totalViewDurationPieFirstLevelData ? transformPieChartData(dashboard.totalViewDurationPieFirstLevelData?.data, dashboard.totalViewDurationPieFirstLevelData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.pieChart.height}
                                              fontSize={CUSTOM_CHART.pieChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                              nameChart={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView.name}
                                              description={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView.description}
                                              colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                              donut={CUSTOM_CHART.pieChart.donut}
                                              innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                    />
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <TableChart data={!dashboard.isLoading.allTableRankData ? transformTableChartData(dashboard.allTableRankData?.data, dashboard.allTableRankData?.colnames, CUSTOM_CHART.tableChart.tableProgramChannel.programRank.columnSort) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programRank.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programRank.description}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination}
                                                fullScreen={true}
                                                customCol={CUSTOM_CHART.tableChart.tableProgramChannel.customCol} />
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <TableChart data={!dashboard.isLoading.allTableDetailData ? transformTableChartData(dashboard.allTableDetailData?.data, dashboard.allTableDetailData?.colnames, CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.columnSort) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.description}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination}
                                                fullScreen={true}
                                                customCol={CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.customCol} />
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <TableChart data={!dashboard.isLoading.allTableEventData ? transformTableChartData(dashboard.allTableEventData?.data, dashboard.allTableEventData?.colnames, CUSTOM_CHART.tableChart.tableProgramChannel.programEvent.columnSort) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programEvent.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programEvent.description}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination}
                                                fullScreen={true}
                                                customCol={CUSTOM_CHART.tableChart.tableProgramChannel.customCol} />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          ((!userLoading && user?.username !== 'vtvguest') ? {id: 'rating_by_minute', label: !stateGlobals.screen_md ? 'Rating theo phút' : 'Rating phút', icon: !stateGlobals.darkMode ? iconRatingByMinute : iconRatingByMinuteDark, iconActive: iconRatingByMinuteActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_rating_by_minute">
                                <InforTab inforTab={"Rating theo phút - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  <div className='w-full py-6 max-lg:py-5 max-md:pb-4'>
                                    <LineChart data={!dashboard.isLoading.ratingLineMinuteChannelData ? transformMixedChartData(dashboard.ratingLineMinuteChannelData?.data, 'event_hour_minute', dashboard.ratingLineMinuteChannelData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.lineChart.heightMinute}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartMinuteChannel.name}
                                              description={CUSTOM_CHART.lineChart.lineChartMinuteChannel.description}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                              legendTop={CUSTOM_CHART.lineChart.lineChartMinuteChannel.legendTop}
                                              xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitleMinute}
                                              fullScreen={true}
                                    />
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <LineChart data={!dashboard.isLoading.ratingLineMinuteChannelOneDateData ? transformMixedChartData(dashboard.ratingLineMinuteChannelOneDateData?.data, 'event_hour_minute', dashboard.ratingLineMinuteChannelOneDateData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.lineChart.heightMinute}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartMinuteDay.name + ' (' + formatDate(appliedFilters?.endDate || getYesterday()) + (appliedFilters?.channels?.length > 0 ? ' - ' + appliedFilters?.channels[0] : ' - VTV1') + ')'}
                                              description={CUSTOM_CHART.lineChart.lineChartMinuteDay.description}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                              legendTop={CUSTOM_CHART.lineChart.lineChartMinuteChannel.legendTop}
                                              xAxisTitle={CUSTOM_CHART.lineChart.xAxisTitleMinute}
                                              fullScreen={true}
                                              textOverflow={true}
                                    />
                                  </div>
                                  <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                    <LineChart data={!dashboard.isLoading.ratingLineMinuteChannelDatesData ? transformMixedChartData(dashboard.ratingLineMinuteChannelDatesData?.data, 'event_hour_minute', dashboard.ratingLineMinuteChannelDatesData?.colnames) : 'isLoading'}
                                              height={CUSTOM_CHART.lineChart.heightMinute}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartMinuteDays.name + ' (' + 'nhiều ngày ' + (appliedFilters?.channels?.length > 0 ? ' - ' + appliedFilters?.channels[0] : ' - VTV1') + ')'}
                                              description={CUSTOM_CHART.lineChart.lineChartMinuteDays.description}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                              legendTop={CUSTOM_CHART.lineChart.lineChartMinuteChannel.legendTop}
                                              fullScreen={true}
                                              textOverflow={true}
                                    />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          } : null)
                        ]}
                        user={(!userLoading && user?.username !== 'vtvguest')}
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