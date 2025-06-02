// frontend/src/app/dashboard-debug/page.tsx
// Create this temporary debug page to see what's happening

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardDebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTests, setApiTests] = useState<any[]>([]);

  useEffect(() => {
    console.log('Dashboard Debug - Auth state:', { user, isAuthenticated, isLoading });
    
    setDebugInfo({
      user,
      isAuthenticated,
      isLoading,
      timestamp: new Date().toISOString(),
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'Server side',
      localStorage: typeof window !== 'undefined' ? {
        accessToken: localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING',
        refreshToken: localStorage.getItem('refresh_token') ? 'EXISTS' : 'MISSING',
      } : 'Server side'
    });

    // Test API calls
    testApiCalls();
  }, [user, isAuthenticated, isLoading]);

  const testApiCalls = async () => {
    const tests: any[] = [];

    // Test 1: Basic API health
    try {
      const response = await fetch('/api/health/');
      const data = await response.json();
      tests.push({
        name: 'API Health Check',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data,
        url: '/api/health/'
      });
    } catch (error: any) {
      tests.push({
        name: 'API Health Check',
        status: 'FAIL',
        error: error.message,
        url: '/api/health/'
      });
    }

    // Test 2: Auth profile
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.ok ? await response.json() : await response.text();
      tests.push({
        name: 'Auth Profile',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data,
        url: '/api/auth/profile/'
      });
    } catch (error: any) {
      tests.push({
        name: 'Auth Profile',
        status: 'FAIL',
        error: error.message,
        url: '/api/auth/profile/'
      });
    }

    // Test 3: Currencies (simple reference data)
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/nextcrm/currencies/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.ok ? await response.json() : await response.text();
      tests.push({
        name: 'Currencies API',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data,
        url: '/api/nextcrm/currencies/'
      });
    } catch (error: any) {
      tests.push({
        name: 'Currencies API',
        status: 'FAIL',
        error: error.message,
        url: '/api/nextcrm/currencies/'
      });
    }

    setApiTests(tests);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auth state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Debug</h1>
        
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className={`p-4 rounded-lg ${isAuthenticated ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="font-medium">
              Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
            {user && (
              <div className="mt-2 text-sm">
                <p>User: {user.username} ({user.email})</p>
                <p>Name: {user.first_name} {user.last_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Connection Tests</h2>
          <div className="space-y-4">
            {apiTests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  test.status === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{test.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    test.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">URL: {test.url}</p>
                {test.error && (
                  <p className="text-red-600 text-sm mb-2">Error: {test.error}</p>
                )}
                {test.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">View Response</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {typeof test.data === 'string' ? test.data : JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Real Dashboard
            </button>
            <button
              onClick={() => testApiCalls()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Rerun API Tests
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Storage & Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}