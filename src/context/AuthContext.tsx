import React, { createContext, useState, useContext, useEffect, PropsWithChildren } from 'react';
import { axiosInstance } from '../lib/authInstances';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface User {
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const response = await axiosInstance.get('/user/me', {
          timeout: 10000,
        });
        
        // Check for success field according to API spec
        if (response.data?.success === false) {
          setIsAuthenticated(false);
          setUser(null);
          Cookies.remove('authToken');
          return;
        }

        const userData = response?.data?.user || response?.data;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          Cookies.remove('authToken');
        }
      } catch (error: any) {
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          // Timeout error - keep existing auth state
        } else {
          setUser(null);
          setIsAuthenticated(false);
          Cookies.remove('authToken');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/user/login', { email, password });
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || 'Login failed. Please check your credentials.');
        return false;
      }

      const userData = response?.data?.user;
      const token = response?.data?.token;
      
      if (userData) {
        setUser(userData);
      }
      
      if (token) {
        Cookies.set('authToken', token, { expires: 7 }); // Save token in cookies for 7 days
      }
      
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials and try again.';
      toast.error(errorMessage);
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
      await axiosInstance.post('/user/logout', {});
      toast.success('Logged out successfully');
    } catch (error) {
      // Continue with logout even if API call fails
      toast.error('Error during logout, but you have been logged out locally');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove('authToken');
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