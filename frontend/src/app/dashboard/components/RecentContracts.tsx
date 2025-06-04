// File: src/app/dashboard/components/RecentContracts.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  FileText, 
  ExternalLink, 
  Filter, 
  Search,
  MoreVertical,
  Eye,
  Edit,
  Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { CONTRACT_STATUS_OPTIONS } from '@/lib/constants';

interface RecentContract {
  id: number;
  contract_number: string;
  title: string;
  counterparty_name: string;
  total_value: number;
  currency: string;
  status: string;
  contract_type: 'PURCHASE' | 'SALE';
  created_at: string;
  end_date: string;
  trader_name?: string;
}

interface RecentContractsProps {
  contracts: RecentContract[];
  loading?: boolean;
  showAll?: boolean;
  onViewAll?: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = CONTRACT_STATUS_OPTIONS.find(s => s.value === status);
  const config = statusConfig || { label: status, color: 'gray' };
  
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClasses[config.color as keyof typeof colorClasses] || colorClasses.gray
    )}>
      {config.label}
    </span>
  );
};

const ContractTypeIcon = ({ type }: { type: 'PURCHASE' | 'SALE' }) => {
  return type === 'PURCHASE' ? (
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
  ) : (
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </div>
  );
};

const ContractDropdown = ({ contract }: { contract: RecentContract }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <Link
              href={`/contracts/${contract.id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4 mr-3" />
              View Details
            </Link>
            <Link
              href={`/contracts/${contract.id}/edit`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit Contract
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const ContractRow = ({ contract }: { contract: RecentContract }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-4 flex-1">
      <ContractTypeIcon type={contract.contract_type} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <Link
            href={`/contracts/${contract.id}`}
            className="text-sm font-medium text-gray-900 hover:text-primary truncate"
          >
            {contract.contract_number}
          </Link>
          <StatusBadge status={contract.status} />
        </div>
        
        <p className="text-sm text-gray-600 truncate mb-1">
          {contract.title}
        </p>
        
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <span>{contract.counterparty_name}</span>
          {contract.trader_name && (
            <span>• Trader: {contract.trader_name}</span>
          )}
          <span>• Created {formatDate(contract.created_at)}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(contract.total_value, contract.currency)}
        </p>
        <p className="text-xs text-gray-500">
          Expires {formatDate(contract.end_date)}
        </p>
      </div>
      
      <ContractDropdown contract={contract} />
    </div>
  </div>
);

const ContractCard = ({ contract }: { contract: RecentContract }) => (
  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <ContractTypeIcon type={contract.contract_type} />
        <div>
          <Link
            href={`/contracts/${contract.id}`}
            className="text-sm font-medium text-gray-900 hover:text-primary"
          >
            {contract.contract_number}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(contract.created_at)}
          </p>
        </div>
      </div>
      <StatusBadge status={contract.status} />
    </div>

    <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
      {contract.title}
    </h4>

    <div className="space-y-2 text-xs text-gray-500 mb-3">
      <div className="flex items-center justify-between">
        <span>Counterparty:</span>
        <span className="font-medium text-gray-700">{contract.counterparty_name}</span>
      </div>
      {contract.trader_name && (
        <div className="flex items-center justify-between">
          <span>Trader:</span>
          <span className="font-medium text-gray-700">{contract.trader_name}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span>Value:</span>
        <span className="font-medium text-gray-900">
          {formatCurrency(contract.total_value, contract.currency)}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t">
      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="w-3 h-3 mr-1" />
        Expires {formatDate(contract.end_date)}
      </div>
      <Link
        href={`/contracts/${contract.id}`}
        className="text-xs text-primary hover:text-primary/80 font-medium"
      >
        View Details
      </Link>
    </div>
  </div>
);

const LoadingSkeleton = ({ variant = 'list' }: { variant?: 'list' | 'grid' }) => {
  const skeletonCount = variant === 'list' ? 5 : 6;
  
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function RecentContracts({ 
  contracts, 
  loading = false, 
  showAll = false,
  onViewAll 
}: RecentContractsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Filter contracts based on search and status
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayContracts = showAll ? filteredContracts : filteredContracts.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Contracts
          </h3>
          
          <div className="flex items-center space-x-2">
            {showAll && (
              <>
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-l-md',
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-r-md',
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    Grid
                  </button>
                </div>
              </>
            )}
            
            {onViewAll && !showAll && (
              <Button onClick={onViewAll} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {showAll && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">All Statuses</option>
              {CONTRACT_STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        showAll ? 'p-6' : 'p-0'
      )}>
        {loading ? (
          <LoadingSkeleton variant={viewMode} />
        ) : displayContracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchTerm || statusFilter ? 'No contracts match your filters' : 'No recent contracts'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm || statusFilter ? 'Try adjusting your search criteria' : 'Start by creating your first contract'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className={cn(showAll ? 'border rounded-lg' : '')}>
                {displayContracts.map(contract => (
                  <ContractRow key={contract.id} contract={contract} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayContracts.map(contract => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}

            {/* Show More Button for non-showAll mode */}
            {!showAll && contracts.length > 5 && (
              <div className="p-4 border-t text-center">
                <Button onClick={onViewAll} variant="outline">
                  View All {contracts.length} Contracts
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RecentContracts;