import axios from 'axios'
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// REACT_ADMIN_HANDOVER.md: Base URL = dev http://localhost:3000/api or deployed API (e.g. https://worklah-updated-dec.onrender.com/api)
// Set VITE_API_BASE_URL in .env for production; omit for dev (localhost).
// ⚠️ Base URL already includes '/api' – use paths like '/admin/login', not '/api/admin/login'

const API_BASE_URL = "https://worklah-updated-dec.onrender.com/api";
// const API_BASE_URL = "http://localhost:3000/api"


export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout for regular requests
})

console.log("ahaghga")

// Separate instance for file uploads with longer timeout
export const axiosFileInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout for file uploads
})

// Request interceptor for both instances
const requestInterceptor = (config: any) => {
  // Try localStorage first, then cookies for token
  let token = localStorage.getItem('authToken');
  if (!token) {
    token = Cookies.get('authToken') || null;
    // Sync to localStorage if found in cookies
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
};

axiosInstance.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error);
});

axiosFileInstance.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error);
});

// Response interceptor for both instances
const responseInterceptor = (response: any) => {
  // Check if response has success field and it's false
  if (response.data && response.data.success === false) {
    const errorMessage = response.data.message || 'Request failed';
    // Don't show toast for auth endpoints (handled in AuthContext)
    if (!response.config.url?.includes('/admin/login') && !response.config.url?.includes('/user/login') && !response.config.url?.includes('/user/register')) {
      toast.error(errorMessage);
    }
    const error = new Error(errorMessage);
    (error as any).response = response;
    return Promise.reject(error);
  }
  return response;
};

axiosInstance.interceptors.response.use(responseInterceptor,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Remove token from both storage locations
      localStorage.removeItem('authToken');
      Cookies.remove('authToken');
      toast.error('Session expired. Please login again.');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signin') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Only show timeout if we don't have a response (actual timeout)
      // If we have a response, the request completed successfully
      if (!error.response) {
        toast.error('Request timeout. Please check your connection or try again later.');
      }
      error.message = 'Request timeout. Please check your connection or try again later.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      toast.error('Network error. Please check your internet connection.');
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.data?.message) {
      // Show API error message if available
      toast.error(error.response.data.message);
    } else if (error.message) {
      // Show generic error message
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Same error handler for file instance
axiosFileInstance.interceptors.response.use(responseInterceptor,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Remove token from both storage locations
      localStorage.removeItem('authToken');
      Cookies.remove('authToken');
      toast.error('Session expired. Please login again.');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signin') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Only show timeout if we don't have a response (request actually timed out)
      if (!error.response) {
        toast.error('Request timeout. Please check your connection or try again later.');
      }
      error.message = 'Request timeout. Please check your connection or try again later.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      toast.error('Network error. Please check your internet connection.');
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.data?.message) {
      // Show API error message if available
      toast.error(error.response.data.message);
    } else if (error.message) {
      // Show generic error message
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);
