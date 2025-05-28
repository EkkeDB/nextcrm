// File: src/hooks/useContractForm.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  ContractFormData, 
  FormStep, 
  FORM_STEPS,
  getDefaultFormData,
  validateStep,
  contractFormSchema
} from '@/types/contract-form';
import { 
  Commodity, 
  Counterparty, 
  Trader, 
  CostCenter 
} from '@/types/contracts';

interface UseContractFormReturn {
  // Form Data
  formData: ContractFormData;
  setFormData: (data: Partial<ContractFormData>) => void;
  
  // Steps Management
  steps: FormStep[];
  currentStep: number;
  currentStepId: string;
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Validation
  errors: Record<string, string>;
  isStepValid: (stepId: string) => boolean;
  validateCurrentStep: () => boolean;
  
  // Form Actions
  saveDraft: () => Promise<void>;
  submitContract: () => Promise<void>;
  resetForm: () => void;
  
  // Loading States
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  
  // Reference Data
  commodities: Commodity[];
  counterparties: Counterparty[];
  traders: Trader[];
  costCenters: CostCenter[];
  loadingReferenceData: boolean;
  
  // Calculated Values
  totalValue: number;
}

// Mock reference data
const generateMockReferenceData = () => ({
  commodities: [
    { id: 1, name: 'Crude Oil', code: 'OIL', category: 'Energy', unit_of_measure: 'barrels', is_active: true },
    { id: 2, name: 'Natural Gas', code: 'GAS', category: 'Energy', unit_of_measure: 'cubic meters', is_active: true },
    { id: 3, name: 'Wheat', code: 'WHT', category: 'Agriculture', unit_of_measure: 'tons', is_active: true },
    { id: 4, name: 'Copper', code: 'COP', category: 'Metals', unit_of_measure: 'tons', is_active: true },
    { id: 5, name: 'Gold', code: 'GLD', category: 'Precious Metals', unit_of_measure: 'ounces', is_active: true },
    { id: 6, name: 'Silver', code: 'SLV', category: 'Precious Metals', unit_of_measure: 'ounces', is_active: true },
    { id: 7, name: 'Corn', code: 'CRN', category: 'Agriculture', unit_of_measure: 'tons', is_active: true },
    { id: 8, name: 'Soybeans', code: 'SOY', category: 'Agriculture', unit_of_measure: 'tons', is_active: true },
  ] as Commodity[],
  
  counterparties: [
    { id: 1, name: 'Energy Corp Solutions', company_type: 'COMPANY', country: 'Spain', is_active: true },
    { id: 2, name: 'Global Trading Ltd', company_type: 'COMPANY', country: 'Portugal', is_active: true },
    { id: 3, name: 'Iberian Resources SA', company_type: 'COMPANY', country: 'Spain', is_active: true },
    { id: 4, name: 'Atlantic Commodities', company_type: 'COMPANY', country: 'France', is_active: true },
    { id: 5, name: 'European Energy Hub', company_type: 'COMPANY', country: 'Germany', is_active: true },
    { id: 6, name: 'Mediterranean Trading Co', company_type: 'COMPANY', country: 'Italy', is_active: true },
    { id: 7, name: 'Nordic Commodities AS', company_type: 'COMPANY', country: 'Norway', is_active: true },
    { id: 8, name: 'Swiss Trading House AG', company_type: 'COMPANY', country: 'Switzerland', is_active: true },
  ] as Counterparty[],
  
  traders: [
    { id: 1, first_name: 'Maria', last_name: 'Silva', email: 'maria.silva@nextcrm.com', full_name: 'Maria Silva', is_active: true },
    { id: 2, first_name: 'João', last_name: 'Santos', email: 'joao.santos@nextcrm.com', full_name: 'João Santos', is_active: true },
    { id: 3, first_name: 'Ana', last_name: 'Rodriguez', email: 'ana.rodriguez@nextcrm.com', full_name: 'Ana Rodriguez', is_active: true },
    { id: 4, first_name: 'Carlos', last_name: 'Mendes', email: 'carlos.mendes@nextcrm.com', full_name: 'Carlos Mendes', is_active: true },
    { id: 5, first_name: 'Sofia', last_name: 'Costa', email: 'sofia.costa@nextcrm.com', full_name: 'Sofia Costa', is_active: true },
    { id: 6, first_name: 'Miguel', last_name: 'Ferreira', email: 'miguel.ferreira@nextcrm.com', full_name: 'Miguel Ferreira', is_active: true },
  ] as Trader[],
  
  costCenters: [
    { id: 1, name: 'Energy Trading', code: 'ET001', is_active: true },
    { id: 2, name: 'Agriculture Division', code: 'AG001', is_active: true },
    { id: 3, name: 'Metals Trading', code: 'MT001', is_active: true },
    { id: 4, name: 'Precious Metals', code: 'PM001', is_active: true },
    { id: 5, name: 'European Operations', code: 'EU001', is_active: true },
  ] as CostCenter[],
});

export function useContractForm(contractId?: number): UseContractFormReturn {
  const router = useRouter();
  
  // Form State
  const [formData, setFormDataState] = useState<ContractFormData>(getDefaultFormData());
  const [steps, setSteps] = useState<FormStep[]>(FORM_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReferenceData, setLoadingReferenceData] = useState(true);
  
  // Reference Data
  const [referenceData, setReferenceData] = useState({
    commodities: [] as Commodity[],
    counterparties: [] as Counterparty[],
    traders: [] as Trader[],
    costCenters: [] as CostCenter[],
  });

  // Load reference data
  const loadReferenceData = useCallback(async () => {
    try {
      setLoadingReferenceData(true);
      
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        console.log('📋 Loading mock reference data...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = generateMockReferenceData();
        setReferenceData(mockData);
        console.log('✅ Mock reference data loaded');
      } else {
        console.log('🌐 Loading real reference data...');
        const [commodities, counterparties, traders, costCenters] = await Promise.all([
          api.get<Commodity[]>('/commodities/'),
          api.get<Counterparty[]>('/counterparties/'),
          api.get<Trader[]>('/users/?role=trader'),
          api.get<CostCenter[]>('/cost-centers/'),
        ]);
        
        setReferenceData({
          commodities,
          counterparties,
          traders,
          costCenters,
        });
        console.log('✅ Real reference data loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load reference data:', error);
    } finally {
      setLoadingReferenceData(false);
    }
  }, []);

  // Load existing contract for editing
  const loadContract = useCallback(async (id: number) => {
    try {
      setLoading(true);
      console.log('📄 Loading contract for editing...', id);
      
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        // Mock existing contract data
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('✅ Mock contract loaded for editing');
      } else {
        const contract = await api.get(`/contracts/${id}/`);
        // Transform API data to form data
        setFormDataState({
          title: contract.title,
          description: contract.description,
          contract_type: contract.contract_type,
          counterparty_id: contract.counterparty.id,
          commodity_id: contract.commodity.id,
          trader_id: contract.trader.id,
          cost_center_id: contract.cost_center.id,
          quantity: contract.quantity,
          unit_of_measure: contract.unit_of_measure,
          price_per_unit: contract.price_per_unit,
          currency: contract.currency,
          payment_terms: contract.payment_terms,
          start_date: contract.start_date,
          end_date: contract.end_date,
          delivery_location: contract.delivery_location,
          status: contract.status,
          facility_ids: contract.facilities?.map((f: any) => f.id) || [],
          documents: [],
        });
      }
    } catch (error) {
      console.error('❌ Failed to load contract:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize form
  useEffect(() => {
    loadReferenceData();
    if (contractId) {
      loadContract(contractId);
    }
  }, [contractId, loadReferenceData, loadContract]);

  // Form data setter with validation
  const setFormData = useCallback((newData: Partial<ContractFormData>) => {
    setFormDataState(prev => {
      const updated = { ...prev, ...newData };
      
      // Auto-fill unit of measure when commodity changes
      if (newData.commodity_id && referenceData.commodities.length > 0) {
        const commodity = referenceData.commodities.find(c => c.id === newData.commodity_id);
        if (commodity && !updated.unit_of_measure) {
          updated.unit_of_measure = commodity.unit_of_measure;
        }
      }
      
      return updated;
    });
    
    // Clear errors for fields that were updated
    if (Object.keys(errors).length > 0) {
      const clearedErrors = { ...errors };
      Object.keys(newData).forEach(key => {
        delete clearedErrors[key];
      });
      setErrors(clearedErrors);
    }
  }, [errors, referenceData.commodities]);

  // Steps Management
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        isActive: index === stepIndex,
      })));
    }
  }, [steps.length]);

  const validateCurrentStep = useCallback(() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return true;
    
    const stepErrors = validateStep(currentStepData.id, formData);
    setErrors(stepErrors);
    
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, steps, formData]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        isCompleted: index <= currentStep ? true : step.isCompleted,
      })));
      
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, validateCurrentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Validation helpers
  const isStepValid = useCallback((stepId: string) => {
    const stepErrors = validateStep(stepId, formData);
    return Object.keys(stepErrors).length === 0;
  }, [formData]);

  // Form Actions
  const saveDraft = useCallback(async () => {
    try {
      setSaving(true);
      console.log('💾 Saving draft...', formData);
      
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Draft saved successfully');
      } else {
        if (contractId) {
          await api.put(`/contracts/${contractId}/`, { ...formData, status: 'DRAFT' });
        } else {
          await api.post('/contracts/', { ...formData, status: 'DRAFT' });
        }
      }
    } catch (error) {
      console.error('❌ Failed to save draft:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [formData, contractId]);

  const submitContract = useCallback(async () => {
    try {
      setSubmitting(true);
      
      // Final validation
      const result = contractFormSchema.safeParse(formData);
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          if (err.path.length > 0) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
        return false;
      }
      
      console.log('🚀 Submitting contract...', formData);
      
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('✅ Contract submitted successfully');
      } else {
        if (contractId) {
          await api.put(`/contracts/${contractId}/`, formData);
        } else {
          await api.post('/contracts/', formData);
        }
      }
      
      // Redirect to contracts list
      router.push('/contracts');
      return true;
    } catch (error) {
      console.error('❌ Failed to submit contract:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [formData, contractId, router]);

  const resetForm = useCallback(() => {
    setFormDataState(getDefaultFormData());
    setSteps(FORM_STEPS);
    setCurrentStep(0);
    setErrors({});
  }, []);

  // Calculated values
  const totalValue = (formData.quantity || 0) * (formData.price_per_unit || 0);

  return {
    // Form Data
    formData,
    setFormData,
    
    // Steps Management
    steps,
    currentStep,
    currentStepId: steps[currentStep]?.id || '',
    goToStep,
    nextStep,
    prevStep,
    
    // Validation
    errors,
    isStepValid,
    validateCurrentStep,
    
    // Form Actions
    saveDraft,
    submitContract,
    resetForm,
    
    // Loading States
    loading,
    saving,
    submitting,
    
    // Reference Data
    commodities: referenceData.commodities,
    counterparties: referenceData.counterparties,
    traders: referenceData.traders,
    costCenters: referenceData.costCenters,
    loadingReferenceData,
    
    // Calculated Values
    totalValue,
  };
}