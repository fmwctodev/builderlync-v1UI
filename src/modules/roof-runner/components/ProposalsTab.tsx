import React, { useState } from 'react';
import { Plus, FileText, Calculator, ArrowRight } from 'lucide-react';

interface ProposalsTabProps {
  onOpenProposalEditor?: (templateId?: string) => void;
}

const ProposalsTab: React.FC<ProposalsTabProps> = ({ onOpenProposalEditor }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'roof-replacement',
      name: 'IKO Cambridge Roof Replacement',
      description: 'Complete roof replacement with IKO Cambridge shingles',
      type: 'Roofing',
      estimatedValue: '$12,500'
    },
    {
      id: 'roof-repair',
      name: 'Storm Damage Roof Repair',
      description: 'Insurance claim roof repair for storm damage',
      type: 'Repair',
      estimatedValue: '$3,200'
    },
    {
      id: 'gutter-replacement',
      name: 'Gutter System Replacement',
      description: 'Complete gutter system with downspouts',
      type: 'Gutters',
      estimatedValue: '$2,800'
    }
  ];

  const measurements = [
    {
      id: 'measurement-1',
      name: 'Main Roof Area',
      sqft: '2,450 sq ft',
      date: '2024-01-15'
    },
    {
      id: 'measurement-2',
      name: 'Garage Roof',
      sqft: '650 sq ft',
      date: '2024-01-15'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Proposals</h2>
        <button
          onClick={() => onOpenProposalEditor?.()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proposal Templates</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onOpenProposalEditor?.(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                        {template.type}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {template.estimatedValue}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create from Measurement Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create from Measurement</h3>
          <div className="space-y-3">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onOpenProposalEditor?.(measurement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Calculator className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{measurement.name}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{measurement.sqft}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">Measured on {measurement.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <p className="text-sm text-primary-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Create proposals directly from your measurements to automatically populate square footage and material calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {templates.length === 0 && measurements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No proposals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first proposal using a template or measurement data.
          </p>
          <button
            onClick={() => onOpenProposalEditor?.()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create First Proposal
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalsTab;