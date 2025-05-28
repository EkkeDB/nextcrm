// File: src/types/contracts.ts

export interface Contract {
  id: number;
  contract_number: string;
  title: string;
  description?: string;
  contract_type: 'PURCHASE' | 'SALE';
  commodity: {
    id: number;
    name: string;
    code: string;
    category: string;
  };
  counterparty: {
    id: number;
    name: string;
    company_type: string;
    country: string;
  };
  quantity: number;
  unit_of_measure: string;
  price_per_unit: number;
  total_value: number;
  currency: string;
  start_date: string;
  end_date: string;
  delivery_location?: string;
  payment_terms?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  trader: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  cost_center: {
    id: number;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
  documents_count?: number;
  facilities_count?: number;
}

export interface ContractFilters {
  search?: string;
  status?: string[];
  contract_type?: string[];
  commodity_id?: number[];
  counterparty_id?: number[];
  trader_id?: number[];
  cost_center_id?: number[];
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  min_value?: number;
  max_value?: number;
  currency?: string[];
  created_from?: string;
  created_to?: string;
}

export interface ContractSortConfig {
  field: keyof Contract | string;
  direction: 'asc' | 'desc';
}

export interface ContractListResponse {
  results: Contract[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ContractBulkAction {
  action: 'delete' | 'approve' | 'suspend' | 'activate' | 'export';
  contract_ids: number[];
}

// Reference data types
export interface Commodity {
  id: number;
  name: string;
  code: string;
  category: string;
  unit_of_measure: string;
  is_active: boolean;
}

export interface Counterparty {
  id: number;
  name: string;
  company_type: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  country: string;
  is_active: boolean;
}

export interface Trader {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface CostCenter {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}