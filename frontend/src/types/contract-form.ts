// File: src/types/contract-form.ts

import { z } from 'zod';

// Contract Form Data Interface
export interface ContractFormData {
  // Basic Information
  title: string;
  description?: string;
  contract_type: 'PURCHASE' | 'SALE' | '';
  
  // Parties & Commercial
  counterparty_id: number | null;
  commodity_id: number | null;
  trader_id: number | null;
  cost_center_id: number | null;
  
  // Financial Details
  quantity: number | null;
  unit_of_measure: string;
  price_per_unit: number | null;
  currency: string;
  payment_terms?: string;
  
  // Dates & Delivery
  start_date: string;
  end_date: string;
  delivery_location?: string;
  
  // Status & Metadata
  status: 'DRAFT' | 'ACTIVE';
  
  // Related Data
  facility_ids: number[];
  
  // Documents
  documents: ContractDocument[];
}

// Document Interface
export interface ContractDocument {
  id?: number;
  name: string;
  file: File | null;
  file_type: string;
  file_size: number;
  url?: string;
  uploaded_at?: string;
}

// Form Step Interface
export interface FormStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  fields: string[];
}

// Validation Schema using Zod
export const contractFormSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, 'Contract title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  
  contract_type: z
    .enum(['PURCHASE', 'SALE'], {
      required_error: 'Contract type is required',
      invalid_type_error: 'Invalid contract type',
    }),
  
  // Parties & Commercial
  counterparty_id: z
    .number({
      required_error: 'Counterparty is required',
      invalid_type_error: 'Invalid counterparty selection',
    })
    .positive('Please select a counterparty'),
  
  commodity_id: z
    .number({
      required_error: 'Commodity is required',
      invalid_type_error: 'Invalid commodity selection',
    })
    .positive('Please select a commodity'),
  
  trader_id: z
    .number({
      required_error: 'Trader is required',
      invalid_type_error: 'Invalid trader selection',
    })
    .positive('Please select a trader'),
  
  cost_center_id: z
    .number({
      required_error: 'Cost center is required',
      invalid_type_error: 'Invalid cost center selection',
    })
    .positive('Please select a cost center'),
  
  // Financial Details
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .positive('Quantity must be greater than 0')
    .max(1000000000, 'Quantity is too large'),
  
  unit_of_measure: z
    .string()
    .min(1, 'Unit of measure is required')
    .max(50, 'Unit of measure cannot exceed 50 characters'),
  
  price_per_unit: z
    .number({
      required_error: 'Price per unit is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0')
    .max(1000000000, 'Price is too large'),
  
  currency: z
    .string()
    .min(1, 'Currency is required')
    .length(3, 'Currency must be 3 characters (e.g., EUR, USD)'),
  
  payment_terms: z
    .string()
    .max(500, 'Payment terms cannot exceed 500 characters')
    .optional(),
  
  // Dates & Delivery
  start_date: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, 'Start date cannot be in the past'),
  
  end_date: z
    .string()
    .min(1, 'End date is required'),
  
  delivery_location: z
    .string()
    .max(500, 'Delivery location cannot exceed 500 characters')
    .optional(),
  
  // Status
  status: z
    .enum(['DRAFT', 'ACTIVE'], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid status',
    }),
  
  // Related Data
  facility_ids: z
    .array(z.number())
    .optional()
    .default([]),
  
}).refine((data) => {
  // Cross-field validation: end_date must be after start_date
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Form Error Types
export type ContractFormErrors = z.ZodFormattedError<ContractFormData>;

// Step Validation Functions
export const validateStep = (stepId: string, data: Partial<ContractFormData>) => {
  const errors: Record<string, string> = {};
  
  switch (stepId) {
    case 'basic':
      if (!data.title?.trim()) errors.title = 'Contract title is required';
      if (!data.contract_type) errors.contract_type = 'Contract type is required';
      break;
      
    case 'parties':
      if (!data.counterparty_id) errors.counterparty_id = 'Counterparty is required';
      if (!data.commodity_id) errors.commodity_id = 'Commodity is required';
      if (!data.trader_id) errors.trader_id = 'Trader is required';
      if (!data.cost_center_id) errors.cost_center_id = 'Cost center is required';
      break;
      
    case 'financial':
      if (!data.quantity || data.quantity <= 0) errors.quantity = 'Valid quantity is required';
      if (!data.price_per_unit || data.price_per_unit <= 0) errors.price_per_unit = 'Valid price is required';
      if (!data.currency?.trim()) errors.currency = 'Currency is required';
      if (!data.unit_of_measure?.trim()) errors.unit_of_measure = 'Unit of measure is required';
      break;
      
    case 'dates':
      if (!data.start_date) errors.start_date = 'Start date is required';
      if (!data.end_date) errors.end_date = 'End date is required';
      if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (end <= start) {
          errors.end_date = 'End date must be after start date';
        }
      }
      break;
      
    case 'review':
      // Full validation happens here
      try {
        contractFormSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            if (err.path.length > 0) {
              errors[err.path[0] as string] = err.message;
            }
          });
        }
      }
      break;
  }
  
  return errors;
};

// Form Steps Configuration
export const FORM_STEPS: FormStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Contract title, type, and description',
    isCompleted: false,
    isActive: true,
    fields: ['title', 'contract_type', 'description'],
  },
  {
    id: 'parties',
    title: 'Parties & Commodity',
    description: 'Counterparty, commodity, trader, and cost center',
    isCompleted: false,
    isActive: false,
    fields: ['counterparty_id', 'commodity_id', 'trader_id', 'cost_center_id'],
  },
  {
    id: 'financial',
    title: 'Financial Details',
    description: 'Quantity, pricing, and payment terms',
    isCompleted: false,
    isActive: false,
    fields: ['quantity', 'unit_of_measure', 'price_per_unit', 'currency', 'payment_terms'],
  },
  {
    id: 'dates',
    title: 'Dates & Delivery',
    description: 'Contract period and delivery information',
    isCompleted: false,
    isActive: false,
    fields: ['start_date', 'end_date', 'delivery_location'],
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload contract documents and attachments',
    isCompleted: false,
    isActive: false,
    fields: ['documents'],
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all details and submit the contract',
    isCompleted: false,
    isActive: false,
    fields: [],
  },
];

// Default form data
export const getDefaultFormData = (): ContractFormData => ({
  title: '',
  description: '',
  contract_type: '',
  counterparty_id: null,
  commodity_id: null,
  trader_id: null,
  cost_center_id: null,
  quantity: null,
  unit_of_measure: '',
  price_per_unit: null,
  currency: 'EUR',
  payment_terms: '',
  start_date: '',
  end_date: '',
  delivery_location: '',
  status: 'DRAFT',
  facility_ids: [],
  documents: [],
});