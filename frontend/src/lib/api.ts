import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  description?: string;
  payerId: string;
  isShared: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateExpenseData {
  title: string;
  amount: string;
  description?: string;
  isShared?: boolean;
  imageUrl?: string;
}

export interface CreateSettlementData {
  payeeId: string;
  amount: string;
  description?: string;
  imageUrl?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async (): Promise<{ expenses: Expense[] }> => {
    const response = await api.get('/expenses');
    return response.data;
  },
  
  create: async (data: CreateExpenseData) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  update: async (id: string, data: CreateExpenseData) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// Settlements API
export const settlementsAPI = {
  getAll: async (): Promise<{ settlements: Settlement[] }> => {
    const response = await api.get('/settlements');
    return response.data;
  },
  
  create: async (data: CreateSettlementData) => {
    const response = await api.post('/settlements', data);
    return response.data;
  },
};
