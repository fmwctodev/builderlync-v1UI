import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { abcSupplyApi } from '../services/api';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CheckoutFormData) => void;
  loading: boolean;
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
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit, loading }) => {
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
    instructions: ''
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Checkout Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delivery Service
            </label>
            <select
              value={formData.deliveryService}
              onChange={(e) => updateField('deliveryService', '', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
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
            <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={(e) => updateField('contact', 'name', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.contact.email}
                onChange={(e) => updateField('contact', 'email', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.contact.phone}
                onChange={(e) => updateField('contact', 'phone', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Date (Optional)
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', '', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              placeholder="Any special delivery instructions..."
              value={formData.instructions}
              onChange={(e) => updateField('instructions', '', e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
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