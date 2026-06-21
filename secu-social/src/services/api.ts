import axios from 'axios';

const BASE_URL = import.meta.env.PROD ? 'https://secu-social-backend.onrender.com' : '/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string) => api.get<T>(url).then((res) => res.data),
  getById: <T>(url: string, id: string) => api.get<T>(`${url}/${id}`).then((res) => res.data),
  post: <T>(url: string, data: unknown) => api.post<T>(url, data).then((res) => res.data),
  put: <T>(url: string, id: string, data: unknown) => api.put<T>(`${url}/${id}`, data).then((res) => res.data),
  patch: <T>(url: string, id: string, data: Partial<T>) => api.patch<T>(`${url}/${id}`, data).then((res) => res.data),
  delete: (url: string, id: string) => api.delete(`${url}/${id}`).then((res) => res.data),
};

export default api;
