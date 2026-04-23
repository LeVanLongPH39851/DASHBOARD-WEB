// src/contexts/DashboardFilterContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';

const DashboardFilterContext = createContext(null);
const FilterValueContext = createContext(null);
const StateGlobalContext = createContext(null);

const SESSION_KEYS = {
  appliedFilters: 'dashboard_filters',
  filterValues: 'filter_values'
};

const isRatingPage = () => {
  try {
    return window.location.pathname.includes('/rating');
  } catch {
    return false;
  }
};

const getSessionValue = (key, fallback = null) => {
  try {
    if (!isRatingPage()) return fallback;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Cannot parse sessionStorage key: ${key}`, error);
    return fallback;
  }
};

export const DashboardFilterProvider = ({ children }) => {
  const [appliedFilters, setAppliedFilters] = useState(() =>
    getSessionValue(SESSION_KEYS.appliedFilters, null)
  );
  const [filterValues, setFilterValues] = useState(() =>
    getSessionValue(SESSION_KEYS.filterValues, null)
  );
  const [stateGlobals, setStateGlobals] = useState({isOpen: true, horizontal: false, isInfor: true, currentTab: 'overview', darkMode: false, screen_md: false, screen_lg: false});
  const appliedValue = useMemo(() => ({ appliedFilters, setAppliedFilters }), [appliedFilters]);
  const filterValue = useMemo(() => ({ filterValues, setFilterValues }), [filterValues]);
  const stateGlobalValue = useMemo(() => ({ stateGlobals, setStateGlobals }), [stateGlobals]);
  return <DashboardFilterContext.Provider value={appliedValue}>
          <FilterValueContext.Provider value={filterValue}>
            <StateGlobalContext.Provider value={stateGlobalValue}>
            {children}
            </StateGlobalContext.Provider>
          </FilterValueContext.Provider>
         </DashboardFilterContext.Provider>;
};

export const useDashboardFilters = () => {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  return ctx;
};

export const useDashboardFilterValues = () => {
  const ctx = useContext(FilterValueContext);
  if (!ctx) throw new Error('useDashboardFilterValues must be used within FilterValueProvider');
  return ctx;
};

export const useDashboardStateGlobals = () => {
  const ctx = useContext(StateGlobalContext);
  if (!ctx) throw new Error('useDashboardStateGlobals must be used within StateGlobalProvider');
  return ctx;
};