import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, CreditCard as Edit, Copy, Trash2, ChevronLeft, ChevronRight, Star, Info, ExternalLink, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { instantEstimatorsApi, type InstantEstimator } from '../services/instantEstimatorsApi';
import Toast from '../../../shared/components/Toast';
import { StagingBanner } from '../components/common';
import { instantEstimatorSettingsApi } from '../services/instantEstimatorSettingsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import ManageEstimatorModal from '../components/estimator/ManageEstimatorModal';
import type {
  InstantEstimatorDefaultMaterial,
  CreateDefaultMaterialData,
  OrganizationProfile,
} from '../types/instantEstimatorSettings';
import {
  GlobalMaterialOptionsSection,
  GlobalContactInfoSection,
} from '../components/estimator-settings';

const InstantEstimatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [name, setName] = useState('');
  const [renameName, setRenameName] = useState('');
  const [selectedEstimator, setSelectedEstimator] = useState<InstantEstimator | null>(null);
  const [estimators, setEstimators] = useState<InstantEstimator[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [estimatorToDelete, setEstimatorToDelete] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [estimatorToManage, setEstimatorToManage] = useState<InstantEstimator | null>(null);

  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(false);
  const [googleReviewsConnected, setGoogleReviewsConnected] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [defaultMaterials, setDefaultMaterials] = useState<InstantEstimatorDefaultMaterial[]>([]);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchEstimators();
    }
  }, [currentPage, currentOrganization?.id]);

  useEffect(() => {
    if (activeTab === 'settings' && currentOrganization?.id) {
      fetchGlobalSettings();
    }
  }, [activeTab, currentOrganization?.id]);

  const fetchGlobalSettings = async () => {
    if (!currentOrganization?.id) return;
    try {
      const [settings, materials, profile, isConnected] = await Promise.all([
        instantEstimatorSettingsApi.getGlobalSettings(currentOrganization.id),
        instantEstimatorSettingsApi.getDefaultMaterials(currentOrganization.id),
        instantEstimatorSettingsApi.getOrganizationProfile(currentOrganization.id),
        instantEstimatorSettingsApi.checkGoogleBusinessIntegration(currentOrganization.id),
      ]);

      if (settings) {
        setGoogleReviewsEnabled(settings.google_reviews_enabled);
      }

      setDefaultMaterials(materials);
      setOrganizationProfile(profile);
      setGoogleReviewsConnected(isConnected);
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
    }
  };

  const saveGlobalSettings = async () => {
    if (!currentOrganization?.id) return;
    try {
      setSavingSettings(true);
      await instantEstimatorSettingsApi.upsertGlobalSettings(currentOrganization.id, {
        google_reviews_enabled: googleReviewsEnabled,
      });
      setToast({ message: 'Settings saved successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to save global settings:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddMaterial = async (material: CreateDefaultMaterialData) => {
    if (!currentOrganization?.id) return;
    try {
      await instantEstimatorSettingsApi.createDefaultMaterial(currentOrganization.id, material);
      const materials = await instantEstimatorSettingsApi.getDefaultMaterials(currentOrganization.id);
      setDefaultMaterials(materials);
      setToast({ message: 'Material added successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to add material:', error);
      setToast({ message: 'Failed to add material', type: 'error' });
    }
  };

  const handleUpdateMaterial = async (id: string, material: Partial<CreateDefaultMaterialData>) => {
    if (!currentOrganization?.id) return;
    try {
      await instantEstimatorSettingsApi.updateDefaultMaterial(id, material);
      const materials = await instantEstimatorSettingsApi.getDefaultMaterials(currentOrganization.id);
      setDefaultMaterials(materials);
      setToast({ message: 'Material updated successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to update material:', error);
      setToast({ message: 'Failed to update material', type: 'error' });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!currentOrganization?.id) return;
    try {
      await instantEstimatorSettingsApi.deleteDefaultMaterial(id);
      const materials = await instantEstimatorSettingsApi.getDefaultMaterials(currentOrganization.id);
      setDefaultMaterials(materials);
      setToast({ message: 'Material deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to delete material:', error);
      setToast({ message: 'Failed to delete material', type: 'error' });
    }
  };

  const fetchEstimators = async () => {
    if (!currentOrganization?.id) return;
    try {
      setLoading(true);
      const response = await instantEstimatorsApi.getInstantEstimators(
        currentOrganization.id,
        currentPage,
        limit
      );
      setEstimators(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch estimators:', error);
      setEstimators([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !currentOrganization?.id) return;
    try {
      await instantEstimatorsApi.createInstantEstimator(currentOrganization.id, name.trim());
      setShowModal(false);
      setName('');
      setToast({ message: 'Estimator created successfully', type: 'success' });
      fetchEstimators();
    } catch (error) {
      console.error('Failed to create estimator:', error);
      setToast({ message: 'Failed to create estimator', type: 'error' });
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !selectedEstimator) return;
    try {
      await instantEstimatorsApi.renameInstantEstimator(selectedEstimator.id, renameName.trim());
      setShowRenameModal(false);
      setRenameName('');
      setSelectedEstimator(null);
      setToast({ message: 'Estimator renamed successfully', type: 'success' });
      fetchEstimators();
    } catch (error) {
      console.error('Failed to rename estimator:', error);
      setToast({ message: 'Failed to rename estimator', type: 'error' });
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!currentOrganization?.id) return;
    try {
      await instantEstimatorsApi.duplicateInstantEstimator(id, currentOrganization.id);
      setToast({ message: 'Estimator duplicated successfully', type: 'success' });
      fetchEstimators();
    } catch (error) {
      console.error('Failed to duplicate estimator:', error);
      setToast({ message: 'Failed to duplicate estimator', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!estimatorToDelete) return;
    try {
      await instantEstimatorsApi.deleteInstantEstimator(estimatorToDelete);
      setToast({ message: 'Estimator deleted successfully', type: 'success' });
      fetchEstimators();
    } catch (error) {
      console.error('Failed to delete estimator:', error);
      setToast({ message: 'Failed to delete estimator', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setEstimatorToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setEstimatorToDelete(id);
    setShowDeleteModal(true);
  };

  const openRenameModal = (estimator: InstantEstimator) => {
    setSelectedEstimator(estimator);
    setRenameName(estimator.name);
    setShowRenameModal(true);
  };

  const openManageModal = (estimator: InstantEstimator) => {
    setEstimatorToManage(estimator);
    setShowManageModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <StagingBanner variant="estimator" />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex-shrink-0">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instant Estimator</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instant Estimator</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            All Instant Estimators
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {activeTab === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : estimators.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No instant estimators found
                      </td>
                    </tr>
                  ) : Array.isArray(estimators) && estimators.length > 0 ? (
                    estimators.map((estimator) => (
                      <tr key={estimator.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <button
                            onClick={() => navigate(`/instant-estimator/${estimator.id}/manage`)}
                            className="hover:text-primary-600 dark:hover:text-red-400 hover:underline"
                          >
                            {estimator.name}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openManageModal(estimator)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Settings className="w-3 h-3" />
                              <span>Manage</span>
                            </button>
                            <button 
                              onClick={() => openRenameModal(estimator)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Rename</span>
                            </button>
                            <button 
                              onClick={() => handleDuplicate(estimator.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Duplicate</span>
                            </button>
                            <button 
                              onClick={() => openDeleteModal(estimator.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No instant estimators found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-6xl">
            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer reviews</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                      Beta
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select Google Reviews you would like to show to your customers to build trust.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/org/${currentOrganization?.slug}/settings/integrations`)}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <Info className="w-4 h-4" />
                  How to use
                </button>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-gray-200 dark:border-gray-700 my-4">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-6 h-6 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show your Google Reviews to customers
                    </p>
                  </div>
                </div>
              </div>

              {googleReviewsConnected ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Google Business connected
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Your Google Reviews are ready to display
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/org/${currentOrganization?.slug}/settings/integrations`)}
                    className="text-sm text-green-700 dark:text-green-400 hover:underline"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/org/${currentOrganization?.slug}/settings/integrations`)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Connect Google Reviews
                </button>
              )}
            </div>

            {/* Material Options Section */}
            <GlobalMaterialOptionsSection
              materials={defaultMaterials}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
            />

            {/* Contact Information Section */}
            <GlobalContactInfoSection
              organizationProfile={organizationProfile}
            />

            {/* Save All Settings Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveGlobalSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Instant Estimator</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose a name that describes how this estimator will be used (e.g., "Website homepage" or "Direct mailer")
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter estimator name"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rename Instant Estimator</h3>
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setSelectedEstimator(null);
                    setRenameName('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new name"
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setSelectedEstimator(null);
                    setRenameName('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={!renameName.trim()}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Estimator</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEstimatorToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this estimator? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEstimatorToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showManageModal && estimatorToManage && currentOrganization?.id && (
        <ManageEstimatorModal
          estimator={estimatorToManage}
          organizationId={currentOrganization.id}
          onClose={() => {
            setShowManageModal(false);
            setEstimatorToManage(null);
          }}
          onSaved={() => {
            fetchEstimators();
          }}
          onToast={(message, type) => setToast({ message, type })}
        />
      )}
    </div>
  );
};

export default InstantEstimatorPage;