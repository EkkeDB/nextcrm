// File: src/components/guards/AuthGuard.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useRole } from '@/hooks/useAuth';
import { ProtectedRouteProps } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasRequiredRole = useRole(requiredRoles);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Save the attempted URL to redirect back after login
      const returnUrl = pathname !== '/login' ? pathname : '/dashboard';
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // If authenticated but doesn't have required role, show access denied
    if (isAuthenticated && requiredRoles.length > 0 && !hasRequiredRole) {
      router.push('/access-denied');
      return;
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, router, pathname, requiredRoles.length]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If authenticated but no required role, show access denied
  if (requiredRoles.length > 0 && !hasRequiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

/**
 * HOC version of AuthGuard for easier usage
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRoles={requiredRoles}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Simple auth check component for conditional rendering
 */
interface AuthCheckProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthCheck({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  requireAuth = true 
}: AuthCheckProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const hasRequiredRole = useRole(requiredRoles);

  // Still loading
  if (isLoading) {
    return <LoadingSpinner size="small" />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (isAuthenticated && requiredRoles.length > 0 && !hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default AuthGuard;