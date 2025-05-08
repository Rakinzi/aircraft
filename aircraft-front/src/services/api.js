// src/services/api.js
import axios from 'axios';

// Create an axios instance with default configs
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log detailed error for debugging
    console.error('API Error:', error.response ? error.response.data : error.message);
    
    return Promise.reject(error);
  }
);

// Auth APIs
const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (userData) => api.post('/register', userData),
};

// Engine APIs - match the Flask endpoints exactly
const enginesAPI = {
  getAll: () => api.get('/engines'),
  getById: (id) => api.get(`/engines/${id}`),
  create: (engineData) => api.post('/engines', engineData),
  update: (id, engineData) => api.put(`/engines/${id}`, engineData),
  delete: (id) => api.delete(`/engines/${id}`), // Added delete method
  addCycleData: (id, cycleData) => api.post(`/engines/${id}/cycles`, cycleData),
};

// Maintenance APIs - match the Flask endpoints exactly
const maintenanceAPI = {
  getAll: (params = {}) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (maintenanceData) => api.post('/maintenance', maintenanceData),
  update: (id, maintenanceData) => api.put(`/maintenance/${id}`, maintenanceData),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// Alerts APIs - match the Flask endpoints exactly
const alertsAPI = {
  getAll: (params = {}) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  update: (id, alertData) => api.put(`/alerts/${id}`, alertData),
};

// Dashboard API - match the Flask endpoints exactly
const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
};

export {
  api as default,
  authAPI,
  enginesAPI,
  maintenanceAPI,
  alertsAPI,
  dashboardAPI
};