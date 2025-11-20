import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Upload, Download } from "lucide-react";
import { CreateContactRequest, createContact, getContacts, updateContact, deleteContact, uploadContactsCsv } from "../../../shared/store/services/contactsApi";
import Toast from "../../../shared/components/Toast";
import ContactModal from "../components/ContactModal";
import ContactsTable from "../components/ContactsTable";
import Pagination from "../components/Pagination";
import CsvUploadModal from "../components/CsvUploadModal";

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    type: 'customer',
    labelRole: '',
    email: '',
    phone: '',
    extension: '',
    company: '',
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);
  const [secondaryPhone, setSecondaryPhone] = useState({phone: '', extension: ''});
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);

  const addSecondaryEmail = () => {
    setShowSecondaryEmail(true);
  };

  const removeSecondaryEmail = () => {
    setShowSecondaryEmail(false);
    setSecondaryEmail('');
  };

  const addSecondaryPhone = () => {
    setShowSecondaryPhone(true);
  };

  const removeSecondaryPhone = () => {
    setShowSecondaryPhone(false);
    setSecondaryPhone({phone: '', extension: ''});
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({...formData, phone: formatted});
  };

  const handleSecondaryPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setSecondaryPhone({...secondaryPhone, phone: formatted});
  };

  const handleAddressChange = (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const contactData: CreateContactRequest = {
      fullName: formData.fullName,
      type: formData.type,
      labelOrRole: formData.labelRole,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    try {
      await createContact(contactData);

      setFormData({
        fullName: '',
        type: 'customer',
        labelRole: '',
        email: '',
        phone: '',
        extension: '',
        company: '',
        address: '',
        latitude: 0,
        longitude: 0
      });
      setShowContactModal(false);
      setToast({message: 'Contact created successfully!', type: 'success'});
      fetchContacts();
    } catch (error: any) {
      console.log("error:", JSON.stringify(error.response.data));
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create contact';
      setToast({message: errorMessage, type: 'error'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    setIsLoading(true);

    const contactData: CreateContactRequest = {
      fullName: formData.fullName,
      type: formData.type,
      labelOrRole: formData.labelRole,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    try {
      await updateContact(editingContact.id, contactData);

      setFormData({
        fullName: '',
        type: 'customer',
        labelRole: '',
        email: '',
        phone: '',
        extension: '',
        company: '',
        address: '',
        latitude: 0,
        longitude: 0
      });
      setShowEditModal(false);
      setEditingContact(null);
      setToast({message: 'Contact updated successfully!', type: 'success'});
      fetchContacts();
    } catch (error: any) {
      console.log("error:", JSON.stringify(error.response.data));
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create contact';
      setToast({message: errorMessage, type: 'error'});
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (page: number = currentPage) => {
    try {
      const response = await getContacts(searchTerm, typeFilter, page, 10);
      setContacts(response.data.contacts || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
      setTotalContacts(response.data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setToast({message: 'Failed to load contacts', type: 'error'});
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchContacts(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
      if (!target.closest('.type-filter-container')) {
        setShowTypeFilter(false);
      }
    };

    if (activeDropdown || showTypeFilter) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown, showTypeFilter]);



  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === contacts.length ? [] : contacts.map(c => c.id)
    );
  };

  const handleDropdownToggle = (contactId: string) => {
    setActiveDropdown(activeDropdown === contactId ? null : contactId);
  };

  const handleViewProfile = (contact: any) => {
    navigate(`/contacts/${contact.id}`);
    setActiveDropdown(null);
  };

  const handleViewJob = (contact: any) => {
    console.log('View job:', contact);
    setActiveDropdown(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchContacts(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      setToast({message: 'Please select a valid CSV file', type: 'error'});
    }
  };

  const handleCsvUpload = async () => {
    if (!selectedFile) {
      setToast({message: 'Please select a file', type: 'error'});
      return;
    }

    setUploadLoading(true);

    try {
      await uploadContactsCsv(selectedFile);
      setToast({message: 'CSV uploaded successfully!', type: 'success'});
      setShowCsvModal(false);
      setSelectedFile(null);
      fetchContacts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      setToast({message: errorMessage, type: 'error'});
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      fullName: contact.fullName || '',
      type: contact.type || 'customer',
      labelRole: contact.label_or_role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      extension: '',
      company: contact.company || '',
      address: contact.address || '',
      latitude: contact.latitude || 0,
      longitude: contact.longitude || 0
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDelete = (contact: any) => {
    setContactToDelete(contact);
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteContact(contactToDelete.id);
      setToast({ message: 'Contact deleted successfully!', type: 'success' });
      setShowDeleteConfirm(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete contact';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Contacts</h1>
          <div className="flex gap-3">
            <button
              // onClick={() => setShowCsvModal(true)}
              className="text-gray-700 dark:text-gray-300 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowCsvModal(true)}
              className="text-gray-700 dark:text-gray-300 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:opacity-90"
              style={{backgroundColor: '#dc2626'}}
            >
              <Plus className="w-4 h-4" />
              New contact
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
              style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#dc2626'}
              onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
            />
          </div>
          <div className="relative type-filter-container">
            <button
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${
                typeFilter ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'Type'}
            </button>

            {showTypeFilter && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTypeFilter('');
                      setShowTypeFilter(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('customer');
                      setShowTypeFilter(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('insurance');
                      setShowTypeFilter(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Insurance
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('vendor');
                      setShowTypeFilter(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Vendor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ContactsTable
        contacts={contacts}
        loadingContacts={loadingContacts}
        selectedContacts={selectedContacts}
        activeDropdown={activeDropdown}
        onSelectContact={handleSelectContact}
        onSelectAll={handleSelectAll}
        onDropdownToggle={handleDropdownToggle}
        onViewProfile={handleViewProfile}
        onViewJob={handleViewJob}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalContacts={totalContacts}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      <ContactModal
        show={showContactModal || showEditModal}
        isEdit={showEditModal}
        isLoading={isLoading}
        formData={formData}
        secondaryEmail={secondaryEmail}
        showSecondaryEmail={showSecondaryEmail}
        secondaryPhone={secondaryPhone}
        showSecondaryPhone={showSecondaryPhone}
        onClose={() => {
          setShowContactModal(false);
          setShowEditModal(false);
          setEditingContact(null);
        }}
        onSubmit={showEditModal ? handleEditSubmit : handleSubmit}
        onFormDataChange={setFormData}
        onPhoneChange={handlePhoneChange}
        onSecondaryPhoneChange={handleSecondaryPhoneChange}
        onAddressChange={handleAddressChange}
        onSecondaryEmailChange={setSecondaryEmail}
        onSecondaryPhoneDataChange={setSecondaryPhone}
        addSecondaryEmail={addSecondaryEmail}
        removeSecondaryEmail={removeSecondaryEmail}
        addSecondaryPhone={addSecondaryPhone}
        removeSecondaryPhone={removeSecondaryPhone}
      />

      <CsvUploadModal
        show={showCsvModal}
        selectedFile={selectedFile}
        uploadLoading={uploadLoading}
        onClose={() => {
          setShowCsvModal(false);
          setSelectedFile(null);
        }}
        onFileSelect={handleFileSelect}
        onUpload={handleCsvUpload}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Contact</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{contactToDelete?.fullName}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setContactToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default Contacts;