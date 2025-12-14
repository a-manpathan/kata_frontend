import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: Add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sweetService = {
  getAll: () => api.get('/sweets').then(res => res.data),
  search: (query: string) => api.get(`/sweets/search?${query}`).then(res => res.data),
  create: (data: any) => api.post('/sweets', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/sweets/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/sweets/${id}`).then(res => res.data),
  purchase: (id: string) => api.post(`/sweets/${id}/purchase`).then(res => res.data),
  restock: (id: string, amount: number) => api.post(`/sweets/${id}/restock`, { amount }).then(res => res.data),
};

export const authService = {
  login: (creds: any) => api.post('/auth/login', creds).then(res => res.data),
  register: (creds: any) => api.post('/auth/register', creds).then(res => res.data),
};

export default api;