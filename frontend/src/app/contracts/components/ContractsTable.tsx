// File: src/app/contracts/components/ContractsTable.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Contract, ContractSortConfig } from '@/types/contracts';
import { CONTRACT_STATUS_OPTIONS, CONTRACT_TYPE_OPTIONS } from '@/lib/constants';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash,
  FileText,
  MapPin,
  Calendar,
  User,
  Building
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface ContractsTableProps {
  contracts: Contract[];
  loading: boolean;
  sortConfig: ContractSortConfig;
  onSort: (sort: ContractSortConfig) => void;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
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
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      colorClasses[config.color as keyof typeof colorClasses] || colorClasses.gray
    )}>
      {config.label}
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const typeConfig = CONTRACT_TYPE_OPTIONS.find(t => t.value === type);
  const config = typeConfig || { label: type, color: 'gray' };
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      colorClasses[config.color as keyof typeof colorClasses] || colorClasses.gray
    )}>
      {config.label}
    </span>
  );
};

const ContractActions = ({ contract }: { contract: Contract }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

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
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                // Handle duplicate
                setIsOpen(false);
              }}
            >
              <Copy className="w-4 h-4 mr-3" />
              Duplicate
            </button>
            <div className="border-t my-1" />
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                // Handle delete
                setIsOpen(false);
              }}
            >
              <Trash className="w-4 h-4 mr-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TableHeader = ({ 
  field, 
  label, 
  sortable = true, 
  sortConfig, 
  onSort 
}: {
  field: string;
  label: string;
  sortable?: boolean;
  sortConfig: ContractSortConfig;
  onSort: (sort: ContractSortConfig) => void;
}) => {
  const isSorted = sortConfig.field === field;
  
  const handleSort = () => {
    if (!sortable) return;
    
    const newDirection = isSorted && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction: newDirection });
  };

  return (
    <th 
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-50'
      )}
      onClick={handleSort}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                'w-3 h-3 -mb-1',
                isSorted && sortConfig.direction === 'asc' ? 'text-gray-900' : 'text-gray-300'
              )} 
            />
            <ChevronDown 
              className={cn(
                'w-3 h-3',
                isSorted && sortConfig.direction === 'desc' ? 'text-gray-900' : 'text-gray-300'
              )} 
            />
          </div>
        )}
      </div>
    </th>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {Array.from({ length: 10 }).map((_, index) => (
      <tr key={index} className="border-b border-gray-200">
        <td className="px-6 py-4">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-6 py-4">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </td>
      </tr>
    ))}
  </div>
);

export function ContractsTable({
  contracts,
  loading,
  sortConfig,
  onSort,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onClearSelection,
}: ContractsTableProps) {
  const isAllSelected = contracts.length > 0 && selectedIds.length === contracts.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < contracts.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  const handleRowSelect = (contractId: number) => {
    if (selectedIds.includes(contractId)) {
      onSelectionChange(selectedIds.filter(id => id !== contractId));
    } else {
      onSelectionChange([...selectedIds, contractId]);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </th>
              <TableHeader field="contract_number" label="Contract #" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="title" label="Title" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="contract_type" label="Type" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="counterparty.name" label="Counterparty" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="commodity.name" label="Commodity" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="total_value" label="Value" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="status" label="Status" sortConfig={sortConfig} onSort={onSort} />
              <TableHeader field="end_date" label="End Date" sortConfig={sortConfig} onSort={onSort} />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <LoadingSkeleton />
            ) : contracts.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No contracts found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search criteria or create a new contract</p>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((contract) => (
                <tr 
                  key={contract.id} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedIds.includes(contract.id) && 'bg-blue-50'
                  )}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contract.id)}
                      onChange={() => handleRowSelect(contract.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      {contract.contract_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-xs">
                      {contract.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {contract.description && contract.description.length > 50 
                        ? `${contract.description.substring(0, 50)}...` 
                        : contract.description
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={contract.contract_type} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.counterparty.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contract.counterparty.country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{contract.commodity.name}</div>
                    <div className="text-xs text-gray-500">
                      {contract.quantity.toLocaleString()} {contract.unit_of_measure}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(contract.total_value, contract.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(contract.price_per_unit, contract.currency)}/{contract.unit_of_measure}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDate(contract.end_date)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <User className="w-3 h-3 text-gray-400 inline mr-1" />
                      {contract.trader.first_name} {contract.trader.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ContractActions contract={contract} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContractsTable;