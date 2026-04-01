import Loading from '../commons/Loading';
import NameChart from '../layouts/components/NameChart';
import { useCallback } from 'react';
import NoData from '../commons/NoData';
const NumberCard = ({ title, description, value, icon=false, background, height='', widthIcon='', suffix = '' }) => {
  
  if(value==='isLoading') {
    return (
      <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        <Loading />
      </div>
    );
  } else if (value === '-') {
    return (
      <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
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
    <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
      <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} getChartData={getEChartsData} />
        <div className='flex items-center gap-2'>
          <div className={`w-8 h-8 max-md:w-7 max-md:h-7 max-md:flex hidden justify-center items-center rounded-lg ${background} transition-all duration-300`}><figure><img src={icon} className={`${widthIcon+' '+background}`} /></figure></div>
          <p className="text-color-black-100 dark:text-color-white-90 transition-all duration-300 text-[32px] max-md:text-lg font-semibold">
            {value?.toLocaleString()} {suffix}
          </p>
        </div>
    </div>
  );
};

export default NumberCard;