// Edit the LAN address here, or set EXPO_PUBLIC_API_URL before starting Expo.
// Physical phones and web clients use the same server; Android emulator may use 10.0.2.2.
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.124:5000/api').replace(/\/+$/, '');
export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}
/** @param {string} endpoint
 * @param {{method?: string, body?: any, headers?: Record<string,string>, signal?: AbortSignal, timeout?: number}} options
 * @param {string|null} token */
export async function apiRequest(endpoint, options = {}, token = null) {
  const { body, headers = {}, signal, timeout = 15000, ...requestOptions } = options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
  try {
    const response = await fetch(BASE_URL + '/' + endpoint.replace(/^\/+/, ''), {
      ...requestOptions, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...headers,
        ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });
    const text = await response.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch {
        if (response.ok) throw new ApiError('The server returned an invalid response. Please try again.', response.status);
      }
    }
    if (!response.ok) throw new ApiError(typeof data?.message === 'string' ? data.message
      : 'Request failed (HTTP ' + response.status + '). Please try again.', response.status);
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (signal?.aborted) throw error;
    throw new ApiError(timedOut ? 'The server took too long to respond. Please try again.'
      : 'Cannot reach the server. Check your Wi-Fi connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
