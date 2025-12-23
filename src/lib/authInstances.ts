import axios from 'axios'
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Support environment-based API URLs
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
//   (import.meta.env.DEV
//     ? "http://localhost:3000/api"
//     : "https://worklah-updated-dec.onrender.com/api

const API_BASE_URL = "https://worklah-updated-dec.onrender.com/api"

// const API_BASE_URL = "http://localhost:3000/api"

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken'); // Retrieve token from cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and check success field
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response has success field and it's false
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.message || 'Request failed';
      // Don't show toast for auth endpoints (handled in AuthContext)
      if (!response.config.url?.includes('/user/login') && !response.config.url?.includes('/user/register')) {
        toast.error(errorMessage);
      }
      const error = new Error(errorMessage);
      (error as any).response = response;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
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
      toast.error('Request timeout. Please check your connection or try again later.');
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
