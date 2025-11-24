import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NewMaterial: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedMaterial, setSelectedMaterial] = useState('EPDM');

  const materials = [
    { id: 'epdm', name: 'EPDM', icon: <div className="w-8 h-8 bg-gray-900 rounded-full"></div> },
    { id: 'asphalt', name: 'Asphalt', icon: <div className="w-8 h-8 bg-gray-800 rounded-full"></div> },
    { id: 'tile', name: 'Tile', icon: <div className="w-8 h-8 bg-red-600 rounded-full"></div> },
    { id: 'metal', name: 'Metal', icon: <div className="w-8 h-8 bg-blue-400 rounded-full"></div> },
    { id: 'cedar', name: 'Cedar', icon: <div className="w-8 h-8 bg-amber-700 rounded-full"></div> },
    { id: 'modified', name: 'Modified Bitumen', icon: <div className="w-8 h-8 bg-gray-600 rounded-full"></div> },
    { id: 'tpo', name: 'TPO', icon: <div className="w-8 h-8 bg-gray-300 rounded-full"></div> },
    { id: 'pitched', name: 'Other - Pitched', icon: <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600">?</span></div> },
    { id: 'flat', name: 'Other - Flat', icon: <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600">?</span></div> }
  ];

  const handleContinue = () => {
    navigate(`/instant-estimator/${id}/manage/materials/setup?type=${selectedMaterial}`);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New material</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Select the material you'll be adding to get a preconfigured template. All details can be edited later.
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
                onClick={() => setSelectedMaterial(material.name)}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedMaterial === material.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Radio button */}
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedMaterial === material.name
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMaterial === material.name && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
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
        <button onClick={handleContinue} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Continue
        </button>
      </div>

    </div>
  );
};

export default NewMaterial;