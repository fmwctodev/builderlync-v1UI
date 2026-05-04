import React, { useState } from 'react';
import { ArrowLeft, X, Plus, Edit, FileText, Image, FileType, Settings, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';

interface TemplateBuilderProps {
  onClose: () => void;
}

export default function TemplateBuilder({ onClose }: TemplateBuilderProps) {
  const [templateName, setTemplateName] = useState('demo');
  const [activeSection, setActiveSection] = useState('Cover');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Estimate option');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingUpgrade, setEditingUpgrade] = useState<string | null>(null);

  const sections = [
    { name: 'Cover', active: true },
    { name: 'Estimate', active: true, subsections: ['Demo', 'Summary'] },
  ];

  const addOptions = [
    {
      icon: Image,
      title: 'Photos',
      description: 'Add images that can be annotated and accompanied by detailed descriptions'
    },
    {
      icon: FileType,
      title: 'PDF',
      description: 'Attach PDFs to complement your proposal, such as marketing or manufacturer documents'
    },
    {
      icon: FileText,
      title: 'Text',
      description: 'Customize your proposal with a text section that supports inline signatures and initials'
    }
  ];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to templates
          </button>
          <div className="text-xs text-gray-500">Changes auto-saved</div>
        </div>

        <div className="flex-1  p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Edit template name');
              }}
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proposal sections</span>
              <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">?</span>
              </div>
            </div>

            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.name}>
                  <div
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      activeSection === section.name
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveSection(section.name)}
                  >
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  {section.subsections && (
                    <div className="ml-4 space-y-1">
                      {section.subsections.map((sub) => (
                        <div
                          key={sub}
                          className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">{sub}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit subsection:', sub);
                            }}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Plus size={16} />
                <span className="text-sm">Add section</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Estimate</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Demo</span>
              <button 
                onClick={() => setShowEditModal(true)}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <Pencil size={14} />
                Edit option
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
            Use this template
          </button>
        </div>

        {/* Template Preview */}
        <div className="flex-1 p-6 bg-paper dark:bg-canvas">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Demo</h3>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <Pencil size={14} />
                    Edit option
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Demo</span>
                  <button 
                    onClick={() => {
                      console.log('Edit demo description');
                    }}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Item</h4>
                    <button 
                      onClick={() => {
                        console.log('Edit item section');
                      }}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This is a testing</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CERTAINTEED LANDMARK IR AND CLIMATEFLEX 3 BOARD</div>

                  <div className="flex gap-4 mt-3 text-sm">
                    <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Plus size={14} />
                      Add item from catalog
                    </button>
                    <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Plus size={14} />
                      Add section heading
                    </button>
                    <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Plus size={14} />
                      Add upgrade
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Estimate subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">$221.00</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Upgrades</h4>
                    <button 
                      onClick={() => {
                        console.log('Edit upgrades section');
                      }}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Test</span>
                    <button 
                      onClick={() => {
                        console.log('Edit upgrade item');
                      }}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm mt-2 flex items-center gap-1">
                    <Plus size={14} />
                    Add summary
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Upgrade subtotal</span>
                    <span className="text-gray-900 dark:text-white">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Company representative name</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Terrylynn Roofing LLC</span>
                      <button 
                        onClick={() => {
                          console.log('Edit company info');
                        }}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">(000) 000-0000</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Company representative email</div>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">LOGO</span>
                    </div>
                    <button 
                      onClick={() => {
                        console.log('Edit logo');
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors shadow-sm"
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">What would you like to add?</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {addOptions.map((option) => (
                <button
                  key={option.title}
                  className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <option.icon size={20} className="text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{option.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Demo</h2>
                <button 
                  onClick={() => {
                    console.log('Edit demo title');
                  }}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {['Estimate option', 'Text', 'Profitability'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {activeTab === 'Estimate option' && (
                  <div className="p-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded text-sm mb-4 inline-block">
                      Estimate option
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              <input type="checkbox" className="rounded" />
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mapping</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Coverage</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit cost ($)</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales tax (%)</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr className="bg-gray-800 text-white">
                            <td className="px-3 py-2">
                              <input type="checkbox" checked className="rounded" readOnly />
                            </td>
                            <td className="px-3 py-2 text-sm">This is a testing</td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2 text-sm"></td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => {
                                    console.log('Edit item');
                                  }}
                                  className="text-white hover:text-gray-300 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    console.log('Delete item');
                                  }}
                                  className="text-white hover:text-gray-300 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    console.log('Toggle visibility');
                                  }}
                                  className="text-white hover:text-gray-300 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">
                              <input type="checkbox" className="rounded" />
                            </td>
                            <td className="px-3 py-2 text-sm">CERTAINTEED L...</td>
                            <td className="px-3 py-2 text-sm">1 H...</td>
                            <td className="px-3 py-2 text-sm">1 squares</td>
                            <td className="px-3 py-2 text-sm">198.90</td>
                            <td className="px-3 py-2 text-sm">square</td>
                            <td className="px-3 py-2 text-sm">1.00</td>
                            <td className="px-3 py-2 text-sm">0.0000</td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => {
                                    console.log('Edit catalog item');
                                  }}
                                  className="text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    console.log('Delete catalog item');
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    console.log('Toggle catalog item visibility');
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-4 mt-4 text-sm">
                      <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Plus size={14} />
                        Add item from catalog
                      </button>
                      <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Plus size={14} />
                        Add section heading
                      </button>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Upgrades</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Test</span>
                          <button 
                            onClick={() => {
                              console.log('Edit upgrade test');
                            }}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                        
                        <table className="w-full border border-gray-200 dark:border-gray-700 mt-2">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                <input type="checkbox" className="rounded" />
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mapping</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Coverage</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit cost ($)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales tax (%)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr className="bg-gray-800 text-white">
                              <td className="px-3 py-2">
                                <input type="checkbox" checked className="rounded" readOnly />
                              </td>
                              <td className="px-3 py-2 text-sm">ok</td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2 text-sm"></td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => {
                                      console.log('Edit upgrade item');
                                    }}
                                    className="text-white hover:text-gray-300 transition-colors"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      console.log('Delete upgrade item');
                                    }}
                                    className="text-white hover:text-gray-300 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      console.log('Toggle upgrade visibility');
                                    }}
                                    className="text-white hover:text-gray-300 transition-colors"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="flex gap-4 mt-4 text-sm">
                          <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <Plus size={14} />
                            Add item from catalog
                          </button>
                          <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <Plus size={14} />
                            Add section heading
                          </button>
                        </div>

                        <button className="text-primary-600 hover:text-primary-700 text-sm mt-4 flex items-center gap-1">
                          <Plus size={14} />
                          Add upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Profitability' && (
                  <div className="p-4">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profitability settings</h3>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="default" checked className="rounded" readOnly />
                          <label htmlFor="default" className="text-sm text-gray-700 dark:text-gray-300">Default (%)</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="minimum" checked className="rounded" readOnly />
                          <label htmlFor="minimum" className="text-sm text-gray-700 dark:text-gray-300">Minimum (%)</label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Margin</label>
                            <input
                              type="number"
                              defaultValue="10"
                              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              defaultValue="5"
                              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}