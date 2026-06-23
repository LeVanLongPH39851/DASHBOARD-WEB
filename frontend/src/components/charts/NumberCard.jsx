import Loading from '../commons/Loading';
import LoadingNumberWC from '../commons/LoadingNumberWC';
import NameChart from '../layouts/components/NameChart';
import { useCallback } from 'react';
import NoData from '../commons/NoData';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';

const NumberCard = ({ title, description, value, icon = false, background, height = '', widthIcon = '', suffix = '', id = null }) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  if (value === 'isLoading') {
    return (
      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        {window.location.pathname.includes('/world-cup-2026') ? <LoadingNumberWC height={'50px'} /> : <Loading />}
      </div>
    );
  } else if (value === '-') {
    return (
      <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        <NoData />
      </div>
    );
  }

  const getEChartsData = useCallback(() => {

    const numericValue = value || 0;

    return {
      labels: ['Label'],
      series: [{
        name: 'Value',  // ✅ Fixed name, bỏ title
        data: [numericValue]
      }]
    };
  }, [value]);

  return (
    <div className={`p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
      <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} getChartData={getEChartsData} id={id} />
      <div className='flex items-center gap-2'>
        <div className={`w-8 h-8 max-md:w-7 max-md:h-7 max-md:flex hidden justify-center items-center rounded-lg ${background} transition-all duration-300`}><figure><img src={icon} className={`${widthIcon}`} /></figure></div>
        <p className="text-color-black-100 dark:text-color-white-90 transition-all duration-300 text-[32px] max-lg:text-[24px] max-md:text-lg font-semibold">
          {value?.toLocaleString()} {!stateGlobals.screen_md && suffix}
        </p>
      </div>
    </div>
  );
};

export default NumberCard;