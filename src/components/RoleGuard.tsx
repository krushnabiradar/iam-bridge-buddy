
import React from 'react';
import { useAuthorization } from '@/context/AuthorizationContext';

interface RoleGuardProps {
  /**
   * The role required to render children
   */
  role: string;
  /**
   * Content to render if user lacks role
   */
  fallback?: React.ReactNode;
  /**
   * Content to render if user has role
   */
  children: React.ReactNode;
  /**
   * Optional behavior to show nothing instead of fallback when role check fails
   */
  hideOnFail?: boolean;
}

/**
 * Component to conditionally render children based on user roles
 * @example
 * <RoleGuard role="admin">
 *   <AdminPanel />
 * </RoleGuard>
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  role,
  fallback = null,
  children,
  hideOnFail = false
}) => {
  const { hasRole, isLoading } = useAuthorization();

  // Handle loading state
  if (isLoading) {
    return null;
  }

  if (hasRole(role)) {
    return <>{children}</>;
  }
  
  if (hideOnFail) {
    return null;
  }
  
  return <>{fallback}</>;
};

export default RoleGuard;
