
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AuthorizationContextType {
  hasRole: (roleName: string) => boolean;
  hasPermission: (permission: string) => boolean;
  userRoles: string[];
  userPermissions: string[];
  isLoading: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Extract roles and permissions from user
      const roles = user.roles || [];
      
      // Create array of role names
      const roleNames = roles.map((role: any) => role.name);
      setUserRoles(roleNames);
      
      // Create array of all permissions from all roles
      const permissions = roles.reduce((acc: string[], role: any) => {
        return [...acc, ...(role.permissions || [])];
      }, []);
      
      // Remove duplicates from permissions
      const uniquePermissions = [...new Set(permissions)];
      setUserPermissions(uniquePermissions);
    } else {
      setUserRoles([]);
      setUserPermissions([]);
    }
    setIsLoading(false);
  }, [user, isAuthenticated]);

  const hasRole = (roleName: string): boolean => {
    return userRoles.includes(roleName);
  };

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  return (
    <AuthorizationContext.Provider value={{ 
      hasRole, 
      hasPermission, 
      userRoles, 
      userPermissions,
      isLoading
    }}>
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
};

// Higher-order component to protect routes based on role
export const withRole = (WrappedComponent: React.ComponentType<any>, requiredRole: string) => {
  return (props: any) => {
    const { hasRole, isLoading } = useAuthorization();
    const { user, isAuthenticated } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated || !user) {
      // User not authenticated
      return <div>Please login to access this page</div>;
    }
    
    if (!hasRole(requiredRole)) {
      // User doesn't have required role
      return <div>Access denied: Insufficient permissions</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Higher-order component to protect routes based on permission
export const withPermission = (WrappedComponent: React.ComponentType<any>, requiredPermission: string) => {
  return (props: any) => {
    const { hasPermission, isLoading } = useAuthorization();
    const { user, isAuthenticated } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated || !user) {
      // User not authenticated
      return <div>Please login to access this page</div>;
    }
    
    if (!hasPermission(requiredPermission)) {
      // User doesn't have required permission
      return <div>Access denied: Insufficient permissions</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};
