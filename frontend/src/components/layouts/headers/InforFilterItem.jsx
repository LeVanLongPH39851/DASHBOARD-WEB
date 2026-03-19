import iconX from '../../../assets/icon_x.png';
import { useDashboardFilterValues } from '../../../context/DashboardFilterContext'

const ClearSet = (setFilterValues, keyFilter) => {
    const element = document.getElementById(keyFilter);
    if (element) {
        element.style.display = 'none';
    }

    switch(keyFilter) {
        case 'channels': setFilterValues(prev => ({...prev, channels: []})); break;
        case 'events': setFilterValues(prev => ({...prev, events: []})); break;
        case 'provinces': setFilterValues(prev => ({...prev, provinces: []})); break;
        case 'regionals': setFilterValues(prev => ({...prev, regionals: []})); break;
        case 'keyCities': setFilterValues(prev => ({...prev, keyCities: []})); break;
        case 'timebands': setFilterValues(prev => ({...prev, timebands: []})); break;
        case 'firstLevels': setFilterValues(prev => ({...prev, firstLevels: []})); break;
    }
};

const InforFilterItem = ({ keyFilter='', nameFilter, valueFilters=[], space }) => {
    const { filterValues, setFilterValues } = useDashboardFilterValues();
    
    const displayValue = Array.isArray(valueFilters) 
        ? valueFilters.join(space) 
        : valueFilters;
    if (!displayValue) return null;
    return (
        <li id={keyFilter} className={`py-1.5 ${keyFilter=='Ngày' ? 'px-4' : 'pr-2 pl-4 filter-item'} text-sm font-medium border border-border-black-10 rounded-xl text-color-black-50 flex gap-1 items-center`}>
            {nameFilter}:<span className='text-color-black-100'>{displayValue}</span>
            {keyFilter!='Ngày' && (<figure onClick={() => ClearSet(setFilterValues, keyFilter)} className='cursor-pointer'><img src={iconX} className='w-2.5 h-2.5' alt="Icon X" /></figure>)}
        </li>
    );
};

export default InforFilterItem;