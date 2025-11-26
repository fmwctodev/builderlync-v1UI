import React from 'react';
import { X, Mail, MessageSquare, Phone, PhoneIncoming, Info, Trash2 } from 'lucide-react';
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

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

const PHONE_TYPES = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

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

  const handleDndAllChange = (checked: boolean) => {
    onFormDataChange({
      ...formData,
      dndAllChannels: checked,
      dndChannels: {
        email: checked,
        textMessages: checked,
        callsVoicemail: checked,
        inboundCallsSms: checked,
      }
    });
  };

  const handleDndChannelChange = (channel: string, checked: boolean) => {
    const newChannels = {
      ...formData.dndChannels,
      [channel]: checked
    };

    const allChecked = Object.values(newChannels).every(v => v === true);

    onFormDataChange({
      ...formData,
      dndChannels: newChannels,
      dndAllChannels: allChecked
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Contact' : 'New contact'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => onFormDataChange({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => onFormDataChange({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Please enter email address"
                />
              </div>
              {showSecondaryEmail && (
                <button
                  onClick={removeSecondaryEmail}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {showSecondaryEmail && (
              <div className="mt-2">
                <input
                  type="email"
                  value={secondaryEmail}
                  onChange={(e) => onSecondaryEmailChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="secondary@domain.com"
                />
              </div>
            )}
            {!showSecondaryEmail && (
              <button onClick={addSecondaryEmail} className="text-sm mt-1 text-primary-600 hover:underline dark:text-primary-400">
                + Add Email
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="flex gap-2">
              <div className="w-32">
                <CustomDropdown
                  options={PHONE_TYPES}
                  value={formData.phoneType || 'mobile'}
                  onChange={(value) => onFormDataChange({...formData, phoneType: value})}
                  placeholder="Select"
                />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter phone number"
                maxLength={14}
              />
              {showSecondaryPhone && (
                <button
                  onClick={removeSecondaryPhone}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {showSecondaryPhone && (
              <div className="mt-2 flex gap-2">
                <div className="w-32">
                  <CustomDropdown
                    options={PHONE_TYPES}
                    value={formData.secondaryPhoneType || 'mobile'}
                    onChange={(value) => onFormDataChange({...formData, secondaryPhoneType: value})}
                    placeholder="Select"
                  />
                </div>
                <input
                  type="tel"
                  value={secondaryPhone.phone}
                  onChange={(e) => onSecondaryPhoneChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                  maxLength={14}
                />
              </div>
            )}
            {!showSecondaryPhone && (
              <button onClick={addSecondaryPhone} className="text-sm mt-1 text-primary-600 hover:underline dark:text-primary-400">
                + Add Phone
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => onFormDataChange({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={onAddressChange}
              placeholder="Enter address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Type <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                options={[
                  { value: 'lead', label: 'Lead' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'partner', label: 'Partner' },
                  { value: 'vendor', label: 'Vendor' },
                  { value: 'sub-contractor', label: 'Sub-Contractor' },
                  { value: 'adjuster', label: 'Adjuster' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'other', label: 'Other' }
                ]}
                value={formData.type}
                onChange={(value) => onFormDataChange({...formData, type: value})}
                placeholder="Select an option"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time zone
              </label>
              <CustomDropdown
                options={TIMEZONES}
                value={formData.timezone || ''}
                onChange={(value) => onFormDataChange({...formData, timezone: value})}
                placeholder="Select an option"
              />
            </div>
          </div>

          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="dndAll"
                checked={formData.dndAllChannels || false}
                onChange={(e) => handleDndAllChange(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="dndAll" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                DND All Channels
              </label>
            </div>

            <div className="flex items-center justify-center my-3">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <span className="px-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Channels</p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dndEmail"
                  checked={formData.dndChannels?.email || false}
                  onChange={(e) => handleDndChannelChange('email', e.target.checked)}
                  disabled={formData.dndAllChannels}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <Mail className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label htmlFor="dndEmail" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Email
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dndText"
                  checked={formData.dndChannels?.textMessages || false}
                  onChange={(e) => handleDndChannelChange('textMessages', e.target.checked)}
                  disabled={formData.dndAllChannels}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <MessageSquare className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label htmlFor="dndText" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Text Messages
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dndCalls"
                  checked={formData.dndChannels?.callsVoicemail || false}
                  onChange={(e) => handleDndChannelChange('callsVoicemail', e.target.checked)}
                  disabled={formData.dndAllChannels}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <Phone className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label htmlFor="dndCalls" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Calls & Voicemail
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dndInbound"
                  checked={formData.dndChannels?.inboundCallsSms || false}
                  onChange={(e) => handleDndChannelChange('inboundCallsSms', e.target.checked)}
                  disabled={formData.dndAllChannels}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <PhoneIncoming className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label htmlFor="dndInbound" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Inbound Calls and SMS
                </label>
                <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" title="Block incoming calls and text messages from this contact" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
