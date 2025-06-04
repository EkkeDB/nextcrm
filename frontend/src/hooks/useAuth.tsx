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

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto-refresh token when near expiry (but only if authenticated)
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkAndRefresh = async () => {
      // Only check if we're actually authenticated and near expiry
      if (authService.isAuthenticated() && authService.isNearExpiry(5)) {
        if (authService.canRefreshToken()) {
          try {
            await authService.refreshToken();
            console.log('🔄 Token refreshed proactively');
          } catch (error) {
            console.error('🔄 Proactive token refresh failed:', error);
            // If refresh fails, logout user
            await logout();
          }
        }
      }
    };

    // Check every 5 minutes, but only if authenticated
    const refreshInterval = setInterval(checkAndRefresh, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // First check if we have valid tokens locally
      if (!authService.isAuthenticated()) {
        // No valid access token
        if (authService.canRefreshToken()) {
          // Try to refresh
          try {
            await authService.refreshToken();
          } catch (error) {
            // Refresh failed, user needs to login
            setAuthState({ 
              user: null, 
              isLoading: false, 
              isAuthenticated: false, 
              error: null 
            });
            return;
          }
        } else {
          // No valid tokens at all
          setAuthState({ 
            user: null, 
            isLoading: false, 
            isAuthenticated: false, 
            error: null 
          });
          return;
        }
      }

      // Now we should have a valid access token, get user info
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Clear everything on auth failure
      setAuthState({ 
        user: null, 
        isLoading: false, 
        isAuthenticated: false, 
        error: null 
      });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.login({ username, password });

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
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({ 
        user: null, 
        isLoading: false, 
        isAuthenticated: false, 
        error: null 
      });
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