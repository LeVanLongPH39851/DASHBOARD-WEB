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
        <ParentTabs uniqueId='dashboard'
                    defaultTab='channel'
                    tabs={[
                      {id: 'overview', label: 'Overview',
                        content: (
                          <>
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
                            <div className='w-full flex gap-6 pb-6'>
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
                            <div className='w-full'>
                              <MixedChart data={transformMixedChartData(dashboard.ratingReachMixedDateData.data, 'date', dashboard.ratingReachMixedDateData.colnames)}
                                          height={CUSTOM_CHART.mixedChart.height}
                                          fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                          fontFamily={CUSTOM_CHART.mixedChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                          nameChart={CUSTOM_CHART.mixedChart.mixedChartDate.name}
                                          description={CUSTOM_CHART.mixedChart.mixedChartDate.desciption}
                                          barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.aveReach}
                                          lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.rating}
                                          colors={CUSTOM_CHART.mixedChart.mixedChartDate.colors}
                                          barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                          barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                              />
                            </div>
                          </>
                        )
                      },
                      {id: 'channel', label: 'Kênh',
                        content: (
                          <>
                            <div className='w-full py-6'>
                              <MixedChart data={transformMixedChartData(dashboard.ratingReachPercentMixedTimebandData.data, 'time_band', dashboard.ratingReachPercentMixedTimebandData.colnames)}
                                          height={CUSTOM_CHART.mixedChart.height}
                                          fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                          fontFamily={CUSTOM_CHART.mixedChart.fontFamily}
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
                              />
                            </div>
                          </>
                        )
                      }
                    ]}
        />
      </div>
    </div>
    </>
  );
};

export default Dashboard;