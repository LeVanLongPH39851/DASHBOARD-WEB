// src/api/payloads/buildPayloadWithFilters.js

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

const buildQueriesRangeFilters = ({ column, startHours, startMinutes, op='<=' }) => {
  if (startHours?.min === 0 && startHours?.max === 23 && startMinutes?.min === 0 && startMinutes?.max === 59) return null;
  
  return [{
    col: column,
    op: '>=',
    val: startHours?.min.toString().padStart(2, '0') + ':' + startMinutes?.min.toString().padStart(2, '0')
  },
  {
    col: column,
    op: op,
    val: startHours?.max.toString().padStart(2, '0') + ':' + startMinutes?.max.toString().padStart(2, '0')
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

  const startTimeFilters = buildQueriesRangeFilters({ 
    column: 'start_time', 
    startHours: filterState.startHours,
    startMinutes: filterState.startMinutes
  });
  
  return queries.map((q) => {
    const currentFilters = q.filters || [];
    
    // Append tất cả filters có data → CHỈ GỌI appendFilters 1 LẦN
    let newFilters = currentFilters;
    if (dayFilters && !disabledFilters.includes('dayFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, dayFilters);
    if (channelFilters && !disabledFilters.includes('channelFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, channelFilters);
    if (eventFilters && !disabledFilters.includes('eventFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, eventFilters);
    if (provinceFilters && !disabledFilters.includes('provinceFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, provinceFilters);
    if (regionalFilters && !disabledFilters.includes('regionalFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, regionalFilters);
    if (keyCitieFilters && !disabledFilters.includes('keyCitieFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, keyCitieFilters);
    if (timebandFilters && !disabledFilters.includes('timebandFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, timebandFilters);
    if (firstLevelFilters && !disabledFilters.includes('firstLevelFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, firstLevelFilters);
    if (programFilters && !disabledFilters.includes('programFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, programFilters);
    if (startTimeFilters && !disabledFilters.includes('startTimeFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, startTimeFilters);
    
    return {
      ...q,
      filters: newFilters,
    };
  });
};

// Helper: append new filter vào existing filters (không ghi đè)
const appendFilters = (existingFilters, newFilters) => {
  if (!existingFilters || (!Array.isArray(existingFilters) && typeof existingFilters !== 'object')) {
    return newFilters;
  }
  
  // Merge: giữ nguyên existing + thêm new filters
  return [...existingFilters, ...newFilters];
};

export const buildPayloadWithFilters = (basePayload, filterState, enabledFilters = []) => {

  const next = structuredClone(basePayload);

  if (enabledFilters.includes('overwriteChannelFilters') && filterState?.channels && filterState?.channels?.length > 0) {
    if (!enabledFilters.includes('oneDateFilters')) {
      next.payload.queries[0].filters = [{ col: 'date', op: 'TEMPORAL_RANGE', val: 'No filter' }];
    } else {
      next.payload.queries[0].filters = [{ col: 'date', op: 'TEMPORAL_RANGE', val: 'No filter' }, { "col": "event_hour_minute", "op": "NOT IN", "val": ["active"] }];
    }
  }

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

  if (!enabledFilters.includes('startTimeFilters')) {
    console.log(next.payload.queries);
  }
  
  return next;
};
