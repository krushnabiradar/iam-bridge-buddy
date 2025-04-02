
import React from 'react';
import { useAuthorization } from '@/context/AuthorizationContext';
import { Loader2, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AccessGuardProps {
  /**
   * The required permission or role
   */
  access: string;
  /**
   * Type of access check: 'role' or 'permission'
   */
  type: 'role' | 'permission';
  /**
   * Content to render if user lacks permission/role
   */
  fallback?: React.ReactNode;
  /**
   * Content to render if user has permission/role
   */
  children: React.ReactNode;
  /**
   * Optional behavior to show nothing instead of fallback when access check fails
   */
  hideOnFail?: boolean;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
}

/**
 * Unified component to conditionally render content based on user roles or permissions
 */
const AccessGuard: React.FC<AccessGuardProps> = ({
  access,
  type,
  fallback,
  children,
  hideOnFail = false,
  loadingComponent
}) => {
  const { hasRole, hasPermission, isLoading } = useAuthorization();

  // Handle loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  // Check access based on type
  const hasAccess = type === 'role' ? hasRole(access) : hasPermission(access);

  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (hideOnFail) {
    return null;
  }
  
  // If no custom fallback is provided, use a default one
  if (!fallback) {
    return (
      <Card className="border-dashed border-muted-foreground/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Access Restricted</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {type === 'role' 
              ? `You need the ${access} role to access this content` 
              : `You need the ${access} permission to access this content`}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return <>{fallback}</>;
};

export default AccessGuard;
