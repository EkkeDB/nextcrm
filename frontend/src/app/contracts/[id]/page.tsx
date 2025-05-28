// File: /c:/Mis_Proyectos/Python/NextCRM/frontend/src/app/contracts/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  User,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';

// Contract interface (should match your existing Contract type)
interface ContractDetail {
  id: string;
  title: string;
  contractNumber: string;
  type: 'purchase' | 'sales' | 'service';
  status: 'draft' | 'active' | 'pending' | 'expired' | 'cancelled';
  commodity: {
    name: string;
    category: string;
  };
  counterparty: {
    name: string;
    email: string;
    phone: string;
  };
  trader: {
    name: string;
    email: string;
  };
  financial: {
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalValue: number;
    currency: string;
    paymentTerms: string;
  };
  dates: {
    createdAt: string;
    startDate: string;
    endDate: string;
    deliveryDate: string;
  };
  deliveryLocation: string;
  description: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    user: string;
    date: string;
    details: string;
  }>;
}

// Mock contract data - this will be replaced with API call later
const getMockContract = (id: string): ContractDetail => ({
  id,
  title: `Contract ${id} - Sample Agreement`,
  contractNumber: `CT-2024-${id.padStart(3, '0')}`,
  type: 'purchase',
  status: 'active',
  commodity: {
    name: 'Hard Red Winter Wheat',
    category: 'Grains'
  },
  counterparty: {
    name: 'AgriCorp Ltd',
    email: 'contracts@agricorp.com',
    phone: '+1 (555) 123-4567'
  },
  trader: {
    name: 'John Smith',
    email: 'john.smith@company.com'
  },
  financial: {
    quantity: 1000,
    unit: 'MT',
    pricePerUnit: 250.00,
    totalValue: 250000,
    currency: 'USD',
    paymentTerms: 'Net 30 days'
  },
  dates: {
    createdAt: '2024-01-15',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    deliveryDate: '2024-03-15'
  },
  deliveryLocation: 'Chicago, IL - Warehouse District',
  description: 'Purchase agreement for high-quality hard red winter wheat for our Q1-Q4 operations. Contract includes quality specifications and delivery requirements.',
  documents: [
    {
      id: '1',
      name: 'Contract_Agreement.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Quality_Specifications.docx',
      type: 'DOC',
      size: '856 KB',
      uploadedAt: '2024-01-16'
    }
  ],
  history: [
    {
      id: '1',
      action: 'Contract Created',
      user: 'John Smith',
      date: '2024-01-15',
      details: 'Initial contract draft created'
    },
    {
      id: '2',
      action: 'Contract Activated',
      user: 'Jane Doe',
      date: '2024-01-20',
      details: 'Contract approved and activated'
    }
  ]
});

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation: const response = await fetch(`/api/contracts/${params.id}`);
        const contractData = getMockContract(params.id as string);
        setContract(contractData);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleEdit = () => {
    router.push(`/contracts/${params.id}/edit`);
  };

  const handleDuplicate = () => {
    console.log('Duplicate contract');
    // Implementation: create new contract with same data
    router.push('/contracts/new');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this contract?')) {
      console.log('Delete contract');
      // Implementation: API call to delete
      router.push('/contracts');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Not Found</h1>
          <p className="text-gray-600 mb-6">The contract you're looking for doesn't exist.</p>
          <Link 
            href="/contracts"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/contracts"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Contracts
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                {getStatusIcon(contract.status)}
                <span className="ml-1 capitalize">{contract.status}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={handleDuplicate}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => console.log('Export')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contract Info Bar */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <span><strong>Contract #:</strong> {contract.contractNumber}</span>
            <span><strong>Type:</strong> {contract.type}</span>
            <span><strong>Created:</strong> {new Date(contract.dates.createdAt).toLocaleDateString()}</span>
            <span><strong>Value:</strong> {contract.financial.currency} {contract.financial.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'financial', label: 'Financial Details' },
                { id: 'documents', label: 'Documents' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                      <p className="text-gray-900">{contract.commodity.name}</p>
                      <p className="text-sm text-gray-500">{contract.commodity.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <p className="text-gray-900">{contract.financial.quantity.toLocaleString()} {contract.financial.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty</label>
                      <p className="text-gray-900">{contract.counterparty.name}</p>
                      <p className="text-sm text-gray-500">{contract.counterparty.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Trader</label>
                      <p className="text-gray-900">{contract.trader.name}</p>
                      <p className="text-sm text-gray-500">{contract.trader.email}</p>
                    </div>
                  </div>
                </div>

                {/* Dates and Delivery */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates & Delivery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contract Period</label>
                      <p className="text-gray-900">
                        {new Date(contract.dates.startDate).toLocaleDateString()} - {new Date(contract.dates.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <p className="text-gray-900">{new Date(contract.dates.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                      <p className="text-gray-900">{contract.deliveryLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{contract.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Total Contract Value</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {contract.financial.currency} {contract.financial.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Price per Unit</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {contract.financial.currency} {contract.financial.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <p className="text-gray-900">{contract.financial.paymentTerms}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <p className="text-gray-900">{contract.financial.currency}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>
                <div className="space-y-3">
                  {contract.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Contract History</h2>
                <div className="space-y-4">
                  {contract.history.map((entry, index) => (
                    <div key={entry.id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{entry.action}</p>
                          <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                        <p className="text-sm text-gray-500 mt-1">by {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Contract
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Contract
                </button>
                <button className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>

            {/* Key Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Counterparty</p>
                    <p className="text-sm text-gray-600">{contract.counterparty.name}</p>
                    <p className="text-sm text-gray-500">{contract.counterparty.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery Date</p>
                    <p className="text-sm text-gray-600">{new Date(contract.dates.deliveryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{contract.deliveryLocation}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Value</p>
                    <p className="text-sm text-gray-600">
                      {contract.financial.currency} {contract.financial.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}