
// API utility for interacting with the backend

export const API_BASE_URL = 'http://localhost:5000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

// Define response types
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles?: any[];
    isActive?: boolean;
    lastLogin?: string;
  };
  token: string;
}

// Function to extract authentication token from URL
export function extractAuthFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userData = urlParams.get('userData');
  
  if (token) {
    localStorage.setItem('auth-token', token);
    
    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('iam-user', JSON.stringify(user));
        return { token, user };
      } catch (error) {
        console.error('Failed to parse user data from URL', error);
      }
    }
    
    return { token };
  }
  
  return null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { 
    method = 'GET', 
    body, 
    headers = {},
    credentials = 'include' 
  } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get auth token from localStorage (if available)
  const token = localStorage.getItem('auth-token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    // For DELETE requests that might not return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) => 
      apiRequest<AuthResponse>('/auth/login', { 
        method: 'POST', 
        body: { email, password } 
      }),
    register: (name: string, email: string, password: string) => 
      apiRequest<AuthResponse>('/auth/register', { 
        method: 'POST', 
        body: { name, email, password } 
      }),
    logout: () => 
      apiRequest('/auth/logout', { method: 'POST' }),
    socialLogin: (provider: string, userData: any) => 
      apiRequest<AuthResponse>('/auth/social', { 
        method: 'POST', 
        body: { provider, userData } 
      }),
    ssoLogin: (token: string) => 
      apiRequest<AuthResponse>('/auth/sso', { 
        method: 'POST', 
        body: { token } 
      }),
    verifyToken: () => 
      apiRequest<AuthResponse>('/auth/verify-token', { method: 'GET' }),
    requestPasswordReset: (email: string) => 
      apiRequest<{ message: string }>('/auth/forgot-password', { 
        method: 'POST', 
        body: { email } 
      }),
    verifyPasswordResetOtp: (email: string, otp: string) => 
      apiRequest<{ message: string }>('/auth/verify-otp', { 
        method: 'POST', 
        body: { email, otp } 
      }),
    resetPassword: (email: string, password: string) => 
      apiRequest<{ message: string }>('/auth/reset-password', { 
        method: 'POST', 
        body: { email, password } 
      }),
  },
  user: {
    getProfile: () => apiRequest('/user/profile'),
    updateProfile: (data: any) => 
      apiRequest('/user/profile', { 
        method: 'PUT', 
        body: data 
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiRequest<{ message: string }>('/user/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword }
      }),
  },
  iam: {
    getAllRoles: (): Promise<RolesResponse> => 
      apiRequest<RolesResponse>('/iam/roles'),
    createRole: (data: any): Promise<{ message: string; role: any }> => 
      apiRequest('/iam/roles', { 
        method: 'POST', 
        body: data 
      }),
    updateRole: (id: string, data: any): Promise<{ message: string; role: any }> => 
      apiRequest(`/iam/roles/${id}`, { 
        method: 'PUT', 
        body: data 
      }),
    deleteRole: (id: string): Promise<{ message: string }> => 
      apiRequest(`/iam/roles/${id}`, { 
        method: 'DELETE' 
      }),
    
    getAllPermissions: (): Promise<PermissionsResponse> => 
      apiRequest<PermissionsResponse>('/iam/permissions'),
    createPermission: (data: any): Promise<{ message: string; permission: any }> => 
      apiRequest('/iam/permissions', { 
        method: 'POST', 
        body: data 
      }),
    
    getUsersWithRoles: (): Promise<UsersResponse> => 
      apiRequest<UsersResponse>('/iam/users'),
    getUserWithRoles: (id: string): Promise<{ message: string; user: any }> => 
      apiRequest(`/iam/users/${id}`),
    assignRoleToUser: (userId: string, roleId: string): Promise<{ message: string; user: any }> => 
      apiRequest('/iam/users/roles/assign', { 
        method: 'POST', 
        body: { userId, roleId } 
      }),
    removeRoleFromUser: (userId: string, roleId: string): Promise<{ message: string; user: any }> => 
      apiRequest('/iam/users/roles/remove', { 
        method: 'POST', 
        body: { userId, roleId } 
      }),
    updateUserStatus: (userId: string, isActive: boolean): Promise<{ message: string; user: any }> => 
      apiRequest(`/iam/users/${userId}/status`, { 
        method: 'PUT', 
        body: { isActive } 
      })
  }
};

// Import the response types from our types file
import { RolesResponse, PermissionsResponse, UsersResponse } from '@/types/api.types';
