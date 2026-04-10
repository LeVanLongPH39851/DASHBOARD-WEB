import iconX from '../../../assets/icon_x.png';
import iconXDark from '../../../assets/icon_x_dark.png';
import { VALUE_LABEL } from '../../../utils/label';
import { useDashboardFilters, useDashboardFilterValues, useDashboardStateGlobals } from '../../../context/DashboardFilterContext'

const ClearSet = (setFilterValues, setAppliedFilters, keyFilter) => {
    switch(keyFilter) {
        case 'channels': setFilterValues(prev => ({...prev, channels: []})); setAppliedFilters(prev => ({...prev, channels: []})); break;
        case 'events': setFilterValues(prev => ({...prev, events: []})); setAppliedFilters(prev => ({...prev, events: []})); break;
        case 'days': setFilterValues(prev => ({...prev, days: []})); setAppliedFilters(prev => ({...prev, days: []})); break;
        case 'provinces': setFilterValues(prev => ({...prev, provinces: []})); setAppliedFilters(prev => ({...prev, provinces: []})); break;
        case 'regionals': setFilterValues(prev => ({...prev, regionals: []})); setAppliedFilters(prev => ({...prev, regionals: []})); break;
        case 'keyCities': setFilterValues(prev => ({...prev, keyCities: []})); setAppliedFilters(prev => ({...prev, keyCities: []})); break;
        case 'timebands': setFilterValues(prev => ({...prev, timebands: []})); setAppliedFilters(prev => ({...prev, timebands: []})); break;
        case 'firstLevels': setFilterValues(prev => ({...prev, firstLevels: []})); setAppliedFilters(prev => ({...prev, firstLevels: []})); break;
        case 'programs': setFilterValues(prev => ({...prev, programs: []})); setAppliedFilters(prev => ({...prev, programs: []})); break;
    }
};

const InforFilterItem = ({ keyFilter='', nameFilter, valueFilters=[], space }) => {

    const { appliedFilters, setAppliedFilters } = useDashboardFilters();
    const { filterValues, setFilterValues } = useDashboardFilterValues();
    const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
    
    const displayValue = Array.isArray(valueFilters)
        ? valueFilters
            .map(item => VALUE_LABEL[item] ?? item)
            .filter(item => item !== '')
            .join(space)
        : VALUE_LABEL[valueFilters] ?? valueFilters;
    if (!displayValue) return null;
    return (
        <li className={`py-1.5 ${keyFilter=='Ngày' ? 'px-4 max-lg:px-3' : 'pr-2 pl-4 max-lg:pl-3 filter-item'} text-sm max-lg:text-[13px] max-md:text-xs font-normal border border-border-black-10 dark:border-border-white-20 rounded-xl text-color-black-50 dark:text-color-white-50 transition-all duration-300 flex gap-1 items-center`}>
            {nameFilter}:<span className='text-color-black-100 dark:text-color-white-90 transition-all duration-300'>{displayValue}</span>
            {keyFilter!='Ngày' && (<figure onClick={() => ClearSet(setFilterValues, setAppliedFilters, keyFilter)} className='cursor-pointer'><img src={!stateGlobals.darkMode ? iconX : iconXDark} className='w-2.5 max-lg:w-2 h-2.5 max-lg:h-2' alt="Icon X" /></figure>)}
        </li>
    );
};

export default InforFilterItem;