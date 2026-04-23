import { useEffect, useState } from 'react';
import NumberCard from '../components/charts/NumberCard';
import Filter from '../components/layouts/filters/Filter';
import { METRIC_SPOTS, METRICS } from '../utils/metricInfor';
import { CUSTOM_CHART } from '../utils/customChart';
import { formatNumber } from '../utils/formatNumber';
import { transformBarChartData } from '../utils/transformApiBartChart';
import BarChart from '../components/charts/BarChart';
import { useDashboardData } from '../hooks/useDashboardDataBrand';
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
  const { user, userLoading } = useCurrentUser();

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
      <Header username={user?.username} />
      <div className='flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300'>
        <FilterSpot filters={scopeFilterData} />
        <div className={`${stateGlobals.isOpen && !stateGlobals.horizontal ? 'w-[84%] max-md:w-full' : 'w-full'} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}>
          <BreadCrumb dashboardName='BÁO CÁO CHO NHÃN HÀNG' />
          <div className='bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
            <ParentTabs uniqueId='dashboard'
                        defaultTab='overview'
                        tabs={[
                          {id: 'overview', label: 'Báo cáo cho nhãn hàng', icon: !stateGlobals.darkMode ? iconOverview : iconOverviewDark, iconActive: iconOverviewActive,
                            content: (
                              <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_overview">
                                <InforTab inforTab={"Báo cáo cho nhãn hàng"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} nameFilter='FilterSpot' />
                                <div className='px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4'>
                                    <div className='w-full grid grid-cols-3 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                        <NumberCard
                                            title={'Số lượng Campaign'}
                                            description={false}
                                            value={!dashboard.isLoading.countCampaignNumberData ? dashboard.countCampaignNumberData?.data ? formatNumber(dashboard.countCampaignNumberData?.data[0]['COUNT_DISTINCT(Campaign)'], { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRIC_SPOTS.count.icon}
                                            background={METRIC_SPOTS.count.background}
                                            widthIcon={METRIC_SPOTS.count.widthIcon}
                                        />
                                        <NumberCard
                                            title={'Số lượng Spot'}
                                            description={false}
                                            value={!dashboard.isLoading.countSpotNumberData ? dashboard.countSpotNumberData?.data ? formatNumber(dashboard.countSpotNumberData?.data[0].count, { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRIC_SPOTS.count.icon}
                                            background={METRIC_SPOTS.count.background}
                                            widthIcon={METRIC_SPOTS.count.widthIcon}
                                        />
                                        <NumberCard
                                            title={'Thời lượng Spot (Phút)'}
                                            description={false}
                                            value={!dashboard.isLoading.durationSpotNumberData ? dashboard.durationSpotNumberData?.data ? formatNumber(dashboard.durationSpotNumberData?.data[0].total_duration, { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRIC_SPOTS.duration.icon}
                                            background={METRIC_SPOTS.duration.background}
                                            widthIcon={METRIC_SPOTS.duration.widthIcon}
                                        />
                                        <NumberCard
                                            title={'Tổng chi phí (Triệu VND)'}
                                            description={false}
                                            value={!dashboard.isLoading.spendVNDNumberData ? dashboard.spendVNDNumberData?.data ? formatNumber(dashboard.spendVNDNumberData?.data[0].price, { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRIC_SPOTS.spend_vnd.icon}
                                            background={METRIC_SPOTS.spend_vnd.background}
                                            widthIcon={METRIC_SPOTS.spend_vnd.widthIcon}
                                        />
                                        <NumberCard
                                            title={'Reach'}
                                            description={false}
                                            value={!dashboard.isLoading.reachNumberData ? dashboard.reachNumberData?.data ? formatNumber(dashboard.reachNumberData?.data[0].reach, { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRICS.ave_reach.icon}
                                            background={METRICS.ave_reach.background}
                                            widthIcon={METRICS.ave_reach.widthIcon}
                                        />
                                        <NumberCard
                                            title={'Tần suất'}
                                            description={false}
                                            value={!dashboard.isLoading.frequencyNumberData ? dashboard.frequencyNumberData?.data ? formatNumber(dashboard.frequencyNumberData?.data[0]['SUM(view)/SUM(reach)'], { isPercent: false }) : '-' : 'isLoading'}
                                            icon={METRICS.rating.icon}
                                            background={METRICS.rating.background}
                                            widthIcon={METRICS.rating.widthIcon}
                                        />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                        <TableChart data={!dashboard.isLoading.allTableBrandData ? transformTableChartData(dashboard.allTableBrandData?.data, dashboard.allTableBrandData?.colnames) : 'isLoading'}
                                                    height={'450px'}
                                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                    fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                    nameChart={'Hoạt động quảng cáo theo nhãn hàng'}
                                                    description={false}
                                                    showPagination={false}
                                                    customCol={{
                                                        'Ngành hàng': {minSize: 150, maxSize: 250},
                                                        'Sản phẩm': {minSize: 200, maxSize: 300},
                                                        'Nhà quảng cáo': {minSize: 200, maxSize: 300},
                                                        'Nhãn hàng': {minSize: 150, maxSize: 250}
                                                    }} />
                                    </div>
                                    <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                        <TableChart data={!dashboard.isLoading.allTableDeviceData ? transformTableChartData(dashboard.allTableDeviceData?.data, dashboard.allTableDeviceData?.colnames) : 'isLoading'}
                                                    height={'300px'}
                                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                    fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                    nameChart={'Báo cáo hiệu quả theo tuần'}
                                                    description={false}
                                                    showPagination={false}/>
                                        <TableChart data={!dashboard.isLoading.allTablePlatformData ? transformTableChartData(dashboard.allTablePlatformData?.data, dashboard.allTablePlatformData?.colnames) : 'isLoading'}
                                                    height={'300px'}
                                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                    fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                    nameChart={'Thống kê truy cập và tỷ lệ tiếp cận theo thiết bị'}
                                                    description={false}
                                                    showPagination={false} />                                    
                                    </div>
                                    <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <PieChart data={!dashboard.isLoading.viewPiePlatformData ? transformPieChartData(dashboard.viewPiePlatformData?.data, dashboard.viewPiePlatformData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.pieChart.height}
                                                fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                nameChart={"Tỉ lệ người xem theo thiết bị"}
                                                description={false}
                                                donut={CUSTOM_CHART.pieChart.donut}
                                                innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                border={false}
                                                center={true} />
                                      <BarChart data={!dashboard.isLoading.percentPlatformViewData ? transformBarChartData(dashboard.percentPlatformViewData?.data, dashboard.percentPlatformViewData?.colnames) : 'isLoading'}
                                                height={CUSTOM_CHART.barChart.height}
                                                fontSize={CUSTOM_CHART.barChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                nameChart={'Tỉ lệ xem hết quảng cáo'}
                                                description={false}
                                                orientation={''}
                                                showPercent={true} />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                        <TableChart data={!dashboard.isLoading.allTableTopProgramData ? transformTableChartData(dashboard.allTableTopProgramData?.data, dashboard.allTableTopProgramData?.colnames) : 'isLoading'}
                                                    height={'400px'}
                                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                    fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                    nameChart={'Top Chương trình quảng cáo nhiều nhất'}
                                                    description={false}
                                                    showPagination={false}
                                                    customCol={{
                                                        'Nhãn hàng': {minSize: 120, maxSize: 350},
                                                        'CHƯƠNG TRÌNH': {minSize: 120, maxSize: 250},
                                                        'KÊNH': {minSize: 0, maxSize: 20}
                                                    }} />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                        <TableChart data={!dashboard.isLoading.adcodeProgramData ? transformTableChartData(dashboard.adcodeProgramData?.data, dashboard.adcodeProgramData?.colnames) : 'isLoading'}
                                                    height={'400px'}
                                                    fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                    fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                    fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                    nameChart={'Chi phí quảng cáo theo Mã giờ'}
                                                    description={false}
                                                    showPagination={false}
                                                    customCol={{
                                                        'CHƯƠNG TRÌNH': {minSize: 120, maxSize: 150},
                                                        'Khung giờ': {minSize: 40, maxSize: 150},
                                                        'Adcode': {minSize: 40, maxSize: 150},
                                                    }} />
                                    </div>
                                    <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <PieChart data={!dashboard.isLoading.sosPieBrandGroupData ? transformPieChartData(dashboard.sosPieBrandGroupData?.data, dashboard.sosPieBrandGroupData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Tỷ trọng chi tiêu trong ngành hàng"}
                                                        description={false}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                      />
                                      <PieChart data={!dashboard.isLoading.sosPieBrandProductData ? transformPieChartData(dashboard.sosPieBrandProductData?.data, dashboard.sosPieBrandProductData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Tỷ trọng chi tiêu trong dòng sản phẩm"}
                                                        description={false}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                      />
                                      <PieChart data={!dashboard.isLoading.sovPieBrandGroupData ? transformPieChartData(dashboard.sovPieBrandGroupData?.data, dashboard.sovPieBrandGroupData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Tỷ trọng hiện diện trong ngành hàng"}
                                                        description={false}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                      />
                                      <PieChart data={!dashboard.isLoading.sovPieBrandProductData ? transformPieChartData(dashboard.sovPieBrandProductData?.data, dashboard.sovPieBrandProductData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.pieChart.height}
                                                        fontSize={CUSTOM_CHART.pieChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.pieChart.fontWeight}
                                                        nameChart={"Tỷ trọng hiện diện trong dòng sản phẩm"}
                                                        description={false}
                                                        donut={CUSTOM_CHART.pieChart.donut}
                                                        innerRadius={CUSTOM_CHART.pieChart.innerRadius}
                                                        border={false}
                                      />
                                    </div>
                                    <div className='w-full grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <BarChart 
                                          data={!dashboard.isLoading.spendVNDBarChannelData ? transformBarChartData(dashboard.spendVNDBarChannelData?.data, dashboard.spendVNDBarChannelData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={CUSTOM_CHART.barChart.colorChannel}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Phân bổ chi phí theo kênh (Triệu VND)'}
                                          description={false}
                                          orientation={'horizontal'}
                                          colorZoom='red'
                                      />
                                      <BarChart 
                                          data={!dashboard.isLoading.spendVNDBarFirstLevelData ? transformBarChartData(dashboard.spendVNDBarFirstLevelData?.data, dashboard.spendVNDBarFirstLevelData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={CUSTOM_CHART.barChart.colorFirstLevel}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Phân bổ chi phí theo thể loại (Triệu VND)'}
                                          description={false}
                                          orientation={'horizontal'}
                                          colorZoom='red'
                                      />
                                      <BarChart 
                                          data={!dashboard.isLoading.reachBarChannelData ? transformBarChartData(dashboard.reachBarChannelData?.data, dashboard.reachBarChannelData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={CUSTOM_CHART.barChart.colorChannel}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Phân bổ Reach theo kênh'}
                                          description={false}
                                          orientation={'horizontal'}
                                          colorZoom='red'
                                      />
                                      <BarChart 
                                          data={!dashboard.isLoading.reachBarFirstLevelData ? transformBarChartData(dashboard.reachBarFirstLevelData?.data, dashboard.reachBarFirstLevelData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={CUSTOM_CHART.barChart.colorFirstLevel}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Phân bổ Reach theo thể loại'}
                                          description={false}
                                          orientation={'horizontal'}
                                          colorZoom='red'
                                      />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <BarChart 
                                          data={!dashboard.isLoading.spendVNDBarDateData ? transformBarChartData(dashboard.spendVNDBarDateData?.data, dashboard.spendVNDBarDateData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={['rgba(255, 204, 0, 1)']}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Xu hướng quảng cáo THEO NGÀY (Triệu VND)'}
                                          description={false}
                                          orientation={''}
                                      />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <BarChart 
                                          data={!dashboard.isLoading.spendVNDBarTimebandData ? transformBarChartData(dashboard.spendVNDBarTimebandData?.data, dashboard.spendVNDBarTimebandData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          colors={['rgba(255, 204, 0, 1)']}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'Xu hướng quảng cáo theo khung giờ (Triệu VND)'}
                                          description={false}
                                          orientation={''}
                                          maxVisibleItems={true} />
                                    </div>
                                    <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                      <BarChart 
                                          data={!dashboard.isLoading.grpBarBrandData ? transformBarChartData(dashboard.grpBarBrandData?.data, dashboard.grpBarBrandData?.colnames) : 'isLoading'}
                                          height={CUSTOM_CHART.barChart.height}
                                          fontSize={CUSTOM_CHART.barChart.fontSize}
                                          fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                          fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                          nameChart={'GRP (%) theo thị trường'}
                                          description={false}
                                          orientation={''}
                                          formatterValue={2}
                                      />
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
                                <InforTab inforTab={"Ad monitoring report"} />
                                <InforFilter filters={scopeFilterData} FilterComponent={FilterSpot} nameFilter='FilterSpot' />
                                <div className='px-6 max-lg:px-5 max-md:px-4'>
                                  <div className='w-full py-6 max-lg:py-5 max-md:py-4'>
                                    <TableChart data={!dashboard.isLoading.allTableMonitoringData ? transformTableChartData(dashboard.allTableMonitoringData?.data, dashboard.allTableMonitoringData?.colnames) : 'isLoading'}
                                                height={'600px'}
                                                fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                nameChart={'MONITORING REPORT'}
                                                description={false}
                                                showPagination={true}
                                                fullScreen={true}
                                                customCol={{
                                                  'Tuần': {align: 'text-center', justify: 'justify-center'},
                                                  'CHƯƠNG TRÌNH': {minSize: 200, maxSize: 300, overflow: true, justify: 'justify-center', align: 'text-center', weight: 600},
                                                  'Thời lượng Spot': {align: 'text-center', justify: 'justify-center'},
                                                  'Break': {align: 'text-center', justify: 'justify-center'},
                                                  'Position': {align: 'text-center', justify: 'justify-center'},
                                                  'Chi phí (Triệu VND)': {align: 'text-center', justify: 'justify-center'},
                                                  'Reach': {align: 'text-center', justify: 'justify-center'},
                                                  'Chiến dịch': {minSize: 220, maxSize: 320, overflow: true},
                                                  'Loại Spot': {minSize: 120, maxSize: 150, overflow: true},
                                                  'Ngành hàng': {minSize: 120, maxSize: 190, overflow: true},
                                                  'Sản phẩm': {minSize: 120, maxSize: 190, overflow: true},
                                                  'Nhãn hàng': {minSize: 180, maxSize: 240, overflow: true},
                                                  'Nhà quảng cáo': {minSize: 180, maxSize: 240, overflow: true}
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
                        countTab='max-md:grid-cols-2'
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