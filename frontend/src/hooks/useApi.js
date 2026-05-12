import { useCallback, useEffect, useState } from 'react';

export const useApi = (apiFn, params = [], options = {}) => {
  const { enabled = true, shouldSkip = false } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // ✅ THÊM: refetch manual (backup cho trường hợp cần)
  const refetch = useCallback(() => {
    if (!enabled || shouldSkip) return Promise.resolve(null);
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
  }, [enabled, shouldSkip, apiFn, ...params]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ SỬA: auto call khi params thay đổi
  useEffect(() => {
    if (!enabled || shouldSkip) return;
    refetch(); // dùng refetch thay vì duplicate logic
  }, [refetch, enabled, shouldSkip]); // chỉ dep vào refetch → clean & safe

  return { data, loading, error, refetch };
};
