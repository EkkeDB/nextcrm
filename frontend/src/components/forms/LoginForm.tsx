// File: src/components/forms/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData, LoginFormErrors } from '@/types/auth';
import { authService } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: process.env.NODE_ENV === 'development' ? 'admin@nextcrm.com' : '',
    password: process.env.NODE_ENV === 'development' ? 'password123' : '',
    remember_me: false,
  });
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: LoginFormErrors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!authService.validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
        remember_me: formData.remember_me,
      });
      
      onSuccess?.();
    } catch (error: any) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Global Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={cn(
              'pl-10',
              formErrors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
        </div>
        {formErrors.email && (
          <p className="text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={cn(
              'pl-10 pr-10',
              formErrors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Enter your password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-sm text-red-600">{formErrors.password}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          id="remember_me"
          name="remember_me"
          type="checkbox"
          checked={formData.remember_me}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          disabled={isSubmitting}
        />
        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
          Remember me for 7 days
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      {/* Additional Links */}
      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;