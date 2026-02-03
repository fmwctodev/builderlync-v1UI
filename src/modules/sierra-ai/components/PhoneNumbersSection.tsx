import { useState, useEffect } from 'react';
import { Plus, Phone, MessageSquare, Image, MoreVertical, Edit2, Trash2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { ImportPhoneNumbersModal } from './ImportPhoneNumbersModal';
import { EditPhoneNumberModal } from './EditPhoneNumberModal';
import { CreatePhoneNumberModal } from './CreatePhoneNumberModal';
import {
  fetchOrganizationPhoneNumbers,
  deletePhoneNumber,
  unassignPhoneNumber,
  checkTwilioIntegration,
  type PhoneNumber,
} from '../services/phoneNumbersService';
import { elevenlabsApi } from '../services/elevenlabsApi';

interface PhoneNumbersSectionProps {
  organizationId: string;
}

export function PhoneNumbersSection({ organizationId }: PhoneNumbersSectionProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [twilioConnected, setTwilioConnected] = useState<boolean | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhoneNumbers();
    checkIntegration();
  }, [organizationId]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const orgSlug = user.companySlug || 'default';

  const loadPhoneNumbers = async () => {
    setLoading(true);
    try {
      const data = await fetchOrganizationPhoneNumbers(organizationId);
      setPhoneNumbers(data);
    } catch (err) {
      console.error('Error loading phone numbers:', err);
      setError('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const checkIntegration = async () => {
    const isConnected = await checkTwilioIntegration(organizationId);
    setTwilioConnected(isConnected);
  };

  const handleDelete = async (phoneNumber: PhoneNumber) => {
    if (!confirm(`Are you sure you want to delete ${phoneNumber.phone_number}?`)) {
      return;
    }

    try {
      await deletePhoneNumber(phoneNumber.id);
      await loadPhoneNumbers();
      setOpenMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete phone number');
    }
  };

  const handleUnassign = async (phoneNumber: PhoneNumber) => {
    if (!confirm(`Unassign this phone number from ${phoneNumber.assigned_agent?.name}?`)) {
      return;
    }

    try {
      await unassignPhoneNumber(phoneNumber.id);
      await loadPhoneNumbers();
      setOpenMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unassign phone number');
    }
  };

  const handleEdit = (phoneNumber: PhoneNumber) => {
    setSelectedNumber(phoneNumber);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleImportSuccess = () => {
    loadPhoneNumbers();
  };

  const handleEditSuccess = () => {
    loadPhoneNumbers();
    setShowEditModal(false);
    setSelectedNumber(null);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'local':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'toll-free':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'mobile':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'short-code':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!twilioConnected && twilioConnected !== null && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              Twilio Not Connected
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Connect your Twilio account to import and manage phone numbers for your AI agents.
            </p>
            <a
              href={`/org/${orgSlug}/settings/integrations`}
              className="text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
            >
              Connect Twilio →
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Phone numbers</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your phone numbers with ElevenLabs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            disabled={!twilioConnected}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Import from Twilio
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Number
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No phone numbers yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Import phone numbers from Twilio to get started
          </p>
          {twilioConnected && (
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Import number
            </button>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {phoneNumbers.map((number) => (
                <tr key={number.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {number.friendly_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadgeColor(
                          number.phone_number_type
                        )}`}
                      >
                        {number.phone_number_type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {number.capabilities.voice && (
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {number.capabilities.sms && (
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {number.capabilities.mms && (
                        <Image className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {number.phone_number}
                  </td>
                  <td className="px-6 py-4">
                    {number.assigned_agent ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {number.assigned_agent.name}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        Missing agent
                        <LinkIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Twilio
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === number.id ? null : number.id)
                        }
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {openMenuId === number.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-[9999] w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => handleEdit(number)}
                              className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit name
                            </button>
                            {number.assigned_agent && (
                              <button
                                onClick={() => handleUnassign(number)}
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <LinkIcon className="w-4 h-4" />
                                Unassign agent
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(number)}
                              className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ImportPhoneNumbersModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        organizationId={organizationId}
        onImportSuccess={handleImportSuccess}
      />

      <CreatePhoneNumberModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        organizationId={organizationId}
        onSuccess={handleImportSuccess}
      />

      {selectedNumber && (
        <EditPhoneNumberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedNumber(null);
          }}
          phoneNumber={selectedNumber}
          onEditSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
