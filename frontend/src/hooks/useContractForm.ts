// File: src/hooks/useContractForm.ts

import { useState, useEffect, useCallback } from 'react';
import { contractsApi, referenceApi, type Contract, type Commodity, type Counterparty, type Trader, type ApiError } from '@/lib/api';

// Simple toast replacement
const toast = {
  success: (message: string) => {
    console.log('✅ SUCCESS:', message);
    if (typeof window !== 'undefined') {
      alert(`✅ ${message}`);
    }
  },
  error: (message: string) => {
    console.log('❌ ERROR:', message);
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },
  info: (message: string) => {
    console.log('ℹ️ INFO:', message);
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  }
};

// Form data interface
export interface ContractFormData {
  id?: string;
  title: string;
  description: string;
  type: 'purchase' | 'sales' | 'service';
  commodityId: string;
  counterpartyId: string;
  traderId: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  totalValue?: number;
  currency?: string;
  paymentTerms?: string;
  specialTerms?: string;
  startDate?: string;
  endDate?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  deliveryTerms?: string;
  deliveryInstructions?: string;
  documents?: Array<{
    id: number;
    name: string;
    size: string;
    type: string;
    uploadDate: string;
    file?: File;
  }>;
  currentStep?: number;
}

export interface UseContractFormReturn {
  currentStep: number;
  totalSteps: number;
  formData: ContractFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  isDraft: boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<ContractFormData>) => void;
  validateStep: (step: number) => boolean;
  
  submitContract: () => Promise<boolean>;
  
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => void;

  commodities: Commodity[];
  counterparties: Counterparty[];
  traders: Trader[];
  
  commoditiesLoading: boolean;
  counterpartiesLoading: boolean;
  tradersLoading: boolean;
}

const DRAFT_KEY = 'contract_form_draft';

export const useContractForm = (): UseContractFormReturn => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    description: '',
    type: 'purchase',
    commodityId: '',
    counterpartyId: '',
    traderId: '',
    currency: 'USD',
    documents: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Reference data state
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  
  const [commoditiesLoading, setCommoditiesLoading] = useState(true);
  const [counterpartiesLoading, setCounterpartiesLoading] = useState(true);
  const [tradersLoading, setTradersLoading] = useState(true);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setCommoditiesLoading(true);
        const commoditiesData = await referenceApi.getCommodities();
        setCommodities(commoditiesData);
      } catch (error) {
        console.error('Error loading commodities:', error);
        toast.error('Failed to load commodities');
      } finally {
        setCommoditiesLoading(false);
      }

      try {
        setCounterpartiesLoading(true);
        const counterpartiesData = await referenceApi.getCounterparties();
        setCounterparties(counterpartiesData);
      } catch (error) {
        console.error('Error loading counterparties:', error);
        toast.error('Failed to load counterparties');
      } finally {
        setCounterpartiesLoading(false);
      }

      try {
        setTradersLoading(true);
        const tradersData = await referenceApi.getTraders();
        setTraders(tradersData);
      } catch (error) {
        console.error('Error loading traders:', error);
        toast.error('Failed to load traders');
      } finally {
        setTradersLoading(false);
      }
    };

    loadReferenceData();
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Form data update
  const updateFormData = useCallback((data: Partial<ContractFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    const clearedErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete clearedErrors[key];
    });
    setErrors(clearedErrors);
  }, [errors]);

  // Validation
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Contract title is required';
        }
        if (!formData.type) {
          newErrors.type = 'Contract type is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }
        break;
      
      case 2:
        if (!formData.commodityId) {
          newErrors.commodityId = 'Commodity is required';
        }
        if (!formData.counterpartyId) {
          newErrors.counterpartyId = 'Counterparty is required';
        }
        if (!formData.traderId) {
          newErrors.traderId = 'Trader is required';
        }
        break;
        
      case 3:
        if (!formData.quantity || formData.quantity <= 0) {
          newErrors.quantity = 'Quantity is required and must be greater than 0';
        }
        if (!formData.unit) {
          newErrors.unit = 'Unit is required';
        }
        if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
          newErrors.pricePerUnit = 'Price per unit is required and must be greater than 0';
        }
        if (!formData.paymentTerms) {
          newErrors.paymentTerms = 'Payment terms are required';
        }
        break;
        
      case 4:
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
          newErrors.endDate = 'End date is required';
        }
        if (!formData.deliveryDate) {
          newErrors.deliveryDate = 'Delivery date is required';
        }
        if (!formData.deliveryLocation?.trim()) {
          newErrors.deliveryLocation = 'Delivery location is required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Load draft
  const loadDraft = useCallback(async (): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const contract = JSON.parse(savedDraft) as ContractFormData;
        setFormData(contract);
        setCurrentStep(contract.currentStep || 1);
        setIsDraft(true);
        toast.info('Draft loaded successfully');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Failed to load draft');
    }
  }, []);

  // Save draft
  const saveDraft = useCallback(async (): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      
      const draftData = { ...formData, currentStep };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setIsDraft(true);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  }, [formData, currentStep]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DRAFT_KEY);
    setIsDraft(false);
  }, []);

  // Submit contract
  const submitContract = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const allStepsValid = [1, 2, 3, 4, 5, 6].every(step => validateStep(step));
      
      if (!allStepsValid) {
        toast.error('Please fix all validation errors before submitting');
        return false;
      }

      const totalValue = (formData.quantity || 0) * (formData.pricePerUnit || 0);
      
      const contractData: Partial<Contract> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        commodity_id: formData.commodityId,
        counterparty_id: formData.counterpartyId,
        trader_id: formData.traderId,
        quantity: formData.quantity || 0,
        unit: formData.unit || '',
        price_per_unit: formData.pricePerUnit || 0,
        total_value: totalValue,
        currency: formData.currency || 'USD',
        payment_terms: formData.paymentTerms || '',
        start_date: formData.startDate || '',
        end_date: formData.endDate || '',
        delivery_date: formData.deliveryDate || '',
        delivery_location: formData.deliveryLocation || '',
        delivery_terms: formData.deliveryTerms || '',
        delivery_instructions: formData.deliveryInstructions || '',
        status: 'draft',
      };

      await contractsApi.createContract(contractData);
      clearDraft();
      toast.success('Contract created successfully!');
      return true;
      
    } catch (error) {
      console.error('Error submitting contract:', error);
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to create contract. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep, clearDraft]);

  // Auto-save draft
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.description || formData.commodityId) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, saveDraft]);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Auto-calculate total value
  useEffect(() => {
    if (formData.quantity && formData.pricePerUnit) {
      const totalValue = formData.quantity * formData.pricePerUnit;
      if (totalValue !== formData.totalValue) {
        setFormData(prev => ({ ...prev, totalValue }));
      }
    }
  }, [formData.quantity, formData.pricePerUnit, formData.totalValue]);

  return {
    currentStep,
    totalSteps,
    formData,
    errors,
    isLoading,
    isDraft,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    validateStep,
    submitContract,
    saveDraft,
    loadDraft,
    clearDraft,
    commodities,
    counterparties,
    traders,
    commoditiesLoading,
    counterpartiesLoading,
    tradersLoading,
  };
};