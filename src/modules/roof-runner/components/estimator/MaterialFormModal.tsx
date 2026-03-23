import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import type {
  InstantEstimatorMaterial,
  CreateMaterialData,
  MaterialType,
} from '../../types/instantEstimatorSettings';
import { MATERIAL_TYPES } from '../../types/instantEstimatorSettings';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: CreateMaterialData) => void;
  material?: InstantEstimatorMaterial | null;
  pricingType: 'per-square-foot' | 'per-square';
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material,
  pricingType,
}) => {
  const [name, setName] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('Asphalt');
  const [imageUrl, setImageUrl] = useState('');
  const [lowPrice, setLowPrice] = useState('');
  const [moderatePrice, setModeratePrice] = useState('');
  const [steepPrice, setSteepPrice] = useState('');
  const [flatPrice, setFlatPrice] = useState('');
  const [multiStorySurcharge, setMultiStorySurcharge] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (material) {
      setName(material.name || '');
      setMaterialType(material.material_type);
      setImageUrl(material.image_url || '');
      setLowPrice(material.low_price?.toString() || '');
      setModeratePrice(material.moderate_price?.toString() || '');
      setSteepPrice(material.steep_price?.toString() || '');
      setFlatPrice(material.flat_price?.toString() || '');
      setMultiStorySurcharge(material.multi_story_surcharge?.toString() || '');
    } else {
      resetForm();
    }
  }, [material, isOpen]);

  const resetForm = () => {
    setName('');
    setMaterialType('Asphalt');
    setImageUrl('');
    setLowPrice('');
    setModeratePrice('');
    setSteepPrice('');
    setFlatPrice('');
    setMultiStorySurcharge('');
  };

  const parsePrice = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasAtLeastOnePrice =
      lowPrice || moderatePrice || steepPrice || flatPrice || multiStorySurcharge;

    if (!name.trim()) {
      alert('Please enter a material name');
      return;
    }

    if (!hasAtLeastOnePrice) {
      alert('Please enter at least one price');
      return;
    }

    setSaving(true);

    try {
      const materialData: CreateMaterialData = {
        name: name.trim(),
        material_type: materialType,
        image_url: imageUrl.trim() || null,
        low_price: parsePrice(lowPrice),
        moderate_price: parsePrice(moderatePrice),
        steep_price: parsePrice(steepPrice),
        flat_price: parsePrice(flatPrice),
        multi_story_surcharge: parsePrice(multiStorySurcharge),
      };

      onSave(materialData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const getPriceLabel = () => {
    return pricingType === 'per-square-foot' ? 'per sqft' : 'per square';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {material ? 'Edit Material' : 'Add Material'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GAF Timberline HDZ"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material Type
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Pricing ({getPriceLabel()})
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter prices for each roof pitch category. Leave blank to show "-" for that category.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Low Pitch
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={lowPrice}
                      onChange={(e) => setLowPrice(e.target.value)}
                      placeholder="-"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Moderate Pitch
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={moderatePrice}
                      onChange={(e) => setModeratePrice(e.target.value)}
                      placeholder="-"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Steep Pitch
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={steepPrice}
                      onChange={(e) => setSteepPrice(e.target.value)}
                      placeholder="-"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Flat
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={flatPrice}
                      onChange={(e) => setFlatPrice(e.target.value)}
                      placeholder="-"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Multi-story Surcharge
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={multiStorySurcharge}
                      onChange={(e) => setMultiStorySurcharge(e.target.value)}
                      placeholder="-"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialFormModal;
