import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote, updateNote, replyToNote, createNote } from '../../../../shared/store/services/contactsApi';
import { Trash2, Edit2, MessageCircle, Send, X } from 'lucide-react';
import Toast from "../../../../shared/components/Toast";
import { getErrorMessage } from "../../../../shared/utils/errorHandler";

interface NotesTabProps {
  contactId: number;
}

interface Note {
  id: number;
  data: string;
  contactId: number;
  replyToNoteId?: number | null;
  isDeleted?: boolean;
  editedBy?: number;
  editedByName?: string;
  updatedAt: string;
  createdAt: string;
  createdByName: string;
  replies?: Note[];
}

const NotesTab: React.FC<NotesTabProps> = ({ contactId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; noteId: number | null }>({ show: false, noteId: null });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await getNotes(contactId);
      const allNotes: Note[] = response.data || [];

      // Organize notes with replies
      const mainNotes = allNotes.filter((note) => !note.replyToNoteId);
      const organizedNotes = mainNotes.map((mainNote) => ({
        ...mainNote,
        replies: allNotes.filter((note) => note.replyToNoteId === mainNote.id)
      }));

      setNotes(organizedNotes);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch notes');
      setToast({ message: errorMessage, type: 'error' });
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [contactId]);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      await createNote({ data: newNoteText, contactId });
      setNewNoteText('');
      setIsAddingNote(false);
      setToast({ message: 'Note added successfully', type: 'success' });
      fetchNotes();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to create note');
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      setDeleteConfirm({ show: false, noteId: null });
      setToast({ message: 'Note deleted successfully', type: 'success' });
      fetchNotes();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to delete note');
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEdit = (noteId: number, currentText: string) => {
    setEditingNote(noteId);
    setEditText(currentText);
  };

  const handleSaveEdit = async (noteId: number) => {
    try {
      await updateNote(noteId, editText);
      setEditingNote(null);
      setEditText('');
      setToast({ message: 'Note updated successfully', type: 'success' });
      fetchNotes();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update note');
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleReply = async (noteId: number) => {
    if (replyText.trim()) {
      try {
        await replyToNote(noteId, replyText, contactId);
        setReplyingTo(null);
        setReplyText('');
        setToast({ message: 'Reply sent successfully', type: 'success' });
        fetchNotes();
      } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to reply to note');
        setToast({ message: errorMessage, type: 'error' });
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.data?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notes
          </h3>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isAddingNote ? (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Note</span>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Type your note here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md resize-none mb-3 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNote(true)}
            className="w-full mb-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-red-600 hover:text-red-700 hover:border-red-300 dark:hover:border-red-500 transition-colors"
          >
            + Add Note
          </button>
        )}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your filters does not match any notes. Please try again.</p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-red-600 hover:text-red-700 hover:border-red-300 dark:hover:border-red-500 transition-colors"
            >
              + Add Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {note.isDeleted ? (
                            <span className="italic text-gray-400">[Note Deleted]</span>
                          ) : (
                            note.data
                          )}
                        </p>
                        {note.editedBy && !note.isDeleted && (
                          <p className="text-xs text-gray-400 italic mb-1">
                            Edited by {note.editedByName} at {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {editingNote !== note.id && !note.isDeleted && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(note.id, note.data)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Edit note"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Reply to note"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, noteId: note.id })}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}</span>
                  <span>by {note.createdByName}</span>
                </div>

                {/* Replies */}
                {note.replies && note.replies.length > 0 && (
                  <div className="ml-4 mt-3 space-y-2 border-l-2 border-red-200 pl-3">
                    {note.replies.map((reply: Note) => (
                      <div key={reply.id} className="p-3 bg-red-50 dark:bg-gray-600 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            {editingNote === reply.id ? (
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                rows={2}
                              />
                            ) : (
                              <div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  {reply.isDeleted ? (
                                    <span className="italic text-gray-400">[Note Deleted]</span>
                                  ) : (
                                    reply.data
                                  )}
                                </p>
                                {reply.editedBy && !reply.isDeleted && (
                                  <p className="text-xs text-gray-400 italic mt-1">
                                    Edited by {reply.editedByName} at {new Date(reply.updatedAt).toLocaleDateString()} {new Date(reply.updatedAt).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          {!reply.isDeleted && (
                            <div className="flex items-center gap-1 ml-2">
                              {editingNote === reply.id ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleSaveEdit(reply.id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNote(null)}
                                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(reply.id, reply.data)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    title="Edit reply"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ show: true, noteId: reply.id })}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    title="Delete reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString()}</span>
                          <span>by {reply.createdByName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === note.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleReply(note.id)}
                    />
                    <button
                      onClick={() => handleReply(note.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Note</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, noteId: null })}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteConfirm.noteId && handleDelete(deleteConfirm.noteId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default NotesTab;