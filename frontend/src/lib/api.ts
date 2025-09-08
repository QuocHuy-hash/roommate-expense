import axios, { AxiosError } from 'axios';

// API Base URL - adjust this based on your backend configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:3001';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Reduced to 3 seconds for faster fallback
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Redirect to login - adjust path as needed
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Types based on your API documentation
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
}

export interface Expense {
  id: string;
  title: string;
  amount: string; // Changed to string as per API docs
  description?: string | null;
  payerId: string;
  isShared: boolean;
  isSettled: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  payerFirstName?: string | null;
  payerLastName?: string | null;
  payerEmail?: string | null;
}

export interface Settlement {
  id: string;
  payerId: string;
  payeeId: string;
  amount: string; // Changed to string as per API docs
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: string;
  description?: string;
  isShared?: boolean;
  imageUrl?: string;
}

export interface UpdateExpenseRequest {
  title: string;
  amount: string;
  description?: string;
  isShared?: boolean;
  imageUrl?: string;
}

export interface CreateSettlementRequest {
  payeeId: string;
  amount: string;
  description?: string;
  imageUrl?: string;
}

// Response types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
}

export interface ExpenseResponse {
  message: string;
  expense: Expense;
}

export interface SettlementsResponse {
  settlements: Settlement[];
}

export interface SettlementResponse {
  message: string;
  settlement: Settlement;
}

export interface ErrorResponse {
  error: string;
}

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async (): Promise<ExpensesResponse> => {
    const response = await api.get('/api/expenses');
    return response.data;
  },
  
  create: async (data: CreateExpenseRequest): Promise<ExpenseResponse> => {
    const response = await api.post('/api/expenses', data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateExpenseRequest): Promise<ExpenseResponse> => {
    const response = await api.put(`/api/expenses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  },

  updateSettlementStatus: async (id: string, isSettled: boolean): Promise<ExpenseResponse> => {
    const response = await api.patch(`/api/expenses/${id}/settle`, { isSettled });
    return response.data;
  },
};

// Settlements API
export const settlementsAPI = {
  getAll: async (): Promise<SettlementsResponse> => {
    const response = await api.get('/api/settlements');
    return response.data;
  },
  
  create: async (data: CreateSettlementRequest): Promise<SettlementResponse> => {
    const response = await api.post('/api/settlements', data);
    return response.data;
  },
};

// Utility function to handle API errors
export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Invalid request data';
        case 401:
          return 'Authentication required';
        case 403:
          return 'Access forbidden';
        case 404:
          return 'Resource not found';
        case 500:
          return 'Internal server error';
        default:
          return 'An unexpected error occurred';
      }
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
  }
  return 'An unexpected error occurred';
};
