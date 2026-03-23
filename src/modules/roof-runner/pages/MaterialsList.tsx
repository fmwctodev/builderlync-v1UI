import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';
import { StagingBanner } from '../components/common';

interface Material {
  id: string;
  name: string;
  materialType: string;
  price: number;
  multiStoryPrice?: number;
  description: string;
  unit: string;
  category: string;
}

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInstantEstimator(parseInt(id));
      const materialsData = response?.data?.materials || [];
      setMaterials(materialsData);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDeleteMaterial = async () => {
    if (!showDeleteConfirm || !id) return;

    try {
      setDeleting(true);
      await apiService.deleteInstantEstimatorMaterial(parseInt(id), showDeleteConfirm);
      setMaterials(prev => prev.filter(m => m.id !== showDeleteConfirm));
      setToast({ message: 'Material deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to delete material:', err);
      setToast({ message: 'Failed to delete material. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const getMaterialToDelete = () => {
    if (!showDeleteConfirm) return null;
    return materials.find(m => m.id === showDeleteConfirm);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <StagingBanner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading materials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <StagingBanner />
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={() => navigate(`/instant-estimator/${id}/manage`)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to manage
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Materials</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Materials</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchMaterials}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <StagingBanner />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => navigate(`/instant-estimator/${id}/manage`)}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to manage
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Materials</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage materials for your instant estimator
            </p>
          </div>
          <button
            onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {materials.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No materials added yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Add materials you offer along with their pricing. Customers will see these options when getting estimates.
              </p>
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Your First Material
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Material options ({materials.length})
                  </h2>
                  <button
                    onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs.
                </p>
              </div>

              {/* Materials Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Low
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Moderate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Steep
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Flat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Multi-story surcharge
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-600 rounded-sm mr-3 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {material.materialType?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {material.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {material.materialType || 'Material'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          ${material.price.toFixed(2)}/sqft
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          ${(material.price * 1.1).toFixed(2)}/sqft
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          ${(material.price * 1.3).toFixed(2)}/sqft
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          ${(material.price * 1.1).toFixed(2)}/sqft
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          ${(material.multiStoryPrice || 0).toFixed(2)}/sqft
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/instant-estimator/${id}/manage/materials/${material.id}/edit`)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                              title="Edit material"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(material.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="Delete material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Material</h3>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleting}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to delete this material?
              </p>
              {getMaterialToDelete() && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getMaterialToDelete()?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getMaterialToDelete()?.materialType} - ${getMaterialToDelete()?.price.toFixed(2)}/sqft
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMaterial}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? 'Deleting...' : 'Delete'}
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

export default MaterialsList;
