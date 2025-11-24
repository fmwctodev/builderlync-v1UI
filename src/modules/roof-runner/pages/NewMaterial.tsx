import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';

const NewMaterial: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Add custom offering']);
  const [existingMaterials, setExistingMaterials] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const materials = [
    { id: 'custom', name: 'Add custom offering', icon: <Plus className="w-8 h-8 text-primary-600" />, selected: true },
    { id: 'asphalt', name: 'Asphalt', icon: <div className="w-8 h-8 bg-gray-800 rounded-full"></div> },
    { id: 'tile', name: 'Tile', icon: <div className="w-8 h-8 bg-red-600 rounded-full"></div> },
    { id: 'metal', name: 'Metal', icon: <div className="w-8 h-8 bg-blue-400 rounded-full"></div> },
    { id: 'cedar', name: 'Cedar', icon: <div className="w-8 h-8 bg-amber-700 rounded-full"></div> },
    { id: 'modified', name: 'Modified Bitumen', icon: <div className="w-8 h-8 bg-gray-600 rounded-full"></div> },
    { id: 'tpo', name: 'TPO', icon: <div className="w-8 h-8 bg-gray-300 rounded-full"></div> },
    { id: 'epdm', name: 'EPDM', icon: <div className="w-8 h-8 bg-gray-900 rounded-full"></div> },
    { id: 'pitched', name: 'Other - Pitched', icon: <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600">?</span></div> },
    { id: 'flat', name: 'Other - Flat', icon: <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600">?</span></div> }
  ];

  useEffect(() => {
    fetchExistingMaterials();
  }, [id]);

  const fetchExistingMaterials = async () => {
    if (!id) return;
    try {
      const response = await apiService.getInstantEstimator(parseInt(id));
      const currentMaterials = response?.data?.materials || [];
      const materialNames = currentMaterials.map((m: any) => m.name);
      setExistingMaterials(materialNames);
      setSelectedMaterials([...materialNames]);
    } catch (error) {
      console.error('Failed to fetch existing materials:', error);
    }
  };

  const toggleMaterial = (materialName: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialName)
        ? prev.filter(m => m !== materialName)
        : [...prev, materialName]
    );
  };

  const handleContinue = async () => {
    if (!id) return;
    try {
      console.log('Updating materials for ID:', id);
      const materialsData = selectedMaterials
        .filter(name => name !== 'Add custom offering') // Remove the custom option
        .map((name, index) => ({
          id: (Date.now() + index).toString(),
          name,
          description: `${name} roofing material`,
          price: 0,
          unit: 'sq ft',
          category: 'Roofing'
        }));
      console.log('Materials data:', materialsData);
      
      const result = await apiService.updateInstantEstimatorMaterials(parseInt(id), materialsData);
      console.log('Update result:', result);
      setToast({ message: 'Material added successfully!', type: 'success' });
      setTimeout(() => navigate(`/instant-estimator/${id}/manage`), 1000);
    } catch (error) {
      console.error('Failed to add material:', error);
      setToast({ message: 'Failed to add material', type: 'error' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New material</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Select the material you'll be adding to get a preconfigured template or select custom offering to start from a blank state. All details can be edited later.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select your material</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {materials.map((material) => (
              <div
                key={material.id}
                onClick={() => toggleMaterial(material.name)}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedMaterials.includes(material.name)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded border-2 ${
                    selectedMaterials.includes(material.name)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMaterials.includes(material.name) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Material content */}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    {material.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {material.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
        <button
          onClick={() => navigate(`/instant-estimator/${id}/manage`)}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Back
        </button>
        <button onClick={handleContinue} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          Continue
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

export default NewMaterial;