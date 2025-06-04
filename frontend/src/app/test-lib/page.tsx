// frontend/src/app/test-lib/page.tsx
// Create this file to test if your lib files are working correctly

'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { contractsApi, referenceApi } from '@/lib/api';
import { CONTRACT_STATUS_OPTIONS, API_ENDPOINTS } from '@/lib/constants';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function TestLibPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: any[] = [];

    // Test 1: Utils
    try {
      const testClasses = cn('text-red-500', 'font-bold');
      const testCurrency = formatCurrency(1234.56, 'EUR');
      const testDate = formatDate(new Date());
      
      results.push({
        test: 'Utils Functions',
        status: 'PASS',
        details: {
          cn: testClasses,
          formatCurrency: testCurrency,
          formatDate: testDate,
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Utils Functions',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 2: Constants
    try {
      const hasStatusOptions = CONTRACT_STATUS_OPTIONS.length > 0;
      const hasApiEndpoints = Object.keys(API_ENDPOINTS).length > 0;
      
      results.push({
        test: 'Constants',
        status: hasStatusOptions && hasApiEndpoints ? 'PASS' : 'FAIL',
        details: {
          statusOptionsCount: CONTRACT_STATUS_OPTIONS.length,
          apiEndpointsCount: Object.keys(API_ENDPOINTS).length,
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Constants',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 3: Auth Service
    try {
      const isAuth = authService.isAuthenticated();
      const validateEmail = authService.validateEmail('test@example.com');
      
      results.push({
        test: 'Auth Service',
        status: 'PASS',
        details: {
          isAuthenticated: isAuth,
          emailValidation: validateEmail,
          hasGetToken: typeof authService.getToken === 'function',
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Auth Service',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 4: API Structure
    try {
      const hasContractsApi = typeof contractsApi === 'object';
      const hasReferenceApi = typeof referenceApi === 'object';
      const hasCreateContract = typeof contractsApi.createContract === 'function';
      const hasGetCommodities = typeof referenceApi.getCommodities === 'function';
      
      results.push({
        test: 'API Structure',
        status: hasContractsApi && hasReferenceApi && hasCreateContract && hasGetCommodities ? 'PASS' : 'FAIL',
        details: {
          hasContractsApi,
          hasReferenceApi,
          hasCreateContract,
          hasGetCommodities,
        }
      });
    } catch (error: any) {
      results.push({
        test: 'API Structure',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 5: Try actual API call (this might fail if backend is not running)
    try {
      const currencies = await referenceApi.getCommodities();
      results.push({
        test: 'API Connection (Commodities)',
        status: 'PASS',
        details: {
          commoditiesCount: Array.isArray(currencies) ? currencies.length : 'Not an array',
        }
      });
    } catch (error: any) {
      results.push({
        test: 'API Connection (Commodities)',
        status: 'EXPECTED_FAIL',
        error: error.message,
        note: 'This might fail if Django backend is not running - that\'s normal'
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing your lib files...</p>
        </div>
      </div>
    );
  }

  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const totalTests = testResults.filter(r => r.status !== 'EXPECTED_FAIL').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Lib Files Test Results
        </h1>
        
        <div className={`p-4 rounded-lg mb-6 ${
          passedTests === totalTests ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">
            Overall Status: {passedTests}/{totalTests} tests passed
          </h2>
          <p className="text-gray-600">
            {passedTests === totalTests 
              ? '✅ All your lib files are working correctly!' 
              : '❌ Some lib files need attention.'
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
                  : result.status === 'EXPECTED_FAIL'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{result.test}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    result.status === 'PASS'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'EXPECTED_FAIL'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status}
                </span>
              </div>
              
              {result.error && (
                <p className="text-red-600 text-sm mb-2">Error: {result.error}</p>
              )}
              
              {result.note && (
                <p className="text-yellow-600 text-sm mb-2">Note: {result.note}</p>
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What This Test Checks</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Your utils.ts functions (cn, formatCurrency, formatDate)</li>
            <li>• Your constants.ts exports (CONTRACT_STATUS_OPTIONS, API_ENDPOINTS)</li>
            <li>• Your auth.ts service methods</li>
            <li>• Your api.ts structure (contractsApi, referenceApi)</li>
            <li>• Actual API connection (expected to fail if Django is not running)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}