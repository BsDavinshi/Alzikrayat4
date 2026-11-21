import axios from 'axios';

// Axios instance with automatic JWT Bearer header injection (Project 4 — Track A)
export const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alzikrayat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('alzikrayat_token');
      localStorage.removeItem('alzikrayat_user');
      window.dispatchEvent(new Event('alzikrayat:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export async function apiRequest(path, options = {}) {
  try {
    const method = (options.method || 'GET').toUpperCase();
    const isFormData = options.body instanceof FormData;
    const headers = { ...(options.headers || {}) };

    if (isFormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const res = await api.request({
      url: path,
      method,
      headers,
      data: options.body
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Request failed';
    throw new Error(message);
  }
}
