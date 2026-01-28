import { useEffect, useState } from 'react';

export const useApi = (apiFn, params = [], options = {}) => {
  const { enabled = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);

    apiFn(...params)
      .then(res => {
        setData(res?.data);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled, apiFn, ...params]);

  return { data, loading, error };
};
