// File: /c:/Mis_Proyectos/Python/NextCRM/frontend/src/hooks/useContracts.ts

import { useState, useEffect, useCallback } from 'react';
import { contractsApi, type Contract, type ContractFilters, type ApiError } from '@/lib/api';

// Filters interface
interface ContractFiltersLocal {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
}

// Sort configuration
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Hook return type
interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  filters: ContractFiltersLocal;
  sortConfig: SortConfig;
  currentPage: number;
  itemsPerPage: number;
  selectedContracts: string[];
  totalPages: number;
  totalContracts: number;
  
  // Actions
  handleSort: (key: string) => void;
  handleFilterChange: (newFilters: Partial<ContractFiltersLocal>) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setSelectedContracts: (contracts: string[]) => void;
  
  // CRUD operations
  createContract: (contractData: Partial<Contract>) => Promise<void>;
  updateContract: (id: string, contractData: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  deleteSelectedContracts: () => Promise<void>;
  refreshContracts: () => Promise<void>;
}

export const useContracts = (): UseContractsReturn => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContracts, setTotalContracts] = useState(0);
  
  // Filters state
  const [filters, setFilters] = useState<ContractFiltersLocal>({
    search: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: ''
  });
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Selection state
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  // Convert local filters to API filters
  const getApiFilters = useCallback((): ContractFilters => {
    const apiFilters: ContractFilters = {
      page: currentPage,
      page_size: itemsPerPage,
      ordering: sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key,
    };

    if (filters.search) {
      apiFilters.search = filters.search;
    }
    if (filters.status) {
      apiFilters.status = filters.status;
    }
    if (filters.type) {
      apiFilters.type = filters.type;
    }
    if (filters.dateFrom) {
      apiFilters.date_from = filters.dateFrom;
    }
    if (filters.dateTo) {
      apiFilters.date_to = filters.dateTo;
    }
    if (filters.minValue) {
      apiFilters.min_value = Number(filters.minValue);
    }
    if (filters.maxValue) {
      apiFilters.max_value = Number(filters.maxValue);
    }

    return apiFilters;
  }, [filters, currentPage, itemsPerPage, sortConfig]);

  // Load contracts from API
  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = getApiFilters();
      const response = await contractsApi.getContracts(apiFilters);
      
      setContracts(response.results);
      setTotalContracts(response.count);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load contracts');
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [getApiFilters]);

  // Load contracts when dependencies change
  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Sort handler
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((newFilters: Partial<ContractFiltersLocal>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Refresh contracts
  const refreshContracts = useCallback(async () => {
    await loadContracts();
  }, [loadContracts]);

  // CRUD operations
  const createContract = useCallback(async (contractData: Partial<Contract>) => {
    try {
      setLoading(true);
      await contractsApi.createContract(contractData);
      await refreshContracts(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshContracts]);

  const updateContract = useCallback(async (id: string, contractData: Partial<Contract>) => {
    try {
      setLoading(true);
      await contractsApi.updateContract(id, contractData);
      await refreshContracts(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshContracts]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await contractsApi.deleteContract(id);
      setSelectedContracts(prev => prev.filter(selectedId => selectedId !== id));
      await refreshContracts(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshContracts]);

  const deleteSelectedContracts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Delete each selected contract
      await Promise.all(
        selectedContracts.map(id => contractsApi.deleteContract(id))
      );
      
      setSelectedContracts([]);
      await refreshContracts(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete selected contracts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedContracts, refreshContracts]);

  // Calculate pagination
  const totalPages = Math.ceil(totalContracts / itemsPerPage);

  return {
    contracts,
    loading,
    error,
    filters,
    sortConfig,
    currentPage,
    itemsPerPage,
    selectedContracts,
    totalPages,
    totalContracts,
    
    // Actions
    handleSort,
    handleFilterChange,
    setCurrentPage,
    setItemsPerPage,
    setSelectedContracts,
    
    // CRUD operations
    createContract,
    updateContract,
    deleteContract,
    deleteSelectedContracts,
    refreshContracts,
  };
};