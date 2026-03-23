import React, { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { InstantEstimatorDefaultMaterial, MaterialType, CreateDefaultMaterialData } from '../../types/instantEstimatorSettings';
import { MATERIAL_TYPES } from '../../types/instantEstimatorSettings';

interface GlobalMaterialOptionsSectionProps {
  materials: InstantEstimatorDefaultMaterial[];
  onAddMaterial: (material: CreateDefaultMaterialData) => Promise<void>;
  onUpdateMaterial: (id: string, material: Partial<CreateDefaultMaterialData>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

interface MaterialFormData {
  name: string;
  material_type: MaterialType;
  image_url: string;
  low_price: string;
  moderate_price: string;
  steep_price: string;
  flat_price: string;
  multi_story_surcharge: string;
}

const initialFormData: MaterialFormData = {
  name: '',
  material_type: 'Asphalt',
  image_url: '',
  low_price: '',
  moderate_price: '',
  steep_price: '',
  flat_price: '',
  multi_story_surcharge: '',
};

export const GlobalMaterialOptionsSection: React.FC<GlobalMaterialOptionsSectionProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<InstantEstimatorDefaultMaterial | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return '-';
    return `$${price.toFixed(2)}/sqft`;
  };

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (material: InstantEstimatorDefaultMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      material_type: material.material_type,
      image_url: material.image_url || '',
      low_price: material.low_price?.toString() || '',
      moderate_price: material.moderate_price?.toString() || '',
      steep_price: material.steep_price?.toString() || '',
      flat_price: material.flat_price?.toString() || '',
      multi_story_surcharge: material.multi_story_surcharge?.toString() || '',
    });
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await onDeleteMaterial(id);
    }
    setOpenMenuId(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data: CreateDefaultMaterialData = {
        name: formData.name,
        material_type: formData.material_type,
        image_url: formData.image_url || null,
        low_price: formData.low_price ? parseFloat(formData.low_price) : null,
        moderate_price: formData.moderate_price ? parseFloat(formData.moderate_price) : null,
        steep_price: formData.steep_price ? parseFloat(formData.steep_price) : null,
        flat_price: formData.flat_price ? parseFloat(formData.flat_price) : null,
        multi_story_surcharge: formData.multi_story_surcharge ? parseFloat(formData.multi_story_surcharge) : null,
      };

      if (editingMaterial) {
        await onUpdateMaterial(editingMaterial.id, data);
      } else {
        await onAddMaterial(data);
      }
      setShowModal(false);
      setFormData(initialFormData);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Failed to save material:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Material options
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add the materials you offer along with their approximate prices, which should include tear-off,
            waste, and markup costs. Your customers will have the option to choose the materials they want
            and will receive estimates based on the information you provide below.
          </p>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Materials</h4>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Low
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Moderate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Steep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Flat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Multi-story surcharge
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No materials added yet
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {material.image_url ? (
                            <img
                              src={material.image_url}
                              alt={material.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {material.name || 'Unnamed material'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {material.material_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(material.low_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(material.moderate_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(material.steep_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(material.flat_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(material.multi_story_surcharge)}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === material.id ? null : material.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {openMenuId === material.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                              onClick={() => handleOpenEdit(material)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMaterial ? 'Edit Material' : 'Add Material'}
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., GAF Timberline HDZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material Type
                </label>
                <select
                  value={formData.material_type}
                  onChange={(e) => setFormData({ ...formData, material_type: e.target.value as MaterialType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Low Pitch ($/sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.low_price}
                    onChange={(e) => setFormData({ ...formData, low_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Moderate Pitch ($/sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.moderate_price}
                    onChange={(e) => setFormData({ ...formData, moderate_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Steep Pitch ($/sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.steep_price}
                    onChange={(e) => setFormData({ ...formData, steep_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Flat Roof ($/sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.flat_price}
                    onChange={(e) => setFormData({ ...formData, flat_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Multi-story Surcharge ($/sqft)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.multi_story_surcharge}
                  onChange={(e) => setFormData({ ...formData, multi_story_surcharge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMaterial(null);
                  setFormData(initialFormData);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || saving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingMaterial ? 'Save Changes' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
