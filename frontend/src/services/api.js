import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('poxscan_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Prediction
export const predictAPI = {
  predict: (formData) => api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
};

// Reviews
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  post: (data) => api.post('/reviews', data),
};

// Disease Updates
export const updatesAPI = {
  getAll: () => api.get('/disease-updates'),
};

// User
export const userAPI = {
  getPredictions: () => api.get('/user/predictions'),
  updateProfile: (data) => api.put('/user/profile', data),
};

// Stats
export const statsAPI = {
  get: () => api.get('/stats'),
};

// Chatbot
export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
};

export default api;
