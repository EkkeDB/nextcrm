// File: src/components/providers/AuthProvider.tsx

'use client';

import React, { createContext, useCallback, useEffect, useReducer, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { AuthUser, AuthState, AuthContextType, LoginCredentials } from '@/types/auth';

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing session
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, tokens } = await authService.login(credentials);
      
      // Store tokens using the API client method
      const { apiClient } = await import('@/lib/api');
      apiClient.setTokens(tokens.access, tokens.refresh);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error; // Re-throw so components can handle it
    }
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await authService.logout();
      
      dispatch({ type: 'LOGOUT' });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
      router.push('/login');
    }
  }, [router]);

  // Refresh auth (check if user is still authenticated)
  const refreshAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if we have a token
      if (!authService.isAuthenticated()) {
        dispatch({ type: 'LOGOUT' });
        return;
      }
      
      // Get current user from API
      const user = await authService.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('Auth refresh error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
      // Clear tokens and redirect to login
      await authService.logout();
      router.push('/login');
    }
  }, [router]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        await refreshAuth();
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    checkAuth();
  }, [refreshAuth]);

  // Auto-refresh token periodically (optional)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      refreshAuth();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, refreshAuth]);

  const contextValue: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;