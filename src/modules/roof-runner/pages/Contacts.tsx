import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Upload, Download, Trash2, X } from "lucide-react";
import { CreateContactRequest, createContact, getContacts, updateContact, deleteContact, deleteContacts, uploadContactsCsv } from "../../../shared/store/services/contactsApi";
import Toast from "../../../shared/components/Toast";
import ContactModal from "../components/ContactModal";
import ContactsTable from "../components/ContactsTable";
import Pagination from "../components/Pagination";
import CsvUploadModal from "../components/CsvUploadModal";
import { Button, Input, Modal } from "../../../shared/components/ui";

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    type: 'customer',
    labelRole: '',
    email: '',
    phone: '',
    phoneType: 'mobile',
    extension: '',
    company: '',
    address: '',
    latitude: 0,
    longitude: 0,
    timezone: '',
    dndAllChannels: false,
    dndChannels: {
      email: false,
      textMessages: false,
      callsVoicemail: false,
      inboundCallsSms: false
    },
    secondaryPhoneType: 'mobile'
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
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const contactData: CreateContactRequest = {
      fullName: fullName,
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
        firstName: '',
        lastName: '',
        type: 'customer',
        labelRole: '',
        email: '',
        phone: '',
        phoneType: 'mobile',
        extension: '',
        company: '',
        address: '',
        latitude: 0,
        longitude: 0,
        timezone: '',
        dndAllChannels: false,
        dndChannels: {
          email: false,
          textMessages: false,
          callsVoicemail: false,
          inboundCallsSms: false
        },
        secondaryPhoneType: 'mobile'
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

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const contactData: CreateContactRequest = {
      fullName: fullName,
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
        firstName: '',
        lastName: '',
        type: 'customer',
        labelRole: '',
        email: '',
        phone: '',
        phoneType: 'mobile',
        extension: '',
        company: '',
        address: '',
        latitude: 0,
        longitude: 0,
        timezone: '',
        dndAllChannels: false,
        dndChannels: {
          email: false,
          textMessages: false,
          callsVoicemail: false,
          inboundCallsSms: false
        },
        secondaryPhoneType: 'mobile'
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
    setSelectedContacts([]);
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
    const nameParts = (contact.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setEditingContact(contact);
    setFormData({
      firstName: firstName,
      lastName: lastName,
      type: contact.type || 'customer',
      labelRole: contact.label_or_role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      phoneType: contact.phoneType || 'mobile',
      extension: '',
      company: contact.company || '',
      address: contact.address || '',
      latitude: contact.latitude || 0,
      longitude: contact.longitude || 0,
      timezone: contact.timezone || '',
      dndAllChannels: contact.dndAllChannels || false,
      dndChannels: contact.dndChannels || {
        email: false,
        textMessages: false,
        callsVoicemail: false,
        inboundCallsSms: false
      },
      secondaryPhoneType: contact.secondaryPhoneType || 'mobile'
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

  const confirmBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    setIsLoading(true);
    try {
      await deleteContacts(selectedContacts);
      setToast({ message: `${selectedContacts.length} contact(s) deleted successfully!`, type: 'success' });
      setShowBulkDeleteConfirm(false);
      setSelectedContacts([]);
      fetchContacts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete contacts';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const TYPE_OPTIONS = [
    { value: '',                label: 'All types' },
    { value: 'lead',            label: 'Lead' },
    { value: 'customer',        label: 'Customer' },
    { value: 'partner',         label: 'Partner' },
    { value: 'vendor',          label: 'Vendor' },
    { value: 'sub-contractor',  label: 'Sub-Contractor' },
    { value: 'adjuster',        label: 'Adjuster' },
    { value: 'staff',           label: 'Staff' },
  ];

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      <div className="bg-surface-1 dark:bg-surface-d-1 border-b border-edge-soft dark:border-edge-d-soft px-studio-page py-5">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="studio-text-label mb-1">Workspace</div>
            <h1 className="studio-text-title-1">Contacts</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" leadingIcon={<Download />}>
              Export CSV
            </Button>
            <Button variant="secondary" leadingIcon={<Upload />} onClick={() => setShowCsvModal(true)}>
              Import CSV
            </Button>
            <Button variant="primary" leadingIcon={<Plus />} onClick={() => setShowContactModal(true)}>
              New contact
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <Input
              leadingIcon={<Search />}
              placeholder="Search by name, email, phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative type-filter-container">
            <Button
              variant="secondary"
              leadingIcon={<Filter />}
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className={typeFilter ? 'border-signal-500 bg-signal-50 dark:bg-signal-500/10' : ''}
            >
              {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'Type'}
            </Button>

            {showTypeFilter && (
              <div className="absolute right-0 mt-1 w-48 z-10 rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 overflow-hidden">
                <div className="py-1">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || 'all'}
                      type="button"
                      onClick={() => {
                        setTypeFilter(opt.value);
                        setShowTypeFilter(false);
                      }}
                      className="flex items-center w-full px-3 h-9 studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedContacts.length > 0 && (
        <div className="bg-signal-50 dark:bg-signal-500/10 border-b border-signal-100 dark:border-signal-500/20 px-studio-page py-3 flex items-center justify-between">
          <span className="studio-text-body-strong text-signal-ink dark:text-signal-100">
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<X />}
              onClick={() => setSelectedContacts([])}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Trash2 />}
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              Delete selected
            </Button>
          </div>
        </div>
      )}

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
        onContactNameClick={handleViewProfile}
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

      <Modal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setContactToDelete(null);
        }}
        title="Delete contact"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setContactToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmDelete} loading={isLoading}>
              {isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="studio-text-body text-ink-2 dark:text-ink-d-2">
          Are you sure you want to delete &ldquo;{contactToDelete?.fullName}&rdquo;? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        title="Delete contacts"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmBulkDelete} loading={isLoading}>
              {isLoading
                ? 'Deleting…'
                : `Delete ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''}`}
            </Button>
          </>
        }
      >
        <p className="studio-text-body text-ink-2 dark:text-ink-d-2">
          Are you sure you want to delete {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}? This action cannot be undone.
        </p>
      </Modal>

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