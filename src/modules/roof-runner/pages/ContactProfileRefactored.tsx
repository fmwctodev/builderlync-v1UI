import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrgPath } from '../../../shared/hooks/useOrgPath';
import { getContactById } from '../../../shared/store/services/contactsApi';
import Toast from '../../../shared/components/Toast';
import ContactModal from '../components/ContactModal';
import ContactHeader from '../components/ContactProfile/ContactHeader';
import ContactDetailsPanel from '../components/ContactProfile/ContactDetailsPanel';
import RightPanelTabs from '../components/ContactProfile/RightPanelTabs';
import RightPanelContent from '../components/ContactProfile/RightPanelContent';
import { AddTaskModal, AddNoteModal, AddDocumentModal } from '../components/ContactProfile/Modals';

const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrgPath } = useOrgPath();
  
  // Core state
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'contact' | 'company'>('contact');
  const [rightPanelView, setRightPanelView] = useState<'activity' | 'tasks' | 'notes' | 'appointments' | 'documents' | 'payments' | 'related'>('activity');
  const [companySearch, setCompanySearch] = useState('');
  const [documentsFilter, setDocumentsFilter] = useState<'All' | 'Internal' | 'Sent' | 'Received'>('All');
  const [showPaymentActions, setShowPaymentActions] = useState(false);
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  
  // Form data
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '' });
  const [noteFormData, setNoteFormData] = useState({ title: '', content: '' });
  const [notesData, setNotesData] = useState<Array<{id: string, title: string, content: string, date: string}>>([]);
  const [documentSection, setDocumentSection] = useState('Internal');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await getContactById(Number(id));
        if (response.success && response.data) {
          setContact(response.data);
        } else {
          setToast({message: 'Contact not found', type: 'error'});
        }
      } catch (error: any) {
        setToast({message: 'Failed to load contact', type: 'error'});
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContact();
  }, [id]);

  const handleSaveTask = () => {
    console.log('Task saved:', taskFormData);
    setShowAddTaskModal(false);
    setTaskFormData({ title: '', description: '' });
  };

  const handleSaveNote = () => {
    if (noteFormData.title.trim() && noteFormData.content.trim()) {
      const newNote = {
        id: Date.now().toString(),
        title: noteFormData.title,
        content: noteFormData.content,
        date: new Date().toLocaleDateString()
      };
      setNotesData([newNote, ...notesData]);
      setShowAddNoteModal(false);
      setNoteFormData({ title: '', content: '' });
    }
  };

  const handleSaveDocument = () => {
    console.log('Document uploaded');
    setShowAddDocumentModal(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading contact...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Contact not found</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <ContactHeader 
        contactName={contact.fullName} 
        onBack={() => navigate(getOrgPath('contacts'))} 
      />

      <div className="flex h-full">
        <ContactDetailsPanel
          contact={contact}
          activeTab={activeTab}
          companySearch={companySearch}
          onTabChange={setActiveTab}
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
              notes={notesData}
              documentsFilter={documentsFilter}
              showPaymentActions={showPaymentActions}
              onAddTask={() => setShowAddTaskModal(true)}
              onAddNote={() => setShowAddNoteModal(true)}
              onAddAppointment={() => {}}
              onAddDocument={() => setShowAddDocumentModal(true)}
              onDocumentsFilterChange={setDocumentsFilter}
              onPaymentActionsToggle={() => setShowPaymentActions(!showPaymentActions)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        show={showAddTaskModal}
        taskFormData={taskFormData}
        onClose={() => setShowAddTaskModal(false)}
        onSave={handleSaveTask}
        onFormDataChange={setTaskFormData}
      />

      <AddNoteModal
        show={showAddNoteModal}
        noteFormData={noteFormData}
        onClose={() => setShowAddNoteModal(false)}
        onSave={handleSaveNote}
        onFormDataChange={setNoteFormData}
      />

      <AddDocumentModal
        show={showAddDocumentModal}
        documentSection={documentSection}
        onClose={() => setShowAddDocumentModal(false)}
        onSave={handleSaveDocument}
        onSectionChange={setDocumentSection}
      />

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

export default ContactProfile;