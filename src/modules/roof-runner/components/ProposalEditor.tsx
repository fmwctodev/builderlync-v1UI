import React, { useState } from 'react';
import { ArrowLeft, Send, Settings, Eye, Minus, Plus } from 'lucide-react';

interface ProposalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ isOpen, onClose, templateId }) => {
  const [activeSection, setActiveSection] = useState('Cover');
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen) return null;

  const sections = [
    'Cover',
    'About Us', 
    'Inspection Photos',
    'Overview',
    'Scope of Work',
    'Estimate'
  ];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to proposals
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Changes auto-saved</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-900 dark:text-white font-medium mr-4">503 Westmorland Drive, Austin, TX 78745</span>
          <button className="flex items-center px-3 py-1 text-primary-600 hover:text-primary-700 border border-primary-200 rounded mr-2">
            <Send className="w-4 h-4 mr-1" />
            Send
          </button>
          <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mr-2">
            Edit proposal
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            View proposal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-16 w-full">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Customer Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer</h3>
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">Michelle Evans</div>
              <div className="text-gray-600 dark:text-gray-400">michelle@mauroatx.com</div>
              <div className="text-gray-600 dark:text-gray-400">(512) 220-0565</div>
            </div>
          </div>

          {/* Related */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Related</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm">
              View job details
            </button>
          </div>

          {/* Proposal Sections */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Proposal sections</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    activeSection === section
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {/* Estimate Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Estimate</h2>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      View details
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    IKO Cambridge Roof Replacement
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">IKO Cambridge Roof Replacement</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      Tarrytown Roofing will complete all approved work outlined in the insurance estimate, 
                      excluding any specifically excluded items. For retail estimates, all services will be conducted 
                      in strict accordance with the detailed scope of work document provided below. Additionally, 
                      Tarrytown Roofing and its affiliates are authorized to communicate directly with your 
                      insurance provider to facilitate claim processing and payment coordination, ensuring a 
                      streamlined and hassle-free experience.
                    </p>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Item</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-600 dark:text-gray-400">Price</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 py-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Scope of Work</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">IKO Cambridge Roof Replacement</div>
                            <div className="text-xs text-primary-600 dark:text-primary-400">See Scope of Work for full details.</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">$12,500.00</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 py-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Section Name</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Fascia Repair</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">$850.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="absolute right-0 top-16 bottom-0 w-16 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
            <div className="flex flex-col items-center space-y-2 mb-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-500">Estimate settings</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-500">Supplier</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-20 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;