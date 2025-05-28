// File: src/app/contracts/new/components/ContractForm.tsx

'use client';

import { useState } from 'react';
import { useContractForm } from '@/hooks/useContractForm';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BasicInfoStep from './BasicInfoStep';
import PartiesStep from './PartiesStep';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send,
  AlertCircle
} from 'lucide-react';

interface ContractFormProps {
  contractId?: number;
}

const StepIndicator = ({ 
  steps, 
  currentStep, 
  onStepClick 
}: {
  steps: any[];
  currentStep: number;
  onStepClick: (index: number) => void;
}) => (
  <div className="bg-white border-b px-6 py-4">
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center space-x-4 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <button
              onClick={() => onStepClick(index)}
              className={cn(
                'flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors',
                index < currentStep && 'text-green-600',
                index === currentStep && 'text-primary',
                index > currentStep && 'text-gray-400',
                'hover:bg-gray-50'
              )}
              disabled={index > currentStep}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                index < currentStep && 'bg-green-100 border-green-500',
                index === currentStep && 'bg-primary/10 border-primary',
                index > currentStep && 'bg-gray-100 border-gray-300'
              )}>
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <span className={cn(
                    'text-sm font-medium',
                    index === currentStep && 'text-primary',
                    index > currentStep && 'text-gray-400'
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className={cn(
                  'text-xs font-medium',
                  index === currentStep && 'text-primary',
                  index < currentStep && 'text-green-600',
                  index > currentStep && 'text-gray-400'
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 hidden md:block max-w-24 truncate">
                  {step.description}
                </div>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-4',
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              )} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  </div>
);

const FormNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  canGoNext,
  saving,
  submitting,
  isLastStep
}: {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  saving: boolean;
  submitting: boolean;
  isLastStep: boolean;
}) => (
  <div className="bg-white border-t px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {currentStep > 0 && (
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={saving || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
        
        <Button
          onClick={onSaveDraft}
          variant="outline"
          disabled={saving || submitting}
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>
        
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!canGoNext || submitting}
          >
            {submitting ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Contract
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoNext || saving || submitting}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export function ContractForm({ contractId }: ContractFormProps) {
  const {
    formData,
    setFormData,
    steps,
    currentStep,
    currentStepId,
    goToStep,
    nextStep,
    prevStep,
    errors,
    validateCurrentStep,
    saveDraft,
    submitContract,
    loading,
    saving,
    submitting,
    commodities,
    counterparties,
    traders,
    costCenters,
    loadingReferenceData,
    totalValue,
  } = useContractForm(contractId);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    try {
      setSaveError(null);
      await saveDraft();
      // Could show a success toast here
    } catch (error: any) {
      setSaveError(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const success = await submitContract();
      if (!success) {
        setSubmitError('Please fix the validation errors and try again');
      }
    } catch (error: any) {
      setSubmitError(error.message);
    }
  };

  const canGoNext = validateCurrentStep();
  const isLastStep = currentStep === steps.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading contract form..." />
      </div>
    );
  }

  const renderCurrentStep = ()