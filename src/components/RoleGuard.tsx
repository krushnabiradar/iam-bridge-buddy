
import React from 'react';
import { useAuthorization } from '@/context/AuthorizationContext';

interface RoleGuardProps {
  role: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Component to conditionally render children based on user roles
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  role,
  fallback = null,
  children
}) => {
  const { hasRole } = useAuthorization();

  if (hasRole(role)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default RoleGuard;
