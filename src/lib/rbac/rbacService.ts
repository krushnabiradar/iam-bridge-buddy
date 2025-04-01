import { Permission, Role, ROLE_PERMISSIONS, EnhancedUser } from './types';

/**
 * Checks if a user has the required permission
 */
export function hasPermission(user: EnhancedUser | null, permission: Permission): boolean {
  if (!user) return false;
  
  // If user has explicit permissions, check those first
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  
  // Otherwise, check permissions based on role
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Checks if a user has at least one of the required permissions
 */
export function hasAnyPermission(user: EnhancedUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Checks if a user has all of the required permissions
 */
export function hasAllPermissions(user: EnhancedUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Checks if a user has a specific role
 */
export function hasRole(user: EnhancedUser | null, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Gets all permissions for a specific role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Gets all permissions for a user based on their role and any additional permissions
 */
export function getUserPermissions(user: EnhancedUser | null): Permission[] {
  if (!user) return [];
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const userPermissions = user.permissions || [];
  
  // Combine and deduplicate permissions
  return [...new Set([...rolePermissions, ...userPermissions])];
}
