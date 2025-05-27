// File: src/app/login/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/forms/LoginForm';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleLoginSuccess = () => {
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                {APP_NAME}
              </h1>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your account to access your CRM dashboard
              </p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm onSuccess={handleLoginSuccess} />

          {/* Footer */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Contact your system administrator for assistance or{' '}
                <a
                  href="mailto:support@nextcrm.com"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  email support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image/Graphics */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-12">
            <div className="max-w-md">
              <h3 className="text-3xl font-bold text-white mb-6">
                Manage your contracts with confidence
              </h3>
              <p className="text-lg text-white/90 mb-8">
                Streamline your CRM operations with our comprehensive contract 
                management system designed for modern businesses.
              </p>
              
              {/* Features List */}
              <ul className="space-y-4 text-white/80">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Complete contract lifecycle management</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Advanced analytics and reporting</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>GDPR compliant data handling</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Multi-language support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}