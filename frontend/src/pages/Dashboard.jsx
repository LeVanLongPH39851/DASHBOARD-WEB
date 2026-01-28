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

const Dashboard = () => {
  const { ratingNumberData, aveReachNumberData, ratingPercentNumberData, aveReachPercentNumberData,
          ratingBarChannelEventData,
          isLoading, hasError } = useDashboardData();

  if (isLoading) return <Loading />;
  if (hasError) return <ErrorState />;
  
  const scopeNumberData = {
    'ratingNumber': ratingNumberData,
    'aveReachNumber': aveReachNumberData,
    'ratingPercentNumber': ratingPercentNumberData,
    'aveReachPercentNumber': aveReachPercentNumberData,
    'ratingBarChannelEventData': ratingBarChannelEventData,
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
        <div className='flex'>
          <div className='w-[60%]'>
          <BarChart data={transformBarChartData(ratingBarChannelEventData.data)}
                    height={CUSTOM_CHART.barChart.height}
                    fontSize={CUSTOM_CHART.barChart.fontSize}
                    fontFamily={`${CUSTOM_CHART.allChart.fontFamily}`}
                    colors={CUSTOM_CHART.barChart.barChartChannelEvent.colors}
                    fontWeight={CUSTOM_CHART.barChart.fontWeight}
                    description={'Đây là thông tin của biểu đồ'}/>
        </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;