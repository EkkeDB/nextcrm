// Base API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  field_errors?: Record<string, string[]>;
  non_field_errors?: string[];
  detail?: string;
}

// Request/Response interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

// Contract Types
export interface Contract {
  id: number;
  contract_number: string;
  title: string;
  description?: string;
  contract_type: 'PURCHASE' | 'SALE';
  commodity: Commodity;
  counterparty: Counterparty;
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
  trader: User;
  cost_center: CostCenter;
  created_at: string;
  updated_at: string;
  facilities?: Facility[];
  documents?: ContractDocument[];
}

export interface ContractCreateRequest {
  title: string;
  description?: string;
  contract_type: 'PURCHASE' | 'SALE';
  commodity_id: number;
  counterparty_id: number;
  quantity: number;
  unit_of_measure: string;
  price_per_unit: number;
  currency: string;
  start_date: string;
  end_date: string;
  delivery_location?: string;
  payment_terms?: string;
  cost_center_id: number;
  facility_ids?: number[];
}

// Counterparty Types
export interface Counterparty {
  id: number;
  name: string;
  company_type: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  tax_id?: string;
  email?: string;
  phone?: string;
  website?: string;
  country: string;
  address: Address;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facilities?: Facility[];
  contracts_count?: number;
  total_contract_value?: number;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// Reference Data Types
export interface Commodity {
  id: number;
  name: string;
  code: string;
  category: string;
  unit_of_measure: string;
  description?: string;
  is_active: boolean;
}

export interface CostCenter {
  id: number;
  name: string;
  code: string;
  description?: string;
  budget?: number;
  is_active: boolean;
}

export interface Facility {
  id: number;
  name: string;
  facility_type: 'WAREHOUSE' | 'PORT' | 'FACTORY' | 'OFFICE' | 'OTHER';
  address: Address;
  capacity?: number;
  capacity_unit?: string;
  counterparty?: number;
  is_active: boolean;
}

// Document Types
export interface ContractDocument {
  id: number;
  contract: number;
  name: string;
  file_type: string;
  file_size: number;
  uploaded_by: User;
  uploaded_at: string;
  url: string;
}

// Dashboard/Statistics Types
export interface DashboardStats {
  total_contracts: number;
  active_contracts: number;
  total_value: number;
  monthly_revenue: number;
  contracts_by_status: Record<string, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
  }>;
  top_commodities: Array<{
    commodity: string;
    value: number;
    count: number;
  }>;
  top_counterparties: Array<{
    counterparty: string;
    value: number;
    count: number;
  }>;
}

// Filter/Search Types
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
}

export interface CounterpartyFilters {
  search?: string;
  company_type?: string[];
  country?: string[];
  is_active?: boolean;
}

// Generic Types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}