import { useEffect, useState } from 'react';
import NumberCard from '../components/charts/NumberCard';
import Filter from '../components/layouts/filters/Filter';
import { METRICS } from '../utils/metricInfor';
import { CUSTOM_CHART } from '../utils/customChart';
import { formatNumber } from '../utils/formatNumber';
import { transformBarChartData } from '../utils/transformApiBartChart';
import BarChart from '../components/charts/BarChart';
import { useDashboardData } from '../hooks/useDashboardDataSpot';
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
import { useDashboardStateGlobals } from '../context/DashboardFilterContext';
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
import PivotTableChart from '../components/charts/PivotTableChart';
import FilterSpot from '../components/layouts/filters/FilterSpot';

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  const scopeFilterData = {
    filterProvince: dashboard.isLoading.filterProvinceData ? [{'Loading': 'Loading'}] : dashboard.filterProvinceData?.data,
    filterProgram: dashboard.isLoading.filterProgramData ? [{ 'Loading': 'Loading' }] : dashboard.filterProgramData?.data,
    filterProduct: dashboard.isLoading.filterProductData ? [{ 'Loading': 'Loading' }] : dashboard.filterProductData?.data,
    filterGroup: dashboard.isLoading.filterGroupData ? [{ 'Loading': 'Loading' }] : dashboard.filterGroupData?.data,
    filterCampaign: dashboard.isLoading.filterCampaignData ? [{ 'Loading': 'Loading' }] : dashboard.filterCampaignData?.data,
    filterBrand: dashboard.isLoading.filterBrandData ? [{ 'Loading': 'Loading' }] : dashboard.filterBrandData?.data,
    filterAdvertiser: dashboard.isLoading.filterAdvertiserData ? [{ 'Loading': 'Loading' }] : dashboard.filterAdvertiserData?.data,
    filterAdcode: dashboard.isLoading.filterAdcodeData ? [{ 'Loading': 'Loading' }] : dashboard.filterAdcodeData?.data
  }
  
  return (
    <main className='font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip'>
      <Header />
      <div className='flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300'>
        <FilterSpot filters={scopeFilterData} />
        <div className={`${stateGlobals.isOpen && !stateGlobals.horizontal ? 'w-[84%] max-md:w-full' : 'w-full'} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}>
          <BreadCrumb dashboardName='GIÁM SÁT QUẢNG CÁO' />
          <div className='bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
            <ParentTabs uniqueId='dashboard'
                        defaultTab='overview'
                        tabs={[
                          {id: 'overview', label: 'Tổng quan', icon: !stateGlobals.darkMode ? iconOverview : iconOverviewDark, iconActive: iconOverviewActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_overview">
                                <InforTab inforTab={"Tổng quan"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4'>
                                    <div className='w-full grid grid-cols-5 max-md:grid-cols-2 gap-6 max-md:gap-4 pb-6 max-md:pb-4'>
                                      <div className='col-span-2'>
                                        <NumberWithTrendChart nameChart={'Chi phí (VND)'} description={'Chi phí (VND)'} data={!dashboard.isLoading.spendVNDNumberData ? transformNumberWithTrendData(dashboard.spendVNDNumberData?.data, dashboard.spendVNDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRICS.rating.icon} suffix='tr VND' />
                                      </div>
                                      <div className='col-span-2'>
                                        <NumberWithTrendChart nameChart={'Chi phí (USD)'} description={'Chi phí (USD)'} data={!dashboard.isLoading.spendUSDNumberData ? transformNumberWithTrendData(dashboard.spendUSDNumberData?.data, dashboard.spendUSDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRICS.rating.icon} suffix='$' />
                                      </div>
                                        <div className='col-span-1 max-md:col-span-2 grid grid-cols-1 max-md:grid-cols-2 gap-6 max-md:gap-4'>
                                            <NumberCard
                                                title={'Số lượng Spot'}
                                                description={'Số lượng Spot'}
                                                value={!dashboard.isLoading.countNumberData ? dashboard.countNumberData?.data ? formatNumber(dashboard.countNumberData?.data[0].count, { isPercent: false }) : '-' : 'isLoading'}
                                                icon={METRICS.ave_reach.icon}
                                                background={METRICS.ave_reach.background}
                                                widthIcon={METRICS.ave_reach.widthIcon}
                                            />
                                            <NumberCard
                                                title={'Thời lượng Spot'}
                                                description={'Thời lượng Spot'}
                                                value={!dashboard.isLoading.durationNumberData ? dashboard.durationNumberData?.data ? dashboard.durationNumberData?.data[0]?.total_duration?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-' : 'isLoading'}
                                                icon={METRICS.ave_reach.icon}
                                                background={METRICS.ave_reach.background}
                                                widthIcon={METRICS.ave_reach.widthIcon}
                                                suffix='phút'
                                            />
                                        </div>
                                    </div>
                                    <div className='w-full pb-6 max-md:pb-4'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                          <NameChart nameChart={'Xu hướng quảng cáo THEO NGÀY'} description={'Xu hướng quảng cáo THEO NGÀY'} opacity={true} />
                                          <ChildTabs tabs={[
                                          {id: 'vnd', label: 'VND',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarDateData ? transformBarChartData(dashboard.spendVNDBarDateData?.data, dashboard.spendVNDBarDateData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 204, 0, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Xu hướng quảng cáo THEO NGÀY'}
                                                  description={'Xu hướng quảng cáo THEO NGÀY'}
                                                  orientation={''}
                                                  displayName={false}
                                                  suffix='tr'
                                              />
                                          )},
                                          {id: 'usd', label: 'USD',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendUSDBarDateData ? transformBarChartData(dashboard.spendUSDBarDateData?.data, dashboard.spendUSDBarDateData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 204, 0, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Xu hướng quảng cáo THEO NGÀY'}
                                                  description={'Xu hướng quảng cáo THEO NGÀY'}
                                                  orientation={''}
                                                  displayName={false}
                                                  suffix={'$'}
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6 max-md:pb-4'>
                                        <ChildTabs tabs={[
                                        {id: 'spend', label: 'Share of spend',
                                        content: (
                                            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                                <PieChart data={!dashboard.isLoading.spendVNDPieChannelData ? transformPieChartData(dashboard.spendVNDPieChannelData?.data, dashboard.spendVNDPieChannelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ chi phí quảng cáo theo kênh'}
                                                          description={'Phân bổ chi phí quảng cáo theo kênh'}
                                                          colors={CUSTOM_CHART.pieChart.colorChannel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                          suffix='tr'
                                                />
                                                <PieChart data={!dashboard.isLoading.spendVNDPieFirstLevelData ? transformPieChartData(dashboard.spendVNDPieFirstLevelData?.data, dashboard.spendVNDPieFirstLevelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ chi phí quảng cáo theo thể loại nội dung'}
                                                          description={'Phân bổ chi phí quảng cáo theo thể loại nội dung'}
                                                          colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                          suffix='tr'
                                                />
                                            </div>
                                        )},
                                        {id: 'spot', label: 'Share of spot',
                                        content: (
                                            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                                <PieChart data={!dashboard.isLoading.countPieChannelData ? transformPieChartData(dashboard.countPieChannelData?.data, dashboard.countPieChannelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ số lượng quảng cáo theo kênh'}
                                                          description={'Phân bổ số lượng quảng cáo theo kênh'}
                                                          colors={CUSTOM_CHART.pieChart.colorChannel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                />
                                                <PieChart data={!dashboard.isLoading.countPieFirstLevelData ? transformPieChartData(dashboard.countPieFirstLevelData?.data, dashboard.countPieFirstLevelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ số lượng quảng cáo theo thể loại nội dung'}
                                                          description={'Phân bổ số lượng quảng cáo theo thể loại nội dung'}
                                                          colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                />
                                            </div>
                                        )},
                                        {id: 'duration', label: 'Share of airtime',
                                        content: (
                                            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                                <PieChart data={!dashboard.isLoading.durationPieChannelData ? transformPieChartData(dashboard.durationPieChannelData?.data, dashboard.durationPieChannelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ thời lượng quảng cáo theo kênh'}
                                                          description={'Phân bổ thời lượng quảng cáo theo kênh'}
                                                          colors={CUSTOM_CHART.pieChart.colorChannel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                          suffix='phút'
                                                          formatterValue={2}
                                                />
                                                <PieChart data={!dashboard.isLoading.durationPieFirstLevelData ? transformPieChartData(dashboard.durationPieFirstLevelData?.data, dashboard.durationPieFirstLevelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ thời lượng quảng cáo theo thể loại nội dung'}
                                                          description={'Phân bổ thời lượng quảng cáo theo thể loại nội dung'}
                                                          colors={CUSTOM_CHART.pieChart.colorFirstLevel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                          suffix='phút'
                                                          formatterValue={2}
                                                />
                                            </div>
                                        )},
                                        {id: 'length_voice', label: 'Share of spot lengths/voice',
                                        content: (
                                            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                                <PieChart data={!dashboard.isLoading.durationPieLengthData ? transformPieChartData(dashboard.durationPieLengthData?.data, dashboard.durationPieLengthData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ độ dài của quảng cáo theo kênh'}
                                                          description={'Phân bổ độ dài của quảng cáo theo kênh'}
                                                          colors={CUSTOM_CHART.pieChart.colorDuration}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                />
                                                <PieChart data={!dashboard.isLoading.grpPieChannelData ? transformPieChartData(dashboard.grpPieChannelData?.data, dashboard.grpPieChannelData?.colnames) : 'isLoading'}
                                                          height={CUSTOM_CHART.pieChart.height}
                                                          fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                          fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                          nameChart={'Phân bổ GRP quảng cáo theo kênh'}
                                                          description={'Phân bổ GRP quảng cáo theo kênh'}
                                                          colors={CUSTOM_CHART.pieChart.colorChannel}
                                                          donut={CUSTOM_CHART.pieChart.donut}
                                                          innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                          formatterValue={2}
                                                />
                                            </div>
                                        )}
                                        ]} />
                                    </div>
                                    <div className='w-full pb-6 max-md:pb-4'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                          <NameChart nameChart={'Top 20 nhà quảng cáo'} description={'Top 20 nhà quảng cáo'} opacity={true} />
                                          <ChildTabs tabs={[
                                          {id: 'vnd', label: 'VND',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarAdvertiserData ? transformBarChartData(dashboard.spendVNDBarAdvertiserData?.data, dashboard.spendVNDBarAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 35}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 204, 0, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  suffix='tr'
                                                  overflow={true}
                                              />
                                          )},
                                          {id: 'usd', label: 'USD',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendUSDBarAdvertiserData ? transformBarChartData(dashboard.spendUSDBarAdvertiserData?.data, dashboard.spendUSDBarAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 35}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 204, 0, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  suffix={'$'}
                                                  overflow={true}
                                              />
                                          )},
                                          {id: 'spot', label: 'SPOT',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.countBarAdvertiserData ? transformBarChartData(dashboard.countBarAdvertiserData?.data, dashboard.countBarAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 35}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 204, 0, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  overflow={true}
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6 max-md:pb-4'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                          <NameChart nameChart={'Top 20 nhà quảng cáo - phân bổ theo kênh'} description={'Top 20 nhà quảng cáo - phân bổ theo kênh'} opacity={true} />
                                          <ChildTabs tabs={[
                                          {id: 'vnd', label: 'VND',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarAdvertiserChannelData ? transformBarChartData(dashboard.spendVNDBarAdvertiserChannelData?.data, dashboard.spendVNDBarAdvertiserChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 50}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  description={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  suffix='tr'
                                                  overflow={true}
                                              />
                                          )},
                                          {id: 'usd', label: 'USD',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendUSDBarAdvertiserChannelData ? transformBarChartData(dashboard.spendUSDBarAdvertiserChannelData?.data, dashboard.spendUSDBarAdvertiserChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 50}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  description={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  suffix={'$'}
                                                  overflow={true}
                                              />
                                          )},
                                          {id: 'spot', label: 'SPOT',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.countBarAdvertiserChannelData ? transformBarChartData(dashboard.countBarAdvertiserChannelData?.data, dashboard.countBarAdvertiserChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 50}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  description={'Top 20 nhà quảng cáo - phân bổ theo kênh'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  overflow={true}
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6 max-md:pb-4'>
                                        <ChildTabs tabs={[
                                        {id: 'brand', label: 'Top 10 nhãn',
                                        content: (
                                          <TableChart data={!dashboard.isLoading.top10BrandData ? transformTableChartData(dashboard.top10BrandData?.data, dashboard.top10BrandData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'Top 10 nhãn'}
                                                description={'Top 10 nhãn'}
                                                showSTT={false}
                                                showPagination={false}
                                                customCol={{'Nhãn': {minSize: 100, maxSize: 170, weight: 600, sticky: true}, 'Chi phí (VND)': {suffix: 'tr'}, 'Chi phí (USD)': {suffix: '$'}}} />
                                        )},
                                        {id: 'product', label: 'Top 10 dòng sản phẩm',
                                        content: (
                                          <TableChart data={!dashboard.isLoading.top10ProductData ? transformTableChartData(dashboard.top10ProductData?.data, dashboard.top10ProductData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'Top 10 dòng sản phẩm'}
                                                description={'Top 10 dòng sản phẩm'}
                                                showSTT={false}
                                                showPagination={false}
                                                customCol={{'Sản phẩm': {minSize: 100, maxSize: 170, weight: 600, sticky: true}, 'Chi phí (VND)': {suffix: 'tr'}, 'Chi phí (USD)': {suffix: '$'}}} />
                                        )},
                                        {id: 'campaign', label: 'Top 10 Chiến dịch',
                                        content: (
                                          <TableChart data={!dashboard.isLoading.top10CampaignData ? transformTableChartData(dashboard.top10CampaignData?.data, dashboard.top10CampaignData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                            height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                            fontSize={CUSTOM_CHART.tableChart.fontSize}
                                            fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                            fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                            nameChart={'Top 10 chiến dịch'}
                                            description={'Top 10 chiến dịch'}
                                            showSTT={false}
                                            showPagination={false}
                                            customCol={{'Chiến dịch': {minSize: 100, maxSize: 170, weight: 600, sticky: true}, 'Chi phí (VND)': {suffix: 'tr'}, 'Chi phí (USD)': {suffix: '$'}}} />
                                        )}
                                        ]} />
                                    </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          {id: 'revenue', label: 'Doanh thu', icon: !stateGlobals.darkMode ? iconChannel : iconChannelDark, iconActive: iconChannelActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_revenue">
                                <InforTab inforTab={"Doanh thu"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4'>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                    <BarChart 
                                        data={!dashboard.isLoading.spendVNDBarTimebandData ? transformBarChartData(dashboard.spendVNDBarTimebandData?.data, dashboard.spendVNDBarTimebandData?.colnames) : 'isLoading'}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={CUSTOM_CHART.barChart.fontSize}
                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                        colors={['rgba(255, 204, 0, 1)']}
                                        fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                        nameChart={'Xu hướng quảng cáo theo khung giờ'}
                                        description={'Xu hướng quảng cáo theo khung giờ'}
                                        orientation={''}
                                        suffix='tr'
                                        maxVisibleItems={true}
                                    />
                                  </div>
                                  <div className='w-full grid grid-cols-10 gap-6 max-md:gap-4 pb-6 max-md:pb-4'>
                                    <div className='col-span-6 max-md:col-span-10'>
                                      <TableChart data={!dashboard.isLoading.adcodeProgramData ? transformTableChartData(dashboard.adcodeProgramData?.data, dashboard.adcodeProgramData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={'Chi phí quảng cáo theo Adcode'}
                                                  description={'Chi phí quảng cáo theo Adcode'}
                                                  showSTT={false}
                                                  showPagination={false}
                                                  customCol={{'Adcode': {weight: 600}, 'CHƯƠNG TRÌNH': {minSize: 100, maxSize: 170}, 'KÊNH': {minSize: 0, maxSize: 10},
                                                              'Chi phí (VND)': {suffix: 'tr'}}} />
                                    </div>
                                    <div className='col-span-4 max-md:col-span-10'>
                                      <TableChart data={!dashboard.isLoading.adcodeProductData ? transformTableChartData(dashboard.adcodeProductData?.data, dashboard.adcodeProductData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={'Chi phí quảng cáo theo dòng sản phẩm'}
                                                  description={'Chi phí quảng cáo theo dòng sản phẩm'}
                                                  showSTT={false}
                                                  showPagination={false}
                                                  customCol={{'Sản phẩm': {weight: 600}, 'Chi phí (VND)': {suffix: 'tr'}}} />
                                    </div>
                                  </div>
                                  <div className='w-full grid grid-cols-10 gap-6 max-md:gap-4 pb-6 max-md:pb-4'>
                                    <div className='col-span-6 max-md:col-span-10'>
                                      <PivotTableChart
                                        data={!dashboard.isLoading.spendVNDPivotChannelFirstLevelData ? dashboard.spendVNDPivotChannelFirstLevelData?.data : 'isLoading'}
                                        nameChart="Doanh thu quảng cáo theo kênh"
                                        description="Doanh thu quảng cáo theo kênh"
                                        rowField="channel_name_tvd"
                                        columnField="firstlevel_vn"
                                        valueField="price"
                                        aggType="sum"
                                        height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                        suffix='tr'
                                      />
                                    </div>
                                    <div className='col-span-4 max-md:col-span-10 grid'>
                                      <PieChart data={!dashboard.isLoading.countPieTimebandData ? transformPieChartData(dashboard.countPieTimebandData?.data, dashboard.countPieTimebandData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.pieChart.height}
                                                fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                nameChart={'Xu hướng quảng cáo theo khung giờ'}
                                                description={'Xu hướng quảng cáo theo khung giờ'}
                                                colors={{
                                                "1.Sáng (00h - 11h)": "rgba(217, 31, 38, 1)",
                                                "2.Trưa (11h - 14h)": "rgba(86, 154, 255, 1)",
                                                "3.Chiều (14h - 18h)": "rgba(128, 212, 27, 1)",
                                                "4.Tối (18h - 24h)": "rgba(2, 147, 113, 1)"
                                                }}
                                                donut={CUSTOM_CHART.pieChart.donut}
                                                innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                legendHorizontal={true}
                                      />
                                    </div>
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                    <BarChart 
                                        data={!dashboard.isLoading.spendVNDBarProgramData ? transformBarChartData(dashboard.spendVNDBarProgramData?.data, dashboard.spendVNDBarProgramData?.colnames) : 'isLoading'}
                                        height={CUSTOM_CHART.barChart.height + 35}
                                        fontSize={CUSTOM_CHART.barChart.fontSize}
                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                        colors={['rgba(255, 204, 0, 1)']}
                                        fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                        nameChart={'Top 20 chương trình có doanh thu cao nhất'}
                                        description={'Top 20 chương trình có doanh thu cao nhất'}
                                        orientation={'horizontal'}
                                        suffix='tr'
                                        overflow={true}
                                    />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                    <BarChart 
                                      data={!dashboard.isLoading.spendVNDBarChannelData ? transformBarChartData(dashboard.spendVNDBarChannelData?.data, dashboard.spendVNDBarChannelData?.colnames) : 'isLoading'}
                                      height={CUSTOM_CHART.barChart.height}
                                      fontSize={CUSTOM_CHART.barChart.fontSize}
                                      fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                      colors={['rgba(255, 204, 0, 1)']}
                                      fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                      nameChart={'Chi phí quảng cáo theo kênh'}
                                      description={'Chi phí quảng cáo theo kênh'}
                                      orientation={''}
                                      suffix='tr'
                                  />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                    <PivotTableChart
                                        data={!dashboard.isLoading.spendVNDPivotChannelTimebandData ? dashboard.spendVNDPivotChannelTimebandData?.data : 'isLoading'}
                                        nameChart="Xu hướng quảng cáo theo khung giờ"
                                        description="Xu hướng quảng cáo theo khung giờ"
                                        rowField="channel_name_tvd"
                                        columnField="time_band"
                                        valueField="price"
                                        aggType="sum"
                                        height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                        suffix='tr'
                                      />
                                  </div>
                                  <div className='w-full'>
                                    <TableChart data={!dashboard.isLoading.spendVNDTableAdvertiserData ? transformTableChartData(dashboard.spendVNDTableAdvertiserData?.data, dashboard.spendVNDTableAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={'Chi phí quảng cáo theo nhà quảng cáo'}
                                                  description={'Chi phí quảng cáo theo nhà quảng cáo'}
                                                  showSTT={false}
                                                  showPagination={false}
                                                  customCol={{'Nhà quảng cáo': {weight: 600}, 'Chi phí (VND)': {suffix: 'tr'}}} />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          {id: 'effective', label: 'Hiệu quả', icon: !stateGlobals.darkMode ? iconProgram : iconProgramDark, iconActive: iconProgramActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_effective">
                                <InforTab inforTab={"Hiệu quả"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  <div className='w-full py-6 max-md:py-4'>
                                      <ChildTabs tabs={[
                                      {id: 'grp', label: 'GRP',
                                      content: (
                                        <PivotTableChart
                                          data={!dashboard.isLoading.grpPivotCampaignWeekData ? dashboard.grpPivotCampaignWeekData?.data : 'isLoading'}
                                          nameChart={'Campaign Detail GRP (%) by Week'}
                                          description={'Campaign Detail GRP (%) by Week'}
                                          rowField="campaign_name"
                                          columnField="week"
                                          valueField="grp"
                                          aggType="sum"
                                          height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                          fontSize={CUSTOM_CHART.tableChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                          formatterValue={2}
                                        />
                                      )},
                                      {id: 'spot', label: 'SPOT',
                                      content: (
                                        <PivotTableChart
                                          data={!dashboard.isLoading.countPivotCampaignWeekData ? dashboard.countPivotCampaignWeekData?.data : 'isLoading'}
                                          nameChart={'Campaign Detail number of Spot by Week'}
                                          description={'Campaign Detail number of Spot by Week'}
                                          rowField="campaign_name"
                                          columnField="week"
                                          valueField="count"
                                          aggType="sum"
                                          height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                          fontSize={CUSTOM_CHART.tableChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                        />
                                      )},
                                      {id: 'reach', label: 'REACH',
                                      content: (
                                        <PivotTableChart
                                          data={!dashboard.isLoading.reachPivotCampaignWeekData ? dashboard.reachPivotCampaignWeekData?.data : 'isLoading'}
                                          nameChart={'Campaign Detail Reach by Week'}
                                          description={'Campaign Detail Reach by Week'}
                                          rowField="campaign_name"
                                          columnField="week"
                                          valueField="reach"
                                          aggType="sum"
                                          height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                          fontSize={CUSTOM_CHART.tableChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                        />
                                      )}
                                      ]} />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4 flex max-md:flex-wrap gap-6 max-md:gap-4'>
                                    <div className='w-[60%] max-md:w-full'>
                                      <BarChart 
                                        data={!dashboard.isLoading.grpBarRegionalBrandData ? transformBarChartData(dashboard.grpBarRegionalBrandData?.data, dashboard.grpBarRegionalBrandData?.colnames) : 'isLoading'}
                                        height={CUSTOM_CHART.barChart.height}
                                        fontSize={CUSTOM_CHART.barChart.fontSize}
                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                        fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                        nameChart={'Competitor Review by Market (GRP)'}
                                        description={'Competitor Review by Market (GRP)'}
                                        orientation={''}
                                    />
                                    </div>
                                    <div className='w-[40%] max-md:w-full'>
                                      <BarChart 
                                          data={!dashboard.isLoading.grpBarWeekBrandData ? transformBarChartData(dashboard.grpBarWeekBrandData?.data, dashboard.grpBarWeekBrandData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Competitor Review by Week (GRP)'}
                                          description={'Competitor Review by Week (GRP)'}
                                          orientation={''}
                                      />
                                    </div>
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                      <ChildTabs tabs={[
                                      {id: 'spend', label: 'AD SPEND',
                                      content: (
                                          <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarBrandChannelData ? transformBarChartData(dashboard.spendVNDBarBrandChannelData?.data, dashboard.spendVNDBarBrandChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Channel'}
                                                  description={'Competitor Review by Channel'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                                  suffix='tr'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarBrandTimebandData ? transformBarChartData(dashboard.spendVNDBarBrandTimebandData?.data, dashboard.spendVNDBarBrandTimebandData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorDuration}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Timeband'}
                                                  description={'Competitor Review by Timeband'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                                  suffix='tr'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendVNDBarBrandFirstLevelData ? transformBarChartData(dashboard.spendVNDBarBrandFirstLevelData?.data, dashboard.spendVNDBarBrandFirstLevelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorFirstLevel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Genre'}
                                                  description={'Competitor Review by Genre'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                                  suffix='tr'
                                              />
                                              <PieChart data={!dashboard.isLoading.spendVNDPieAdvertiserData ? transformPieChartData(dashboard.spendVNDPieAdvertiserData?.data, dashboard.spendVNDPieAdvertiserData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Advertisers' Share"}
                                                        description={"Advertisers' Share"}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                                        suffix='tr'
                                              />
                                          </div>
                                      )},
                                      {id: 'grp', label: 'GRP',
                                      content: (
                                          <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                              <BarChart 
                                                  data={!dashboard.isLoading.grpBarBrandChannelData ? transformBarChartData(dashboard.grpBarBrandChannelData?.data, dashboard.grpBarBrandChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Channel'}
                                                  description={'Competitor Review by Channel'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.grpBarBrandTimebandData ? transformBarChartData(dashboard.grpBarBrandTimebandData?.data, dashboard.grpBarBrandTimebandData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorDuration}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Timeband'}
                                                  description={'Competitor Review by Timeband'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.grpBarBrandFirstLevelData ? transformBarChartData(dashboard.grpBarBrandFirstLevelData?.data, dashboard.grpBarBrandFirstLevelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorFirstLevel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Genre'}
                                                  description={'Competitor Review by Genre'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <PieChart data={!dashboard.isLoading.grpPieAdvertiserData ? transformPieChartData(dashboard.grpPieAdvertiserData?.data, dashboard.grpPieAdvertiserData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Advertisers' Share"}
                                                        description={"Advertisers' Share"}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                              />
                                          </div>
                                      )},
                                      {id: 'reach', label: 'REACH',
                                      content: (
                                          <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4'>
                                              <BarChart 
                                                  data={!dashboard.isLoading.reachBarBrandChannelData ? transformBarChartData(dashboard.reachBarBrandChannelData?.data, dashboard.reachBarBrandChannelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorChannel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Channel'}
                                                  description={'Competitor Review by Channel'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.reachBarBrandTimebandData ? transformBarChartData(dashboard.reachBarBrandTimebandData?.data, dashboard.reachBarBrandTimebandData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorDuration}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Timeband'}
                                                  description={'Competitor Review by Timeband'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <BarChart 
                                                  data={!dashboard.isLoading.reachBarBrandFirstLevelData ? transformBarChartData(dashboard.reachBarBrandFirstLevelData?.data, dashboard.reachBarBrandFirstLevelData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={CUSTOM_CHART.barChart.colorFirstLevel}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Competitor Review by Genre'}
                                                  description={'Competitor Review by Genre'}
                                                  orientation={'horizontal'}
                                                  colorZoom='red'
                                              />
                                              <PieChart data={!dashboard.isLoading.reachPieAdvertiserData ? transformPieChartData(dashboard.reachPieAdvertiserData?.data, dashboard.reachPieAdvertiserData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Advertisers' Share"}
                                                        description={"Advertisers' Share"}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                              />
                                          </div>
                                      )}
                                      ]} />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                      <TableChart data={!dashboard.isLoading.allTableBrandData ? transformTableChartData(dashboard.allTableBrandData?.data, dashboard.allTableBrandData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'Hiệu quả quảng cáo theo nhãn'}
                                                description={'Hiệu quả quảng cáo theo nhãn'}
                                                showSTT={false}
                                                showPagination={false}
                                                customCol={{'Nhãn': {weight: 600, minSize: 100, maxSize: 170, sticky: true}}} />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                      <TableChart data={!dashboard.isLoading.allTableBrandProgramData ? transformTableChartData(dashboard.allTableBrandProgramData?.data, dashboard.allTableBrandProgramData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'Hiệu quả quảng cáo của nhãn theo chương trình'}
                                                description={'Hiệu quả quảng cáo của nhãn theo chương trình'}
                                                showSTT={false}
                                                showPagination={false}
                                                customCol={{'Nhãn': {weight: 600, minSize: 100, maxSize: 170, sticky: true}, 'CHƯƠNG TRÌNH': {minSize: 100, maxSize: 170}, 'Chi phí (VND)': {suffix: 'tr'}}} />
                                  </div>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                      <TableChart data={!dashboard.isLoading.allTableDeviceData ? transformTableChartData(dashboard.allTableDeviceData?.data, dashboard.allTableDeviceData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'Active Device Summary'}
                                                description={'Active Device Summary'}
                                                showSTT={false}
                                                customCol={{'Ngày': {sticky: true}}} />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          },
                          {id: 'ad_monitoring_report', label: !stateGlobals.screen_md ? 'Ad monitoring report' : 'Ad monitoring', icon: !stateGlobals.darkMode ? iconRatingByMinute : iconRatingByMinuteDark, iconActive: iconRatingByMinuteActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_ad_monitoring_report">
                                <InforTab inforTab={"Rating theo phút - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  <div className='w-full pb-6 max-md:pb-4'>
                                    <TableChart data={!dashboard.isLoading.allTableMonitoringData ? transformTableChartData(dashboard.allTableMonitoringData?.data, dashboard.allTableMonitoringData?.colnames) : 'isLoading'}
                                                height={'600px'}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'MONITORING REPORT'}
                                                description={'MONITORING REPORT'}
                                                showPagination={true}
                                                fullScreen={true}
                                                customCol={{
                                                  'Tuần': {align: 'text-center', justify: 'justify-center'},
                                                  'CHƯƠNG TRÌNH': {minSize: 200, maxSize: 300, overflow: true, justify: 'justify-center', align: 'text-center', weight: 600},
                                                  'Thời lượng Spot': {align: 'text-center', justify: 'justify-center'},
                                                  'Break': {align: 'text-center', justify: 'justify-center'},
                                                  'Position': {align: 'text-center', justify: 'justify-center'},
                                                  'Chi phí (VND)': {align: 'text-center', justify: 'justify-center', suffix: 'tr'},
                                                  'Reach': {align: 'text-center', justify: 'justify-center'},
                                                  'Chiến dịch': {minSize: 220, maxSize: 320, overflow: true},
                                                  'Loại Spot': {minSize: 120, maxSize: 150, overflow: true},
                                                  'Ngành hàng': {minSize: 120, maxSize: 190, overflow: true},
                                                  'Sản phẩm': {minSize: 120, maxSize: 190, overflow: true},
                                                  'Nhãn hàng': {minSize: 180, maxSize: 240, overflow: true},
                                                  'Nhà quảng cáo': {minSize: 180, maxSize: 240, overflow: true},
                                                }} />
                                  </div>
                                </div>
                                <div className='px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 max-md:pb-19 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                                  <Footer color='text-color-black-100 dark:text-color-white-90' />
                                </div>
                              </section>
                            )
                          }
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