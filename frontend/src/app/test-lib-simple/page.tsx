// frontend/src/app/test-lib-simple/page.tsx
// Simple test that doesn't trigger auth redirects

'use client';

import { useState } from 'react';

export default function TestLibSimplePage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runSimpleTests = () => {
    const results: any[] = [];

    // Test 1: Utils import
    try {
      const { cn, formatCurrency, formatDate } = require('@/lib/utils');
      const testClasses = cn('text-red-500', 'font-bold');
      const testCurrency = formatCurrency(1234.56, 'EUR');
      const testDate = formatDate(new Date());
      
      results.push({
        test: 'Utils Functions',
        status: 'PASS',
        details: { cn: testClasses, formatCurrency: testCurrency, formatDate: testDate }
      });
    } catch (error: any) {
      results.push({
        test: 'Utils Functions',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 2: Constants import
    try {
      const { CONTRACT_STATUS_OPTIONS, API_ENDPOINTS } = require('@/lib/constants');
      results.push({
        test: 'Constants',
        status: CONTRACT_STATUS_OPTIONS && API_ENDPOINTS ? 'PASS' : 'FAIL',
        details: {
          hasStatusOptions: !!CONTRACT_STATUS_OPTIONS,
          hasApiEndpoints: !!API_ENDPOINTS,
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Constants',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 3: Auth import
    try {
      const { authService } = require('@/lib/auth');
      results.push({
        test: 'Auth Service',
        status: authService ? 'PASS' : 'FAIL',
        details: {
          hasAuthService: !!authService,
          hasIsAuthenticated: typeof authService?.isAuthenticated === 'function',
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Auth Service',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 4: API imports (the critical test)
    try {
      const { contractsApi, referenceApi, apiClient, tokenManager } = require('@/lib/api');
      
      results.push({
        test: 'API Exports',
        status: contractsApi && referenceApi ? 'PASS' : 'FAIL',
        details: {
          hasContractsApi: !!contractsApi,
          hasReferenceApi: !!referenceApi,
          hasApiClient: !!apiClient,
          hasTokenManager: !!tokenManager,
          contractsApiMethods: contractsApi ? Object.keys(contractsApi) : 'undefined',
          referenceApiMethods: referenceApi ? Object.keys(referenceApi) : 'undefined',
        }
      });
    } catch (error: any) {
      results.push({
        test: 'API Exports',
        status: 'FAIL',
        error: error.message,
      });
    }

    setTestResults(results);
    setHasRun(true);
  };

  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const totalTests = testResults.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Simple Lib Files Test (No Auth Required)
        </h1>
        
        {!hasRun && (
          <div className="mb-6">
            <button
              onClick={runSimpleTests}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Run Tests
            </button>
          </div>
        )}

        {hasRun && (
          <>
            <div className={`p-4 rounded-lg mb-6 ${
              passedTests === totalTests ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h2 className="text-xl font-semibold mb-2">
                Test Results: {passedTests}/{totalTests} passed
              </h2>
              <p className="text-gray-600">
                {passedTests === totalTests 
                  ? '✅ All lib files are importing correctly!' 
                  : '❌ Some lib files have import issues.'
                }
              </p>
            </div>

            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'PASS'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        result.status === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  
                  {result.error && (
                    <p className="text-red-600 text-sm mb-2">Error: {result.error}</p>
                  )}
                  
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {passedTests === totalTests && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 Great! Your lib files are working</h3>
                <p className="text-green-700 text-sm">
                  Now you can try logging in and testing your actual application functionality.
                </p>
              </div>
            )}

            {passedTests < totalTests && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">❌ Issues found</h3>
                <p className="text-red-700 text-sm">
                  Check the errors above. Most likely you need to add the missing exports to your api.ts file.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}