import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { getContactByIdRequest } from '../../../shared/store/slices/contactsSlice';
import { createTaskRequest } from '../../../shared/store/slices/tasksSlice';
import { createNote } from '../../../shared/store/services/contactsApi';
import { CreateTaskData } from '../types';
import ContactHeader from '../components/ContactProfile/ContactHeader';
import ContactDetailsPanel from '../components/ContactProfile/ContactDetailsPanel';
import RightPanelTabs from '../components/ContactProfile/RightPanelTabs';
import RightPanelContent from '../components/ContactProfile/RightPanelContent';
import { AddTaskModal, AddNoteModal, AddDocumentModal, AddAppointmentModal, AddCompanyModal } from '../components/ContactProfile/Modals';

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

  useEffect(() => {
    if (id) {
      dispatch(getContactByIdRequest(parseInt(id)));
    }
  }, [id, dispatch]);

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

        <div className="w-1/2 bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <RightPanelTabs
              activeTab={rightPanelView}
              onTabChange={setRightPanelView}
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
              onDocumentsFilterChange={setDocumentsFilter}
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
              ...taskData,
              contactId: parseInt(contact.id)
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
        onSave={(documentData) => {
          console.log('Document saved:', documentData);
          setShowAddDocumentModal(false);
        }}
      />

      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSave={(appointmentData) => {
          console.log('Appointment saved:', appointmentData);
          setShowAddAppointmentModal(false);
        }}
      />

      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSave={(companyData) => {
          console.log('Company saved:', companyData);
          setShowAddCompanyModal(false);
        }}
      />
    </div>
  );
};

export default ContactProfile;