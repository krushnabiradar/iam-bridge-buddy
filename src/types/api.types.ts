
// API Response Types
export interface RoleType {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionType {
  _id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  _id: string;
  id: string;
  name: string;
  email: string;
  roles: RoleType[];
  isActive: boolean;
  avatar?: string;
  socialProvider?: string | null;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  message: string;
  users: UserType[];
}

export interface RolesResponse {
  message: string;
  roles: RoleType[];
}

export interface PermissionsResponse {
  message: string;
  permissions: PermissionType[];
}
