
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
  };
  token: string;
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
  },
  user: {
    getProfile: () => apiRequest('/user/profile'),
    updateProfile: (data: any) => 
      apiRequest('/user/profile', { 
        method: 'PUT', 
        body: data 
      }),
  },
};
