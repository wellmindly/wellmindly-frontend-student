import axios from 'axios';
import { Capacitor } from '@capacitor/core';

let baseURL = import.meta.env.VITE_API_URL || 'https://api.wellmindly.com/api';

if (!import.meta.env.VITE_API_URL && Capacitor.isNativePlatform()) {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    baseURL = 'https://api.wellmindly.com/api';
  } else if (platform === 'ios') {
    baseURL = 'https://api.wellmindly.com/api';
  }
}

const api = axios.create({
  baseURL,
});

/**
 * Pull a displayable string out of an axios error.
 *
 * The API answers in two shapes: the v1 routes and the global error handler send
 * `{ error: { code, message } }`, while the older routes send `{ error: "text" }`.
 * Passing `data.error` straight into state is what broke here - React throws
 * "Objects are not valid as a React child" and takes the page down, so an error
 * banner became a blank screen.
 */
export const apiErrorMessage = (err: unknown, fallback: string): string => {
  const payload = (err as { response?: { data?: { error?: unknown; message?: unknown } } })?.response?.data;
  const error = payload?.error;

  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message;

  return fallback;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
