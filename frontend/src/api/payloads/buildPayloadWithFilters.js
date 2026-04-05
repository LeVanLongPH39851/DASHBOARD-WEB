// src/api/payloads/buildPayloadWithFilters.js

const pad2 = (n) => String(n).padStart(2, '0');

const toTimeRangeString = (startDate, endDate) => {
  if (!startDate && !endDate) return null;
  const s = startDate ? `${startDate}T00:00:00` : null;
  const e = endDate ? `${endDate}T23:59:59` : null;
  const start = s ?? e?.replace('T23:59:59', 'T00:00:00');
  const end = e ?? s?.replace('T00:00:00', 'T23:59:59');
  return `${start} : ${end}`;
};

const buildQueriesFilters = ({ column, values }) => {
  if (!values || values.length === 0) return null;
  return [{
    col: column,
    op: 'IN',
    val: values,
  }];
};

const appendAllFilters = (queries, filterState, disabledFilters) => {
  if (!queries || !filterState) return queries;
  if (filterState.days.includes('InWeek')) {
    filterState.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'InWeek'];
  } else if (filterState.days.includes('Weekend')) {
    filterState.days = ['Saturday', 'Sunday', 'Weekend'];
  }
  
  const dayFilters = buildQueriesFilters({ 
    column: 'days_of_week',
    values: filterState.days
  });

  const channelFilters = buildQueriesFilters({ 
    column: 'channel_name_tvd', 
    values: filterState.channels 
  });

  const eventFilters = buildQueriesFilters({ 
    column: 'event_category_name', 
    values: filterState.events 
  });

  const provinceFilters = buildQueriesFilters({ 
    column: 'province', 
    values: filterState.provinces 
  });

  const regionalFilters = buildQueriesFilters({ 
    column: 'regional_name', 
    values: filterState.regionals 
  });

  const keyCitieFilters = buildQueriesFilters({ 
    column: 'key_city', 
    values: filterState.keyCities 
  });

  const timebandFilters = buildQueriesFilters({ 
    column: 'time_band', 
    values: filterState.timebands 
  });

  const firstLevelFilters = buildQueriesFilters({ 
    column: 'firstlevel_vn', 
    values: filterState.firstLevels 
  });

  const programFilters = buildQueriesFilters({ 
    column: 'program_name', 
    values: filterState.programs 
  });
  
  return queries.map((q) => {
    const currentFilters = q.filters || [];
    
    // Append tất cả filters có data → CHỈ GỌI appendFilters 1 LẦN
    let newFilters = currentFilters;
    if (dayFilters && !disabledFilters.includes('dayFilters')) newFilters = appendFilters(newFilters, dayFilters);
    if (channelFilters && !disabledFilters.includes('channelFilters')) newFilters = appendFilters(newFilters, channelFilters);
    if (eventFilters && !disabledFilters.includes('eventFilters')) newFilters = appendFilters(newFilters, eventFilters);
    if (provinceFilters && !disabledFilters.includes('provinceFilters')) newFilters = appendFilters(newFilters, provinceFilters);
    if (regionalFilters && !disabledFilters.includes('regionalFilters')) newFilters = appendFilters(newFilters, regionalFilters);
    if (keyCitieFilters && !disabledFilters.includes('keyCitieFilters')) newFilters = appendFilters(newFilters, keyCitieFilters);
    if (timebandFilters && !disabledFilters.includes('timebandFilters')) newFilters = appendFilters(newFilters, timebandFilters);
    if (firstLevelFilters && !disabledFilters.includes('firstLevelFilters')) newFilters = appendFilters(newFilters, firstLevelFilters);
    if (programFilters && !disabledFilters.includes('programFilters')) newFilters = appendFilters(newFilters, programFilters);
    
    return {
      ...q,
      filters: newFilters,
    };
  });
};

// Helper: append new filter vào existing filters (không ghi đè)
const appendFilters = (existingFilters, newFilters) => {
  if (!existingFilters || !Array.isArray(existingFilters)) {
    return newFilters;
  }
  
  // Merge: giữ nguyên existing + thêm new filters
  return [...existingFilters, ...newFilters];
};

export const buildPayloadWithFilters = (basePayload, filterState, enabledFilters = []) => {
  const next = structuredClone(basePayload);

  const timeRange = toTimeRangeString(filterState?.startDate, filterState?.endDate);

  // 1) Update time_range cho queries + extra_form_data
  if (timeRange) {
    next.payload.queries = (next.payload.queries || []).map((q) => ({
      ...q,
      time_range: timeRange,
    }));

    next.payload.form_data = next.payload.form_data || {};
    next.payload.form_data.extra_form_data = next.payload.form_data.extra_form_data || {};
    next.payload.form_data.extra_form_data.time_range = timeRange;
  }
  
  next.payload.queries = appendAllFilters(next.payload.queries, filterState, enabledFilters);

  return next;
};
