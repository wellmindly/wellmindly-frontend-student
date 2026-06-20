import axios from 'axios';
import { Capacitor } from '@capacitor/core';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (!import.meta.env.VITE_API_URL && Capacitor.isNativePlatform()) {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    baseURL = 'http://localhost:5000/api';
  } else if (platform === 'ios') {
    baseURL = 'http://localhost:5000/api';
  }
}

const api = axios.create({
  baseURL,
});

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
