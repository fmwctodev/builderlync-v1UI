import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimator(parseInt(id));
      const materialsData = response?.data?.materials || [];
      setMaterials(materialsData);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setToast({ message: 'Failed to load materials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await apiService.deleteInstantEstimatorMaterial(parseInt(id!), materialId);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      setToast({ message: 'Material deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to delete material:', error);
      setToast({ message: 'Failed to delete material', type: 'error' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => navigate(`/instant-estimator/${id}/manage`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-4"
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading materials...</div>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No materials added yet</div>
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Material
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Material options</h2>
                  <button
                    onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs. Your customers will have the option to choose the materials they want and will receive estimates based on the information you provide below.
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
                            <div className="w-8 h-8 bg-blue-600 rounded-sm mr-3 flex items-center justify-center">
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
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <MoreHorizontal className="w-4 h-4" />
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