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

const DashboardContent = () => {
  const dashboard = useDashboardData();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  const scopeFilterData = {
    filterProvince: dashboard.isLoading.filterProvinceData ? [{'Loading': 'Loading'}] : dashboard.filterProvinceData?.data
  }
  
  return (
    <main className='font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip'>
      <Header />
      <div className='flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300'>
        <Filter filters={scopeFilterData} />
        <div className={`pb-6 max-lg:pb-5 max-md:pb-4 ${stateGlobals.isOpen && !stateGlobals.horizontal ? 'w-[84%] max-md:w-full' : 'w-full'} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}>
          <BreadCrumb/>
          <div className='bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
            <ParentTabs uniqueId='dashboard'
                        defaultTab='overview'
                        tabs={[
                          {id: 'overview', label: 'Tổng quan', icon: !stateGlobals.darkMode ? iconOverview : iconOverviewDark, iconActive: iconOverviewActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_overview">
                                <InforTab inforTab={"Tổng quan"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4'>
                                    <div className='w-full grid grid-cols-5 gap-6 pb-6'>
                                      <div className='col-span-2'>
                                        <NumberWithTrendChart nameChart={'Chi phí (VND)'} description={'Chi phí (VND)'} data={!dashboard.isLoading.spendVNDNumberData ? transformNumberWithTrendData(dashboard.spendVNDNumberData?.data, dashboard.spendVNDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRICS.rating.icon} suffix='tr VND' />
                                      </div>
                                      <div className='col-span-2'>
                                        <NumberWithTrendChart nameChart={'Chi phí (USD)'} description={'Chi phí (USD)'} data={!dashboard.isLoading.spendUSDNumberData ? transformNumberWithTrendData(dashboard.spendUSDNumberData?.data, dashboard.spendUSDNumberData?.colnames) : 'isLoading'} fontFamily={CUSTOM_CHART.allChart.fontFamily} fontSize={CUSTOM_CHART.numberWithTrendChart.fontSize} fontWeight={CUSTOM_CHART.numberWithTrendChart.fontWeight} icon={METRICS.rating.icon} suffix='$' />
                                      </div>
                                        <div className='col-span-1 grid grid-cols-1 gap-6'>
                                            <NumberCard
                                                title={'Số lượng Spot'}
                                                description={'Số lượng Spot'}
                                                value={!dashboard.isLoading.countNumberData ? formatNumber(dashboard.countNumberData?.data[0].count, { isPercent: false }) : 'isLoading'}
                                                icon={METRICS.ave_reach.icon}
                                                background={METRICS.ave_reach.background}
                                                widthIcon={METRICS.ave_reach.widthIcon}
                                            />
                                            <NumberCard
                                                title={'Thời lượng Spot'}
                                                description={'Thời lượng Spot'}
                                                value={!dashboard.isLoading.durationNumberData ? formatNumber(dashboard.durationNumberData?.data[0].total_duration, { isPercent: false }) : 'isLoading'}
                                                icon={METRICS.ave_reach.icon}
                                                background={METRICS.ave_reach.background}
                                                widthIcon={METRICS.ave_reach.widthIcon}
                                                suffix='phút'
                                            />
                                        </div>
                                    </div>
                                    <div className='w-full pb-6'>
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
                                                  colors={['rgba(255, 56, 60, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Xu hướng quảng cáo THEO NGÀY'}
                                                  description={'Xu hướng quảng cáo THEO NGÀY'}
                                                  orientation={''}
                                                  displayName={false}
                                                  colorZoom='red'
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
                                                  colors={['rgba(255, 56, 60, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Xu hướng quảng cáo THEO NGÀY'}
                                                  description={'Xu hướng quảng cáo THEO NGÀY'}
                                                  orientation={''}
                                                  displayName={false}
                                                  colorZoom='red'
                                                  suffix={'$'}
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6'>
                                        <ChildTabs tabs={[
                                        {id: 'spend', label: 'Share of spend',
                                        content: (
                                            <div className='grid grid-cols-2 gap-6'>
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
                                            <div className='grid grid-cols-2 gap-6'>
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
                                            <div className='grid grid-cols-2 gap-6'>
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
                                                />
                                            </div>
                                        )},
                                        {id: 'length_voice', label: 'Share of spot lengths/voice',
                                        content: (
                                            <div className='grid grid-cols-2 gap-6'>
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
                                    <div className='w-full pb-6'>
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
                                                  colors={['rgba(255, 56, 60, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='red'
                                                  suffix='tr'
                                              />
                                          )},
                                          {id: 'usd', label: 'USD',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.spendUSDBarAdvertiserData ? transformBarChartData(dashboard.spendUSDBarAdvertiserData?.data, dashboard.spendUSDBarAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 35}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 56, 60, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='red'
                                                  suffix={'$'}
                                              />
                                          )},
                                          {id: 'spot', label: 'SPOT',
                                          content: (
                                              <BarChart 
                                                  data={!dashboard.isLoading.countBarAdvertiserData ? transformBarChartData(dashboard.countBarAdvertiserData?.data, dashboard.countBarAdvertiserData?.colnames) : 'isLoading'}
                                                  height={CUSTOM_CHART.barChart.height + 35}
                                                  fontSize={CUSTOM_CHART.barChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  colors={['rgba(255, 56, 60, 1)']}
                                                  fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='red'
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6'>
                                      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                          <NameChart nameChart={'Top 20 nhà quảng cáo'} description={'Top 20 nhà quảng cáo'} opacity={true} />
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
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='yellow'
                                                  suffix='tr'
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
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='yellow'
                                                  suffix={'$'}
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
                                                  nameChart={'Top 20 nhà quảng cáo'}
                                                  description={'Top 20 nhà quảng cáo'}
                                                  orientation={'horizontal'}
                                                  displayName={false}
                                                  colorZoom='yellow'
                                              />
                                          )}
                                          ]} />
                                      </div>
                                    </div>
                                    <div className='w-full pb-6'>
                                        <ChildTabs tabs={[
                                        {id: 'brand', label: 'Top 10 nhãn',
                                        content: (
                                          <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                            <NameChart nameChart={'Top 10 dòng sản phẩm'} description={'Top 10 dòng sản phẩm'} opacity={true} />
                                            <TableChart data={!dashboard.isLoading.top10BrandData ? transformTableChartData(dashboard.top10BrandData?.data, dashboard.top10BrandData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={'Top 10 nhãn'}
                                                  description={'Top 10 nhãn'}
                                                  showSTT={false}
                                                  showPagination={false}
                                                  displayName={false}
                                                  center={true} />
                                          </div>
                                        )},
                                        {id: 'product', label: 'Top 10 dòng sản phẩm',
                                        content: (
                                          <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                            <NameChart nameChart={'Top 10 dòng sản phẩm'} description={'Top 10 dòng sản phẩm'} opacity={true} />
                                            <TableChart data={!dashboard.isLoading.top10ProductData ? transformTableChartData(dashboard.top10ProductData?.data, dashboard.top10ProductData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                                  height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                                  fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                  fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                  fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                  nameChart={'Top 10 dòng sản phẩm'}
                                                  description={'Top 10 dòng sản phẩm'}
                                                  showSTT={false}
                                                  showPagination={false}
                                                  displayName={false}
                                                  center={true} />
                                          </div>
                                        )},
                                        {id: 'campaign', label: 'Top 10 Chiến dịch',
                                        content: (
                                          <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                            <NameChart nameChart={'Top 10 Chiến dịch'} description={'Top 10 Chiến dịch'} opacity={true} />
                                            <TableChart data={!dashboard.isLoading.top10CampaignData ? transformTableChartData(dashboard.top10CampaignData?.data, dashboard.top10CampaignData?.colnames, null, ['percent_price', 'percent_count', 'percent_duration', 'percent_grp']) : 'isLoading'}
                                              height={CUSTOM_CHART.tableChart.tableChartChannel.height}
                                              fontSize={CUSTOM_CHART.tableChart.fontSize}
                                              fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                              fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                              nameChart={'Top 10 chiến dịch'}
                                              description={'Top 10 chiến dịch'}
                                              showSTT={false}
                                              showPagination={false}
                                              displayName={false}
                                              center={true} />
                                          </div>
                                        )}
                                        ]} />
                                    </div>
                                </div>
                              </section>
                            )
                          },
                          {id: 'revenue', label: 'Doanh thu', icon: !stateGlobals.darkMode ? iconChannel : iconChannelDark, iconActive: iconChannelActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_channel">
                                <InforTab inforTab={"Doanh thu"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4'>
                                  
                                </div>
                              </section>
                            )
                          },
                          {id: 'effective', label: 'Hiệu quả', icon: !stateGlobals.darkMode ? iconProgram : iconProgramDark, iconActive: iconProgramActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_program">
                                <InforTab inforTab={"Hiệu quả"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  
                                </div>
                              </section>
                            )
                          },
                          {id: 'Ad_monitoring_report', label: 'Ad monitoring report', icon: !stateGlobals.darkMode ? iconRatingByMinute : iconRatingByMinuteDark, iconActive: iconRatingByMinuteActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_rating_by_minute">
                                <InforTab inforTab={"Rating theo phút - P4+ toàn quốc"} />
                                <InforFilter filters={scopeFilterData} />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  
                                </div>
                              </section>
                            )
                          }
                        ]}
            />
          </div>
          <div className='px-6 max-lg:px-5 max-md:px-4 max-md:pb-15 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
            <Footer color='text-color-black-100 dark:text-color-white-90' />
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