// File: /c:/Mis_Proyectos/Python/NextCRM/frontend/src/app/contracts/new/components/ContractForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useContractForm } from '@/hooks/useContractForm';
import { 
  FinancialDetailsStep, 
  DatesDeliveryStep, 
  DocumentsStep, 
  ReviewSubmitStep 
} from './ContractFormSteps';

// Basic Information Step Component
const BasicInformationStep = ({ formData, errors, onUpdate }: any) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter contract title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.type ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select contract type</option>
            <option value="purchase">Purchase</option>
            <option value="sales">Sales</option>
            <option value="service">Service</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter contract description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Parties and Commodity Step Component
const PartiesAndCommodityStep = ({ formData, errors, onUpdate, commodities, counterparties, traders }: any) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Parties & Commodity</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commodity *
          </label>
          <select
            value={formData.commodityId}
            onChange={(e) => onUpdate({ commodityId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.commodityId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select commodity</option>
            {commodities.map((commodity: any) => (
              <option key={commodity.id} value={commodity.id}>
                {commodity.name} ({commodity.category})
              </option>
            ))}
          </select>
          {errors.commodityId && (
            <p className="mt-1 text-sm text-red-600">{errors.commodityId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counterparty *
          </label>
          <select
            value={formData.counterpartyId}
            onChange={(e) => onUpdate({ counterpartyId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.counterpartyId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select counterparty</option>
            {counterparties.map((party: any) => (
              <option key={party.id} value={party.id}>
                {party.name} ({party.email})
              </option>
            ))}
          </select>
          {errors.counterpartyId && (
            <p className="mt-1 text-sm text-red-600">{errors.counterpartyId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Trader *
          </label>
          <select
            value={formData.traderId}
            onChange={(e) => onUpdate({ traderId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.traderId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select trader</option>
            {traders.map((trader: any) => (
              <option key={trader.id} value={trader.id}>
                {trader.name} ({trader.email})
              </option>
            ))}
          </select>
          {errors.traderId && (
            <p className="mt-1 text-sm text-red-600">{errors.traderId}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main ContractForm component
export default function ContractForm() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    formData,
    errors,
    isLoading,
    nextStep,
    prevStep,
    updateFormData,
    validateStep,
    submitContract,
    saveDraft,
    commodities,
    counterparties,
    traders
  } = useContractForm();

  const [showSuccess, setShowSuccess] = useState(false);

  // Step labels for progress indicator
  const stepLabels = [
    'Basic Info',
    'Parties & Commodity',
    'Financial Details', 
    'Dates & Delivery',
    'Documents',
    'Review & Submit'
  ];

  // Handle next step with validation
  const handleNext = async () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      nextStep();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const success = await submitContract();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/contracts');
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    await saveDraft();
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Created!</h2>
          <p className="text-gray-600 mb-6">
            Your contract has been successfully created and is now pending approval.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/contracts')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Contracts
            </button>
            <button
              onClick={() => router.push('/contracts/new')}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create Another Contract
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/contracts')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-gray-600 mt-2">Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < totalSteps ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-colors ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {stepLabels.map((label, index) => (
              <span key={index} className={`${index === currentStep - 1 ? 'text-blue-600 font-medium' : ''}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {currentStep === 1 && (
            <BasicInformationStep
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 2 && (
            <PartiesAndCommodityStep
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
              commodities={commodities}
              counterparties={counterparties}
              traders={traders}
            />
          )}

          {currentStep === 3 && (
            <FinancialDetailsStep
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === 4 && (
            <DatesDeliveryStep
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === 5 && (
            <DocumentsStep
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === 6 && (
            <ReviewSubmitStep
              formData={formData}
              commodities={commodities}
              counterparties={counterparties}
              traders={traders}
            />
          )}

          {/* Navigation Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Save Draft
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Contract...
                    </div>
                  ) : (
                    'Create Contract'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Contract Creation Guide
            </a>{' '}
            or{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}