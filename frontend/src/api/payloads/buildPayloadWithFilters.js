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

  const normalizedDays = filterState.days?.includes('InWeek')
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'InWeek']
    : filterState.days?.includes('Weekend')
      ? ['Saturday', 'Sunday', 'Weekend']
      : filterState.days;

  const FILTER_CONFIG = [
    {
      key: 'days',
      disabledKey: 'dayFilters',
      build: () => buildQueriesFilters({
        column: 'days_of_week',
        values: normalizedDays
      }),
    },
    {
      key: 'channels',
      disabledKey: 'channelFilters',
      build: () => buildQueriesFilters({
        column: 'channel_name_tvd',
        values: filterState.channels
      }),
    },
    {
      key: 'events',
      disabledKey: 'eventFilters',
      build: () => buildQueriesFilters({
        column: 'event_category_name',
        values: filterState.events
      }),
    },
    {
      key: 'provinces',
      disabledKey: 'provinceFilters',
      build: () => buildQueriesFilters({
        column: 'province',
        values: filterState.provinces
      }),
    },
    {
      key: 'regionals',
      disabledKey: 'regionalFilters',
      build: () => buildQueriesFilters({
        column: 'regional_name',
        values: filterState.regionals
      }),
    },
    {
      key: 'keyCities',
      disabledKey: 'keyCityFilters',
      build: () => buildQueriesFilters({
        column: 'key_city',
        values: filterState.keyCities
      }),
    },
    {
      key: 'timebands',
      disabledKey: 'timebandFilters',
      build: () => buildQueriesFilters({
        column: 'time_band',
        values: filterState.timebands
      }),
    },
    {
      key: 'firstLevels',
      disabledKey: 'firstLevelFilters',
      build: () => buildQueriesFilters({
        column: 'firstlevel_vn',
        values: filterState.firstLevels
      }),
    },
    {
      key: 'programs',
      disabledKey: 'programFilters',
      build: () => buildQueriesFilters({
        column: 'program_name',
        values: filterState.programs
      }),
    },
    {
      key: 'startTime',
      disabledKey: 'startTimeFilters',
      build: () => buildQueriesRangeFilters({
        column: 'start_time',
        startHours: filterState.startHours,
        startMinutes: filterState.startMinutes
      }),
    }
  ];

  return queries.map((q) => {
    let newFilters = q.filters || [];

    FILTER_CONFIG.forEach(({ disabledKey, build }) => {
      const builtFilter = build();

      if (
        builtFilter &&
        !disabledFilters.includes(disabledKey) &&
        !disabledFilters.includes('allFilters')
      ) {
        newFilters = appendFilters(newFilters, builtFilter);
      }
    });

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
