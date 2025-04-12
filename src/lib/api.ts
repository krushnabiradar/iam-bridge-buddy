
// Import the response types before they're used
import { RolesResponse, PermissionsResponse, UsersResponse } from '@/types/api.types';
import { 
  Notification, 
  NotificationPreferences, 
  NotificationCountResponse, 
  NotificationsResponse, 
  NotificationPreferencesResponse 
} from '@/types/notification.types';

// API utility for interacting with the backend
export const API_BASE_URL = 'http://localhost:5000/api';

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
    mfaEnabled?: boolean;
  };
  token: string;
  requiresMfa?: boolean;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

/**
 * Extract authentication token from URL
 * Useful for social login redirects
 */
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

/**
 * Helper to log API requests and responses for debugging
 */
export const logApiCall = (endpoint: string, method: string, response: any, error?: any) => {
  if (error) {
    console.error(`API ${method} ${endpoint} failed:`, error);
    return;
  }
  console.log(`API ${method} ${endpoint} response:`, response);
};

/**
 * Main API request function with improved error handling and typing
 */
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
    console.log(`Making ${method} request to ${endpoint}`, body ? 'with body:' : '', body || '');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials
    });

    // Better error handling with detailed information
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'API request failed') as ApiError;
      error.status = response.status;
      error.code = errorData.code;
      error.data = errorData;
      throw error;
    }

    // For DELETE requests that might not return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }

    const data = await response.json();
    logApiCall(endpoint, method, data);
    return data;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * API utility functions grouped by domain
 */
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
      apiRequest<{message: string}>('/auth/logout', { method: 'POST' }),
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
    generateMfaSecret: () => 
      apiRequest<{ message: string, qrCodeUrl: string, secretKey: string }>('/auth/mfa/setup', { 
        method: 'GET' 
      }),
    enableMfa: (verificationCode: string) => 
      apiRequest<{ message: string, success: boolean }>('/auth/mfa/enable', { 
        method: 'POST', 
        body: { verificationCode } 
      }),
    disableMfa: () => 
      apiRequest<{ message: string, success: boolean }>('/auth/mfa/disable', { 
        method: 'POST' 
      }),
    verifyMfa: (email: string, password: string, verificationCode: string, remember: boolean = false) => 
      apiRequest<AuthResponse>('/auth/mfa/verify', { 
        method: 'POST', 
        body: { email, password, verificationCode, remember } 
      }),
  },
  user: {
    getProfile: () => apiRequest<{message: string, user: any}>('/user/profile'),
    updateProfile: (data: any) => 
      apiRequest<{message: string, user: any}>('/user/profile', { 
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
    // Roles
    getAllRoles: () => 
      apiRequest<RolesResponse>('/iam/roles'),
    getRoleById: (id: string) =>
      apiRequest<{message: string, role: any}>(`/iam/roles/${id}`),
    createRole: (data: any) => 
      apiRequest<{ message: string; role: any }>('/iam/roles', { 
        method: 'POST', 
        body: data 
      }),
    updateRole: (id: string, data: any) => 
      apiRequest<{ message: string; role: any }>(`/iam/roles/${id}`, { 
        method: 'PUT', 
        body: data 
      }),
    deleteRole: (id: string) => 
      apiRequest<{ message: string }>(`/iam/roles/${id}`, { 
        method: 'DELETE' 
      }),
    
    // Permissions
    getAllPermissions: () => 
      apiRequest<PermissionsResponse>('/iam/permissions'),
    getPermissionById: (id: string) =>
      apiRequest<{message: string, permission: any}>(`/iam/permissions/${id}`),
    createPermission: (data: any) => 
      apiRequest<{ message: string; permission: any }>('/iam/permissions', { 
        method: 'POST', 
        body: data 
      }),
    
    // Users
    getUsersWithRoles: () => 
      apiRequest<UsersResponse>('/iam/users'),
    getUserWithRoles: (id: string) => 
      apiRequest<{ message: string; user: any }>(`/iam/users/${id}`),
    assignRoleToUser: (userId: string, roleId: string) => 
      apiRequest<{ message: string; user: any }>('/iam/users/roles/assign', { 
        method: 'POST', 
        body: { userId, roleId } 
      }),
    removeRoleFromUser: (userId: string, roleId: string) => 
      apiRequest<{ message: string; user: any }>('/iam/users/roles/remove', { 
        method: 'POST', 
        body: { userId, roleId } 
      }),
    updateUserStatus: (userId: string, isActive: boolean) => 
      apiRequest<{ message: string; user: any }>(`/iam/users/${userId}/status`, { 
        method: 'PUT', 
        body: { isActive } 
      })
  },
  notifications: {
    getAll: (limit = 20, skip = 0) => 
      apiRequest<NotificationsResponse>(`/notifications?limit=${limit}&skip=${skip}`),
    getUnreadCount: () => 
      apiRequest<NotificationCountResponse>('/notifications/unread-count'),
    markAsRead: (id: string) => 
      apiRequest<{ message: string; notification: Notification }>(`/notifications/${id}/read`, { 
        method: 'PUT' 
      }),
    markAllAsRead: () => 
      apiRequest<{ message: string; modifiedCount: number }>('/notifications/mark-all-read', { 
        method: 'PUT' 
      }),
    getPreferences: () => 
      apiRequest<NotificationPreferencesResponse>('/notifications/preferences'),
    updatePreferences: (data: { 
      email?: Partial<NotificationPreferences['email']>, 
      inApp?: Partial<NotificationPreferences['inApp']> 
    }) => 
      apiRequest<NotificationPreferencesResponse>('/notifications/preferences', { 
        method: 'PUT', 
        body: data 
      })
  }
};
