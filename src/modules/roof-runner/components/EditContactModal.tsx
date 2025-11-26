import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getContactById, updateContact, Contact } from '../../../shared/store/services/contactsApi';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string | null;
  onContactUpdated: (contact: { id: string; name: string }) => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contactId,
  onContactUpdated
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    type: 'customer' as 'customer' | 'lead',
    labelOrRole: '',
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContact();
    }
  }, [isOpen, contactId]);

  const fetchContact = async () => {
    if (!contactId) return;

    setFetchLoading(true);
    try {
      const response = await getContactById(contactId);
      const contact = response.data;
      setFormData({
        fullName: contact.full_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        type: contact.type as 'customer' | 'lead',
        labelOrRole: contact.label_or_role || '',
        address: contact.address || '',
        latitude: Number(contact.latitude) || 0,
        longitude: Number(contact.longitude) || 0
      });
    } catch (err) {
      console.error('Error fetching contact:', err);
      setErrors({ fetch: 'Failed to load contact details' });
    } finally {
      setFetchLoading(false);
    }
  };

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !contactId) {
      return;
    }

    setLoading(true);
    try {
      const response = await updateContact(contactId, formData);
      onContactUpdated({
        id: response.data.id,
        name: response.data.full_name
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error updating contact:', error);
      setErrors({ submit: 'Failed to update contact. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      type: 'customer',
      labelOrRole: '',
      address: '',
      latitude: 0,
      longitude: 0
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Contact</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading contact details...</div>
          </div>
        ) : errors.fetch ? (
          <div className="p-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.fetch}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'customer' | 'lead' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="customer">Customer</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role/Label
                </label>
                <input
                  type="text"
                  value={formData.labelOrRole}
                  onChange={(e) => setFormData({ ...formData, labelOrRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Homeowner, Decision Maker, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Acme Inc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditContactModal;
