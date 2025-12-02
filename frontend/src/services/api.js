import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eatHubToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'An error occurred';
      const errorCode = error.response.data?.error?.code || 'ERROR';
      
      return Promise.reject({
        message: errorMessage,
        code: errorCode,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      });
    }
  }
);

export default api;
