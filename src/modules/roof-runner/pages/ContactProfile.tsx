import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, DollarSign, FileText, MapPin, Calendar, Mail, Phone, Building, Briefcase, X, ChevronDown } from 'lucide-react';
import { getContactById, updateContact, CreateContactRequest, createNote, getNotes, deleteNote, updateNote, replyToNote } from '../../../shared/store/services/contactsApi';
import Toast from '../../../shared/components/Toast';
import ContactModal from '../components/ContactModal';

const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);
  const [secondaryPhone, setSecondaryPhone] = useState({phone: '', extension: ''});
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<{id: number, content: string} | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'reply'>('create');

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
        console.error('Error fetching contact:', error);
        setToast({message: 'Failed to load contact', type: 'error'});
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchNotes = async () => {
    if (!contact?.id) return;
    setNotesLoading(true);
    try {
      const response = await getNotes(contact.id);
      if (response.success && response.data) {
        const allNotes = response.data.data || response.data || [];
        // Group notes with their replies
        const groupedNotes = allNotes.filter(note => !note.replyToNoteId).map(mainNote => ({
          ...mainNote,
          replies: allNotes.filter(reply => reply.replyToNoteId === mainNote.id)
        }));
        setNotes(groupedNotes);
      }
    } catch (error: any) {
      console.error('Error fetching notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (contact?.id) {
      fetchNotes();
    }
  }, [contact?.id]);

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

  const handleEditClick = () => {
    setFormData({
      fullName: contact.full_name || '',
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
  };

  const handleAddressChange = (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
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
      await updateContact(contact.id, contactData);
      setShowEditModal(false);
      setToast({message: 'Contact updated successfully!', type: 'success'});
      // Refresh contact data
      const response = await getContactById(Number(id));
      if (response.success && response.data) {
        setContact(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update contact';
      setToast({message: errorMessage, type: 'error'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    setModalMode('create');
    setNoteContent('');
    setEditingNote(null);
    setReplyingTo(null);
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !contact?.id) return;

    try {
      if (modalMode === 'create') {
        await createNote({
          data: noteContent.trim(),
          contactId: contact.id
        });
        setToast({message: 'Note saved successfully!', type: 'success'});
      } else if (modalMode === 'edit' && editingNote) {
        await updateNote(editingNote.id, noteContent.trim());
        setToast({message: 'Note updated successfully!', type: 'success'});
      } else if (modalMode === 'reply' && replyingTo) {
        await replyToNote(replyingTo, noteContent.trim(), contact.id);
        setToast({message: 'Reply added successfully!', type: 'success'});
      }
      
      setShowNoteModal(false);
      setNoteContent('');
      setEditingNote(null);
      setReplyingTo(null);
      fetchNotes();
    } catch (error: any) {
      console.error('Error saving note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save note';
      setToast({message: errorMessage, type: 'error'});
    }
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteModal(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete);
      setShowDeleteModal(false);
      setNoteToDelete(null);
      setToast({message: 'Note deleted successfully!', type: 'success'});
      fetchNotes();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete note';
      setToast({message: errorMessage, type: 'error'});
    }
  };

  const handleEditNote = (noteId: number, content: string) => {
    setModalMode('edit');
    setEditingNote({id: noteId, content});
    setNoteContent(content);
    setReplyingTo(null);
    setShowNoteModal(true);
  };

  const handleReplyNote = (noteId: number) => {
    setModalMode('reply');
    setReplyingTo(noteId);
    setNoteContent('');
    setEditingNote(null);
    setShowNoteModal(true);
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => navigate('/contacts')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          View all contacts
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {contact.full_name}
            </h1>
            <button
              onClick={handleEditClick}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit contact
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Type</h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white capitalize">{contact.type}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Lifetime value</h3>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">0.00</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {contact.email && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{contact.email}</p>
                </div>
              </div>
            )}
            {contact.phone && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h4>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{contact.phone}</p>
                </div>
              </div>
            )}
            {contact.company && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</h4>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{contact.company}</p>
                </div>
              </div>
            )}
            {contact.label_or_role && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h4>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{contact.label_or_role}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white">{new Date(contact.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white">{new Date(contact.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
             {contact.address && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h4>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-900 dark:text-white">{contact.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Internal Contact Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Internal contact notes</h2>
              <button
                onClick={handleNewNote}
                className="px-4 py-2 text-white text-sm font-medium rounded-md hover:bg-red-700" style={{backgroundColor: '#dc2626'}}
              >
                New note
              </button>
            </div>

            <div className="space-y-6">
              {notesLoading ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 dark:text-gray-400">Loading notes...</div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 dark:text-gray-400">No notes yet</div>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="space-y-3">
                    {/* Main Note */}
                    <div className={note.isDeleted ? "bg-gray-100 dark:bg-gray-700 rounded-lg p-4" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${note.isDeleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {note.createdByName || `User ${note.createdBy}`}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                          {note.editedBy && note.editedByName && (
                            <span className="ml-2">• Edited by {note.editedByName}</span>
                          )}
                        </span>
                      </div>
                      <p className={`mb-3 ${note.isDeleted ? 'text-gray-600 dark:text-gray-400 italic' : 'text-gray-700 dark:text-gray-300'}`}>
                        {note.isDeleted ? '[Note deleted]' : note.data}
                      </p>
                      {!note.isDeleted && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button onClick={() => handleReplyNote(note.id)} className="flex items-center gap-1 hover:text-red-700 text-sm" style={{color: '#dc2626'}}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply {note.replies?.length > 0 && `(${note.replies.length})`}
                            </button>
                            <button onClick={() => handleEditNote(note.id, note.data)} className="hover:text-red-700 text-sm" style={{color: '#dc2626'}}>
                              Edit
                            </button>
                          </div>
                          <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Replies */}
                    {note.replies && note.replies.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {note.replies.map((reply) => (
                          <div key={reply.id} className={`border-l-4 pl-4 ${reply.isDeleted ? 'bg-gray-50 dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/20'} rounded-r-lg p-3`} style={{borderLeftColor: '#dc2626'}}>
                            <div className="flex items-start justify-between mb-2">
                              <h5 className={`text-sm font-medium ${reply.isDeleted ? 'text-gray-600 dark:text-gray-400' : 'text-red-900 dark:text-red-100'}`}>
                                {reply.createdByName || `User ${reply.createdBy}`}
                              </h5>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(reply.createdAt).toLocaleString()}
                                {reply.editedBy && reply.editedByName && (
                                  <span className="ml-2">• Edited by {reply.editedByName}</span>
                                )}
                              </span>
                            </div>
                            <p className={`text-sm ${reply.isDeleted ? 'text-gray-500 dark:text-gray-400 italic' : 'text-red-800 dark:text-red-200'}`}>
                              {reply.isDeleted ? '[Reply deleted]' : reply.data}
                            </p>
                            {!reply.isDeleted && (
                              <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => handleEditNote(reply.id, reply.data)} className="hover:text-red-700 text-xs" style={{color: '#dc2626'}}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteNote(reply.id)} className="text-red-500 hover:text-red-600 text-xs">
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Jobs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Jobs</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                New job
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Active jobs</h3>

              {/* Sample Job Card */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Edgewick HOA</h4>
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  1928 Warely Lane, Austin, TX 78741
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">0/1</span>
                    </div>
                    <span className="px-2 py-1 bg-warning-50 dark:bg-warning-500/20 text-warning-700 dark:text-warning-300 text-xs rounded">
                      Draft
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-error-500 dark:text-error-400">• 70 days</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated 2 months ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        show={showEditModal}
        isEdit={true}
        isLoading={isLoading}
        formData={formData}
        secondaryEmail={secondaryEmail}
        showSecondaryEmail={showSecondaryEmail}
        secondaryPhone={secondaryPhone}
        showSecondaryPhone={showSecondaryPhone}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        onFormDataChange={setFormData}
        onPhoneChange={handlePhoneChange}
        onSecondaryPhoneChange={(value) => setSecondaryPhone({...secondaryPhone, phone: formatPhoneNumber(value)})}
        onAddressChange={handleAddressChange}
        onSecondaryEmailChange={setSecondaryEmail}
        onSecondaryPhoneDataChange={setSecondaryPhone}
        addSecondaryEmail={addSecondaryEmail}
        removeSecondaryEmail={removeSecondaryEmail}
        addSecondaryPhone={addSecondaryPhone}
        removeSecondaryPhone={removeSecondaryPhone}
      />

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalMode === 'create' ? 'Internal contact note' : modalMode === 'edit' ? 'Edit note' : 'Reply to note'}
                </h2>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteContent('');
                    setEditingNote(null);
                    setReplyingTo(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-bold text-gray-700 dark:text-gray-300">
                B
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded italic text-gray-700 dark:text-gray-300">
                I
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded underline text-gray-700 dark:text-gray-300">
                U
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a new internal contact note"
                className="w-full min-h-[300px] resize-none border-none outline-none text-gray-700 dark:text-gray-300 dark:bg-gray-800 placeholder-gray-400"
                style={{ fontSize: '14px', lineHeight: '1.5' }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {noteContent.length} / 5000 characters
                </span>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                  className="px-6 py-2 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{backgroundColor: '#dc2626'}}
                >
                  {modalMode === 'create' ? 'Save' : modalMode === 'edit' ? 'Update' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Deleting this note is permanent and cannot be undone
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteNote}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
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

export default ContactProfile;