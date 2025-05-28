// File: src/app/contracts/new/components/BasicInfoStep.tsx

'use client';

import { ContractFormData } from '@/types/contract-form';
import { CONTRACT_TYPE_OPTIONS } from '@/lib/constants';
import { FileText, ShoppingCart, TrendingUp } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface BasicInfoStepProps {
  formData: ContractFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<ContractFormData>) => void;
}

export function BasicInfoStep({ formData, errors, onChange }: BasicInfoStepProps) {
  const handleTypeSelect = (type: 'PURCHASE' | 'SALE') => {
    onChange({ contract_type: type });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">
          Start by providing the essential details about your contract
        </p>
      </div>

      {/* Contract Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Contract Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeSelect('PURCHASE')}
            className={cn(
              'relative p-6 border-2 rounded-lg text-left transition-all hover:shadow-md',
              formData.contract_type === 'PURCHASE'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-3 rounded-lg',
                formData.contract_type === 'PURCHASE' ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                <ShoppingCart className={cn(
                  'w-6 h-6',
                  formData.contract_type === 'PURCHASE' ? 'text-blue-600' : 'text-gray-500'
                )} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Purchase Contract</h3>
                <p className="text-sm text-gray-600">
                  You're buying commodities from a counterparty
                </p>
              </div>
            </div>
            {formData.contract_type === 'PURCHASE' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect('SALE')}
            className={cn(
              'relative p-6 border-2 rounded-lg text-left transition-all hover:shadow-md',
              formData.contract_type === 'SALE'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-3 rounded-lg',
                formData.contract_type === 'SALE' ? 'bg-green-100' : 'bg-gray-100'
              )}>
                <TrendingUp className={cn(
                  'w-6 h-6',
                  formData.contract_type === 'SALE' ? 'text-green-600' : 'text-gray-500'
                )} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sale Contract</h3>
                <p className="text-sm text-gray-600">
                  You're selling commodities to a counterparty
                </p>
              </div>
            </div>
            {formData.contract_type === 'SALE' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>
        {errors.contract_type && (
          <p className="text-sm text-red-600 mt-1">{errors.contract_type}</p>
        )}
      </div>

      {/* Contract Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Contract Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Enter a descriptive title for this contract"
          className={cn(
            errors.title && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
        <p className="text-xs text-gray-500">
          A clear, descriptive title helps identify this contract later
        </p>
      </div>

      {/* Contract Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Add any additional details or notes about this contract..."
          className={cn(
            'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary',
            errors.description && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
        <p className="text-xs text-gray-500">
          Provide context, background, or special requirements for this contract
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Getting Started</h4>
            <p className="text-sm text-blue-700 mt-1">
              Choose whether you're buying or selling, then provide a clear title. 
              You'll add more details like counterparty, commodity, and pricing in the next steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoStep;