// src/contexts/DashboardFilterContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';

const DashboardFilterContext = createContext(null);

export const DashboardFilterProvider = ({ children }) => {
  const [appliedFilters, setAppliedFilters] = useState(null); // null = default payload
  const value = useMemo(() => ({ appliedFilters, setAppliedFilters }), [appliedFilters]);
  return <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>;
};

export const useDashboardFilters = () => {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  return ctx;
};