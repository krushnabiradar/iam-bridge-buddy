
import React from 'react';
import { useAuthorization } from '@/context/AuthorizationContext';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Component to conditionally render children based on user permissions
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission,
  fallback = null,
  children
}) => {
  const { hasPermission } = useAuthorization();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionGuard;
