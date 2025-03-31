
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { api, AuthResponse, extractAuthFromUrl } from '@/lib/api';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  socialLogin: (provider: string) => Promise<void>;
  ssoLogin: (token: string) => Promise<void>;
  updateUserData: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a NavigationAwareAuthProvider to handle the issue with navigate not being available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationAwareAuthProvider>
      {children}
    </NavigationAwareAuthProvider>
  );
};

// Create an inner provider that uses the navigation hooks
const NavigationAwareAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const urlAuth = extractAuthFromUrl();
        if (urlAuth?.user) {
          setUser(urlAuth.user);
          toast.success("Social login successful");
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/dashboard');
          setIsLoading(false);
          return;
        }
        const storedUser = localStorage.getItem('iam-user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('iam-user');
        localStorage.removeItem('auth-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(email, password);
      setUser(response.user);
      localStorage.setItem('iam-user', JSON.stringify(response.user));
      localStorage.setItem('auth-token', response.token);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(name, email, password);
      setUser(response.user);
      localStorage.setItem('iam-user', JSON.stringify(response.user));
      localStorage.setItem('auth-token', response.token);
      toast.success("Account created successfully");
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      const mockUserData = {
        id: '1',
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`
      };
      
      const response = await api.auth.socialLogin(provider, mockUserData);
      
      setUser(response.user);
      localStorage.setItem('iam-user', JSON.stringify(response.user));
      localStorage.setItem('auth-token', response.token);
      toast.success(`Logged in with ${provider} successfully`);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      toast.error(`${provider} login failed. Please try again.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const ssoLogin = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.ssoLogin(token);
      
      setUser(response.user);
      localStorage.setItem('iam-user', JSON.stringify(response.user));
      localStorage.setItem('auth-token', response.token);
      toast.success("SSO login successful");
    } catch (error) {
      console.error('SSO login failed:', error);
      toast.error("SSO login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iam-user');
    localStorage.removeItem('auth-token');
    toast.success("Logged out successfully");
  };

  const updateUserData = (userData: User) => {
    setUser(userData);
    localStorage.setItem('iam-user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        socialLogin,
        ssoLogin,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
