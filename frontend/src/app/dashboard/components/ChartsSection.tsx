// File: src/app/dashboard/components/ChartsSection.tsx

'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  RevenueChartData, 
  StatusDistributionData, 
  TopPerformerData 
} from '@/types/dashboard';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ChartsSectionProps {
  revenueData: RevenueChartData[];
  statusData: StatusDistributionData[];
  topCommodities: TopPerformerData[];
  topCounterparties: TopPerformerData[];
  loading?: boolean;
}

const COLORS = {
  DRAFT: '#9CA3AF',
  ACTIVE: '#10B981',
  COMPLETED: '#3B82F6',
  CANCELLED: '#EF4444',
  SUSPENDED: '#F59E0B',
};

const ChartCard = ({ 
  title, 
  children, 
  className,
  actions 
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  actions?: React.ReactNode;
}) => (
  <div className={cn('bg-white p-6 rounded-lg shadow-sm border', className)}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actions}
    </div>
    {children}
  </div>
);

const ChartLoadingSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="animate-pulse">
    <div className={`bg-gray-200 rounded`} style={{ height: `${height}px` }}></div>
  </div>
);

export function ChartsSection({
  revenueData,
  statusData,
  topCommodities,
  topCounterparties,
  loading = false
}: ChartsSectionProps) {
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | '24m'>('12m');

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: pld.color }}
                />
                <span className="text-sm text-gray-600">{pld.dataKey === 'revenue' ? 'Revenue' : 'Contracts'}</span>
              </div>
              <span className="text-sm font-medium">
                {pld.dataKey === 'revenue' 
                  ? formatCurrency(pld.value) 
                  : `${pld.value} contracts`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const StatusTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.status}</p>
          <p className="text-sm text-gray-600">
            {data.value} contracts ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderRevenueChart = () => {
    if (loading) return <ChartLoadingSkeleton height={400} />;

    const chartProps = {
      data: revenueData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

            switch (revenueChartType) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<RevenueTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<RevenueTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<RevenueTooltip />} />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Invalid chart type</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trends Chart */}
      <ChartCard
        title="Revenue Trends"
        className="col-span-2"
        actions={
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '6m' | '12m' | '24m')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="24m">Last 24 months</option>
            </select>
            <div className="flex border border-gray-300 rounded-md">
              {(['line', 'area', 'bar'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setRevenueChartType(type)}
                  className={cn(
                    'px-3 py-1 text-sm capitalize first:rounded-l-md last:rounded-r-md',
                    revenueChartType === type
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {renderRevenueChart()}
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Status Distribution */}
        <ChartCard title="Contract Status Distribution">
          {loading ? (
            <ChartLoadingSkeleton height={300} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || COLORS[entry.status as keyof typeof COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Top Commodities */}
        <ChartCard title="Top Commodities by Value">
          {loading ? (
            <ChartLoadingSkeleton height={300} />
          ) : (
            <div className="space-y-4">
              {topCommodities.slice(0, 5).map((commodity, index) => (
                <div key={commodity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{commodity.name}</p>
                      <p className="text-sm text-gray-500">{commodity.count} contracts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(commodity.value)}
                    </p>
                    <p className="text-sm text-gray-500">{commodity.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Counterparties */}
      <ChartCard title="Top Counterparties by Contract Value">
        {loading ? (
          <ChartLoadingSkeleton height={200} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Counterparty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contracts</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Share</th>
                </tr>
              </thead>
              <tbody>
                {topCounterparties.slice(0, 5).map((counterparty, index) => (
                  <tr key={counterparty.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{counterparty.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{counterparty.count}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(counterparty.value)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${counterparty.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {counterparty.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

export default ChartsSection;