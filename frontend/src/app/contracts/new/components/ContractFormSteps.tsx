// File: /c:/Mis_Proyectos/Python/NextCRM/frontend/src/app/contracts/new/components/ContractFormSteps.tsx

'use client';

import { useState } from 'react';
import { Upload, X, FileText, Calendar, DollarSign, MapPin, AlertCircle } from 'lucide-react';

// Step 3: Financial Details Component
export const FinancialDetailsStep = ({ formData, errors, onUpdate }: any) => {
  const calculateTotal = () => {
    const quantity = Number(formData.quantity) || 0;
    const pricePerUnit = Number(formData.pricePerUnit) || 0;
    return quantity * pricePerUnit;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Details</h2>
      <div className="space-y-6">
        {/* Quantity and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
              min="0"
              step="0.01"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <select
              value={formData.unit || ''}
              onChange={(e) => onUpdate({ unit: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.unit ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select unit</option>
              <option value="MT">Metric Tons (MT)</option>
              <option value="KG">Kilograms (KG)</option>
              <option value="LB">Pounds (LB)</option>
              <option value="BU">Bushels (BU)</option>
              <option value="GAL">Gallons (GAL)</option>
              <option value="L">Liters (L)</option>
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Price and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Unit *
            </label>
            <input
              type="number"
              value={formData.pricePerUnit || ''}
              onChange={(e) => onUpdate({ 
                pricePerUnit: Number(e.target.value),
                totalValue: Number(e.target.value) * (Number(formData.quantity) || 0)
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.pricePerUnit ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter price per unit"
              min="0"
              step="0.01"
            />
            {errors.pricePerUnit && (
              <p className="mt-1 text-sm text-red-600">{errors.pricePerUnit}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              value={formData.currency || 'USD'}
              onChange={(e) => onUpdate({ currency: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.currency ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
            )}
          </div>
        </div>

        {/* Total Value Display */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Total Contract Value</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formData.currency || 'USD'} {calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms *
          </label>
          <select
            value={formData.paymentTerms || ''}
            onChange={(e) => onUpdate({ paymentTerms: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.paymentTerms ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select payment terms</option>
            <option value="Net 15">Net 15 days</option>
            <option value="Net 30">Net 30 days</option>
            <option value="Net 45">Net 45 days</option>
            <option value="Net 60">Net 60 days</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Prepaid">Prepaid</option>
            <option value="LC">Letter of Credit</option>
          </select>
          {errors.paymentTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentTerms}</p>
          )}
        </div>

        {/* Special Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Financial Terms
          </label>
          <textarea
            value={formData.specialTerms || ''}
            onChange={(e) => onUpdate({ specialTerms: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any special financial terms or conditions..."
          />
        </div>
      </div>
    </div>
  );
};

// Step 4: Dates & Delivery Component
export const DatesDeliveryStep = ({ formData, errors, onUpdate }: any) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dates & Delivery</h2>
      <div className="space-y-6">
        {/* Contract Period */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Contract Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                value={formData.deliveryDate || ''}
                onChange={(e) => onUpdate({ deliveryDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deliveryDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.deliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Location *
              </label>
              <input
                type="text"
                value={formData.deliveryLocation || ''}
                onChange={(e) => onUpdate({ deliveryLocation: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deliveryLocation ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter delivery address or location"
              />
              {errors.deliveryLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryLocation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Terms
              </label>
              <select
                value={formData.deliveryTerms || ''}
                onChange={(e) => onUpdate({ deliveryTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select delivery terms</option>
                <option value="FOB">FOB - Free on Board</option>
                <option value="CIF">CIF - Cost, Insurance, and Freight</option>
                <option value="DDP">DDP - Delivered Duty Paid</option>
                <option value="EXW">EXW - Ex Works</option>
                <option value="DAP">DAP - Delivered at Place</option>
                <option value="FCA">FCA - Free Carrier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Instructions
          </label>
          <textarea
            value={formData.deliveryInstructions || ''}
            onChange={(e) => onUpdate({ deliveryInstructions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any special delivery instructions..."
          />
        </div>
      </div>
    </div>
  );
};

// Step 5: Documents Component
export const DocumentsStep = ({ formData, errors, onUpdate }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const documents = formData.documents || [];

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newDocuments = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || getFileExtension(file.name),
      uploadDate: new Date().toISOString(),
      file: file // Store file for actual upload later
    }));

    onUpdate({ 
      documents: [...documents, ...newDocuments] 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toUpperCase();
  };

  const removeDocument = (documentId: number) => {
    const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);
    onUpdate({ documents: updatedDocuments });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </label>
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.type} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contract Agreement</li>
                <li>• Quality Specifications</li>
                <li>• Delivery Terms</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Optional Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Insurance Certificates</li>
                <li>• Inspection Reports</li>
                <li>• Compliance Documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 6: Review & Submit Component
export const ReviewSubmitStep = ({ formData, commodities, counterparties, traders }: any) => {
  const getCommodityName = (id: string) => {
    const commodity = commodities.find((c: any) => c.id === id);
    return commodity?.name || 'Unknown Commodity';
  };

  const getCounterpartyName = (id: string) => {
    const party = counterparties.find((p: any) => p.id === id);
    return party?.name || 'Unknown Counterparty';
  };

  const getTraderName = (id: string) => {
    const trader = traders.find((t: any) => t.id === id);
    return trader?.name || 'Unknown Trader';
  };

  const calculateTotal = () => {
    const quantity = Number(formData.quantity) || 0;
    const pricePerUnit = Number(formData.pricePerUnit) || 0;
    return quantity * pricePerUnit;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h2>
      <div className="space-y-6">
        {/* Summary Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Review Your Contract</h3>
              <p className="text-sm text-blue-700 mt-1">
                Please review all the information below before submitting your contract. 
                Once submitted, you'll be able to edit most fields, but some changes may require approval.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Contract Title</label>
              <p className="mt-1 text-sm text-gray-900">{formData.title || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Contract Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{formData.type || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-sm text-gray-900">{formData.description || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Parties & Commodity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parties & Commodity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Commodity</label>
              <p className="mt-1 text-sm text-gray-900">{getCommodityName(formData.commodityId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Counterparty</label>
              <p className="mt-1 text-sm text-gray-900">{getCounterpartyName(formData.counterpartyId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Assigned Trader</label>
              <p className="mt-1 text-sm text-gray-900">{getTraderName(formData.traderId)}</p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Quantity</label>
              <p className="mt-1 text-sm text-gray-900">
                {formData.quantity?.toLocaleString() || '0'} {formData.unit || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Price per Unit</label>
              <p className="mt-1 text-sm text-gray-900">
                {formData.currency || 'USD'} {Number(formData.pricePerUnit || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Value</label>
              <p className="mt-1 text-lg font-bold text-green-600">
                {formData.currency || 'USD'} {calculateTotal().toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Payment Terms</label>
              <p className="mt-1 text-sm text-gray-900">{formData.paymentTerms || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Dates & Delivery */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Delivery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Start Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">End Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Delivery Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Delivery Terms</label>
              <p className="mt-1 text-sm text-gray-900">{formData.deliveryTerms || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-500">Delivery Location</label>
              <p className="mt-1 text-sm text-gray-900">{formData.deliveryLocation || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          {formData.documents && formData.documents.length > 0 ? (
            <div className="space-y-2">
              {formData.documents.map((doc: any, index: number) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{doc.name} ({doc.size})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No documents uploaded</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms and Conditions
              </a>{' '}
              and confirm that all information provided is accurate and complete. I understand that 
              submitting this contract will create a binding agreement subject to approval.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};