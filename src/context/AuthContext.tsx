import React, { createContext, useState, useContext, useEffect, PropsWithChildren } from 'react';
import { axiosInstance } from '../lib/authInstances';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface User {
  _id?: string; // MongoDB ObjectId (primary)
  id?: string; // Alias for _id (fallback for compatibility)
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | 'EMPLOYER';
  employerId?: string; // For employer users
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get token from storage
  const getToken = (): string | null => {
    // Try localStorage first, then cookies
    const localToken = localStorage.getItem('authToken');
    if (localToken) return localToken;
    
    const cookieToken = Cookies.get('authToken');
    if (cookieToken) {
      // Sync to localStorage if found in cookies
      localStorage.setItem('authToken', cookieToken);
      return cookieToken;
    }
    
    return null;
  };

  // Helper function to set token in both storage methods
  const setToken = (token: string) => {
    // Store in localStorage (primary)
    localStorage.setItem('authToken', token);
    // Also store in cookies as backup
    Cookies.set('authToken', token, { 
      expires: 7, // 7 days
      secure: window.location.protocol === 'https:', // Secure in production
      sameSite: 'lax'
    });
  };

  // Helper function to remove token from all storage
  const removeToken = () => {
    localStorage.removeItem('authToken');
    Cookies.remove('authToken');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const response = await axiosInstance.get('/admin/me', {
          timeout: 10000,
        });
        
        // Check for success field according to API spec
        if (response.data?.success === false) {
          setIsAuthenticated(false);
          setUser(null);
          removeToken();
          return;
        }

        // Admin API returns 'admin' field, not 'user'
        const userData = response?.data?.admin || response?.data?.user || response?.data;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          removeToken();
        }
      } catch (error: any) {
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          // Timeout error - keep existing auth state if token exists
          const token = getToken();
          if (token) {
            // Keep authenticated state, but try to refresh user data silently
            console.warn('Auth check timeout, keeping existing session');
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          removeToken();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/admin/login', { email, password });
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || 'Login failed. Please check your credentials.');
        return false;
      }

      // Admin API returns 'admin' field, not 'user'
      const userData = response?.data?.admin || response?.data?.user;
      const token = response?.data?.token;
      
      if (!token) {
        toast.error('Login failed: No token received from server.');
        return false;
      }

      if (userData) {
        setUser(userData);
      } else {
        toast.error('Login failed: No admin data received from server.');
        return false;
      }
      
      // Store token in both localStorage and cookies
      setToken(token);
      
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials and try again.';
      toast.error(errorMessage);
      removeToken(); // Clear any existing tokens on failed login
      return false;
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/user/register', { fullName, email, password });
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || 'Signup failed. Please try again.');
        return false;
      }

      const userData = response?.data?.user;
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Account created successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/admin/logout', {});
      toast.success('Logged out successfully');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, but logging out locally');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      removeToken(); // Remove token from both localStorage and cookies
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};