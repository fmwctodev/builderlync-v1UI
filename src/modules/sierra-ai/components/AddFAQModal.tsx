import React, { useState } from 'react';
import { X, HelpCircle, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';

interface AddFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  organizationId: string;
}

export function AddFAQModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
  organizationId,
}: AddFAQModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MAX_CHARS = 1000;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (question.trim().length === 0) {
      setError('Please enter a question');
      return;
    }

    if (answer.trim().length === 0) {
      setError('Please enter an answer');
      return;
    }

    if (question.length > MAX_CHARS) {
      setError(`Question must be ${MAX_CHARS} characters or less`);
      return;
    }

    if (answer.length > MAX_CHARS) {
      setError(`Answer must be ${MAX_CHARS} characters or less`);
      return;
    }

    setLoading(true);

    try {
      await knowledgeBaseApi.createQAPair({
        organization_id: organizationId,
        question_pattern: question.trim(),
        answer: answer.trim(),
        intent: 'general',
        priority: 'normal',
        status: 'published',
        offer_to_book: false,
        allow_ranges: false,
        collection_id: selectedCollection || undefined,
      });

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setQuestion('');
    setAnswer('');
    setSelectedCollection('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  FAQs
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Write a question and answer pair to help your bot answer common questions.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Q</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Your question goes here"
                    rows={3}
                    maxLength={MAX_CHARS}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {question.length}/{MAX_CHARS} characters
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">A</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer goes here"
                    rows={5}
                    maxLength={MAX_CHARS}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {answer.length}/{MAX_CHARS} characters
                </span>
              </div>
            </div>

            {collections.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collection (Optional)
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">None (General FAQs)</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  FAQ saved successfully!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
