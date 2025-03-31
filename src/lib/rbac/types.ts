
// Role and permission types for RBAC
export type Permission = 
  | 'create:user'
  | 'read:user'
  | 'update:user'
  | 'delete:user'
  | 'read:users'
  | 'create:organization'
  | 'read:organization'
  | 'update:organization'
  | 'delete:organization'
  | 'invite:member'
  | 'remove:member'
  | 'assign:role';

export type Role = 'admin' | 'manager' | 'user' | 'guest';

// Map of roles to their permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'create:user',
    'read:user',
    'update:user',
    'delete:user',
    'read:users',
    'create:organization',
    'read:organization',
    'update:organization',
    'delete:organization',
    'invite:member',
    'remove:member',
    'assign:role'
  ],
  manager: [
    'read:user',
    'update:user',
    'read:users',
    'read:organization',
    'update:organization',
    'invite:member',
    'remove:member'
  ],
  user: [
    'read:user',
    'update:user',
    'read:organization'
  ],
  guest: [
    'read:user'
  ]
};

// Tenant/Organization type for multi-tenancy (foundation)
export interface Tenant {
  id: string;
  name: string;
  plan?: string;
  settings?: Record<string, any>;
}

// Enhanced user type with role and tenant information
export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  permissions?: Permission[];
  tenantId?: string;
  lastLogin?: string;
}
