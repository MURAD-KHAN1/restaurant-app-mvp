import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/client';
/** @param {string} endpoint
 * @param {{enabled?: boolean, token?: string|null, transform?: (data:any)=>any, onData?: (data:any)=>void}} options */
export function useApi(endpoint, { token = null, enabled = true, transform, onData } = {}) {
  const [result, setResult] = useState(null);
  const data = enabled && result?.endpoint === endpoint && result?.token === token ? result.data : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const active = useRef(false);
  const request = useRef(null);
  const callbacks = useRef({ transform, onData });
  useEffect(() => { callbacks.current = { transform, onData }; }, [transform, onData]);
  const refetch = useCallback(async () => {
    if (!enabled) return null;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    if (active.current) { setLoading(true); setError(null); }
    try {
      const response = await apiRequest(endpoint, { signal: controller.signal }, token);
      const result = callbacks.current.transform ? callbacks.current.transform(response) : response;
      if (active.current && !controller.signal.aborted) {
        setResult({ endpoint, token, data: result }); callbacks.current.onData?.(result);
      }
      return result;
    } catch (failure) {
      if (active.current && !controller.signal.aborted) setError(failure.message || 'Unable to load data. Please try again.');
      throw failure;
    } finally {
      if (active.current && request.current === controller) setLoading(false);
    }
  }, [endpoint, token, enabled]);
  useEffect(() => {
    active.current = true;
    refetch().catch(() => {});
    return () => { active.current = false; request.current?.abort(); };
  }, [refetch]);
  return { data, loading: enabled && loading, error: enabled ? error : null, refetch };
}
