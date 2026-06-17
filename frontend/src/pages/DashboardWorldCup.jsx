import { useEffect, useState } from 'react';
import NumberCard from '../components/charts/NumberCard';
import Filter from '../components/layouts/filters/Filter';
import { METRIC_SPOTS } from '../utils/metricInfor';
import { METRICS } from '../utils/metricInfor';
import { CUSTOM_CHART } from '../utils/customChart';
import { formatNumber } from '../utils/formatNumber';
import { transformBarChartData } from '../utils/transformApiBartChart';
import BarChart from '../components/charts/BarChart';
import { useDashboardData } from '../hooks/useDashboardDataWorldCup';
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
import iconWorldCup from '../assets/icon_world_cup.png';
import iconChannel from '../assets/icon_channel.png';
import iconProgram from '../assets/icon_program.png';
import iconRatingByMinute from '../assets/icon_rating_by_minute.png';
import iconWorldCupDark from '../assets/icon_world_cup_dark.png';
import iconChannelDark from '../assets/icon_channel_dark.png';
import iconProgramDark from '../assets/icon_program_dark.png';
import iconRatingByMinuteDark from '../assets/icon_rating_by_minute_dark.png';
import iconOverviewActive from '../assets/icon_overview_active.png';
import iconChannelActive from '../assets/icon_channel_active.png';
import iconProgramActive from '../assets/icon_program_active.png';
import iconRatingByMinuteActive from '../assets/icon_rating_by_minute_active.png';
import { useCurrentUser } from '../hooks/useCurrentUser';
import PivotTableChart from '../components/charts/PivotTableChart';
import FilterWorldCup from '../components/layouts/filters/FilterWorldCup';
import { LABEL_SPOT } from '../utils/label';
import iconBall from '../assets/icon_ball.png';
import iconBallDark from '../assets/icon_ball_dark.png';
import iconBallActive from '../assets/icon_ball_active.png';

const DashboardContent = () => {
    const dashboard = useDashboardData();
    const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
    const { user, userLoading } = useCurrentUser();

    const scopeFilterData = {
        filterProvince: dashboard.isLoading.filterProvinceData ? [{ 'Loading': 'Loading' }] : dashboard.filterProvinceData?.data,
        filterProgram: dashboard.isLoading.filterProgramData ? [{ 'Loading': 'Loading' }] : dashboard.filterProgramData?.data
    }

    return (
        <main className='font-family-be-vietnam-pro w-full h-full tracking-[0.1px] overflow-x-clip'>
            <Header username={user?.username} />
            <div className='flex w-full h-full bg-background-light dark:bg-background-dark transition-all duration-300'>
                <FilterWorldCup filters={scopeFilterData} />
                <div className={`${stateGlobals.isOpen && !stateGlobals.horizontal ? 'w-[84%] max-md:w-full' : 'w-full'} transition-all duration-300 bg-background-dashboard dark:bg-background-dashboard-dark`}>
                    <BreadCrumb dashboardName='FIFA WORLD CUP 2026' icon={!stateGlobals.darkMode ? iconWorldCup : iconWorldCupDark} widthIcon='w-12 max-lg:w-8 max-md:w-7.25' />
                    <div className='bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300'>
                        <ParentTabs uniqueId='dashboard'
                            defaultTab='overview'
                            tabs={[
                                {
                                    id: 'overview', label: 'World Cup 2026', icon: !stateGlobals.darkMode ? iconBall : iconBallDark, iconActive: iconBallActive,
                                    content: (
                                        <section className='bg-background-dashboard dark:bg-background-dashboard-dark transiton-all duration-300' id="target_capture_overview">
                                            <InforTab inforTab={"World Cup 2026"} maxInsert={dashboard?.maxInsertData?.data?.[0]?.['MAX(check_time)']} />
                                            <InforFilter filters={scopeFilterData} FilterComponent={FilterWorldCup} nameFilter='FilterWorldCup' />
                                            <div className='px-6 max-lg:px-5 max-md:px-4 pt-6 max-lg:pt-5 max-md:pt-4'>
                                                <div className='w-full grid grid-cols-3 max-lg:grid-cols-3 max-md:grid-cols-2 gap-6 max-lg:gap-5 max-md:gap-4 pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <NumberCard
                                                        title={'Số trận đấu'}
                                                        description={false}
                                                        value={!dashboard.isLoading.countMatchNumberData ? dashboard.countMatchNumberData?.data ? formatNumber(dashboard.countMatchNumberData?.data[0]["Count (DISTINCT program_name, description)"], { isPercent: false }) : '-' : 'isLoading'}
                                                        icon={METRIC_SPOTS.count.icon}
                                                        background={METRIC_SPOTS.count.background}
                                                        widthIcon={METRIC_SPOTS.count.widthIcon}
                                                    />
                                                    <NumberCard
                                                        title={'Rating (000)'}
                                                        description={false}
                                                        value={!dashboard.isLoading.ratingNumberData ? dashboard.ratingNumberData?.data ? formatNumber(dashboard.ratingNumberData?.data[0].rating, { isPercent: false }) : '-' : 'isLoading'}
                                                        icon={METRICS.rating.icon}
                                                        background={METRICS.rating.background}
                                                        widthIcon={METRICS.rating.widthIcon}
                                                    />
                                                    <NumberCard
                                                        title={'Ave.Reach (000)'}
                                                        description={false}
                                                        value={!dashboard.isLoading.aveReachNumberData ? dashboard.aveReachNumberData?.data ? formatNumber(dashboard.aveReachNumberData?.data[0].ave_reach, { isPercent: false }) : '-' : 'isLoading'}
                                                        icon={METRICS.ave_reach.icon}
                                                        background={METRICS.ave_reach.background}
                                                        widthIcon={METRICS.ave_reach.widthIcon}
                                                    />
                                                    <NumberCard
                                                        title={'Thời gian xem TB'}
                                                        description={false}
                                                        value={!dashboard.isLoading.durationNumberData ? dashboard.durationNumberData?.data ? dashboard.durationNumberData?.data[0]?.minute_user_program?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-' : 'isLoading'}
                                                        icon={METRIC_SPOTS.duration.icon}
                                                        background={METRIC_SPOTS.duration.background}
                                                        widthIcon={METRIC_SPOTS.duration.widthIcon}
                                                        suffix='phút'
                                                    />
                                                    <NumberCard
                                                        title={'Rating (%)'}
                                                        description={false}
                                                        value={!dashboard.isLoading.ratingPercentNumberData ? dashboard.ratingPercentNumberData?.data ? formatNumber(dashboard.ratingPercentNumberData?.data[0]["rating%"], { isPercent: true }) : '-' : 'isLoading'}
                                                        icon={METRICS.rating.icon}
                                                        background={METRICS.rating.background}
                                                        widthIcon={METRICS.rating.widthIcon}
                                                    />
                                                    <NumberCard
                                                        title={'Reach (%)'}
                                                        description={false}
                                                        value={!dashboard.isLoading.aveReachPercentNumberData ? dashboard.aveReachPercentNumberData?.data ? formatNumber(dashboard.aveReachPercentNumberData?.data[0]["reach%"], { isPercent: true }) : '-' : 'isLoading'}
                                                        icon={METRICS.ave_reach.icon}
                                                        background={METRICS.ave_reach.background}
                                                        widthIcon={METRICS.ave_reach.widthIcon}
                                                    />
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <MixedChart data={!dashboard.isLoading.ratingReachBarDateData ? transformMixedChartData(dashboard.ratingReachBarDateData?.data, 'date', dashboard.ratingReachBarDateData?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.mixedChart.height}
                                                        fontSize={CUSTOM_CHART.mixedChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.mixedChart.fontWeight}
                                                        nameChart={'Biến động khán giả World Cup 2026 theo ngày (THTT)'}
                                                        maxVisibleItems={CUSTOM_CHART.mixedChart.mixedChartDate.maxVisibleItems}
                                                        description={false}
                                                        barSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.aveReach}
                                                        lineSeriesKeys={CUSTOM_CHART.mixedChart.mixedChartDate.metrics.rating}
                                                        colors={CUSTOM_CHART.mixedChart.mixedChartDate.colors}
                                                        barMaxWidth={CUSTOM_CHART.mixedChart.barMaxWidth}
                                                        barWidthPercent={CUSTOM_CHART.mixedChart.barWidthPercent}
                                                        lastDataIndexActive={CUSTOM_CHART.mixedChart.mixedChartDate.lastDataIndexActive} />
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4 grid grid-cols-2 max-md:grid-cols-1 gap-6 max-lg:gap-5 max-md:gap-4'>
                                                    <BarChart
                                                        data={!dashboard.isLoading.ratingPercentBarChannelData ? transformBarChartData(dashboard.ratingPercentBarChannelData?.data, dashboard.ratingPercentBarChannelData?.colnames) : 'isLoading'}
                                                        height={400}
                                                        fontSize={CUSTOM_CHART.barChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.barChart.fontWeight}
                                                        nameChart={'Rating (%) chương trình World Cup trên các kênh'}
                                                        description={false}
                                                        orientation={'horizontal'}
                                                        formatterValue={2}
                                                    />
                                                    <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component relative`}>
                                                        <NameChart nameChart={'Khán giả World Cup theo thị trường'} description={false} opacity={true} />
                                                        <ChildTabs tabs={[
                                                            {
                                                                id: 'regional', label: 'Vùng',
                                                                content: (
                                                                    <TableChart data={!dashboard.isLoading.allTableRegionalData ? transformTableChartData(dashboard.allTableRegionalData?.data, dashboard.allTableRegionalData?.colnames) : 'isLoading'}
                                                                        height={'400px'}
                                                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                                        nameChart={'Khán giả World Cup theo thị trường'}
                                                                        description={false}
                                                                        showSTT={false}
                                                                        showPagination={false}
                                                                        customCol={{
                                                                            'VÙNG': { justify: 'justify-center', minSize: 100, maxSize: 300 }
                                                                        }}
                                                                        displayName={false}
                                                                        showHeader={false} />
                                                                )
                                                            },
                                                            {
                                                                id: 'province', label: 'Tỉnh/TP',
                                                                content: (
                                                                    <TableChart data={!dashboard.isLoading.allTableProvinceData ? transformTableChartData(dashboard.allTableProvinceData?.data, dashboard.allTableProvinceData?.colnames) : 'isLoading'}
                                                                        height={'400px'}
                                                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                                        nameChart={'Khán giả World Cup theo thị trường'}
                                                                        description={false}
                                                                        showSTT={false}
                                                                        showPagination={false}
                                                                        customCol={{
                                                                            'TỈNH/TP': { justify: 'justify-center', minSize: 100, maxSize: 300 }
                                                                        }}
                                                                        displayName={false}
                                                                        showHeader={false} />
                                                                )
                                                            }
                                                        ]} />
                                                    </div>
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <TableChart data={!dashboard.isLoading.allTableDetailData ? transformTableChartData(dashboard.allTableDetailData?.data, dashboard.allTableDetailData?.colnames) : 'isLoading'}
                                                        height={'400px'}
                                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                        nameChart={'Chỉ số đo lường theo trận đấu (THTT)'}
                                                        description={false}
                                                        showSTT={true}
                                                        customCol={{
                                                            'TRẬN ĐẤU': {
                                                                flag2: true, minSize: 160, maxSize: 160
                                                            },
                                                            'THỜI GIAN\nBẮT ĐẦU': { justify: 'justify-center', align: 'text-center' }
                                                        }}
                                                        showPagination={true} />
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <TableChart data={!dashboard.isLoading.allTableTeamData ? transformTableChartData(dashboard.allTableTeamData?.data, dashboard.allTableTeamData?.colnames) : 'isLoading'}
                                                        height={'425px'}
                                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                        nameChart={'Chỉ số đo lường theo đội tuyển'}
                                                        description={false}
                                                        showSTT={true}
                                                        customCol={{
                                                            'SỐ TRẬN ĐẤU': { justify: 'justify-center', align: 'text-center', prefix: 0 },
                                                            'ĐỘI TUYỂN': {
                                                                minSize: 101, maxSize: 300, flag: true, sticky: true
                                                            },
                                                        }}
                                                        showPagination={true} />
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <TableChart data={!dashboard.isLoading.allTableShareData ? transformTableChartData(dashboard.allTableShareData?.data, dashboard.allTableShareData?.colnames) : 'isLoading'}
                                                        height={'450px'}
                                                        fontSize={CUSTOM_CHART.tableChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.tableChart.fontWeight}
                                                        nameChart={'Các chương trình Đồng hành World Cup'}
                                                        description={false}
                                                        showSTT={true}
                                                        customCol={{
                                                            'KÊNH': { minSize: 0, maxSize: 30, channel: true, sticky: true },
                                                            'CHƯƠNG TRÌNH': { weight: 600, minSize: 100, maxSize: 200 },
                                                        }}
                                                        showPagination={true} />
                                                </div>
                                                <div className='w-full pb-6 max-lg:pb-5 max-md:pb-4'>
                                                    <LineChart data={!dashboard.isLoading.ratingLineMinuteVTV6Data ? transformMixedChartData(dashboard.ratingLineMinuteVTV6Data?.data, 'event_hour_minute', dashboard.ratingLineMinuteVTV6Data?.colnames) : 'isLoading'}
                                                        height={CUSTOM_CHART.lineChart.heightMinute}
                                                        fontSize={CUSTOM_CHART.lineChart.fontSize}
                                                        fontFamily={CUSTOM_CHART.allChart.fontFamily}
                                                        fontWeight={CUSTOM_CHART.lineChart.fontWeight}
                                                        nameChart={'RATING VTV6 theo phút (nhiều ngày)'}
                                                        description={false}
                                                        smooth={CUSTOM_CHART.lineChart.smooth}
                                                        symbolSize={CUSTOM_CHART.lineChart.symbolSize}
                                                        lineWidth={CUSTOM_CHART.lineChart.lineWidth}
                                                        areaStyle={CUSTOM_CHART.lineChart.areaStyle}
                                                        stack={CUSTOM_CHART.lineChart.stack}
                                                        showTopNSeries={0}
                                                        legendTop={true}
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