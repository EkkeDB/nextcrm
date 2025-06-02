'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { AuthUser, AuthState, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthHelpers = () => {
  const requireAuth = () => {
    return authService.isAuthenticated();
  };

  const getToken = () => {
    return authService.getToken();
  };

  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  return {
    requireAuth,
    getToken,
    isTokenExpired,
  };
};

// Add useRole hook that was referenced in AuthGuard
export const useRole = (requiredRoles: string[] = []) => {
  const { user } = useAuth();
  
  if (requiredRoles.length === 0) return true;
  
  // For now, just check if user is staff/admin
  // You can expand this based on your role system
  if (requiredRoles.includes('admin')) {
    return user?.username === 'admin'; // Simple check, improve as needed
  }
  
  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
        return;
      }

      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      await authService.logout();
      setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      
      // Store tokens using the token manager
      const { tokenManager } = await import('@/lib/api');
      tokenManager.setTokens(response.tokens.access, response.tokens.refresh);

      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed',
      }));
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};