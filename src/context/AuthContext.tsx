import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from "sonner";
import { api, AuthResponse, extractAuthFromUrl } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RoleType } from '@/types/api.types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles?: RoleType[];
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  mfaEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ requiresMfa?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  socialLogin: (provider: string) => Promise<void>;
  ssoLogin: (token: string) => Promise<void>;
  updateUserData: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUserRoles = (user: any): User => {
  if (!user) return user;
  
  const normalizedUser = { ...user };
  
  if (normalizedUser.roles && !Array.isArray(normalizedUser.roles)) {
    console.warn('Roles is not an array:', normalizedUser.roles);
    normalizedUser.roles = [];
  }
  
  if (normalizedUser.roles) {
    console.log('User roles:', normalizedUser.roles);
  } else {
    console.log('No roles found in user object');
    normalizedUser.roles = [];
  }
  
  return normalizedUser;
};

const NavigationAwareAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  const checkAuth = useCallback(async () => {
    try {
      const urlAuth = extractAuthFromUrl();
      if (urlAuth?.user) {
        const normalizedUser = normalizeUserRoles(urlAuth.user);
        setUser(normalizedUser);
        
        const userWithTimestamp = {
          user: normalizedUser,
          timestamp: new Date().getTime(),
          remember: true
        };
        localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
        localStorage.setItem('auth-token', urlAuth.token);
        
        toast.success("Social login successful");
        window.history.replaceState({}, document.title, window.location.pathname);
        
        navigate('/dashboard');
        return;
      }
      
      const storedUserData = localStorage.getItem('iam-user');
      if (storedUserData) {
        const { user: storedUser, timestamp, remember } = JSON.parse(storedUserData);
        
        const expiryTime = remember ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        const isExpired = new Date().getTime() - timestamp > expiryTime;
        
        if (!isExpired) {
          const normalizedUser = normalizeUserRoles(storedUser);
          setUser(normalizedUser);
          
          try {
            const verifyResponse = await api.auth.verifyToken();
            if (verifyResponse.user) {
              const freshUser = normalizeUserRoles(verifyResponse.user);
              setUser(freshUser);
              
              const updatedUserData = {
                user: freshUser,
                timestamp: new Date().getTime(),
                remember
              };
              localStorage.setItem('iam-user', JSON.stringify(updatedUserData));
            }
          } catch (error) {
            console.warn('Token verification failed, using stored user data');
          }
        } else {
          localStorage.removeItem('iam-user');
          localStorage.removeItem('auth-token');
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('iam-user');
      localStorage.removeItem('auth-token');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'iam-user' || e.key === 'auth-token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const login = async (email: string, password: string, remember: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(email, password);
      
      if (response.requiresMfa) {
        setIsLoading(false);
        return { requiresMfa: true };
      }
      
      setUser(response.user);
      
      const userWithTimestamp = {
        user: response.user,
        timestamp: new Date().getTime(),
        remember
      };
      
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
      localStorage.setItem('auth-token', response.token);
      toast.success("Logged in successfully");
      navigate('/dashboard');
      return {};
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
      
      const userWithTimestamp = {
        user: response.user,
        timestamp: new Date().getTime(),
        remember: false
      };
      
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
      localStorage.setItem('auth-token', response.token);
      toast.success("Account created successfully");
      navigate('/dashboard');
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
      
      const userWithTimestamp = {
        user: response.user,
        timestamp: new Date().getTime(),
        remember: true
      };
      
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
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
      
      const userWithTimestamp = {
        user: response.user,
        timestamp: new Date().getTime(),
        remember: true
      };
      
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
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
    navigate('/auth');
  };

  const updateUserData = (userData: User) => {
    setUser(userData);
    
    const storedUserData = localStorage.getItem('iam-user');
    if (storedUserData) {
      const { remember } = JSON.parse(storedUserData);
      const userWithTimestamp = {
        user: userData,
        timestamp: new Date().getTime(),
        remember
      };
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
    } else {
      const userWithTimestamp = {
        user: userData,
        timestamp: new Date().getTime(),
        remember: false
      };
      localStorage.setItem('iam-user', JSON.stringify(userWithTimestamp));
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    socialLogin,
    ssoLogin,
    updateUserData
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading && currentPath !== '/auth' ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your account...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationAwareAuthProvider>
      {children}
    </NavigationAwareAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
