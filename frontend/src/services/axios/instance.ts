import axios from 'axios';
import { sessionManager } from '../../utils/sessionManager';
import { toast } from 'react-hot-toast';

// Create base instances for each microservice
export const authApi = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const userApi = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const driverApi = axios.create({
  baseURL: 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add this new instance
export const partnerApi = axios.create({
  baseURL: 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Update the request interceptor to handle partner tokens
const requestInterceptor = (config: any) => {
  // Check for partner session first
  const partnerSession = sessionManager.getPartnerSession();
  if (partnerSession.token) {
    config.headers.Authorization = `Bearer ${partnerSession.token}`;
    return config;
  }

  // Fall back to regular session
  const { token } = sessionManager.getSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor
const responseInterceptor = (response: any) => response;

// Error interceptor
const errorInterceptor = (error: any) => {
  const originalRequest = error.config;
console.log('error', error.response);

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    sessionManager.clearSession();
    // window.location.href = '/login';
    toast.error('Session expired. Please login again.');
  }

  return Promise.reject(error);
};

// Apply interceptors to all instances including partnerApi
[authApi, userApi, driverApi, partnerApi].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
}); 