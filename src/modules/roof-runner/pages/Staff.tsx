import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { AddEditStaffModal, DeleteConfirmModal } from '../components/StaffModals';
import { getStaff, createStaff, updateStaff, deleteStaff, StaffMember, CreateStaffRequest, UpdateStaffRequest } from '../../../shared/store/services/staffApi';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const fetchStaff = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const response = await getStaff(page, 10);
      setStaff(response.data.staff || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
      setTotalStaff(response.data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setToast({ message: 'Failed to load staff members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (staffData: any) => {
    setIsSubmitting(true);
    try {
      const createData: CreateStaffRequest = {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        extension: staffData.extension,
        password: staffData.password || 'defaultPassword123'
      };

      await createStaff(createData);
      setToast({ message: 'Staff member added successfully!', type: 'success' });
      setShowAddModal(false);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add staff member';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async (staffData: any) => {
    if (!editingStaff) return;
    
    setIsSubmitting(true);
    try {
      const updateData: UpdateStaffRequest = {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        extension: staffData.extension
      };

      if (staffData.password) {
        updateData.password = staffData.password;
      }

      await updateStaff(editingStaff.id, updateData);
      setToast({ message: 'Staff member updated successfully!', type: 'success' });
      setShowEditModal(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update staff member';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    
    setIsSubmitting(true);
    try {
      await deleteStaff(deletingStaff.id);
      setToast({ message: 'Staff member deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      setDeletingStaff(null);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete staff member';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDropdownToggle = (staffId: number) => {
    setActiveDropdown(activeDropdown === staffId ? null : staffId);
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDelete = (member: StaffMember) => {
    setDeletingStaff(member);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStaff(page);
  };

  const filteredStaff = staff.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Staff Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:opacity-90"
            style={{backgroundColor: '#dc2626'}}
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
            style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {filteredStaff.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {member.image ? (
                          <img src={member.image} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => handleDropdownToggle(member.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {activeDropdown === member.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                          <button
                            onClick={() => handleEdit(member)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-900 dark:text-white">{member.phone}</span>
                    </div>
                    {member.extension && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Extension:</span>
                        <span className="text-gray-900 dark:text-white">{member.extension}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalStaff)} of {totalStaff} staff members
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddEditStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStaff}
      />

      <AddEditStaffModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingStaff(null);
        }}
        onSave={handleEditStaff}
        member={editingStaff || undefined}
        isEdit={true}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingStaff(null);
        }}
        onConfirm={handleDeleteStaff}
        memberName={deletingStaff ? `${deletingStaff.firstName} ${deletingStaff.lastName}` : ''}
      />
    </div>
  );
};

export default Staff;