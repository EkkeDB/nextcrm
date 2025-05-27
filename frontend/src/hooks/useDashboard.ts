// File: src/hooks/useDashboard.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { DashboardStats, DashboardFilters, AlertItem } from '@/types/dashboard';
import { API_ENDPOINTS } from '@/lib/constants';

interface UseDashboardReturn {
  // Data
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  
  // Current filters
  filters: DashboardFilters;
}

// Mock data for development - replace with real API calls
const generateMockData = (): DashboardStats => ({
  total_contracts: 127,
  active_contracts: 89,
  completed_contracts: 32,
  draft_contracts: 6,
  total_contract_value: 15750000,
  monthly_revenue: 2100000,
  total_counterparties: 45,
  active_counterparties: 38,
  
  contracts_change_percent: 12.5,
  revenue_change_percent: 8.3,
  counterparties_change_percent: 5.2,
  
  contracts_by_status: {
    DRAFT: 6,
    ACTIVE: 89,
    COMPLETED: 32,
    CANCELLED: 0,
    SUSPENDED: 0,
  },
  
  revenue_by_month: [
    { month: 'Jan 2024', year: 2024, revenue: 1850000, contracts_count: 12 },
    { month: 'Feb 2024', year: 2024, revenue: 2100000, contracts_count: 15 },
    { month: 'Mar 2024', year: 2024, revenue: 1950000, contracts_count: 11 },
    { month: 'Apr 2024', year: 2024, revenue: 2250000, contracts_count: 18 },
    { month: 'May 2024', year: 2024, revenue: 2400000, contracts_count: 16 },
    { month: 'Jun 2024', year: 2024, revenue: 2100000, contracts_count: 14 },
    { month: 'Jul 2024', year: 2024, revenue: 2350000, contracts_count: 17 },
    { month: 'Aug 2024', year: 2024, revenue: 2200000, contracts_count: 13 },
    { month: 'Sep 2024', year: 2024, revenue: 2500000, contracts_count: 19 },
    { month: 'Oct 2024', year: 2024, revenue: 2300000, contracts_count: 15 },
    { month: 'Nov 2024', year: 2024, revenue: 2450000, contracts_count: 18 },
    { month: 'Dec 2024', year: 2024, revenue: 2600000, contracts_count: 21 },
  ],
  
  top_commodities: [
    { id: 1, name: 'Crude Oil', total_value: 5200000, contracts_count: 23, percentage: 33.0 },
    { id: 2, name: 'Natural Gas', total_value: 3100000, contracts_count: 18, percentage: 19.7 },
    { id: 3, name: 'Wheat', total_value: 2800000, contracts_count: 15, percentage: 17.8 },
    { id: 4, name: 'Copper', total_value: 2200000, contracts_count: 12, percentage: 14.0 },
    { id: 5, name: 'Gold', total_value: 1850000, contracts_count: 8, percentage: 11.7 },
  ],
  
  top_counterparties: [
    { id: 1, name: 'Energy Corp Solutions', total_value: 4500000, contracts_count: 12, percentage: 28.6 },
    { id: 2, name: 'Global Trading Ltd', total_value: 3200000, contracts_count: 18, percentage: 20.3 },
    { id: 3, name: 'Iberian Resources SA', total_value: 2800000, contracts_count: 15, percentage: 17.8 },
    { id: 4, name: 'Atlantic Commodities', total_value: 2100000, contracts_count: 9, percentage: 13.3 },
    { id: 5, name: 'European Energy Hub', total_value: 1900000, contracts_count: 11, percentage: 12.1 },
  ],
  
  top_traders: [
    { id: 1, name: 'Maria Silva', total_value: 4200000, contracts_count: 28, percentage: 26.7 },
    { id: 2, name: 'João Santos', total_value: 3800000, contracts_count: 22, percentage: 24.1 },
    { id: 3, name: 'Ana Rodriguez', total_value: 2900000, contracts_count: 19, percentage: 18.4 },
    { id: 4, name: 'Carlos Mendes', total_value: 2300000, contracts_count: 16, percentage: 14.6 },
    { id: 5, name: 'Sofia Costa', total_value: 1950000, contracts_count: 12, percentage: 12.4 },
  ],
  
  recent_contracts: [
    {
      id: 1,
      contract_number: 'CTR-2024-001',
      title: 'Crude Oil Supply Agreement - Q1 2024',
      counterparty_name: 'Energy Corp Solutions',
      total_value: 850000,
      currency: 'EUR',
      status: 'ACTIVE',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      contract_number: 'CTR-2024-002',
      title: 'Natural Gas Distribution Contract',
      counterparty_name: 'Global Trading Ltd',
      total_value: 620000,
      currency: 'EUR',
      status: 'DRAFT',
      created_at: '2024-01-14T14:22:00Z',
    },
    {
      id: 3,
      contract_number: 'CTR-2024-003',
      title: 'Wheat Import Agreement - Spring Delivery',
      counterparty_name: 'Iberian Resources SA',
      total_value: 420000,
      currency: 'EUR',
      status: 'ACTIVE',
      created_at: '2024-01-12T09:15:00Z',
    },
    {
      id: 4,
      contract_number: 'CTR-2024-004',
      title: 'Copper Mining Rights Extension',
      counterparty_name: 'Atlantic Commodities',
      total_value: 1200000,
      currency: 'EUR',
      status: 'COMPLETED',
      created_at: '2024-01-10T16:45:00Z',
    },
    {
      id: 5,
      contract_number: 'CTR-2024-005',
      title: 'Gold Trading Framework Agreement',
      counterparty_name: 'European Energy Hub',
      total_value: 950000,
      currency: 'EUR',
      status: 'ACTIVE',
      created_at: '2024-01-08T11:20:00Z',
    },
  ],
  
  expiring_contracts: [
    {
      id: 1,
      contract_number: 'CTR-2023-089',
      title: 'Annual Oil Supply Contract',
      counterparty_name: 'Energy Corp Solutions',
      end_date: '2024-01-25',
      days_until_expiry: 5,
    },
    {
      id: 2,
      contract_number: 'CTR-2023-095',
      title: 'Gas Distribution Agreement',
      counterparty_name: 'Global Trading Ltd',
      end_date: '2024-01-30',
      days_until_expiry: 10,
    },
    {
      id: 3,
      contract_number: 'CTR-2023-078',
      title: 'Wheat Supply Contract',
      counterparty_name: 'Iberian Resources SA',
      end_date: '2024-01-18',
      days_until_expiry: -2, // Expired
    },
  ],
  
  overdue_tasks: 3,
  pending_approvals: 7,
});

const generateMockAlerts = (): AlertItem[] => [
  {
    id: 1,
    type: 'expiring',
    title: 'Contract CTR-2023-089 expires in 5 days',
    description: 'Annual Oil Supply Contract with Energy Corp Solutions needs renewal',
    date: '2024-01-25',
    priority: 'high',
    actionUrl: '/contracts/1',
  },
  {
    id: 2,
    type: 'approval',
    title: 'Contract approval required',
    description: 'Natural Gas Distribution Contract (CTR-2024-002) pending manager approval',
    priority: 'medium',
    actionUrl: '/contracts/2/approve',
  },
  {
    id: 3,
    type: 'overdue',
    title: 'Contract CTR-2023-078 has expired',
    description: 'Wheat Supply Contract expired 2 days ago and requires immediate attention',
    date: '2024-01-18',
    priority: 'high',
    actionUrl: '/contracts/3',
  },
  {
    id: 4,
    type: 'warning',
    title: 'High contract volume this month',
    description: 'You are approaching your monthly contract limit (89/100)',
    priority: 'low',
  },
];

export function useDashboard(initialFilters?: Partial<DashboardFilters>): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: '30d',
    contract_type: 'ALL',
    ...initialFilters,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, replace this with actual API calls
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(generateMockData());
      } else {
        // Real API call
        const response = await api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS, {
          ...filters,
        });
        setStats(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refetch data when filters change
  useEffect(() => {
    if (stats) { // Don't refetch on initial load
      fetchDashboardData();
    }
  }, [filters, fetchDashboardData, stats]);

  return {
    stats,
    loading,
    error,
    refreshData,
    updateFilters,
    filters,
  };
}

// Separate hook for alerts data
export function useDashboardAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, replace with real API call
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAlerts(generateMockAlerts());
      } else {
        // Real API call
        const response = await api.get<AlertItem[]>('/dashboard/alerts/');
        setAlerts(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
      console.error('Alerts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refreshAlerts: fetchAlerts,
  };
}

export default useDashboard;