// File: src/app/dashboard/components/StatsCards.tsx

'use client';

import { StatCardProps } from '@/types/dashboard';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    text: 'text-gray-600',
  },
};

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  loading = false 
}: StatCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    // Format large numbers
    if (val >= 1000000) {
      return formatCurrency(val);
    } else if (val >= 1000) {
      return formatNumber(val);
    }
    return val.toString();
  };

  const renderChangeIndicator = () => {
    if (!change) return null;

    const isPositive = change.type === 'increase';
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
    const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <div className={cn('flex items-center text-sm', changeColor)}>
        <ChangeIcon className="w-4 h-4 mr-1" />
        <span className="font-medium">
          {Math.abs(change.value)}%
        </span>
        <span className="text-gray-500 ml-1">
          vs {change.period}
        </span>
      </div>
    );
  };

  return (
    <div className={cn('p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow', colors.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {renderChangeIndicator()}
        </div>
        <div className={cn('p-3 rounded-lg', colors.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    total_contracts: number;
    active_contracts: number;
    total_contract_value: number;
    monthly_revenue: number;
    total_counterparties: number;
    contracts_change_percent: number;
    revenue_change_percent: number;
    counterparties_change_percent: number;
  } | null;
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards: Omit<StatCardProps, 'loading'>[] = [
    {
      title: 'Total Contracts',
      value: stats?.total_contracts || 0,
      change: stats ? {
        value: stats.contracts_change_percent,
        type: stats.contracts_change_percent >= 0 ? 'increase' : 'decrease',
        period: 'last month',
      } : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Active Contracts',
      value: stats?.active_contracts || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats?.total_contract_value || 0),
      change: stats ? {
        value: stats.revenue_change_percent,
        type: stats.revenue_change_percent >= 0 ? 'increase' : 'decrease',
        period: 'last month',
      } : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.monthly_revenue || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      title: 'Counterparties',
      value: stats?.total_counterparties || 0,
      change: stats ? {
        value: stats.counterparties_change_percent,
        type: stats.counterparties_change_percent >= 0 ? 'increase' : 'decrease',
        period: 'last month',
      } : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'gray',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          {...card}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default StatsCards;