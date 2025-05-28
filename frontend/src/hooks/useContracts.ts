// File: src/hooks/useContracts.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  Contract, 
  ContractFilters, 
  ContractSortConfig, 
  ContractListResponse,
  ContractBulkAction,
  Commodity,
  Counterparty,
  Trader,
  CostCenter
} from '@/types/contracts';
import { API_ENDPOINTS } from '@/lib/constants';

interface UseContractsReturn {
  // Data
  contracts: Contract[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  
  // Filtering & Sorting
  filters: ContractFilters;
  sortConfig: ContractSortConfig;
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<ContractFilters>) => void;
  setSort: (sort: ContractSortConfig) => void;
  refreshContracts: () => Promise<void>;
  bulkAction: (action: ContractBulkAction) => Promise<void>;
  
  // Selection
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
}

// Mock data generator
const generateMockContracts = (count: number = 50): Contract[] => {
  const statuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'] as const;
  const types = ['PURCHASE', 'SALE'] as const;
  const currencies = ['EUR', 'USD', 'GBP'];
  const commodities = [
    { id: 1, name: 'Crude Oil', code: 'OIL', category: 'Energy' },
    { id: 2, name: 'Natural Gas', code: 'GAS', category: 'Energy' },
    { id: 3, name: 'Wheat', code: 'WHT', category: 'Agriculture' },
    { id: 4, name: 'Copper', code: 'COP', category: 'Metals' },
    { id: 5, name: 'Gold', code: 'GLD', category: 'Precious Metals' },
  ];
  const counterparties = [
    { id: 1, name: 'Energy Corp Solutions', company_type: 'COMPANY', country: 'Spain' },
    { id: 2, name: 'Global Trading Ltd', company_type: 'COMPANY', country: 'Portugal' },
    { id: 3, name: 'Iberian Resources SA', company_type: 'COMPANY', country: 'Spain' },
    { id: 4, name: 'Atlantic Commodities', company_type: 'COMPANY', country: 'France' },
    { id: 5, name: 'European Energy Hub', company_type: 'COMPANY', country: 'Germany' },
  ];
  const traders = [
    { id: 1, first_name: 'Maria', last_name: 'Silva', email: 'maria.silva@nextcrm.com' },
    { id: 2, first_name: 'João', last_name: 'Santos', email: 'joao.santos@nextcrm.com' },
    { id: 3, first_name: 'Ana', last_name: 'Rodriguez', email: 'ana.rodriguez@nextcrm.com' },
    { id: 4, first_name: 'Carlos', last_name: 'Mendes', email: 'carlos.mendes@nextcrm.com' },
  ];
  const costCenters = [
    { id: 1, name: 'Energy Trading', code: 'ET001' },
    { id: 2, name: 'Agriculture Division', code: 'AG001' },
    { id: 3, name: 'Metals Trading', code: 'MT001' },
  ];

  return Array.from({ length: count }, (_, index) => {
    const commodity = commodities[Math.floor(Math.random() * commodities.length)];
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    const trader = traders[Math.floor(Math.random() * traders.length)];
    const costCenter = costCenters[Math.floor(Math.random() * costCenters.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const quantity = Math.floor(Math.random() * 10000) + 100;
    const pricePerUnit = Math.floor(Math.random() * 1000) + 50;
    const totalValue = quantity * pricePerUnit;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 365) + 30);

    return {
      id: index + 1,
      contract_number: `CTR-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      title: `${commodity.name} ${types[Math.floor(Math.random() * types.length)]} Agreement`,
      description: `${types[Math.floor(Math.random() * types.length)]} contract for ${commodity.name} with ${counterparty.name}`,
      contract_type: types[Math.floor(Math.random() * types.length)],
      commodity,
      counterparty,
      quantity,
      unit_of_measure: commodity.category === 'Energy' ? 'barrels' : 'tons',
      price_per_unit: pricePerUnit,
      total_value: totalValue,
      currency,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      delivery_location: `${counterparty.country} Port`,
      payment_terms: '30 days net',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      trader,
      cost_center: costCenter,
      created_at: startDate.toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: Math.floor(Math.random() * 5),
      facilities_count: Math.floor(Math.random() * 3) + 1,
    };
  });
};

export function useContracts(initialFilters?: Partial<ContractFilters>): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filtering & Sorting
  const [filters, setFiltersState] = useState<ContractFilters>({
    ...initialFilters,
  });
  const [sortConfig, setSortConfig] = useState<ContractSortConfig>({
    field: 'created_at',
    direction: 'desc',
  });
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching contracts...', {
        page: currentPage,
        pageSize,
        filters,
        sortConfig
      });

      // Mock API for development
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        console.log('📋 Using mock contracts data...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let mockContracts = generateMockContracts(100);
        
        // Apply filters
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockContracts = mockContracts.filter(contract =>
            contract.contract_number.toLowerCase().includes(searchLower) ||
            contract.title.toLowerCase().includes(searchLower) ||
            contract.counterparty.name.toLowerCase().includes(searchLower) ||
            contract.commodity.name.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.status && filters.status.length > 0) {
          mockContracts = mockContracts.filter(contract =>
            filters.status!.includes(contract.status)
          );
        }
        
        if (filters.contract_type && filters.contract_type.length > 0) {
          mockContracts = mockContracts.filter(contract =>
            filters.contract_type!.includes(contract.contract_type)
          );
        }
        
        // Apply sorting
        mockContracts.sort((a, b) => {
          const aValue = a[sortConfig.field as keyof Contract];
          const bValue = b[sortConfig.field as keyof Contract];
          
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
        
        // Apply pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedContracts = mockContracts.slice(startIndex, endIndex);
        
        setContracts(paginatedContracts);
        setTotalCount(mockContracts.length);
        
        console.log('✅ Mock contracts loaded:', paginatedContracts.length, 'of', mockContracts.length);
      } else {
        // Real API call
        console.log('🌐 Making real API call...');
        const params = {
          page: currentPage,
          page_size: pageSize,
          ordering: sortConfig.direction === 'desc' ? `-${sortConfig.field}` : sortConfig.field,
          ...filters,
        };
        
        const response = await api.get<ContractListResponse>(API_ENDPOINTS.CONTRACTS, params);
        setContracts(response.results);
        setTotalCount(response.count);
        
        console.log('✅ Real contracts loaded:', response.results.length);
      }
    } catch (err: any) {
      console.error('❌ Contracts fetch error:', err);
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, sortConfig]);

  // Actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSizeAndReset = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const setFilters = useCallback((newFilters: Partial<ContractFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setSort = useCallback((sort: ContractSortConfig) => {
    setSortConfig(sort);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const refreshContracts = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  const bulkAction = useCallback(async (action: ContractBulkAction) => {
    try {
      setLoading(true);
      console.log('🔄 Performing bulk action:', action);
      
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        // Mock bulk action
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Mock bulk action completed');
      } else {
        // Real API call
        await api.post('/contracts/bulk-action/', action);
      }
      
      // Refresh contracts after bulk action
      await fetchContracts();
      setSelectedIds([]);
    } catch (err: any) {
      console.error('❌ Bulk action error:', err);
      throw new Error(err.message || 'Bulk action failed');
    } finally {
      setLoading(false);
    }
  }, [fetchContracts]);

  // Selection actions
  const selectAll = useCallback(() => {
    setSelectedIds(contracts.map(contract => contract.id));
  }, [contracts]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Fetch contracts when dependencies change
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    contracts,
    totalCount,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    filters,
    sortConfig,
    setPage,
    setPageSize: setPageSizeAndReset,
    setFilters,
    setSort,
    refreshContracts,
    bulkAction,
    selectedIds,
    setSelectedIds,
    selectAll,
    clearSelection,
  };
}