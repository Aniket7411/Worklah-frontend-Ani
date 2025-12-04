import axios from 'axios'
import Cookies from 'js-cookie';

// const API_BASE_URL = "http://localhost:3000/api";
const API_BASE_URL = "https://worklah-updated-dec.onrender.com";

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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout: The server took too long to respond.');
      error.message = 'Request timeout. Please check your connection or try again later.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network error: Unable to reach the server.');
      error.message = 'Network error. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);
