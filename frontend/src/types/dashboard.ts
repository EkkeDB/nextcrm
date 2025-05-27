// File: src/types/dashboard.ts

export interface DashboardStats {
  // Overview Stats
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  draft_contracts: number;
  total_contract_value: number;
  monthly_revenue: number;
  total_counterparties: number;
  active_counterparties: number;
  
  // Period Comparisons
  contracts_change_percent: number;
  revenue_change_percent: number;
  counterparties_change_percent: number;
  
  // Contract Status Distribution
  contracts_by_status: {
    DRAFT: number;
    ACTIVE: number;
    COMPLETED: number;
    CANCELLED: number;
    SUSPENDED: number;
  };
  
  // Revenue Trends (last 12 months)
  revenue_by_month: Array<{
    month: string;
    year: number;
    revenue: number;
    contracts_count: number;
  }>;
  
  // Top Performing Data
  top_commodities: Array<{
    id: number;
    name: string;
    total_value: number;
    contracts_count: number;
    percentage: number;
  }>;
  
  top_counterparties: Array<{
    id: number;
    name: string;
    total_value: number;
    contracts_count: number;
    percentage: number;
  }>;
  
  top_traders: Array<{
    id: number;
    name: string;
    total_value: number;
    contracts_count: number;
    percentage: number;
  }>;
  
  // Recent Activity
  recent_contracts: Array<{
    id: number;
    contract_number: string;
    title: string;
    counterparty_name: string;
    total_value: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  
  // Alerts and Notifications
  expiring_contracts: Array<{
    id: number;
    contract_number: string;
    title: string;
    counterparty_name: string;
    end_date: string;
    days_until_expiry: number;
  }>;
  
  overdue_tasks: number;
  pending_approvals: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
  loading?: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  contracts: number;
  previousRevenue?: number;
}

export interface StatusDistributionData {
  status: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TopPerformerData {
  id: number;
  name: string;
  value: number;
  count: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface AlertItem {
  id: number;
  type: 'expiring' | 'overdue' | 'approval' | 'warning';
  title: string;
  description: string;
  date?: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface DashboardFilters {
  period: '7d' | '30d' | '90d' | '12m' | 'ytd' | 'all';
  contract_type?: 'PURCHASE' | 'SALE' | 'ALL';
  status?: string[];
  trader_id?: number;
  cost_center_id?: number;
}