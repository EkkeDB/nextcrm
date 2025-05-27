// File: src/app/dashboard/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { useAuth, useAuthHelpers } from '@/hooks/useAuth';
import { useDashboard, useDashboardAlerts } from '@/hooks/useDashboard';
import Button from '@/components/ui/Button';
import { 
  LogOut, 
  Settings, 
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import StatsCards from './components/StatsCards';
import ChartsSection from './components/ChartsSection';
import RecentContracts from './components/RecentContracts';
import OverdueAlerts from './components/OverdueAlerts';
import type { DashboardFilters as DashboardFiltersType } from '@/types/dashboard';

function DashboardHeader() {
  const { logout } = useAuth();
  const { user, getUserDisplayName, getRoleDisplayName } = useAuthHelpers();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              NextCRM
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName()}
              </p>
            </div>
            
            <Button
              onClick={() => router.push('/settings')}
              variant="ghost"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardFilters({ 
  filters, 
  onFiltersChange,
  onRefresh,
  refreshing = false
}: {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: Partial<DashboardFiltersType>) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Period Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filters.period}
              onChange={(e) => onFiltersChange({ period: e.target.value as DashboardFiltersType['period'] })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
              <option value="ytd">Year to date</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Contract Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.contract_type}
              onChange={(e) => onFiltersChange({ 
                contract_type: e.target.value as DashboardFiltersType['contract_type'] 
              })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Contracts</option>
              <option value="PURCHASE">Purchase Only</option>
              <option value="SALE">Sale Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    stats, 
    loading, 
    error, 
    refreshData, 
    updateFilters, 
    filters 
  } = useDashboard();
  
  const { 
    alerts, 
    loading: alertsLoading 
  } = useDashboardAlerts();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAllContracts = () => {
    router.push('/contracts');
  };

  // Transform data for components
  const revenueData = stats?.revenue_by_month.map(item => ({
    month: item.month,
    revenue: item.revenue,
    contracts: item.contracts_count,
  })) || [];

  const statusData = stats ? Object.entries(stats.contracts_by_status).map(([status, value]) => ({
    status,
    value,
    color: '',
    percentage: Math.round((value / stats.total_contracts) * 100),
  })) : [];

  const expiringContracts = stats?.expiring_contracts.map(contract => ({
    ...contract,
    total_value: 500000, // Mock value
    currency: 'EUR',
    status: 'ACTIVE',
  })) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || 'User'}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your contracts and business today.
          </p>
        </div>

        {/* Filters */}
        <DashboardFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards 
            stats={stats ? {
              total_contracts: stats.total_contracts,
              active_contracts: stats.active_contracts,
              total_contract_value: stats.total_contract_value,
              monthly_revenue: stats.monthly_revenue,
              total_counterparties: stats.total_counterparties,
              contracts_change_percent: stats.contracts_change_percent,
              revenue_change_percent: stats.revenue_change_percent,
              counterparties_change_percent: stats.counterparties_change_percent,
            } : null}
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ChartsSection
            revenueData={revenueData}
            statusData={statusData}
            topCommodities={stats?.top_commodities.map(item => ({
              id: item.id,
              name: item.name,
              value: item.total_value,
              count: item.contracts_count,
              percentage: item.percentage,
            })) || []}
            topCounterparties={stats?.top_counterparties.map(item => ({
              id: item.id,
              name: item.name,
              value: item.total_value,
              count: item.contracts_count,
              percentage: item.percentage,
            })) || []}
            loading={loading}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Contracts - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentContracts
              contracts={stats?.recent_contracts.map(contract => ({
                ...contract,
                contract_type: 'PURCHASE' as const,
                end_date: '2024-12-31',
                trader_name: 'Maria Silva',
              })) || []}
              loading={loading}
              onViewAll={handleViewAllContracts}
            />
          </div>

          {/* Alerts - Takes 1 column */}
          <div className="lg:col-span-1">
            <OverdueAlerts
              expiringContracts={expiringContracts}
              alerts={alerts}
              loading={alertsLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}