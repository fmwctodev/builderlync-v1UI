import React, { useState } from 'react';
import {
  Building, Users, Calendar, Mail, Phone, CreditCard,
  Zap, Database, Shield, FileText, Palette, Settings as SettingsIcon,
  Plus, ExternalLink, Check, X, AlertTriangle, Send, CheckCircle,
  MailOpen, MousePointer, Flag, MessageSquare, Bell, XCircle, Info,
  ArrowRight
} from 'lucide-react';
import { AddEditStaffModal, DeleteConfirmModal } from '../components/StaffModals';

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
    { id: 'email-service', label: 'Email Service', icon: Mail },
  ];

  const emailTabs = [
    "SMTP Service",
    "Reply & Forward Settings",
    "Email Analytics",
    "Bounce Classification",
    "Postmaster Tools",
  ];

  const [activeEmail, setActiveEmail] = useState(emailTabs[0]);

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
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
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
          {activeTab === 'email-service' && <EmailServiceTab />}
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
            <button className="text-primary-600 hover:underline dark:text-primary-400">Edit</button>
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
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
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
            <div className="w-12 h-8 bg-primary-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'text-primary-600 hover:underline dark:text-primary-400'
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { getStaff } = await import('../../../shared/store/services/staffApi');
      const response = await getStaff(1, 50);
      setStaff(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setToast({ message: 'Failed to load staff members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (member: any) => {
    try {
      const { createStaff } = await import('../../../shared/store/services/staffApi');
      await createStaff({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        extension: member.extension,
        password: member.password || 'defaultPassword123',
        image: member.image
      });
      setToast({ message: 'Staff member added successfully!', type: 'success' });
      setShowAddModal(false);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEditMember = async (member: any) => {
    if (!selectedMember) return;
    try {
      const { updateStaff } = await import('../../../shared/store/services/staffApi');
      await updateStaff(selectedMember.id, {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        extension: member.extension,
        password: member.password,
        image: member.image
      });
      setToast({ message: 'Staff member updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedMember(null);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    try {
      const { deleteStaff } = await import('../../../shared/store/services/staffApi');
      await deleteStaff(selectedMember.id);
      setToast({ message: 'Staff member deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const openEditModal = (member: any) => {
    setSelectedMember({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      phone: member.phone,
      extension: member.extension
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (member: any) => {
    setSelectedMember({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name
    });
    setShowDeleteModal(true);
  };

  React.useEffect(() => {
    fetchStaff();
  }, []);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage team members and their roles</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.email}</td>
                    {/* <td className="px-6 py-4">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs dark:bg-primary-900 dark:text-primary-200">
                        Staff
                      </span>
                    </td> */}
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(member)}
                        className={`text-primary-600 hover:underline text-sm mr-2 dark:text-primary-400 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        disabled={!canManageStaff}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(member)}
                        className={`text-red-600 hover:underline text-sm dark:text-red-400 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        disabled={!canManageStaff}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />

      <AddEditStaffModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditMember}
        member={selectedMember}
        isEdit={true}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMember}
        memberName={selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : ''}
      />
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
            <button className="text-primary-600 hover:underline dark:text-primary-400">Connect</button>
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
            <button className={`w-full px-4 py-2 rounded-lg ${integration.connected
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-primary-600 text-white hover:bg-primary-700'
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
                  <button className="text-primary-600 hover:underline text-sm mr-2 dark:text-primary-400">Edit</button>
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
              <button className="text-primary-600 hover:underline dark:text-primary-400">Choose File</button>
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

const EmailServiceTab: React.FC = () => {
  const emailTabs = [
    "SMTP Service",
    "Reply & Forward Settings",
    "Email Analytics",
    "Bounce Classification",
    "Postmaster Tools",
  ];

  const [activeEmail, setActiveEmail] = useState(emailTabs[0]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            SMTP Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You can use your own SMTP services or use the default service
          </p>
        </div>
        <button 
          onClick={() => setShowAddServiceModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {emailTabs.map((emailTab) => (
            <button
              key={emailTab}
              onClick={() => setActiveEmail(emailTab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap
                ${activeEmail === emailTab
                  ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }
              `}
            >
              {emailTab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div>
          {activeEmail === "SMTP Service" && <SMTPServiceContent />}
          {activeEmail === "Reply & Forward Settings" && <ReplyForwardContent />}
          {activeEmail === "Email Analytics" && <EmailAnalyticsContent />}
          {activeEmail === "Bounce Classification" && <BounceClassificationContent />}
          {activeEmail === "Postmaster Tools" && <PostmasterToolsContent />}
        </div>
      </div>

      <AddEmailServiceModal 
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
      />
    </div>
  );
};

const AddEmailServiceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-900">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add your own email service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure your SMTP provider like Outlook, Gsuite, Sendgrid, etc</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const ReplyForwardContent: React.FC = () => {
  const [forwardToAssigned, setForwardToAssigned] = useState(false);

  return (
    <div className="space-y-8">
      {/* Forwarding Address Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forwarding Address</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will receive the email replies not only in the Conversation view, but also in your personal email inbox.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">Note:</span> Forwarding Addresses cannot use the same domain as your Sending Domain in order to prevent infinite loops. I.e. if your sending domain is yourdomain.com, you cannot add a forwarding address for something@yourdomain.com
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forwarding Address</label>
            <textarea
              rows={3}
              placeholder="Forwarding address (Press 'Enter' after each address)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BCC Emails</label>
            <textarea
              rows={3}
              placeholder="BCC Emails (Press 'Enter' after each address)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={forwardToAssigned}
                onChange={(e) => setForwardToAssigned(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Forward to assigned user</span>
          </div>
          
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Reply Address Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reply Address</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            reply-to address will be added to all the emails
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">Note:</span> Reply conversations cannot be tracked and will not come to conversation thread.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reply Address</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <div className="flex items-center bg-gray-100 border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mr-2 dark:bg-gray-600 dark:text-gray-300">
                    info@sitehues.com
                    <button className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailAnalyticsContent: React.FC = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('');

  const handleMetricClick = (metricLabel: string) => {
    setSelectedMetric(metricLabel);
    setShowReportModal(true);
  };

  const metrics = [
    { icon: Send, label: 'Sent', value: '109', percentage: '100%', color: 'bg-green-100 text-green-600', bgColor: 'bg-green-100' },
    { icon: CheckCircle, label: 'Delivered', value: '109', percentage: '100%', color: 'bg-green-100 text-green-600', bgColor: 'bg-green-100' },
    { icon: MailOpen, label: 'Opened', value: '14', percentage: '13%', color: 'bg-green-100 text-green-600', bgColor: 'bg-green-100' },
    { icon: MousePointer, label: 'Clicked', value: '0', percentage: '0%', color: 'bg-green-100 text-green-600', bgColor: 'bg-green-100' },
    { icon: Flag, label: 'Complained', value: '0', percentage: '0%', color: 'bg-red-100 text-red-600', bgColor: 'bg-red-100' },
    { icon: MessageSquare, label: 'Bounced', value: '0', percentage: '0%', color: 'bg-orange-100 text-orange-600', bgColor: 'bg-orange-100' },
    { icon: Bell, label: 'Unsubscribed', value: '0', percentage: '0%', color: 'bg-yellow-100 text-yellow-600', bgColor: 'bg-yellow-100' },
    { icon: XCircle, label: 'Failed', value: '0', percentage: '0%', color: 'bg-gray-100 text-gray-600', bgColor: 'bg-gray-100' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Metrics</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>2025-11-10</span>
            <span>2025-11-16</span>
          </div>
          <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            <span>≡</span>
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={index} 
              onClick={() => handleMetricClick(metric.label)}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metric.bgColor} dark:${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color.split(' ')[1]} dark:${metric.color.split(' ')[1]}`} />
                </div>
                <span className={`text-sm font-medium ${metric.color.split(' ')[1]} dark:${metric.color.split(' ')[1]}`}>
                  {metric.percentage}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <EmailReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        metricType={selectedMetric}
      />
    </div>
  );
};

const EmailReportModal: React.FC<{ isOpen: boolean; onClose: () => void; metricType: string }> = ({ isOpen, onClose, metricType }) => {
  if (!isOpen) return null;

  const sampleData = [
    { name: 'vgkmtefrfnfxtvsiefzdbp', email: 'gressmanallison@gmail.com', status: 'Sent', date: 'Nov 16, 2025 11:17 pm' },
    { name: 'mqivhwjjdvgfbsgpgvbdetq', email: 'kmadcock98@gmail.com', status: 'Sent', date: 'Nov 16, 2025 10:41 pm' },
    { name: 'kpkmvirasyyulkkfdspj', email: 'marilyncastro@gmail.com', status: 'Sent', date: 'Nov 16, 2025 10:38 pm' },
    { name: 'whkrbejjrpskyubvbqyfvh', email: 'lisbeth05martinez@gmail.com', status: 'Sent', date: 'Nov 16, 2025 10:18 pm' },
    { name: 'uhgvuchasvlchprgvhldwnjv', email: 'ncuts75@hotmail.com', status: 'Sent', date: 'Nov 16, 2025 10:02 pm' },
    { name: 'kjtctguusaitycvwzncjfr', email: 'beverlyvanscyoc@yahoo.com', status: 'Sent', date: 'Nov 16, 2025 07:17 pm' },
    { name: 'gzvdtoxilisdcaqx', email: 'guypeters@comcast.net', status: 'Sent', date: 'Nov 16, 2025 06:49 pm' },
    { name: 'wyiwhyqshyuqoayfebq', email: 'sunlover7703@gmail.com', status: 'Sent', date: 'Nov 16, 2025 06:17 pm' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                defaultValue="2025-11-10"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <span className="text-gray-400">→</span>
              <input 
                type="date" 
                defaultValue="2025-11-16"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sampleData.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-blue-600 dark:text-blue-400">{row.name}</span>
                      <ExternalLink className="w-3 h-3 ml-1 text-blue-600 dark:text-blue-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Records : 109</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Previous</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">2</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">3</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">4</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">5</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">6</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BounceClassificationContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Bounces</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <input 
              type="date" 
              defaultValue="2025-11-15"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span>→</span>
            <input 
              type="date" 
              defaultValue="2025-11-17"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            <span>≡</span>
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Permanent Bounce</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Permanent Bounce Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0%</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">ESP/ISP Block</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">55</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
        </div>
      </div>

      {/* Bounce Classification Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Bounce Classification Overview</h4>
          <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">
            Troubleshoot Email Bounces
          </button>
        </div>
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Service Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Definition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No error bounces were found for the selected date and filters.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PostmasterToolsContent: React.FC = () => {
  const [activeProvider, setActiveProvider] = useState('Google');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Postmaster Tools</h3>
      
      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-48 space-y-2">
          <button 
            onClick={() => setActiveProvider('Google')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeProvider === 'Google' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Google
          </button>
          <button 
            onClick={() => setActiveProvider('Microsoft SNDS')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeProvider === 'Microsoft SNDS' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Microsoft SNDS
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeProvider === 'Google' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Google Postmaster Tool</h4>
                <p className="text-gray-600 dark:text-gray-400">With Google Postmaster Tools, you can optimize email performance and ensure accurate delivery to Gmail inboxes.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Connected to Google Postmaster</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <button className="text-red-600 hover:underline text-sm dark:text-red-400">Revoke</button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected Account: sean@sitehues.com | Account Name: Sean Richard</p>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dedicated Sending Domains</h5>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <h6 className="font-medium text-orange-800 dark:text-orange-200 mb-2">No Dedicated Sending Domains Detected</h6>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        It looks like you don't have any dedicated sending domains set up yet, or your domain is currently unverified.
                        Having a dedicated domain helps optimize email performance and ensures reliable delivery to inboxes.
                      </p>
                      <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm font-medium dark:text-orange-400 dark:hover:text-orange-200">
                        <span>Create Domain Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeProvider === 'Microsoft SNDS' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Microsoft SNDS Tool</h4>
                <p className="text-gray-600 dark:text-gray-400">With Outlook Postmaster Tools, you can monitor and troubleshoot your emails effectively, ensuring they reach your recipient's inboxes without fail.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/20">
                  <Info className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">IP not found in your account</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
                  You're on a shared IP, the option to access detailed data about individual IPs and manage feedback loop settings might not be available, as these features are typically offered for dedicated IP account.
                </p>
                <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">Know more</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SMTPServiceContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Select Default Provider */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Default Provider</h3>
        <div className="border border-primary-200 rounded-lg p-4 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary-500 rounded"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">LeadConnector Email System</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">lc.automationlab.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">
                View Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LeadConnector Email System Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">LeadConnector Email System</h4>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 dark:text-white">Dedicated Domain And IP</h5>
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center dark:bg-gray-600">
              <ExternalLink className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Using a dedicated sending domain for email communications can help improve deliverability and maintain your sender reputation. Here are the key actions you should take when setting up a dedicated sending domain:
              </p>
            </div>
            <div className="ml-3.5 space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Implement DMARC:</span> DMARC policy allows you to specify how receiving servers should handle emails that fail SPF and DKIM checks. It helps you monitor email deliverability and protects against phishing attempts using your domain.
                </p>
              </div>
            </div>
            <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">
              Show More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default Settings;