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
  isPaid?: boolean; // New field for payment status
  paymentDate?: string | null; // New field for payment date
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

export interface PaymentHistory {
  id: string;
  settlementId: string;
  payerId: string;
  payeeId: string;
  amount: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'digital_wallet';
  status: 'pending' | 'completed' | 'failed';
  description?: string | null;
  paymentProofUrl?: string | null;
  paymentDate: string;
  createdAt: string;
  payer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaidExpense {
  id: string;
  amountPaid: string;
  expense: {
    id: string;
    title: string;
    amount: string;
    description?: string;
    createdAt: string;
  };
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
  paymentMethod?: 'bank_transfer' | 'cash' | 'digital_wallet';
  expenseIds?: string[]; // Array of expense IDs to mark as paid
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
  paymentHistory?: PaymentHistory;
}

export interface PaymentHistoryResponse {
  paymentHistory: PaymentHistory[];
}

export interface PaymentDetailsResponse {
  payment: PaymentHistory;
  paidExpenses: PaidExpense[];
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

  getUnpaid: async (): Promise<ExpensesResponse> => {
    const response = await api.get('/api/expenses/unpaid');
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

  getPaymentHistory: async (): Promise<PaymentHistoryResponse> => {
    const response = await api.get('/api/settlements/payment-history');
    return response.data;
  },

  getPaymentDetails: async (id: string): Promise<PaymentDetailsResponse> => {
    const response = await api.get(`/api/settlements/payment-history/${id}`);
    return response.data;
  },
};

// Utility function to handle API errors
export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data?.error) {
      // Handle specific error messages
      const errorMessage = axiosError.response.data.error;
      if (errorMessage === 'Invalid credentials') {
        return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      }
      return errorMessage;
    }
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Dữ liệu không hợp lệ';
        case 401:
          return 'Thông tin đăng nhập không đúng';
        case 403:
          return 'Không có quyền truy cập';
        case 404:
          return 'Không tìm thấy tài nguyên';
        case 500:
          return 'Lỗi máy chủ nội bộ';
        default:
          return 'Đã xảy ra lỗi không mong muốn';
      }
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Hết thời gian chờ kết nối';
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
    }
  }
  return 'Đã xảy ra lỗi không mong muốn';
};
