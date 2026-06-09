import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared refresh promise — prevents concurrent 401s from each firing a separate refresh call
let refreshPromise: Promise<void> | null = null;

const doRefresh = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_URL}/api/auth/refresh`,
    { refreshToken }
  );

  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

// Response interceptor — handle token refresh on 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        await refreshPromise;
        const token = localStorage.getItem('accessToken');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Document API
export const documentAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Set Content-Type to null to remove the instance-level 'application/json' default.
    // Axios 1.x will otherwise detect the JSON header and convert FormData to JSON,
    // which causes multer on the server to receive no file (400 "No file uploaded").
    // With null, the browser sets the correct multipart/form-data; boundary=... header.
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': null },
    });
  },
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Chat API
export const chatAPI = {
  getSessions: () => api.get('/chat/history'),
  getSession: (sessionId: string) => api.get(`/chat/history/${sessionId}`),
  deleteSession: (sessionId: string) => api.delete(`/chat/history/${sessionId}`),
};

export default api;
