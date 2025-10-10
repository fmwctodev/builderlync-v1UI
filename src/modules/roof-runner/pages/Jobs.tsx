import React, { useState } from 'react';
import { Search, Filter, Plus, X, Grid, List, Settings, ChevronDown, Eye, MoreVertical } from 'lucide-react';

const Jobs: React.FC = () => {
  const [activeView, setActiveView] = useState('board');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Initialize job cards for each column
  const [jobCards, setJobCards] = useState<Record<string, Array<{id: string, jobNumber: string, address: string, value: string, assignee: string}>>>(() => {
    const initialCards: Record<string, Array<{id: string, jobNumber: string, address: string, value: string, assignee: string}>> = {};
    const columns = [
      'New lead', 'Appointment scheduled', 'Appointment run', 'Adjuster Meeting Scheduled',
      'Adjuster Meeting Complete', 'Under Service Agreement/Contin', 'Estimate Received',
      'Proposal sent/presented', 'Proposal follow-up', 'Reinspection', 'Public Adjuster',
      'Proposal signed/Pre-Production', 'Supplementing', 'Pre-production', 'Materials Ordered',
      'Production', 'Post-production', 'Payments/Invoicing', 'Post-job completion follow-up',
      'Job completed', 'Lost', 'Unqualified'
    ];
    
    columns.forEach(column => {
      initialCards[column] = Array.from({ length: Math.min(5, Math.floor(Math.random() * 8) + 1) }, (_, i) => ({
        id: `${column}-${i}`,
        jobNumber: `Job #${1000 + Math.floor(Math.random() * 9000)}`,
        address: `${100 + i} Main Street, City, State`,
        value: `$${(Math.random() * 50000).toFixed(0)}`,
        assignee: String.fromCharCode(65 + (i % 26))
      }));
    });
    
    return initialCards;
  });

  const assignees = [
    'Anchor Dwyer', 'Austin Queen', 'Avery Zhao', 'Brendan Mullins', 'Chris Debayle',
    'Dorian Mendivil', 'Erin Haws', 'Ethan Lintz', 'Garrett Jones', 'Giulia Johnson',
    'Hayley Parks', 'JEFFREY JONES', 'Jacob Cox', 'Jake Webb', 'James Wolfgang Kuntz',
    'Joey G', 'Kirk White', 'Lexus Oliver', 'Luis Torres', 'Nicholas Wnukowski',
    'Nick X', 'Ralph Nevarez', 'Ray Aguilus', 'Richard Endruschat', 'Sean Richard',
    'Vijender Singh', 'Willy Hill'
  ];

  const stages = [
    'New lead', 'Appointment scheduled', 'Appointment run', 'Adjuster Meeting Scheduled',
    'Adjuster Meeting Complete', 'Under Service Agreement/Contin', 'Estimate Received',
    'Proposal sent/presented', 'Proposal follow-up', 'Reinspection', 'Public Adjuster',
    'Proposal signed/Pre-Production', 'Supplementing', 'Pre-production', 'Materials Ordered',
    'Production', 'Post-production', 'Payments/Invoicing', 'Post-job completion follow-up',
    'Job completed', 'Lost', 'Unqualified'
  ];

  const leadSources = [
    'Unassigned', 'Antonio', 'Billboard/Print Ad', 'CAI', 'Call Center', 'Call In',
    'Chive', 'Clive', 'Customer referral', 'DEMO - IE', 'Door', 'Door hanger',
    'Door knocking', 'Existing Relationship', 'Facebook', 'Goodwin', 'Google',
    'GutterMaxx', 'Home Advisor', 'Instagram', 'Insurance Agent Referral', 'Light',
    'Mailer', 'Nadine', 'Omar', 'Realestate referral', 'Referral - Kammie', 'REI',
    'Repeat Customer', 'Roof Engine', 'The Roofing Broker', 'Thumbtack', 'Torus',
    'Website', 'Website - IE', 'Yard Sign', 'Yelp'
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-6 mb-4">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'board'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Board View</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'list'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'settings'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="w-96 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="default">Default</option>
              <option value="awaiting">Awaiting Adjuster Inspection</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'board' && (
            <div className="h-full p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="flex gap-4 min-w-max">
                {[
                  { name: 'New lead', count: 527, value: '$1.00' },
                  { name: 'Appointment scheduled', count: 3, value: '$227,296.61' },
                  { name: 'Appointment run', count: 122, value: '$40,200.00' },
                  { name: 'Adjuster Meeting Scheduled', count: 12, value: '$0.00' },
                  { name: 'Adjuster Meeting Complete', count: 19, value: '$96,800.00' },
                  { name: 'Under Service Agreement/Contin', count: 1, value: '$0.00' },
                  { name: 'Estimate Received', count: 1, value: '$0.00' },
                  { name: 'Proposal sent/presented', count: 217, value: '$12,063,204.78' },
                  { name: 'Proposal follow-up', count: 5, value: '$0.00' },
                  { name: 'Reinspection', count: 14, value: '$0.00' },
                  { name: 'Public Adjuster', count: 15, value: '$70,455.70' },
                  { name: 'Proposal signed/Pre-Production', count: 30, value: '$547,944.40' },
                  { name: 'Supplementing', count: 3, value: '$23,050.70' },
                  { name: 'Pre-production', count: 2, value: '$63,110.40' },
                  { name: 'Materials Ordered', count: 0, value: '$0.00' },
                  { name: 'Production', count: 7, value: '$636,082.27' },
                  { name: 'Post-production', count: 5, value: '$73,562.72' },
                  { name: 'Payments/Invoicing', count: 23, value: '$395,942.78' },
                  { name: 'Post-job completion follow-up', count: 0, value: '$0.00' },
                  { name: 'Job completed', count: 220, value: '$3,278,832.60' },
                  { name: 'Lost', count: 102, value: '$283,592.26' },
                  { name: 'Unqualified', count: 121, value: '$137,250.00' }
                ].map((column, index) => (
                  <div key={column.name} className="w-80 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                      {/* Column Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{column.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">({column.count})</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{column.value}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">🏠 Default</span>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">🧰 Awaiting Adjuster Inspection</span>
                        </div>
                      </div>
                      
                      {/* Cards Container */}
                      <div 
                        className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[200px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const cardData = e.dataTransfer.getData('text/plain');
                          if (cardData) {
                            const { cardId, sourceColumn } = JSON.parse(cardData);
                            if (sourceColumn !== column.name) {
                              // Move card from source to target column
                              setJobCards(prev => {
                                const newCards = { ...prev };
                                const cardToMove = newCards[sourceColumn].find(card => card.id === cardId);
                                if (cardToMove) {
                                  newCards[sourceColumn] = newCards[sourceColumn].filter(card => card.id !== cardId);
                                  newCards[column.name] = [...newCards[column.name], cardToMove];
                                }
                                return newCards;
                              });
                            }
                            setDraggedCard(null);
                          }
                        }}
                      >
                        {/* Job Cards */}
                        {(jobCards[column.name] || []).map((card) => (
                          <div
                            key={card.id}
                            draggable
                            className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 ${
                              draggedCard === card.id ? 'opacity-50 scale-95' : ''
                            }`}
                            onDragStart={(e) => {
                              const dragData = JSON.stringify({ cardId: card.id, sourceColumn: column.name });
                              e.dataTransfer.setData('text/plain', dragData);
                              setDraggedCard(card.id);
                            }}
                            onDragEnd={() => setDraggedCard(null)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{card.jobNumber}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">2d ago</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{card.address}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{card.value}</span>
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                {card.assignee}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* View All Button */}
                        {(jobCards[column.name]?.length || 0) === 0 && (
                          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                            Drop cards here
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'list' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {[
                          'Last updated', 'Time in stage', 'Address', 'Contact', 'Value',
                          'Workflow', 'Stage', 'Close date', 'Lead source', 'Assignees',
                          'Job owner', 'Tasks', 'Reports', 'Proposals', 'Actions'
                        ].map(header => (
                          <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {Array.from({ length: 10 }, (_, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">2 days ago</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">5 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">123 Main St, City</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">John Doe</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">${(Math.random() * 50000).toFixed(0)}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">🏠 Default</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">New lead</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Dec 25, 2024</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Website</td>
                          <td className="px-4 py-3">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                              {String.fromCharCode(65 + (i % 26))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Owner {i + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 5)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 3)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 2)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === `row-${i}` ? null : `row-${i}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openDropdown === `row-${i}` && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                    <div className="py-1">
                                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Reassign
                                      </button>
                                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Order Report
                                      </button>
                                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Create DIY
                                      </button>
                                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Create Proposal
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'settings' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job settings</h2>
                <p className="text-gray-600 dark:text-gray-400">All your job specific settings are listed below</p>
              </div>

              {/* Workflows & Stages */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workflows & stages</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">A job moves through various stages before it is completed. Stages are grouped together inside workflows, which are listed below and can be customized.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🏠</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Default</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>1448 jobs</span>
                          <span>22 stages</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🧰</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Awaiting Adjuster Inspection</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>1 job</span>
                          <span>22 stages</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
                  </div>
                </div>
                
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create a workflow</span>
                </button>
              </div>

              {/* Lead Sources */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead sources</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Jobs are attributed to various lead sources which can be customized</p>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage sources</button>
              </div>

              {/* Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cards</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Customize the look and layout of your team's job cards</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address Card */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">1 Western Road, Houston, Texas</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rebecca Smith</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                  </div>
                  
                  {/* Customer Name Card */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rebecca Smith</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">1 Western Road, Houston, Texas</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Customer name</p>
                  </div>
                </div>
              </div>

              {/* Default Folders */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default folders</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Default folders will automatically appear in every new job to keep your attachments organized. You can add up to 20.</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Claims Documents</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Labor Invoice</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Material Invoices</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New folder</span>
                </button>
              </div>

              {/* Job Costing Access */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job costing access</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">By default job costing is only accessible to managers (and higher roles), to make it available to everyone in your team, please uncheck the box</p>
                
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-900 dark:text-white">Only managers</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Filters Sidebar */}
        {showFilters && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected filters</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">None</p>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
              <div className="space-y-2">
                {[
                  'Last updated (newest)', 'Last updated (oldest)', 'Created date (newest)',
                  'Created date (oldest)', 'Close date (newest)', 'Close date (oldest)',
                  'Address (alphabetical)', 'Value (higher)', 'Value (lower)',
                  'Time in stage (newest)', 'Time in stage (oldest)'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="radio" name="sort" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignees & Job Owner */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assignees & Job owner</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignees.map(assignee => (
                  <label key={assignee} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{assignee}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Stages</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">2 workflows hidden</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm">🏠 Default</span>
                  <span className="text-sm">🧰 Awaiting Adjuster Inspection</span>
                </div>
                {stages.map(stage => (
                  <label key={stage} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{stage}</span>
                    <span className="ml-auto text-xs">🏠 🧰</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Updated Date */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Updated date</h4>
              <div className="space-y-2">
                {[
                  'Today', 'Last 7 days', 'Last 4 weeks', 'Last 3 months',
                  'Last 6 months', 'Last 12 months', 'Month to date',
                  'Quarter to date', 'Year to date'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Close Date */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Close date</h4>
              <div className="space-y-2">
                {[
                  'Last 7 days', 'Last 4 weeks', 'Last 3 months', 'Last 6 months',
                  'Last 12 months', 'Month to date', 'Quarter to date', 'Year to date'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lead Sources */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lead sources</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Unassigned</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jobs that have no lead source</p>
                  </div>
                </label>
                {leadSources.slice(1).map(source => (
                  <label key={source} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* New Job Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Job</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This will create a card on the CRM board</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Report</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get a measurement report in hours</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Proposal</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Convert reports into customer proposals</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Customer</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add new contacts to Roofr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;