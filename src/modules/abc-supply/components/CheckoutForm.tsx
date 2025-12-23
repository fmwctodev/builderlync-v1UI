import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { abcSupplyApi } from '../services/api';
import { Branch, ShipTo, ShipToBranch } from '../types';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CheckoutFormData) => void;
  loading: boolean;
  selectedShipTos: string[];
  shipTos: ShipTo[];
}

export interface CheckoutFormData {
  branchNumber: string;
  deliveryAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryDate?: string;
  instructions?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit, loading, selectedShipTos, shipTos }) => {
  const [availableBranches, setAvailableBranches] = useState<ShipToBranch[]>([]);
  const [formData, setFormData] = useState<CheckoutFormData>({
    branchNumber: '',
    deliveryAddress: {
      name: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal: ''
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    deliveryDate: '',
    instructions: ''
  });

  useEffect(() => {
    // Get branches from selected shipTos
    const branches: ShipToBranch[] = [];
    selectedShipTos.forEach(shipToNumber => {
      const shipTo = shipTos.find(s => s.number === shipToNumber);
      if (shipTo && shipTo.branches) {
        branches.push(...shipTo.branches);
      }
    });
    // Remove duplicates based on branch number
    const uniqueBranches = branches.filter((branch, index, self) => 
      index === self.findIndex(b => b.number === branch.number)
    );
    setAvailableBranches(uniqueBranches);
  }, [selectedShipTos, shipTos]);

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
              <MapPin className="w-4 h-4 inline mr-1" />
              Select Branch
            </label>
            <select
              value={formData.branchNumber}
              onChange={(e) => updateField('branchNumber', '', e.target.value)}
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select a branch...</option>
              {availableBranches.map((branch) => (
                <option key={branch.number} value={branch.number}>
                  {branch.name} ({branch.number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company/Name"
                value={formData.deliveryAddress.name}
                onChange={(e) => updateField('deliveryAddress', 'name', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.deliveryAddress.line1}
                onChange={(e) => updateField('deliveryAddress', 'line1', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.deliveryAddress.line2}
                onChange={(e) => updateField('deliveryAddress', 'line2', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.deliveryAddress.city}
                onChange={(e) => updateField('deliveryAddress', 'city', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.deliveryAddress.state}
                onChange={(e) => updateField('deliveryAddress', 'state', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.deliveryAddress.postal}
                onChange={(e) => updateField('deliveryAddress', 'postal', e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
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