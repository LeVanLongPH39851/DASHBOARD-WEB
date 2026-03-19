export const transformNumberWithTrendData = (apiData, colnames) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return null;
  if (!colnames || !Array.isArray(colnames) || colnames.length < 2) return null;

  const [dateKey, valueKey] = colnames;

  return apiData.map(item => {
    const d = new Date(item[dateKey]);
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    return {
      date,
      value: item[valueKey] ?? 0,
    };
  });
};
