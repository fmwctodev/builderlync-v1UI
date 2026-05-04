import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';

const MaterialSetup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    materialType: 'EPDM',
    price: '',
    multiStoryPrice: '',
    description: 'EPDM rubber (ethylene propylene diene monomer rubber) is a type of synthetic rubber that is used in many flat and low-slope roof applications. EPDM is sought after for clean water collection.\n• 20 year warranty (NDL warranty available)',
    images: [] as File[]
  });
  
  useEffect(() => {
    const materialType = searchParams.get('type');
    if (materialType) {
      setFormData(prev => ({
        ...prev,
        materialType,
        name: materialType
      }));
    }
  }, [searchParams]);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const materialTypes = [
    'EPDM', 'TPO', 'Modified Bitumen', 'Asphalt', 'Metal', 'Tile', 'Cedar', 'Other - Pitched', 'Other - Flat'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Material name is required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const materialData = {
        name: formData.name,
        materialType: formData.materialType,
        price: parseFloat(formData.price) || 0,
        multiStoryPrice: parseFloat(formData.multiStoryPrice) || 0,
        description: formData.description,
        unit: 'sqft',
        category: 'Roofing'
      };

      await apiService.addInstantEstimatorMaterial(parseInt(id!), materialData);
      setToast({ message: 'Material saved successfully!', type: 'success' });
      setTimeout(() => navigate(`/instant-estimator/${id}/manage/materials`), 1000);
    } catch (error) {
      console.error('Failed to save material:', error);
      setToast({ message: 'Failed to save material', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to test
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New material</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Set your material pricing, photos, and description so the homeowner is aware of what is included in your offering. The preview on the right also shows what the homeowner will see for this material.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Material Setup */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Material setup</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material type
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) => handleInputChange('materialType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {materialTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($/sqft)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">sqft</span>
                  </div>
                </div>

                {/* Multi-story building surcharge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Multi-story building surcharge (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.multiStoryPrice}
                      onChange={(e) => handleInputChange('multiStoryPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">sqft</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This cost will be added to the total if a homeowner tells us their building has multiple stories. Turn on the Multi-story building question to enable this feature here
                  </p>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </label>
                  <div className="flex gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Material ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-600 hover:border-blue-400"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-600">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <strong>B</strong>
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <em>I</em>
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <u>U</u>
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      className="w-full p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none border-0 focus:ring-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Characters: {formData.description.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Preview (mobile view)</h2>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-sm mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  {formData.images.length > 0 ? (
                    <img
                      src={URL.createObjectURL(formData.images[0])}
                      alt="Material preview"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ${formData.price || '10,000'}*
                  </div>
                  
                  <button className="w-full bg-black text-white py-2 rounded-lg text-sm mb-4">
                    Get free proposal →
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <button className="flex items-center justify-between w-full text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">More details</span>
                      <span className="text-gray-400">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
        <button
          onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !formData.name.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
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

export default MaterialSetup;