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
    // var isKill = false;
    return apiFn(...params)
      .then(res => {
        // if (!res?.data?.data?.[0]) { isKill = true; } else { isKill = false; }
        setData(res?.data);
        return res?.data;
      })
      .catch(err => {
        setError(err);
        throw err;
      })
      .finally(() => {
        // if (!isKill)
        setLoading(false);
      });
  }, [enabled, shouldSkip, apiFn, ...params]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ SỬA: auto call khi params thay đổi
  useEffect(() => {
    if (!enabled || shouldSkip) return;
    refetch(); // dùng refetch thay vì duplicate logic
  }, [refetch, enabled, shouldSkip]); // chỉ dep vào refetch → clean & safe

  // ✅ THÊM: lắng nghe event 'api-killed' để reset loading ngay khi kill request
  // useEffect(() => {
  //   const handleKilled = () => {
  //     setLoading(true);
  //     setError(null);
  //   };
  //   window.addEventListener('api-killed', handleKilled);
  //   return () => window.removeEventListener('api-killed', handleKilled);
  // }, []);

  return { data, loading, error, refetch };
};
