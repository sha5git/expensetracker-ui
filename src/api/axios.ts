import axios from 'axios';

const BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refreshToken cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── In-memory access token ──────────────────────────────────────────────────
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

// ── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response interceptor: handle 401 → refresh → retry ─────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

let onSessionExpiredCallback: (() => void) | null = null;
export const setOnSessionExpired = (cb: () => void) => {
  onSessionExpiredCallback = cb;
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while a refresh is in progress
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        _accessToken = data.accessToken;
        onRefreshed(data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (_refreshError) {
        // Refresh failed — clear token and force app logout
        _accessToken = null;
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        return Promise.reject(_refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
