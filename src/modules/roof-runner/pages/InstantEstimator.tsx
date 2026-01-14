import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Edit, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';
import type { InstantEstimator, InstantEstimatorsResponse } from '../types';
import Toast from '../../../shared/components/Toast';

const InstantEstimator: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
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
  const [estimatorToDelete, setEstimatorToDelete] = useState<number | null>(null);
  const [businessProfile, setBusinessProfile] = useState<{ friendly_business_name: string; business_logo: string | null } | null>(null);

  useEffect(() => {
    fetchEstimators();
    if (activeTab === 'settings') {
      fetchBusinessProfile();
    }
  }, [currentPage, activeTab]);

  const fetchBusinessProfile = async () => {
    try {
      const response = await apiService.getBusinessProfile();
      setBusinessProfile(response.data || response);
    } catch (error) {
      console.error('Failed to fetch business profile:', error);
    }
  };

  const fetchEstimators = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimators(currentPage, limit);
      const responseData = response.data || response;
      setEstimators(Array.isArray(responseData.data) ? responseData.data : []);
      setTotal(responseData.pagination?.total || 0);
      setTotalPages(responseData.pagination?.totalPages || 1);
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
    if (!name.trim()) return;
    try {
      await apiService.createInstantEstimator({ name: name.trim() });
      setShowModal(false);
      setName('');
      fetchEstimators();
    } catch (error) {
      console.error('Failed to create estimator:', error);
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !selectedEstimator) return;
    try {
      await apiService.renameInstantEstimator(selectedEstimator.id, { name: renameName.trim() });
      setShowRenameModal(false);
      setRenameName('');
      setSelectedEstimator(null);
      fetchEstimators();
    } catch (error) {
      console.error('Failed to rename estimator:', error);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await apiService.duplicateInstantEstimator(id);
      fetchEstimators();
    } catch (error) {
      console.error('Failed to duplicate estimator:', error);
    }
  };

  const handleDelete = async () => {
    if (!estimatorToDelete) return;
    try {
      await apiService.deleteInstantEstimator(estimatorToDelete);
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

  const openDeleteModal = (id: number) => {
    setEstimatorToDelete(id);
    setShowDeleteModal(true);
  };

  const openRenameModal = (estimator: InstantEstimator) => {
    setSelectedEstimator(estimator);
    setRenameName(estimator.name);
    setShowRenameModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
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
                            onClick={() => navigate(`/org/${orgSlug}/instant-estimator/${estimator.id}/manage`)}
                            className="hover:text-primary-600 dark:hover:text-blue-400 hover:underline"
                          >
                            {estimator.name}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => navigate(`/org/${orgSlug}/instant-estimator/${estimator.id}/manage`)}
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
          <div className="space-y-6">
            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer reviews</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Beta</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select Google Reviews you would like to show to your customers to build trust.
                  </p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to use
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-8 h-8 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Show your Google Reviews to customers
                </p>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect Google Reviews
                </button>
              </div>
            </div>

            {/* Material Options Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Material options</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs. Your customers will have the option to choose the materials they want and will receive estimates based on the information you provide below.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button className="text-sm text-blue-600 hover:text-blue-700">Materials</button>
                  <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NAME</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">LOW</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MODERATE</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">STEEP</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">FLAT</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MULTI-STORY SURCHARGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No materials added yet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contact information is pulled from your organization's business info. To update, please edit your business info in settings.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company profile
                  </label>
                  <input
                    type="text"
                    value={businessProfile?.friendly_business_name || 'Loading...'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex flex-col items-center">
                      {businessProfile?.business_logo ? (
                        <img 
                          src={businessProfile.business_logo} 
                          alt={businessProfile.friendly_business_name}
                          className="w-50 h-50 object-contain rounded mb-2"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
                          Logo
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {businessProfile?.friendly_business_name || 'Business Name'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                Save All Settings
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
    </div>
  );
};

export default InstantEstimator;