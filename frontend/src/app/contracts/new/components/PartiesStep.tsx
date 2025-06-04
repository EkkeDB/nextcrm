// File: src/app/contracts/new/components/PartiesStep.tsx

'use client';

import { useState } from 'react';
import { ContractFormData } from '@/types/contract-form';
import { Commodity, Counterparty, Trader, CostCenter } from '@/types/contracts';
import { Search, Building, Package, User, Briefcase, ChevronDown, Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PartiesStepProps {
  formData: ContractFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<ContractFormData>) => void;
  commodities: Commodity[];
  counterparties: Counterparty[];
  traders: Trader[];
  costCenters: CostCenter[];
  loading: boolean;
}

interface SelectableItemProps {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const SelectableItem = ({ id, title, subtitle, icon, selected, onSelect }: SelectableItemProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm',
      selected
        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
        : 'border-gray-200 hover:border-gray-300'
    )}
  >
    <div className="flex items-center space-x-3">
      <div className={cn(
        'p-2 rounded-lg',
        selected ? 'bg-primary/10' : 'bg-gray-100'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      {selected && (
        <div className="flex-shrink-0">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  </button>
);

interface SearchableSelectProps {
  title: string;
  placeholder: string;
  items: any[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  renderItem: (item: any) => { title: string; subtitle: string; icon: React.ReactNode };
  error?: string;
  required?: boolean;
}

const SearchableSelect = ({
  title,
  placeholder,
  items,
  selectedId,
  onSelect,
  renderItem,
  error,
  required = false
}: SearchableSelectProps) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const { title, subtitle } = renderItem(item);
    const searchLower = search.toLowerCase();
    return title.toLowerCase().includes(searchLower) || 
           subtitle.toLowerCase().includes(searchLower);
  });

  const selectedItem = items.find(item => item.id === selectedId);
  const selectedDisplay = selectedItem ? renderItem(selectedItem) : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full p-3 border rounded-lg text-left bg-white flex items-center justify-between',
            error ? 'border-red-300' : 'border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
          )}
        >
          {selectedDisplay ? (
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-gray-100 rounded">
                {selectedDisplay.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedDisplay.title}</p>
                <p className="text-xs text-gray-500">{selectedDisplay.subtitle}</p>
              </div>
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronDown className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredItems.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredItems.map(item => {
                    const display = renderItem(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelect(item.id);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={cn(
                          'w-full p-3 rounded-lg text-left transition-colors',
                          selectedId === item.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1 bg-gray-100 rounded">
                            {display.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{display.title}</p>
                            <p className="text-xs text-gray-500">{display.subtitle}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No {title.toLowerCase()} found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New {title}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export function PartiesStep({
  formData,
  errors,
  onChange,
  commodities,
  counterparties,
  traders,
  costCenters,
  loading
}: PartiesStepProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching counterparties, commodities, and traders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Parties & Commodity</h2>
        <p className="text-gray-600">
          Select the counterparty, commodity, trader, and cost center for this contract
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Counterparty Selection */}
        <SearchableSelect
          title="Counterparty"
          placeholder="Select a counterparty"
          items={counterparties}
          selectedId={formData.counterparty_id}
          onSelect={(id) => onChange({ counterparty_id: id })}
          renderItem={(counterparty) => ({
            title: counterparty.name,
            subtitle: `${counterparty.company_type} • ${counterparty.country}`,
            icon: <Building className="w-4 h-4 text-gray-600" />
          })}
          error={errors.counterparty_id}
          required
        />

        {/* Commodity Selection */}
        <SearchableSelect
          title="Commodity"
          placeholder="Select a commodity"
          items={commodities}
          selectedId={formData.commodity_id}
          onSelect={(id) => onChange({ commodity_id: id })}
          renderItem={(commodity) => ({
            title: commodity.name,
            subtitle: `${commodity.category} • ${commodity.code}`,
            icon: <Package className="w-4 h-4 text-gray-600" />
          })}
          error={errors.commodity_id}
          required
        />

        {/* Trader Selection */}
        <SearchableSelect
          title="Trader"
          placeholder="Select a trader"
          items={traders}
          selectedId={formData.trader_id}
          onSelect={(id) => onChange({ trader_id: id })}
          renderItem={(trader) => ({
            title: `${trader.first_name} ${trader.last_name}`,
            subtitle: trader.email,
            icon: <User className="w-4 h-4 text-gray-600" />
          })}
          error={errors.trader_id}
          required
        />

        {/* Cost Center Selection */}
        <SearchableSelect
          title="Cost Center"
          placeholder="Select a cost center"
          items={costCenters}
          selectedId={formData.cost_center_id}
          onSelect={(id) => onChange({ cost_center_id: id })}
          renderItem={(costCenter) => ({
            title: costCenter.name,
            subtitle: costCenter.code,
            icon: <Briefcase className="w-4 h-4 text-gray-600" />
          })}
          error={errors.cost_center_id}
          required
        />
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900">Selection Tips</h4>
            <p className="text-sm text-green-700 mt-1">
              Use the search function to quickly find items. The commodity selection will automatically 
              set the default unit of measure for the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartiesStep;