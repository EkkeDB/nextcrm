// File: src/types/auth.ts

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'manager' | 'user';
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  company?: string;
  position?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

// Form validation schemas
export interface LoginFormData {
  username: string;
  password: string;
  remember_me: boolean;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}