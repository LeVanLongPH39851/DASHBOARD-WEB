import Loading from '../commons/Loading';
import NameChart from '../layouts/components/NameChart';
import { useCallback } from 'react';
const NumberCard = ({ title, description, value, icon=false, background, height='', widthIcon='', suffix = '' }) => {
  if(value==='isLoading') {
    return (
      <div className={`p-6 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        <Loading />
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
    <div className={`p-6 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
      <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} getChartData={getEChartsData} />
        <p className="text-color-black-100 dark:text-color-white-90 transition-all duration-300 text-[32px] font-semibold">
          {value?.toLocaleString()} {suffix}
        </p>
    </div>
  );
};

export default NumberCard;