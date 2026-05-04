import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Pin } from 'lucide-react';
import {
  opportunityNotesApi,
  OpportunityNote,
  CreateOpportunityNoteRequest,
} from '../../services/opportunityNotesApi';

interface OpportunityNotesTabProps {
  opportunityId: string;
}

export default function OpportunityNotesTab({ opportunityId }: OpportunityNotesTabProps) {
  const [notes, setNotes] = useState<OpportunityNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOpportunityNoteRequest>({
    opportunity_id: opportunityId,
    content: '',
    is_pinned: false,
  });

  useEffect(() => {
    loadNotes();
  }, [opportunityId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await opportunityNotesApi.getNotes(opportunityId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await opportunityNotesApi.updateNote(editingId, formData);
      } else {
        await opportunityNotesApi.createNote(formData);
      }
      await loadNotes();
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleTogglePin = async (note: OpportunityNote) => {
    try {
      await opportunityNotesApi.togglePin(note.id, note.is_pinned);
      await loadNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleEdit = (note: OpportunityNote) => {
    setEditingId(note.id);
    setFormData({
      opportunity_id: opportunityId,
      content: note.content,
      is_pinned: note.is_pinned,
    });
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await opportunityNotesApi.deleteNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      opportunity_id: opportunityId,
      content: '',
      is_pinned: false,
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Note'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paper dark:bg-canvas rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note Content <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Pin this note</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {editingId ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No notes added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
                note.is_pinned
                  ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {note.is_pinned && <Pin className="h-4 w-4 text-yellow-600" />}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`p-2 transition-colors ${
                      note.is_pinned
                        ? 'text-yellow-600 hover:text-yellow-700'
                        : 'text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400'
                    }`}
                    title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    title="Edit note"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
