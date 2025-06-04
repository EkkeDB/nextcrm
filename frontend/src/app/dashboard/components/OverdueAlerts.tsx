// File: src/app/dashboard/components/OverdueAlerts.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate, daysBetween, cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  Eye,
  AlertCircle,
  Filter
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { AlertItem } from '@/types/dashboard';

interface ExpiringContract {
  id: number;
  contract_number: string;
  title: string;
  counterparty_name: string;
  end_date: string;
  days_until_expiry: number;
  total_value: number;
  currency: string;
  status: string;
}

interface OverdueAlertsProps {
  expiringContracts: ExpiringContract[];
  alerts: AlertItem[];
  loading?: boolean;
}

const AlertIcon = ({ type, priority }: { type: AlertItem['type']; priority: AlertItem['priority'] }) => {
  const getIconColor = () => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const iconClass = cn('w-5 h-5', getIconColor());

  switch (type) {
    case 'expiring':
      return <Clock className={iconClass} />;
    case 'overdue':
      return <AlertTriangle className={iconClass} />;
    case 'approval':
      return <CheckCircle className={iconClass} />;
    case 'warning':
      return <AlertCircle className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const PriorityBadge = ({ priority }: { priority: AlertItem['priority'] }) => {
  const badgeClasses = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      badgeClasses[priority]
    )}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const UrgencyIndicator = ({ days }: { days: number }) => {
  let color = 'bg-green-500';
  let urgency = 'Low';
  
  if (days <= 0) {
    color = 'bg-red-500';
    urgency = 'Expired';
  } else if (days <= 7) {
    color = 'bg-red-500';
    urgency = 'Critical';
  } else if (days <= 30) {
    color = 'bg-yellow-500';
    urgency = 'Warning';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-xs text-gray-600">{urgency}</span>
    </div>
  );
};

const ExpiringContractCard = ({ contract }: { contract: ExpiringContract }) => {
  const isExpired = contract.days_until_expiry <= 0;
  const isCritical = contract.days_until_expiry <= 7;

  return (
    <div className={cn(
      'p-4 border rounded-lg transition-colors',
      isExpired ? 'border-red-200 bg-red-50' : 
      isCritical ? 'border-yellow-200 bg-yellow-50' : 
      'border-gray-200 bg-white hover:bg-gray-50'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-lg',
            isExpired ? 'bg-red-100' : isCritical ? 'bg-yellow-100' : 'bg-blue-100'
          )}>
            {isExpired ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Clock className={cn(
                'w-4 h-4',
                isCritical ? 'text-yellow-600' : 'text-blue-600'
              )} />
            )}
          </div>
          <div>
            <Link
              href={`/contracts/${contract.id}`}
              className="text-sm font-medium text-gray-900 hover:text-primary"
            >
              {contract.contract_number}
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              {contract.counterparty_name}
            </p>
          </div>
        </div>
        <UrgencyIndicator days={contract.days_until_expiry} />
      </div>

      <h4 className="text-sm text-gray-900 mb-2 line-clamp-2">
        {contract.title}
      </h4>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {isExpired 
                ? `Expired ${Math.abs(contract.days_until_expiry)} days ago`
                : `${contract.days_until_expiry} days remaining`
              }
            </span>
          </div>
        </div>
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: contract.currency
          }).format(contract.total_value)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-xs text-gray-500">
          Expires on {formatDate(contract.end_date)}
        </span>
        <Link
          href={`/contracts/${contract.id}`}
          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center"
        >
          <Eye className="w-3 h-3 mr-1" />
          Review
        </Link>
      </div>
    </div>
  );
};

const AlertCard = ({ alert }: { alert: AlertItem }) => (
  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
    <div className="mt-0.5">
      <AlertIcon type={alert.type} priority={alert.priority} />
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {alert.title}
        </h4>
        <PriorityBadge priority={alert.priority} />
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        {alert.description}
      </p>
      
      <div className="flex items-center justify-between">
        {alert.date && (
          <span className="text-xs text-gray-500">
            {formatDate(alert.date)}
          </span>
        )}
        {alert.actionUrl && (
          <Link
            href={alert.actionUrl}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Take Action
          </Link>
        )}
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export function OverdueAlerts({ 
  expiringContracts, 
  alerts, 
  loading = false 
}: OverdueAlertsProps) {
  const [activeTab, setActiveTab] = useState<'expiring' | 'alerts'>('expiring');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Filter alerts by priority
  const filteredAlerts = priorityFilter 
    ? alerts.filter(alert => alert.priority === priorityFilter)
    : alerts;

  // Separate expired and expiring contracts
  const expiredContracts = expiringContracts.filter(c => c.days_until_expiry <= 0);
  const expiringContractsFiltered = expiringContracts.filter(c => c.days_until_expiry > 0);

  const totalIssues = expiringContracts.length + alerts.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Alerts & Notifications
              </h3>
              <p className="text-sm text-gray-500">
                {totalIssues} items requiring attention
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('expiring')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'expiring'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Expiring Contracts ({expiringContracts.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'alerts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            System Alerts ({alerts.length})
          </button>
        </div>

        {/* Priority Filter for Alerts */}
        {activeTab === 'alerts' && (
          <div className="mt-4">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : activeTab === 'expiring' ? (
          <div className="space-y-6">
            {/* Expired Contracts */}
            {expiredContracts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Expired Contracts ({expiredContracts.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiredContracts.map(contract => (
                    <ExpiringContractCard key={contract.id} contract={contract} />
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Soon */}
            {expiringContractsFiltered.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Expiring Soon ({expiringContractsFiltered.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiringContractsFiltered.map(contract => (
                    <ExpiringContractCard key={contract.id} contract={contract} />
                  ))}
                </div>
              </div>
            )}

            {expiringContracts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No expiring contracts</p>
                <p className="text-sm text-gray-400">All contracts are up to date</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {priorityFilter ? 'No alerts match your filter' : 'No system alerts'}
                </p>
                <p className="text-sm text-gray-400">
                  {priorityFilter ? 'Try selecting a different priority level' : 'Everything looks good!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OverdueAlerts;