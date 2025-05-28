// File: src/app/contracts/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { useContracts } from '@/hooks/useContracts';
import { ContractBulkAction } from '@/types/contracts';
import Button from '@/components/ui/Button';
import ContractsTable from './components/ContractsTable';
import ContractsFilters from './components/ContractsFilters';
import { 
  Plus, 
  Download, 
  RefreshCw, 
  Trash, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ContractsHeader({ 
  selectedCount, 
  onBulkAction, 
  onRefresh, 
  loading 
}: {
  selectedCount: number;
  onBulkAction: (action: ContractBulkAction) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const router = useRouter();

  const bulkActions = [
    { 
      action: 'approve' as const, 
      label: 'Approve', 
      icon: CheckCircle, 
      className: 'text-green-600 hover:bg-green-50' 
    },
    { 
      action: 'suspend' as const, 
      label: 'Suspend', 
      icon: Pause, 
      className: 'text-yellow-600 hover:bg-yellow-50' 
    },
    { 
      action: 'activate' as const, 
      label: 'Activate', 
      icon: Play, 
      className: 'text-blue-600 hover:bg-blue-50' 
    },
    { 
      action: 'delete' as const, 
      label: 'Delete', 
      icon: Trash, 
      className: 'text-red-600 hover:bg-red-50' 
    },
  ];

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">Manage and track your business contracts</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600">
                {selectedCount} selected
              </span>
              <div className="flex border border-gray-300 rounded-md">
                {bulkActions.map((action, index) => (
                  <button
                    key={action.action}
                    onClick={() => onBulkAction({ 
                      action: action.action, 
                      contract_ids: [] // Will be filled by the parent component
                    })}
                    className={cn(
                      'flex items-center px-3 py-1.5 text-sm font-medium transition-colors',
                      index === 0 && 'rounded-l-md',
                      index === bulkActions.length - 1 && 'rounded-r-md',
                      index > 0 && 'border-l border-gray-300',
                      action.className
                    )}
                    disabled={loading}
                  >
                    <action.icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>

          <Button
            onClick={() => {/* Handle export */}}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => router.push('/contracts/new')}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContractsPagination({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalCount, 
  onPageChange, 
  onPageSizeChange 
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="bg-white px-6 py-4 border-t flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Showing {startItem}-{endItem} of {totalCount} contracts
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:ring-primary"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page !== 'number'}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded transition-colors',
              typeof page === 'number' && page === currentPage
                ? 'bg-primary text-white'
                : typeof page === 'number'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-default'
            )}
          >
            {page}
          </button>
        ))}

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function ContractsContent() {
  const {
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
    setPageSize,
    setFilters,
    setSort,
    refreshContracts,
    bulkAction,
    selectedIds,
    setSelectedIds,
    selectAll,
    clearSelection,
  } = useContracts();

  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleBulkAction = async (action: ContractBulkAction) => {
    if (selectedIds.length === 0) return;

    try {
      setBulkActionLoading(true);
      await bulkAction({
        ...action,
        contract_ids: selectedIds,
      });
      // Success handled by the hook (refreshes data and clears selection)
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      // Handle error (could show a toast notification)
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load contracts
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={refreshContracts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContractsHeader
        selectedCount={selectedIds.length}
        onBulkAction={handleBulkAction}
        onRefresh={refreshContracts}
        loading={loading || bulkActionLoading}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <ContractsFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        <ContractsTable
          contracts={contracts}
          loading={loading}
          sortConfig={sortConfig}
          onSort={setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
        />

        {totalCount > 0 && (
          <ContractsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <AuthGuard>
      <ContractsContent />
    </AuthGuard>
  );
}