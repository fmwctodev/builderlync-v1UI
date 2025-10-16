import React, { useState } from 'react';
import { 
  Building, Users, Calendar, Mail, Phone, CreditCard, 
  Zap, Database, Shield, FileText, Palette, Settings as SettingsIcon,
  Plus, ExternalLink, Check, X, AlertTriangle
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [userRole, setUserRole] = useState<'Owner' | 'Admin' | 'User'>('Owner');

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'communications', label: 'Communications', icon: Mail },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'custom-fields', label: 'Custom Fields', icon: Database },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'brand-board', label: 'Brand Board', icon: Palette },
  ];

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Settings
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'business' && <BusinessInfoTab />}
          {activeTab === 'billing' && <BillingTab userRole={userRole} />}
          {activeTab === 'staff' && <StaffManagementTab userRole={userRole} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'communications' && <CommunicationsTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'custom-fields' && <CustomFieldsTab />}
          {activeTab === 'permissions' && <PermissionsTab userRole={userRole} />}
          {activeTab === 'audit-logs' && <AuditLogsTab userRole={userRole} />}
          {activeTab === 'brand-board' && <BrandBoardTab />}
        </div>
      </div>
    </div>
  );
};

const BusinessInfoTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your company details and locations</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
            <input
              type="text"
              defaultValue="BuilderLync Roofing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option>Roofing & Construction</option>
              <option>Solar Installation</option>
              <option>General Contracting</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="info@builderlync.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <textarea
              rows={3}
              defaultValue="123 Main Street, Suite 100, Austin, TX 78701"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Locations</h3>
          <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <Plus size={16} />
            <span>Add Location</span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Main Office</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">123 Main Street, Austin, TX 78701</p>
            </div>
            <button className="text-blue-600 hover:underline dark:text-blue-400">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingTab: React.FC<{ userRole: string }> = ({ userRole }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and payment methods</p>
      </div>

      {userRole !== 'Owner' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage billing settings.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Professional Plan</h4>
            <p className="text-gray-600 dark:text-gray-400">$99/month • Billed monthly</p>
          </div>
          <button 
            className={`px-4 py-2 rounded-lg ${
              userRole === 'Owner' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={userRole !== 'Owner'}
          >
            Change Plan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <button 
            className={`px-4 py-2 rounded-lg ${
              userRole === 'Owner' 
                ? 'text-blue-600 hover:underline dark:text-blue-400' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={userRole !== 'Owner'}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const StaffManagementTab: React.FC<{ userRole: string }> = ({ userRole }) => {
  const canManageStaff = userRole === 'Owner' || userRole === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage team members and their roles</p>
        </div>
        {canManageStaff && (
          <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <Plus size={16} />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {!canManageStaff && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only owners and admins can manage staff.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">John Smith</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">john@builderlync.com</td>
                <td className="px-6 py-4">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs dark:bg-red-900 dark:text-red-200">
                    Owner
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className={`text-blue-600 hover:underline text-sm mr-2 dark:text-blue-400 ${
                      !canManageStaff ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canManageStaff}
                  >
                    Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Sarah Johnson</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">sarah@builderlync.com</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs dark:bg-blue-900 dark:text-blue-200">
                    Admin
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className={`text-blue-600 hover:underline text-sm mr-2 dark:text-blue-400 ${
                      !canManageStaff ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canManageStaff}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CalendarTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calendar Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect and manage calendar integrations</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar Connections</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Google Calendar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">john@builderlync.com</p>
              </div>
            </div>
            <button className="text-red-600 hover:underline dark:text-red-400">Disconnect</button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Outlook Calendar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Not connected</p>
              </div>
            </div>
            <button className="text-blue-600 hover:underline dark:text-blue-400">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunicationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Communications</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure email, SMS, and voice settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Twilio Integration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account SID</label>
              <input
                type="text"
                placeholder="Enter Twilio Account SID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auth Token</label>
              <input
                type="password"
                placeholder="Enter Auth Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Save Twilio Settings
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phone Numbers</h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">Manage your Twilio phone numbers</p>
          <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <Plus size={16} />
            <span>Buy Number</span>
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">(555) 123-4567</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const IntegrationsTab: React.FC = () => {
  const integrations = [
    { name: 'QuickBooks', description: '2-way sync for customers and payments', connected: true, type: 'Accounting' },
    { name: 'Google Analytics', description: 'Website traffic and conversion tracking', connected: true, type: 'Analytics' },
    { name: 'Meta/Facebook', description: 'Social media and advertising', connected: true, type: 'Marketing' },
    { name: 'Google Business', description: 'Business profile and reviews', connected: false, type: 'Marketing' },
    { name: 'Yelp', description: 'Review management and messaging', connected: false, type: 'Reputation' },
    { name: 'TikTok Ads', description: 'Social media advertising', connected: false, type: 'Marketing' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect with third-party services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${integration.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
              </div>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                {integration.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.description}</p>
            <button className={`w-full px-4 py-2 rounded-lg ${
              integration.connected 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              {integration.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomFieldsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Custom Fields & Values</h2>
          <p className="text-gray-600 dark:text-gray-400">Create custom fields for contacts and jobs</p>
        </div>
        <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          <Plus size={16} />
          <span>Add Field</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Fields</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Property Type</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Dropdown</td>
                <td className="px-6 py-4">
                  <Check className="w-4 h-4 text-green-500" />
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm mr-2 dark:text-blue-400">Edit</button>
                  <button className="text-red-600 hover:underline text-sm dark:text-red-400">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Scoring</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hot Lead Score</label>
              <input
                type="number"
                defaultValue="80"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warm Lead Score</label>
              <input
                type="number"
                defaultValue="50"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cold Lead Score</label>
              <input
                type="number"
                defaultValue="20"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Save Scoring Rules
          </button>
        </div>
      </div>
    </div>
  );
};

const PermissionsTab: React.FC<{ userRole: string }> = ({ userRole }) => {
  const canManagePermissions = userRole === 'Owner';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Roles & Permissions</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage user roles and access levels</p>
      </div>

      {!canManagePermissions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage permissions.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owner</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Full system access</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Export data</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage billing</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />View audit logs</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage contacts</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage jobs</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Export data</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Manage billing</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />View contacts</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Create jobs</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Send messages</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Export data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const AuditLogsTab: React.FC<{ userRole: string }> = ({ userRole }) => {
  const canViewLogs = userRole === 'Owner' || userRole === 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs</h2>
        <p className="text-gray-600 dark:text-gray-400">Track system activities and errors</p>
      </div>

      {!canViewLogs && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only owners and admins can view audit logs.</p>
          </div>
        </div>
      )}

      {canViewLogs && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-01-15 14:30:22</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">john@builderlync.com</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contact Created</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contact #1247</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                      Success
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-01-15 14:25:15</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">sarah@builderlync.com</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Data Export</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contacts</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs dark:bg-red-900 dark:text-red-200">
                      Failed - Insufficient Permissions
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const BrandBoardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Brand Board</h2>
        <p className="text-gray-600 dark:text-gray-400">Define your brand identity for AI and creative assets</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Website</label>
            <input
              type="url"
              defaultValue="https://builderlync.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
            <textarea
              rows={4}
              defaultValue="Professional roofing and construction services specializing in residential and commercial projects. We provide quality workmanship with a focus on customer satisfaction and long-term relationships."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Voice & Tone</label>
            <textarea
              rows={3}
              placeholder="Describe your brand's personality, tone of voice, and communication style..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
            <textarea
              rows={3}
              placeholder="Describe your ideal customers and target market..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center dark:border-gray-600">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded dark:bg-gray-700"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your logo</p>
              <button className="text-blue-600 hover:underline dark:text-blue-400">Choose File</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Colors</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded"></div>
                <input
                  type="text"
                  defaultValue="#dc2626"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
                <input
                  type="text"
                  defaultValue="#1f2937"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Save Brand Board
        </button>
      </div>
    </div>
  );
};

export default Settings;