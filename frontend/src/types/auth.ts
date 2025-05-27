// File: src/types/auth.ts

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}