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

const buildQueriesRangeFilters = ({ column, values, op='<=' }) => {
  if (!values || Object.keys(values).length === 0) return null;
  return [{
    col: column,
    op: '>=',
    val: values?.min
  },
  {
    col: column,
    op: op,
    val: values?.max
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

  const startHourFilters = buildQueriesRangeFilters({ 
    column: 'start_hour', 
    values: filterState.startHours,
    op: '<'
  });

  const startMinuteFilters = buildQueriesRangeFilters({ 
    column: 'start_minute', 
    values: filterState.startMinutes
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
    if (startHourFilters && (startHourFilters?.min !== 0 && startHourFilters?.max !== 24) && !disabledFilters.includes('startHourFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, startHourFilters);
    if (startMinuteFilters && (startMinuteFilters?.min !== 0 && startMinuteFilters?.max !== 59) && !disabledFilters.includes('startMinuteFilters') && !disabledFilters.includes('allFilters')) newFilters = appendFilters(newFilters, startMinuteFilters);
    
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
  
  return next;
};
