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
  baseURL: 'http://localhost:3002/api',
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
  const partnerSession = sessionManager.getDriverSession();
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
  console.log('Axios error interceptor:', { 
    status: error.response?.status,
    url: originalRequest?.url,
    method: originalRequest?.method,
    responseData: error.response?.data
  });

  // Skip 400 errors for password issues - these should not trigger logouts
  if (error.response?.status === 400 && 
      error.response?.data?.passwordError === true) {
    console.log('Password verification failed, not logging out');
    return Promise.reject(error);
  }

  // Only clear session for authentication errors and if it's not a specific excluded route
  // We're excluding update-profile completely since we handle that error separately
  if (error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('verify-token') &&
      !originalRequest.url.includes('update-profile')) {
    console.log('Session expired, logging out');
    originalRequest._retry = true;
    sessionManager.clearSession();
    // toast.error('Session expired. Please login again.');
    // window.location.href = '/login';
  }

  return Promise.reject(error);
};

// Apply interceptors to all instances including partnerApi
[authApi, userApi, driverApi, partnerApi].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
}); 