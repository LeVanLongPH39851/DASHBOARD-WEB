import iconX from '../../../assets/icon_x.png';

const ClearSet = (setChannels, setEvents, setProvinces, keyFilter) => {
    const element = document.getElementById(keyFilter);
    if (element) {
        element.style.display = 'none';
    }

    switch(keyFilter) {
        case 'channels': setChannels([]); break;
        case 'events': setEvents([]); break;
        case 'provinces': setProvinces([]); break;
    }
};

const InforFilterItem = ({ keyFilter='', nameFilter, valueFilters=[], space, setChannels, setEvents, setProvinces }) => {
    const displayValue = Array.isArray(valueFilters) 
        ? valueFilters.join(space) 
        : valueFilters;
    if (!displayValue) return null;
    return (
        <li id={keyFilter} key={keyFilter} className={`py-1.5 ${keyFilter=='Ngày' ? 'px-4' : 'pr-2 pl-4 filter-item'} text-sm font-medium border border-border-black-10 rounded-xl text-color-black-50 flex gap-1 items-center`}>
            {nameFilter}:<span className='text-color-black-100'>{displayValue}</span>
            {keyFilter!='Ngày' && (<figure onClick={() => ClearSet(setChannels, setEvents, setProvinces, keyFilter)} className='cursor-pointer'><img src={iconX} className='w-2.5 h-2.5' alt="Icon X" /></figure>)}
        </li>
    );
};

export default InforFilterItem;