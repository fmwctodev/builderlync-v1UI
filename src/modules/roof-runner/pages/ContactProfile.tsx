import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { getContactByIdRequest } from '../../../shared/store/slices/contactsSlice';
import { createTaskRequest } from '../../../shared/store/slices/tasksSlice';
import { createNote, updateContact, CreateContactRequest } from '../../../shared/store/services/contactsApi';
import { createJob, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';
import { CreateTaskData } from '../types';
import AddressModal from '../components/AddressModal';
import JobDetailsModal from '../components/JobDetailsModal';
import ContactHeader from '../components/ContactProfile/ContactHeader';
import ContactDetailsPanel from '../components/ContactProfile/ContactDetailsPanel';
import RightPanelTabs from '../components/ContactProfile/RightPanelTabs';
import RightPanelContent from '../components/ContactProfile/RightPanelContent';
import { AddTaskModal, AddNoteModal, AddDocumentModal, AddAppointmentModal, AddCompanyModal } from '../components/ContactProfile/Modals';
import ContactModal from '../components/ContactModal';
import Toast from '../components/Toast';

type RightPanelView = 'activity' | 'tasks' | 'notes' | 'appointments' | 'documents' | 'payments' | 'related';
type DocumentsFilter = 'all' | 'internal' | 'sent' | 'received';

const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentContact, isLoadingContact, error } = useSelector((state: RootState) => state.contacts);
  


  // State management
  const [activeTab, setActiveTab] = useState<'contact' | 'company'>('contact');
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('activity');
  const [documentsFilter, setDocumentsFilter] = useState<DocumentsFilter>('all');
  const [showPaymentActions, setShowPaymentActions] = useState(false);
  const [companySearch, setCompanySearch] = useState('');

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [jobAddress, setJobAddress] = useState('');
  const [jobCoordinates, setJobCoordinates] = useState<{lat: number; lng: number} | null>(null);

  // Job creation state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Contact edit state
  const [contactFormData, setContactFormData] = useState({
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
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);
  const [secondaryPhone, setSecondaryPhone] = useState({phone: '', extension: ''});
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);

  const [formData, setFormData] = useState<CreateJobRequest>({
    name: '',
    location: '',
    assignees: [],
    jobOwner: '',
    workflowStages: 'New lead',
    closeDate: '',
    jobValue: 0,
    source: '',
    details: '',
    insuranceEnabled: false,
    insuranceCompany: '',
    policyAccountNumber: '',
    claimNumber: '',
    dateOfLoss: '',
    typeOfDamage: '',
    claimAmount: 0,
    deductible: 0,
    claimDetails: '',
    createdBy: 1,
    createdByName: 'Current User',
    editedBy: 1,
    editedByName: 'Current User'
  });

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createJob(formData);
      setToast({ message: 'Job created successfully!', type: 'success' });
      setShowJobDetails(false);
      resetJobForm();
      setJobAddress('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create job';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetJobForm = () => {
    setFormData({
      name: '',
      location: '',
      assignees: [],
      jobOwner: '',
      workflowStages: 'New lead',
      closeDate: '',
      jobValue: 0,
      source: '',
      details: '',
      insuranceEnabled: false,
      insuranceCompany: '',
      policyAccountNumber: '',
      claimNumber: '',
      dateOfLoss: '',
      typeOfDamage: '',
      claimAmount: 0,
      deductible: 0,
      claimDetails: '',
      createdBy: 1,
      createdByName: 'Current User',
      editedBy: 1,
      editedByName: 'Current User'
    });
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
    setContactFormData({...contactFormData, phone: formatted});
  };

  const handleSecondaryPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setSecondaryPhone({...secondaryPhone, phone: formatted});
  };

  const handleAddressChange = (address: string, lat: number, lng: number) => {
    setContactFormData(prev => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lng
    }));
  };

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

  const handleEdit = () => {
    if (!currentContact) return;

    const nameParts = (currentContact.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setContactFormData({
      firstName: firstName,
      lastName: lastName,
      type: currentContact.type || 'customer',
      labelRole: currentContact.labelOrRole || '',
      email: currentContact.email || '',
      phone: currentContact.phone || '',
      phoneType: 'mobile',
      extension: '',
      company: currentContact.company || '',
      address: currentContact.address || '',
      latitude: currentContact.latitude || 0,
      longitude: currentContact.longitude || 0,
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
    setShowEditContactModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContact) return;

    setLoading(true);

    const fullName = `${contactFormData.firstName} ${contactFormData.lastName}`.trim();

    const contactData: CreateContactRequest = {
      fullName: fullName,
      type: contactFormData.type,
      labelOrRole: contactFormData.labelRole,
      email: contactFormData.email,
      phone: contactFormData.phone,
      company: contactFormData.company,
      address: contactFormData.address,
      latitude: contactFormData.latitude,
      longitude: contactFormData.longitude
    };

    try {
      await updateContact(currentContact.id, contactData);
      setToast({message: 'Contact updated successfully!', type: 'success'});
      setShowEditContactModal(false);
      dispatch(getContactByIdRequest(parseInt(id!)));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update contact';
      setToast({message: errorMessage, type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getContactByIdRequest(parseInt(id)));
    }
    fetchStaff();
  }, [id, dispatch]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const contact = currentContact ? {
    id: currentContact.id.toString(),
    fullName: currentContact.fullName,
    email: currentContact.email,
    phone: currentContact.phone,
    address: currentContact.address,
    company: currentContact.company,
    type: currentContact.type,
    labelOrRole: currentContact.labelOrRole
  } : null;

  const notesData = [
    {
      id: '1',
      content: 'Initial contact made. Customer interested in roofing services.',
      author: 'Jane Smith',
      date: '2024-01-15',
      time: '10:30 AM'
    }
  ];

  if (isLoadingContact) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-lg">Loading contact...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-lg">Contact not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <ContactHeader
        contactName={contact.fullName}
        onBack={() => navigate('/contacts')}
        onCreateJob={() => setShowAddressModal(true)}
        onEdit={handleEdit}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <ContactDetailsPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          contact={contact}
          companySearch={companySearch}
          onCompanySearchChange={setCompanySearch}
          onAddCompany={() => setShowAddCompanyModal(true)}
        />

        <div className="w-1/2 bg-paper dark:bg-canvas">
          <div className="p-6">
            <RightPanelTabs
              activeTab={rightPanelView}
              onTabChange={(tab: string) => setRightPanelView(tab as RightPanelView)}
            />

            <RightPanelContent
              activeTab={rightPanelView}
              contactId={parseInt(contact.id)}
              documentsFilter={documentsFilter}
              showPaymentActions={showPaymentActions}
              onAddTask={() => setShowAddTaskModal(true)}
              onAddNote={() => setShowAddNoteModal(true)}
              onAddAppointment={() => setShowAddAppointmentModal(true)}
              onAddDocument={() => setShowAddDocumentModal(true)}
              onDocumentsFilterChange={(filter: string) => setDocumentsFilter(filter as DocumentsFilter)}
              onPaymentActionsToggle={() => setShowPaymentActions(!showPaymentActions)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSave={(taskData: CreateTaskData) => {
          if (contact) {
            dispatch(createTaskRequest({
              text: taskData.title,
              assignee: taskData.assignedTo || '',
              blocking: false,
              completed: false,
              dueDate: taskData.dueDate || '',
              createdBy: 1,
              createdByName: 'Current User'
            }));
          }
          setShowAddTaskModal(false);
        }}
      />

      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onSave={async (noteData: { data: string }) => {
          if (contact) {
            try {
              await createNote({
                data: noteData.data,
                contactId: parseInt(contact.id)
              });
              // Refresh notes after creation
              window.location.reload();
            } catch (error) {
              console.error('Failed to create note:', error);
            }
          }
          setShowAddNoteModal(false);
        }}
      />

      <AddDocumentModal
        isOpen={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        onSave={(documentData: any) => {
          console.log('Document saved:', documentData);
          setShowAddDocumentModal(false);
        }}
      />

      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSave={(appointmentData: any) => {
          console.log('Appointment saved:', appointmentData);
          setShowAddAppointmentModal(false);
        }}
      />

      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSave={(companyData: any) => {
          console.log('Company saved:', companyData);
          setShowAddCompanyModal(false);
        }}
      />

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setJobAddress('');
          setJobCoordinates(null);
        }}
        jobAddress={jobAddress}
        setJobAddress={(address: string, lat?: number, lng?: number) => {
          setJobAddress(address);
          if (lat && lng) {
            setJobCoordinates({lat, lng});
          }
        }}
        onContinue={() => {
          if (jobAddress.trim()) {
            setFormData({...formData, location: jobAddress, name: jobAddress});
            setShowAddressModal(false);
            setShowJobDetails(true);
          }
        }}
        onCreateFromCompanyCam={() => {
          setShowAddressModal(false);
          setShowJobDetails(true);
        }}
      />

      <JobDetailsModal
        isOpen={showJobDetails}
        onClose={() => {
          setShowJobDetails(false);
          resetJobForm();
          setJobAddress('');
          setJobCoordinates(null);
        }}
        onSubmit={handleJobSubmit}
        formData={formData}
        setFormData={setFormData}
        staff={staff}
        loading={loading}
      />

      <ContactModal
        show={showEditContactModal}
        isEdit={true}
        isLoading={loading}
        formData={contactFormData}
        secondaryEmail={secondaryEmail}
        showSecondaryEmail={showSecondaryEmail}
        secondaryPhone={secondaryPhone}
        showSecondaryPhone={showSecondaryPhone}
        onClose={() => {
          setShowEditContactModal(false);
        }}
        onSubmit={handleEditSubmit}
        onFormDataChange={setContactFormData}
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

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ContactProfile;