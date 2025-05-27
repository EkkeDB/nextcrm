// File: src/hooks/useAuth.ts

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/components/providers/AuthProvider';
import { AuthContextType } from '@/types/auth';

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

/**
 * Hook to check if user has specific role(s)
 */
export function useRole(requiredRoles?: string | string[]): boolean {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  if (!requiredRoles) {
    return true;
  }
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Role hierarchy: admin > manager > user
  const roleHierarchy: Record<string, number> = {
    'admin': 3,
    'manager': 2,
    'user': 1,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = Math.min(...roles.map(role => roleHierarchy[role] || 0));
  
  return userLevel >= requiredLevel;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  return useRole('admin');
}

/**
 * Hook to check if user is manager or above
 */
export function useIsManager(): boolean {
  return useRole(['admin', 'manager']);
}

/**
 * Hook for auth-related utilities
 */
export function useAuthHelpers() {
  const { user } = useAuth();
  
  const getUserDisplayName = (): string => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email;
  };
  
  const getUserInitials = (): string => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };
  
  const getRoleDisplayName = (): string => {
    if (!user) return '';
    
    const roleNames: Record<string, string> = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'user': 'User',
    };
    return roleNames[user.role] || user.role;
  };
  
  const getRoleColor = (): string => {
    if (!user) return 'text-gray-600 bg-gray-100';
    
    const roleColors: Record<string, string> = {
      'admin': 'text-red-600 bg-red-100',
      'manager': 'text-blue-600 bg-blue-100',
      'user': 'text-green-600 bg-green-100',
    };
    return roleColors[user.role] || 'text-gray-600 bg-gray-100';
  };
  
  return {
    user,
    getUserDisplayName,
    getUserInitials,
    getRoleDisplayName,
    getRoleColor,
  };
}