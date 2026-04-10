import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { abcSupplyApi } from '../services/api';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CheckoutFormData) => void;
  loading: boolean;
  supplier?: string;
  srsCustomerProfile?: any | null;
}

export interface CheckoutFormData {
  jobId?: number | null;
  deliveryService: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryDate?: string;
  instructions?: string;
  customerCode?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit, loading, supplier, srsCustomerProfile }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [formData, setFormData] = useState<CheckoutFormData>({
    jobId: null,
    deliveryService: 'OTG', // Default to Our Truck Ground
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    deliveryDate: '',
    instructions: '',
    customerCode: '',
    shippingAddress: {
      name: '',
      line1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    // Fetch jobs
    const fetchJobs = async () => {
      try {
        const data = await abcSupplyApi.getJobs(100);
        if (data.success) {
          setJobs(data.data.data || []);
        } else if (data.data && Array.isArray(data.data.data)) {
          // Fallback in case success flag works differently or data structure varies slightly
          setJobs(data.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || supplier !== 'SRS') return;
    const storedCode = srsCustomerProfile?.customer_code || srsCustomerProfile?.customerCode;
    if (storedCode) {
      setFormData(prev => ({
        ...prev,
        customerCode: storedCode
      }));
    }
  }, [isOpen, supplier, srsCustomerProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (section: keyof CheckoutFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object'
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  if (!isOpen) return null;

  const storedSrsCode = srsCustomerProfile?.customer_code || srsCustomerProfile?.customerCode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Checkout Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Associate with Job (Optional)
            </label>
            <select
              value={formData.jobId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="">No job selected</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.location || `Job #${job.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Service
            </label>
            <select
              value={formData.deliveryService}
              onChange={(e) => updateField('deliveryService', '', e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              <option value="OTG">Our Truck Ground (OTG)</option>
              <option value="COM">Common Carrier (COM)</option>
              <option value="CPU">Customer Pickup (CPU)</option>
              <option value="EXP">Express Pickup (EXP)</option>
              <option value="OTR">Our Truck Roof (OTR)</option>
              <option value="OTW">Our Truck Window (OTW)</option>
              <option value="TPC">Third-Party Carrier (TPC)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Note: Delivery Services available are dependent on the branch and are subject to change at the discretion of the branch.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={(e) => updateField('contact', 'name', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.contact.email}
                onChange={(e) => updateField('contact', 'email', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.contact.phone}
                onChange={(e) => updateField('contact', 'phone', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
              />
            </div>
          </div>

          {supplier === 'SRS' && (
            <>
              {storedSrsCode ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                  <div className="font-medium">SRS customer code connected</div>
                  <div className="mt-1 text-gray-900 dark:text-white">{storedSrsCode}</div>
                  <div className="mt-2 text-xs text-green-700/80 dark:text-green-200/80">
                    Manage this in Integrations if you need to change it.
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Code (Required for SRS)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your SRS Customer Code"
                    value={formData.customerCode}
                    onChange={(e) => updateField('customerCode', '', e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company/Recipient Name"
                    value={formData.shippingAddress?.name}
                    onChange={(e) => updateField('shippingAddress', 'name', e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.shippingAddress?.line1}
                    onChange={(e) => updateField('shippingAddress', 'line1', e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.shippingAddress?.city}
                    onChange={(e) => updateField('shippingAddress', 'city', e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.shippingAddress?.state}
                      onChange={(e) => updateField('shippingAddress', 'state', e.target.value)}
                      required
                      className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.shippingAddress?.zipCode}
                      onChange={(e) => updateField('shippingAddress', 'zipCode', e.target.value)}
                      required
                      className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Date (Optional)
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', '', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              placeholder="Any special delivery instructions..."
              value={formData.instructions}
              onChange={(e) => updateField('instructions', '', e.target.value)}
              rows={3}
              className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {supplier === 'SRS' && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed italic">
                <strong>Tax & Delivery Disclaimer:</strong> Tax and delivery fees are estimated in this interface. Final calculation is performed by SRS Distribution upon order submission.
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
