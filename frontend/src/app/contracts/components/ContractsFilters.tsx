// File: src/app/contracts/components/ContractsFilters.tsx

'use client';

import { useState } from 'react';
import { ContractFilters } from '@/types/contracts';
import { CONTRACT_STATUS_OPTIONS, CONTRACT_TYPE_OPTIONS, CURRENCIES } from '@/lib/constants';
import { Search, Filter, X, Calendar, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ContractsFiltersProps {
  filters: ContractFilters;
  onFiltersChange: (filters: Partial<ContractFilters>) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function ContractsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false
}: ContractsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value || undefined });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked 
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFiltersChange({ 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.contract_type || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    onFiltersChange({ 
      contract_type: newTypes.length > 0 ? newTypes : undefined 
    });
  };

  const handleDateRangeChange = (field: 'start_date_from' | 'start_date_to' | 'end_date_from' | 'end_date_to', value: string) => {
    onFiltersChange({ [field]: value || undefined });
  };

  const handleValueRangeChange = (field: 'min_value' | 'max_value', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({ [field]: numValue });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Basic Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search contracts by number, title, counterparty, or commodity..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_STATUS_OPTIONS.map((status) => (
                <label
                  key={status.value}
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors',
                    filters.status?.includes(status.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status.value) || false}
                    onChange={(e) => handleStatusChange(status.value, e.target.checked)}
                    className="sr-only"
                  />
                  {status.label}
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <div className="flex gap-2">
              {CONTRACT_TYPE_OPTIONS.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors',
                    filters.contract_type?.includes(type.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={filters.contract_type?.includes(type.value) || false}
                    onChange={(e) => handleTypeChange(type.value, e.target.checked)}
                    className="sr-only"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Ranges */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Start Date Range
              </h4>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.start_date_from || ''}
                  onChange={(e) => handleDateRangeChange('start_date_from', e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.start_date_to || ''}
                  onChange={(e) => handleDateRangeChange('start_date_to', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                End Date Range
              </h4>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.end_date_from || ''}
                  onChange={(e) => handleDateRangeChange('end_date_from', e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.end_date_to || ''}
                  onChange={(e) => handleDateRangeChange('end_date_to', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Value Range */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Contract Value Range
              </h4>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Minimum value"
                  value={filters.min_value || ''}
                  onChange={(e) => handleValueRangeChange('min_value', e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="number"
                  placeholder="Maximum value"
                  value={filters.max_value || ''}
                  onChange={(e) => handleValueRangeChange('max_value', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Currency Filter */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Currency</h4>
              <select
                value={filters.currency?.[0] || ''}
                onChange={(e) => onFiltersChange({ 
                  currency: e.target.value ? [e.target.value] : undefined 
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                disabled={loading}
              >
                <option value="">All Currencies</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Created Date Range */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Created Date Range</h4>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.created_from || ''}
                  onChange={(e) => onFiltersChange({ created_from: e.target.value || undefined })}
                  disabled={loading}
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.created_to || ''}
                  onChange={(e) => onFiltersChange({ created_to: e.target.value || undefined })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractsFilters;