import { useCallback, useEffect, useState } from 'react';

export const useApi = (apiFn, params = [], options = {}) => {
  const { enabled = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // ✅ THÊM: refetch manual (backup cho trường hợp cần)
  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    return apiFn(...params)
      .then(res => {
        setData(res?.data);
        return res?.data;
      })
      .catch(err => {
        setError(err);
        throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled, apiFn, ...params]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ SỬA: auto call khi params thay đổi
  useEffect(() => {
    if (!enabled) return;
    refetch(); // dùng refetch thay vì duplicate logic
  }, [refetch]); // chỉ dep vào refetch → clean & safe

  return { data, loading, error, refetch };
};
