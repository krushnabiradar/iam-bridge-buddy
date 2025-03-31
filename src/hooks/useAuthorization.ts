
import { useAuth } from '@/context/AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  hasRole,
  getUserPermissions
} from '@/lib/rbac/rbacService';
import { Permission, Role, EnhancedUser } from '@/lib/rbac/types';

export function useAuthorization() {
  const { user } = useAuth();
  
  // Convert current user to EnhancedUser
  const enhancedUser: EnhancedUser | null = user ? {
    ...user,
    role: (user.role as Role) || 'user', // Default to 'user' if no role specified
  } : null;
  
  return {
    hasPermission: (permission: Permission) => hasPermission(enhancedUser, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(enhancedUser, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(enhancedUser, permissions),
    hasRole: (role: Role) => hasRole(enhancedUser, role),
    getUserPermissions: () => getUserPermissions(enhancedUser),
    isAdmin: () => enhancedUser?.role === 'admin',
    isManager: () => enhancedUser?.role === 'admin' || enhancedUser?.role === 'manager',
    user: enhancedUser
  };
}
