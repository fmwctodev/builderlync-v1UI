import React, { useState } from 'react';
import { Plus, AlertTriangle, Search, Edit2, Trash2, Eye, Copy, Check } from 'lucide-react';
import { AddEditStaffModal, DeleteConfirmModal } from '../StaffModals';

interface StaffProps {
  userRole?: string;
}

const Staff: React.FC<StaffProps> = ({ userRole = 'Owner' }) => {
  const canManageStaff = userRole === 'Owner' || userRole === 'Admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchStaff = async (page: number = 1) => {
    try {
      setLoading(true);
      const { getStaff } = await import('../../../../shared/store/services/staffApi');
      const response = await getStaff(page, 10);
      setStaff(response.data.data || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setToast({ message: 'Failed to load staff members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (member: any) => {
    try {
      const { createStaff } = await import('../../../../shared/store/services/staffApi');
      const staffResponse = await createStaff({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        extension: member.extension,
        password: member.password || 'defaultPassword123',
        image: member.image
      });

      const staffId = staffResponse?.data?.id;

      if (member.roleId && staffId) {
        try {
          const { getRoles, createRoleFromTemplate, assignRoleToStaffMember } = await import('../../../../shared/store/services/rolesApi');

          let organizationRoleId: string;

          if (member.roleId.startsWith('role:')) {
            organizationRoleId = member.roleId.replace('role:', '');
          } else if (member.roleId.startsWith('template:')) {
            const templateId = member.roleId.replace('template:', '');
            const rolesResponse = await getRoles();
            const existingRole = rolesResponse.data?.find((r: any) => r.template_id === templateId);

            if (existingRole) {
              organizationRoleId = existingRole.id;
            } else {
              const roleResponse = await createRoleFromTemplate(templateId);
              if (roleResponse.success && roleResponse.data) {
                organizationRoleId = roleResponse.data.id;
              } else {
                throw new Error('Failed to create role from template');
              }
            }
          } else {
            organizationRoleId = member.roleId;
          }

          await assignRoleToStaffMember(staffId, organizationRoleId);
        } catch (roleError: any) {
          console.error('Error assigning role to staff member:', roleError);
        }
      }

      try {
        const { createContact } = await import('../../../../shared/store/services/contactsApi');
        await createContact({
          fullName: `${member.firstName} ${member.lastName}`,
          type: 'staff',
          labelOrRole: 'Staff Member',
          email: member.email,
          phone: member.phone || '',
          company: '',
          address: '',
          latitude: 0,
          longitude: 0
        });
        setToast({ message: 'Staff member added and contact created successfully!', type: 'success' });
      } catch (contactError: any) {
        console.error('Error creating contact for staff member:', contactError);
        setToast({ message: 'Staff member added but contact creation failed', type: 'success' });
      }

      setShowAddModal(false);
      fetchStaff(currentPage);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEditMember = async (member: any) => {
    try {
      const { updateStaff } = await import('../../../../shared/store/services/staffApi');
      await updateStaff(selectedMember.id, {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        extension: member.extension,
        password: member.password,
        image: member.image
      });

      if (member.roleId) {
        try {
          const { getRoles, createRoleFromTemplate, assignRoleToStaffMember } = await import('../../../../shared/store/services/rolesApi');

          let organizationRoleId: string;

          if (member.roleId.startsWith('role:')) {
            organizationRoleId = member.roleId.replace('role:', '');
          } else if (member.roleId.startsWith('template:')) {
            const templateId = member.roleId.replace('template:', '');
            const rolesResponse = await getRoles();
            const existingRole = rolesResponse.data?.find((r: any) => r.template_id === templateId);

            if (existingRole) {
              organizationRoleId = existingRole.id;
            } else {
              const roleResponse = await createRoleFromTemplate(templateId);
              if (roleResponse.success && roleResponse.data) {
                organizationRoleId = roleResponse.data.id;
              } else {
                throw new Error('Failed to create role from template');
              }
            }
          } else {
            organizationRoleId = member.roleId;
          }

          await assignRoleToStaffMember(selectedMember.id, organizationRoleId);
        } catch (roleError: any) {
          console.error('Error assigning role to staff member:', roleError);
        }
      }

      try {
        const { getContacts, updateContact, createContact } = await import('../../../../shared/store/services/contactsApi');
        const contactsResponse = await getContacts(selectedMember.email, 'staff', 1, 10);

        if (contactsResponse.data?.data && contactsResponse.data.data.length > 0) {
          const existingContact = contactsResponse.data.data[0];
          await updateContact(existingContact.id, {
            fullName: `${member.firstName} ${member.lastName}`,
            type: 'staff',
            labelOrRole: 'Staff Member',
            email: member.email,
            phone: member.phone || '',
            company: existingContact.company || '',
            address: existingContact.address || '',
            latitude: existingContact.latitude || 0,
            longitude: existingContact.longitude || 0
          });
          setToast({ message: 'Staff member and contact updated successfully!', type: 'success' });
        } else {
          await createContact({
            fullName: `${member.firstName} ${member.lastName}`,
            type: 'staff',
            labelOrRole: 'Staff Member',
            email: member.email,
            phone: member.phone || '',
            company: '',
            address: '',
            latitude: 0,
            longitude: 0
          });
          setToast({ message: 'Staff member updated and contact created successfully!', type: 'success' });
        }
      } catch (contactError: any) {
        console.error('Error updating contact for staff member:', contactError);
        setToast({ message: 'Staff member updated but contact sync failed', type: 'success' });
      }

      setShowEditModal(false);
      setSelectedMember(null);
      fetchStaff(currentPage);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteMember = async () => {
    try {
      const { deleteStaff } = await import('../../../../shared/store/services/staffApi');
      await deleteStaff(selectedMember.id);
      setToast({ message: 'Staff member deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchStaff(currentPage);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const openDeleteModal = (member: any) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-teal-500',
      'bg-red-600',
      'bg-primary-500',
      'bg-red-500',
      'bg-primary-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  const generateUserId = (id: number, email: string) => {
    const hash = email.slice(0, 3) + id.toString().padStart(3, '0');
    return hash.toUpperCase();
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchQuery === '' ||
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.phone && member.phone.includes(searchQuery)) ||
      generateUserId(member.id, member.email).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === '' || true;

    return matchesSearch && matchesRole;
  });

  React.useEffect(() => {
    fetchStaff(1);
  }, []);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage team members and their roles</p>
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-64">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
                >
                  <option value="">User Role</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="name, email, phone, ids"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {canManageStaff && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member, index) => {
                  const userId = generateUserId(member.id, member.email);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-semibold text-sm`}>
                            {getInitials(member.first_name, member.last_name)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.first_name} {member.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {member.email}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {userId}
                            </span>
                            <button
                              onClick={() => copyToClipboard(member.id, userId)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {copiedId === member.id ? (
                                <Check size={12} className="text-green-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {member.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 uppercase">
                          ACCOUNT-ADMIN
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(member)}
                            disabled={!canManageStaff}
                            className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(member)}
                            disabled={!canManageStaff}
                            className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            disabled={!canManageStaff}
                            className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredStaff.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchStaff(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                {currentPage}
              </button>
              <button
                onClick={() => fetchStaff(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AddEditStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />

      <AddEditStaffModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        onSave={handleEditMember}
        member={selectedMember ? {
          firstName: selectedMember.first_name,
          lastName: selectedMember.last_name,
          email: selectedMember.email,
          phone: selectedMember.phone,
          extension: selectedMember.extension,
          profileImage: selectedMember.image
        } : undefined}
        isEdit={true}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
        memberName={selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : ''}
      />
    </div>
  );
};

export default Staff;
