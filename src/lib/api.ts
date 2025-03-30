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
    role?: string;
    lastLogin?: string;
  };
  token: string;
}

export interface EmployeeResponse {
  message: string;
  employee: {
    _id: string;
    userId: {
      name: string;
      email: string;
      avatar?: string;
    };
    employeeId: string;
    department?: {
      _id: string;
      name: string;
    };
    position?: {
      _id: string;
      title: string;
    };
    dateOfJoining: string;
    status: 'active' | 'onLeave' | 'terminated' | 'retired';
  };
}

export interface DepartmentResponse {
  message: string;
  department: {
    _id: string;
    name: string;
    description?: string;
    manager?: {
      _id: string;
      employeeId: string;
    };
  };
}

export interface PositionResponse {
  message: string;
  position: {
    _id: string;
    title: string;
    department: {
      _id: string;
      name: string;
    };
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    salaryRange?: {
      min?: number;
      max?: number;
    };
    isActive: boolean;
  };
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
  hrms: {
    getDepartments: () => 
      apiRequest<{ message: string, departments: any[] }>('/hrms/departments'),
    getDepartment: (id: string) => 
      apiRequest<DepartmentResponse>(`/hrms/departments/${id}`),
    createDepartment: (data: {name: string, description?: string, manager?: string}) => 
      apiRequest<DepartmentResponse>('/hrms/departments', {
        method: 'POST',
        body: data
      }),
    updateDepartment: (id: string, data: {name?: string, description?: string, manager?: string}) => 
      apiRequest<DepartmentResponse>(`/hrms/departments/${id}`, {
        method: 'PUT',
        body: data
      }),
    deleteDepartment: (id: string) => 
      apiRequest<{message: string}>(`/hrms/departments/${id}`, {
        method: 'DELETE'
      }),
      
    getPositions: () => 
      apiRequest<{ message: string, positions: any[] }>('/hrms/positions'),
    getPosition: (id: string) => 
      apiRequest<PositionResponse>(`/hrms/positions/${id}`),
    createPosition: (data: any) => 
      apiRequest<PositionResponse>('/hrms/positions', {
        method: 'POST',
        body: data
      }),
    updatePosition: (id: string, data: any) => 
      apiRequest<PositionResponse>(`/hrms/positions/${id}`, {
        method: 'PUT',
        body: data
      }),
    deletePosition: (id: string) => 
      apiRequest<{message: string}>(`/hrms/positions/${id}`, {
        method: 'DELETE'
      }),
      
    getEmployees: () => 
      apiRequest<{ message: string, employees: any[] }>('/hrms/employees'),
    getEmployee: (id: string) => 
      apiRequest<EmployeeResponse>(`/hrms/employees/${id}`),
    createEmployee: (data: any) => 
      apiRequest<EmployeeResponse>('/hrms/employees', {
        method: 'POST',
        body: data
      }),
    updateEmployee: (id: string, data: any) => 
      apiRequest<EmployeeResponse>(`/hrms/employees/${id}`, {
        method: 'PUT',
        body: data
      }),
    uploadDocument: (id: string, data: {title: string, fileUrl: string}) => 
      apiRequest<EmployeeResponse>(`/hrms/employees/${id}/documents`, {
        method: 'POST',
        body: data
      }),
    deleteEmployee: (id: string) => 
      apiRequest<{message: string}>(`/hrms/employees/${id}`, {
        method: 'DELETE'
      }),
  }
};
