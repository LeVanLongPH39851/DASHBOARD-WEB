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
import { useDashboardFilters } from '../context/DashboardFilterContext';
import BigNumberWithTrend from '../components/charts/BigNumberWithTrend';
import NameChart from '../components/layouts/components/NameChart';

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const [filterOpen, setFilterOpen] = useState({isOpen: true, horizontal: false, isInfor: true});
  const [currentTab, setCurrentTab] = useState('overview');
  const [channels, setChannels] = useState([]);
  const [events, setEvents] = useState([]);
  const [provinces, setProvinces] = useState([]);

  if (dashboard.isLoading) return <Loading />;
  if (dashboard.hasError) return <ErrorState />;
  
  const scopeNumberData = {
    'ratingNumber': dashboard.ratingNumberData,
    'aveReachNumber': dashboard.aveReachNumberData,
    'ratingPercentNumber': dashboard.ratingPercentNumberData,
    'aveReachPercentNumber': dashboard.aveReachPercentNumberData,
    'ratingBarChannelEventData': dashboard.ratingBarChannelEventData
  }

  const scopeFilterData = {
    filterProvince: dashboard.filterProvinceData.data
  }
  
  return (
    <main className='font-family-be-vietnam-pro w-full h-full tracking-[0.1px]'>
      <Header />
      <div className='flex w-full h-full'>
        <Filter isOpen={filterOpen} setIsOpen={setFilterOpen} currentTab={currentTab}
                filters={scopeFilterData} appliedFilters={appliedFilters} setAppliedFilters={setAppliedFilters}
                channels={channels} setChannels={setChannels} events={events} setEvents={setEvents}
                provinces={provinces} setProvinces={setProvinces} />
        <div className={`mb-4 ${filterOpen.isOpen && !filterOpen.horizontal ? 'w-[85%]' : 'w-full'} transition-all duration-300`}>
          <BreadCrumb/>
          <div className='bg-background-dashboard'>
            <ParentTabs uniqueId='dashboard'
                        defaultTab='overview'
                        tabs={[
                          {id: 'overview', label: 'Tổng quan',
                            content: (
                              <section>
                                <InforTab inforTab={"Tổng quan - P4+ toàn quốc"} isOpen={filterOpen} setIsOpen={setFilterOpen} />
                                <InforFilter inforFilter={appliedFilters}
                                             setInforFilter={setAppliedFilters}
                                             filters={scopeFilterData}
                                             channels={channels}
                                             events={events}
                                             provinces={provinces}
                                             setChannels={setChannels}
                                             setEvents={setEvents}
                                             setProvinces={setProvinces}
                                             currentTab={currentTab}
                                             isOpen={filterOpen}
                                             setIsOpen={setFilterOpen} />
                                <div className='px-6 pt-6'>
                                  <div className='w-full grid grid-cols-2 gap-6 pb-6'>
                                    <BigNumberWithTrend height='h-98.75' icon={METRICS.rating.icon}/>
                                    <div className="grid grid-cols-2 gap-6">
                                    {Object.values(METRICS).map(card => (
                                      <NumberCard
                                        key={card.name}
                                        title={card.title}
                                        description={card.description}
                                        value={formatNumber(scopeNumberData?.[card.name]?.data[0]?.[card.metric], { isPercent: card.isPercent })}
                                        icon={card.icon}
                                        background={card.background}
                                        widthIcon={card.widthIcon}
                                      />
                                    ))}
                                  </div>
                                  </div>
                                  <div className='w-full flex gap-6 pb-6'>
                                    <div className='w-[60%]'>
                                      <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart} description={METRICS.rating.description} />
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
                                              displayName={false}
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
                                                displayName={false}
                                              />
                                            )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-[40%]'>
                                      <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartChannelEvent.ratingNameChart} description={METRICS.rating.description} />
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
                                              displayName={false}
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
                                                displayName={false}
                                              />
                                            )}
                                          ]} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className='w-full flex gap-6 pb-6'>
                                    <div className='w-[60%]'>
                                      <ChildTabs tabs={[
                                        {id: CUSTOM_TAB.childTabChannel.channel.id, label: CUSTOM_TAB.childTabChannel.channel.label,
                                        content: (
                                          <TableChart data={transformTableChartData(dashboard.allTableChannelData.data, dashboard.allTableChannelData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableChartChannel.name}
                                                description={CUSTOM_CHART.tableChart.tableChartChannel.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableChartChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableChartChannel.pagination} />
                                        )},
                                        {id: CUSTOM_TAB.childTabChannel.event.id, label: CUSTOM_TAB.childTabChannel.event.label,
                                          content: (
                                            <TableChart data={transformTableChartData(dashboard.allTableChannelEventData.data, dashboard.allTableChannelEventData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableChartChannel.name}
                                                description={CUSTOM_CHART.tableChart.tableChartChannel.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableChartChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableChartChannel.pagination} />
                                          )}
                                        ]} />
                                    </div>
                                    <div className='w-[40%]'>
                                      <ChildTabs tabs={[
                                        {id: CUSTOM_TAB.childTabArea.regional.id, label: CUSTOM_TAB.childTabArea.regional.label,
                                        content: (
                                          <TableChart data={transformTableChartData(dashboard.ratingReachPercentTableRegionalData.data, dashboard.ratingReachPercentTableRegionalData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableChartArea.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableChartArea.name}
                                                description={CUSTOM_CHART.tableChart.tableChartArea.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableChartArea.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableChartArea.pagination} />
                                        )},
                                        {id: CUSTOM_TAB.childTabArea.province.id, label: CUSTOM_TAB.childTabArea.province.label,
                                          content: (
                                            <TableChart data={transformTableChartData(dashboard.ratingReachPercentTableProvinceData.data, dashboard.ratingReachPercentTableProvinceData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableChartArea.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableChartArea.name}
                                                description={CUSTOM_CHART.tableChart.tableChartArea.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableChartArea.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableChartArea.pagination} />
                                          )}
                                      ]}/>
                                    </div>
                                  </div>
                                  <div className='w-full grid grid-cols-2 gap-6 pb-6'>
                                      <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartArea.rating.name} description={METRICS.rating.description} />
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
                                              displayName={false}
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
                                              displayName={false}
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
                                              displayName={false}
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
                                              displayName={false}
                                            />
                                          )}
                                          ]} />
                                      </div>
                                      <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
                                        <NameChart nameChart={CUSTOM_CHART.barChart.barChartArea.aveReach.name} description={METRICS.ave_reach.description} />
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
                                              displayName={false}
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
                                              displayName={false}
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
                                              displayName={false}
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
                                              displayName={false}
                                            />
                                          )}
                                          ]} />
                                      </div>
                                  </div>
                                  <div className='w-full pb-6'>
                                    <MixedChart data={transformMixedChartData(dashboard.ratingReachMixedDateData.data, 'date', dashboard.ratingReachMixedDateData.colnames)}
                                                height={CUSTOM_CHART.mixedChart.height}
                                                fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                nameChart={CUSTOM_CHART.mixedChart.mixedChartDate.name}
                                                description={CUSTOM_CHART.mixedChart.mixedChartDate.desciption}
                                                barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.aveReach}
                                                lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.rating}
                                                colors={CUSTOM_CHART.mixedChart.mixedChartDate.colors}
                                                barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent} />
                                  </div>
                                </div>
                              </section>
                            )
                          },
                          {id: 'channel', label: 'Kênh',
                            content: (
                              <section>
                                <InforTab inforTab={"Kênh - P4+ toàn quốc"} isOpen={filterOpen} setIsOpen={setFilterOpen} />
                                <InforFilter inforFilter={appliedFilters}
                                             setInforFilter={setAppliedFilters}
                                             filters={scopeFilterData}
                                             channels={channels}
                                             events={events}
                                             provinces={provinces}
                                             setChannels={setChannels}
                                             setEvents={setEvents}
                                             setProvinces={setProvinces}
                                             currentTab={currentTab}
                                             isOpen={filterOpen}
                                             setIsOpen={setFilterOpen} />
                                <div className='px-10 pt-6'>
                                  <NormalTabs tabs={[
                                    {id: '%', label: '(%)',
                                      content: (
                                        <>
                                          <div className='w-full pb-6'>
                                            <MixedChart data={transformMixedChartData(dashboard.ratingReachPercentMixedTimebandData.data, 'time_band', dashboard.ratingReachPercentMixedTimebandData.colnames)}
                                                        height={CUSTOM_CHART.mixedChart.height}
                                                        fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.name}
                                                        description={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.desciption}
                                                        barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.metrics.aveReachPercent}
                                                        lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.metrics.ratingPercent}
                                                        colors={CUSTOM_CHART.mixedChart.mixedChartPercentTimeband.colors}
                                                        barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                        barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingPercentLineTimebandChannelData.data, 'time_band', dashboard.ratingPercentLineTimebandChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.aveReachPercentLineDateChannelData.data, 'date', dashboard.aveReachPercentLineDateChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.aveReach.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.aveReach.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingPercentLineDateChannelData.data, 'date', dashboard.ratingPercentLineDateChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.rating.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartPercentDateChannel.rating.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <TreeMapChart data={transformTreeMapData(dashboard.aveReachPercentTreemapChannelData.data, dashboard.aveReachPercentTreemapChannelData.colnames)}
                                                          height={CUSTOM_CHART.treeMapChart.height}
                                                          fontSize={CUSTOM_CHART.treeMapChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.treeMapChart.fontWeight}
                                                          nameChart={CUSTOM_CHART.treeMapChart.treeMapChartPercentChannel.name}
                                                          description={CUSTOM_CHART.treeMapChart.treeMapChartPercentChannel.desciption}
                                                          colors={CUSTOM_CHART.treeMapChart.colorChannel}
                                            />
                                          </div>
                                        </>
                                      )
                                    },
                                    {id: '000', label: '(000)',
                                      content: (
                                        <>
                                          <div className='w-full pb-6'>
                                            <MixedChart data={transformMixedChartData(dashboard.ratingReachMixedTimebandData.data, 'time_band', dashboard.ratingReachMixedTimebandData.colnames)}
                                                        height={CUSTOM_CHART.mixedChart.height}
                                                        fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                        nameChart={CUSTOM_CHART.mixedChart.mixedChartTimeband.name}
                                                        description={CUSTOM_CHART.mixedChart.mixedChartTimeband.desciption}
                                                        barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartTimeband.metrics.aveReach}
                                                        lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartTimeband.metrics.rating}
                                                        colors={CUSTOM_CHART.mixedChart.mixedChartTimeband.colors}
                                                        barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                        barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingLineTimebandChannelData.data, 'time_band', dashboard.ratingLineTimebandChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartTimebandChannel.rating.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartTimebandChannel.rating.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandChannel.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.aveReachLineTimebandChannelData.data, 'time_band', dashboard.aveReachLineTimebandChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartTimebandChannel.aveReach.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartTimebandChannel.aveReach.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandChannel.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingLineDateChannelData.data, 'date', dashboard.ratingLineDateChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingLineDateChannelData.data, 'date', dashboard.ratingLineDateChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartDateChannel.rating.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartDateChannel.rating.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.aveReachLineDateChannelData.data, 'date', dashboard.aveReachLineDateChannelData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartDateChannel.aveReach.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.ratingLineTimebandDayData.data, 'time_band', dashboard.ratingLineTimebandDayData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartTimebandDay.rating.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartTimebandDay.rating.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.aveReachLineTimebandDayData.data, 'time_band', dashboard.aveReachLineTimebandDayData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartTimebandDay.aveReach.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartTimebandDay.aveReach.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <LineChart data={transformMixedChartData(dashboard.aveReachLineTimebandRegionalData.data, 'time_band', dashboard.aveReachLineTimebandRegionalData.colnames)}
                                                      height={CUSTOM_CHART.lineChart.height}
                                                      fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                      fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                      nameChart={CUSTOM_CHART.lineChart.lineChartTimebandRegional.name}
                                                      description={CUSTOM_CHART.lineChart.lineChartTimebandRegional.desciption}
                                                      colors={CUSTOM_CHART.lineChart.colorChannel}
                                                      smooth={CUSTOM_CHART.lineChart.smooth}
                                                      symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                      lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                      areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                      stack={CUSTOM_CHART.lineChart.stack}
                                                      showTopNSeries={CUSTOM_CHART.lineChart.lineChartTimebandRegional.showTopNSeries}
                                            />
                                          </div>
                                          <div className='w-full pb-6'>
                                            <TreeMapChart data={transformTreeMapData(dashboard.ratingTreemapChannelData.data, dashboard.ratingTreemapChannelData.colnames)}
                                                          height={CUSTOM_CHART.treeMapChart.height}
                                                          fontSize={CUSTOM_CHART.treeMapChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.treeMapChart.fontWeight}
                                                          nameChart={CUSTOM_CHART.treeMapChart.treeMapChartChannel.name}
                                                          description={CUSTOM_CHART.treeMapChart.treeMapChartChannel.desciption}
                                                          colors={CUSTOM_CHART.treeMapChart.colorChannel}
                                            />
                                          </div>
                                        </>
                                      )
                                    }
                                  ]}/>
                                </div>
                              </section>
                            )
                          },
                          {id: 'program', label: 'Chương trình',
                            content: (
                              <section>
                                <InforTab inforTab={"Chương trình - P4+ toàn quốc"} isOpen={filterOpen} setIsOpen={setFilterOpen} />
                                <InforFilter inforFilter={appliedFilters}
                                             setInforFilter={setAppliedFilters}
                                             filters={scopeFilterData}
                                             channels={channels}
                                             events={events}
                                             provinces={provinces}
                                             setChannels={setChannels}
                                             setEvents={setEvents}
                                             setProvinces={setProvinces}
                                             currentTab={currentTab}
                                             isOpen={filterOpen}
                                             setIsOpen={setFilterOpen} />
                                <div className='px-10'>
                                  <div className='w-full grid grid-cols-2 gap-6 py-6'>
                                    <PieChart data={transformPieChartData(dashboard.totalEventDurationPieFirstLevelData.data, dashboard.totalEventDurationPieFirstLevelData.colnames)}
                                              height={CUSTOM_CHART.pieChart.height}
                                              fontSize={CUSTOM_CHART.pieChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                              nameChart={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalEvent.name}
                                              description={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalEvent.desciption}
                                              colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                              donut={CUSTOM_CHART.pieChart.donut}
                                              innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                    />
                                    <PieChart data={transformPieChartData(dashboard.totalViewDurationPieFirstLevelData.data, dashboard.totalViewDurationPieFirstLevelData.colnames)}
                                              height={CUSTOM_CHART.pieChart.height}
                                              fontSize={CUSTOM_CHART.pieChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                              nameChart={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView.name}
                                              description={CUSTOM_CHART.pieChart.pieChartFirstLevel.totalView.desciption}
                                              colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                              donut={CUSTOM_CHART.pieChart.donut}
                                              innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                    />
                                  </div>
                                  <div className='w-full pb-6'>
                                    <TableChart data={transformTableChartData(dashboard.allTableRankData.data, dashboard.allTableRankData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programRank.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programRank.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination} />
                                  </div>
                                  <div className='w-full pb-6'>
                                    <TableChart data={transformTableChartData(dashboard.allTableDetailData.data, dashboard.allTableDetailData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programDetail.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination} />
                                  </div>
                                  <div className='w-full pb-6'>
                                    <TableChart data={transformTableChartData(dashboard.allTableEventData.data, dashboard.allTableEventData.colnames)}
                                                height={CUSTOM_CHART.tableChart.tableProgramChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={CUSTOM_CHART.tableChart.tableProgramChannel.programEvent.name}
                                                description={CUSTOM_CHART.tableChart.tableProgramChannel.programEvent.desciption}
                                                showSTT={CUSTOM_CHART.tableChart.tableProgramChannel.STT}
                                                showPagination={CUSTOM_CHART.tableChart.tableProgramChannel.pagination} />
                                  </div>
                                </div>
                              </section>
                            )
                          },
                          {id: 'rating_by_minute', label: 'Rating theo phút',
                            content: (
                              <section>
                                <InforTab inforTab={"Rating theo phút - P4+ toàn quốc"} isOpen={filterOpen} setIsOpen={setFilterOpen} />
                                <InforFilter inforFilter={appliedFilters}
                                             setInforFilter={setAppliedFilters}
                                             filters={scopeFilterData}
                                             channels={channels}
                                             events={events}
                                             provinces={provinces}
                                             setChannels={setChannels}
                                             setEvents={setEvents}
                                             setProvinces={setProvinces}
                                             currentTab={currentTab}
                                             isOpen={filterOpen}
                                             setIsOpen={setFilterOpen} />
                                <div className='px-10'>
                                  <div className='w-full py-6'>
                                    <LineChart data={transformMixedChartData(dashboard.ratingLineMinuteChannelData.data, 'event_start_time_split_m', dashboard.ratingLineMinuteChannelData.colnames)}
                                              height={CUSTOM_CHART.lineChart.height}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.name}
                                              description={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.desciption}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                    />
                                  </div>
                                  <div className='w-full pb-6'>
                                    <LineChart data={transformMixedChartData(dashboard.ratingLineMinuteChannelOneDateData.data, 'event_start_time_split_m', dashboard.ratingLineMinuteChannelOneDateData.colnames)}
                                              height={CUSTOM_CHART.lineChart.height}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.name}
                                              description={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.desciption}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                    />
                                  </div>
                                  <div className='w-full pb-6'>
                                    <LineChart data={transformMixedChartData(dashboard.ratingLineMinuteChannelDatesData.data, 'event_start_time_split_m', dashboard.ratingLineMinuteChannelDatesData.colnames)}
                                              height={CUSTOM_CHART.lineChart.height}
                                              fontSize={CUSTOM_CHART.lineChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                              nameChart={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.name}
                                              description={CUSTOM_CHART.lineChart.lineChartPercentTimebandChannel.desciption}
                                              colors={CUSTOM_CHART.lineChart.colorChannel}
                                              smooth={CUSTOM_CHART.lineChart.smooth}
                                              symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                              lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                              areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                              stack={CUSTOM_CHART.lineChart.stack}
                                              showTopNSeries={0}
                                    />
                                  </div>
                                </div>
                              </section>
                            )
                          }
                        ]}
                        onTabChange={setCurrentTab}
            />
          </div>
          <div className='px-10'>
            <Footer />
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