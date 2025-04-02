
import React from 'react';
import { useAuthorization } from '@/context/AuthorizationContext';

interface PermissionGuardProps {
  /**
   * The permission required to render children
   */
  permission: string;
  /**
   * Content to render if user lacks permission
   */
  fallback?: React.ReactNode;
  /**
   * Content to render if user has permission
   */
  children: React.ReactNode;
  /**
   * Optional behavior to show nothing instead of fallback when permission check fails
   */
  hideOnFail?: boolean;
}

/**
 * Component to conditionally render children based on user permissions
 * @example
 * <PermissionGuard permission="users:create">
 *   <CreateUserButton />
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission,
  fallback = null,
  children,
  hideOnFail = false
}) => {
  const { hasPermission, isLoading } = useAuthorization();

  // Handle loading state
  if (isLoading) {
    return null;
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  if (hideOnFail) {
    return null;
  }
  
  return <>{fallback}</>;
};

export default PermissionGuard;
