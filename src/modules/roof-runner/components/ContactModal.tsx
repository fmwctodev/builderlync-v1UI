import React from 'react';
import { X } from 'lucide-react';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';
import CustomDropdown from '../../../shared/components/CustomDropdown';

interface ContactModalProps {
  show: boolean;
  isEdit: boolean;
  isLoading: boolean;
  formData: any;
  secondaryEmail: string;
  showSecondaryEmail: boolean;
  secondaryPhone: { phone: string; extension: string };
  showSecondaryPhone: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: any) => void;
  onPhoneChange: (value: string) => void;
  onSecondaryPhoneChange: (value: string) => void;
  onAddressChange: (address: string, lat: number, lng: number) => void;
  onSecondaryEmailChange: (value: string) => void;
  onSecondaryPhoneDataChange: (data: { phone: string; extension: string }) => void;
  addSecondaryEmail: () => void;
  removeSecondaryEmail: () => void;
  addSecondaryPhone: () => void;
  removeSecondaryPhone: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({
  show,
  isEdit,
  isLoading,
  formData,
  secondaryEmail,
  showSecondaryEmail,
  secondaryPhone,
  showSecondaryPhone,
  onClose,
  onSubmit,
  onFormDataChange,
  onPhoneChange,
  onSecondaryPhoneChange,
  onAddressChange,
  onSecondaryEmailChange,
  onSecondaryPhoneDataChange,
  addSecondaryEmail,
  removeSecondaryEmail,
  addSecondaryPhone,
  removeSecondaryPhone,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Contact' : 'New contact'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onFormDataChange({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
              placeholder="Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              {isEdit ? (
                <input
                  type="text"
                  value={formData.type.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              ) : (
                <CustomDropdown
                  options={[
                    { value: 'lead', label: 'Lead' },
                    { value: 'customer', label: 'Customer' },
                    { value: 'vendor', label: 'Vendor' },
                    { value: 'sub-contractor', label: 'Sub-Contractor' },
                    { value: 'adjuster', label: 'Adjuster' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={formData.type}
                  onChange={(value) => onFormDataChange({...formData, type: value})}
                  placeholder="Select type"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label or role
              </label>
              <input
                type="text"
                value={formData.labelRole}
                onChange={(e) => onFormDataChange({...formData, labelRole: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                placeholder="Tenant, cosigner etc"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="email@domain.com"
            />
            {showSecondaryEmail && (
              <div className="mt-2">
                <input
                  type="email"
                  value={secondaryEmail}
                  onChange={(e) => onSecondaryEmailChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="secondary@domain.com"
                />
              </div>
            )}
            {!showSecondaryEmail ? (
              <button onClick={addSecondaryEmail} className="text-sm mt-1 hover:underline text-red-600">
                Add secondary
              </button>
            ) : (
              <button onClick={removeSecondaryEmail} className="text-red-600 text-sm mt-1 hover:underline">
                Remove secondary
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="(212) 212-1212"
                maxLength={14}
              />
              <input
                type="text"
                value={formData.extension}
                onChange={(e) => onFormDataChange({...formData, extension: e.target.value})}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ext."
              />
            </div>
            {showSecondaryPhone && (
              <div className="mt-2 flex gap-2">
                <input
                  type="tel"
                  value={secondaryPhone.phone}
                  onChange={(e) => onSecondaryPhoneChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="(212) 212-1212"
                  maxLength={14}
                />
                <input
                  type="text"
                  value={secondaryPhone.extension}
                  onChange={(e) => onSecondaryPhoneDataChange({...secondaryPhone, extension: e.target.value})}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ext."
                />
              </div>
            )}
            {!showSecondaryPhone ? (
              <button onClick={addSecondaryPhone} className="text-sm mt-1 hover:underline text-red-600">
                Add secondary
              </button>
            ) : (
              <button onClick={removeSecondaryPhone} className="text-red-600 text-sm mt-1 hover:underline">
                Remove secondary
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => onFormDataChange({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={onAddressChange}
              placeholder="Enter address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Contact' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;