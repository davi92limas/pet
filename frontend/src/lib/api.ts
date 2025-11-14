import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('@helppet:token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('@helppet:token');
      localStorage.removeItem('@helppet:user');
    }
    return Promise.reject(error);
  },
);

export { api, API_URL };
