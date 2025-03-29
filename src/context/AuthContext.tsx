import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { api, AuthResponse, extractAuthFromUrl } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // First check if there's a token in the URL (from social login redirect)
        const urlAuth = extractAuthFromUrl();
        if (urlAuth?.user) {
          setUser(urlAuth.user);
          toast.success("Social login successful");
          
          // Clear the URL parameters without triggering a refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to dashboard
          navigate('/dashboard');
          setIsLoading(false);
          return;
        }
        
        // Otherwise check localStorage
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
      // In a real implementation, this would be an API call
      // The mock implementation will be used for now
      const response = await api.auth.login(email, password);
      
      // Use typed response
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
      // In a real implementation, this would be an API call
      // The mock implementation will be used for now
      const response = await api.auth.register(name, email, password);
      
      // Use typed response
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
      // In a real implementation, this would be an API call
      // For now, simulate a frontend-only flow
      const mockUserData = {
        id: '1',
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`
      };
      
      const response = await api.auth.socialLogin(provider, mockUserData);
      
      // Use typed response
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
      // In a real implementation, this would be an API call
      // The mock implementation will be used for now
      const response = await api.auth.ssoLogin(token);
      
      // Use typed response
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
        ssoLogin
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
