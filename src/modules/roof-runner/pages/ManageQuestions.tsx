import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, X, Lock, GripVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';
import { StagingBanner } from '../components/common';

export type QuestionType = 'short_text' | 'multiple_choice' | 'yes_no';

export interface EstimatorQuestion {
  id: string;
  name: string;
  type: QuestionType;
  isRequired: boolean;
  options?: string[];
  isCustom?: boolean;
}

const generateId = () => `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ManageQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EstimatorQuestion | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [customQuestionForm, setCustomQuestionForm] = useState({
    name: '',
    type: 'short_text' as QuestionType,
    isRequired: false,
    options: ['']
  });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([
    'Get started',
    'Address & slope',
    'Building type',
    'Current material',
    'Desired material',
    'Timeline',
    'Contact form'
  ]);

  const [customQuestions, setCustomQuestions] = useState<EstimatorQuestion[]>([]);

  const allPossibleQuestions = [
    'Get started',
    'Address & slope',
    'Building type',
    'Current material',
    'Desired material',
    'Timeline',
    'Contact form',
    'Multi-story building',
    'Roof age',
    'Leaks and damages',
    'Insurance claim',
    'Solar',
    'Project details',
    'Financing'
  ];

  const availableQuestions = allPossibleQuestions.filter(q => !selectedQuestions.includes(q));

  const addQuestion = (question: string) => {
    if (!selectedQuestions.includes(question)) {
      setSelectedQuestions(prev => [...prev, question]);
    }
    setShowDropdown(false);
  };

  const removeQuestion = (question: string) => {
    setSelectedQuestions(prev => prev.filter(q => q !== question));
  };

  const isLocked = (question: string) => {
    return ['Get started', 'Contact form'].includes(question);
  };

  const fetchQuestions = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimator(parseInt(id));
      if (response?.data?.questions) {
        const savedQuestions = response.data.questions;
        const predefined: string[] = [];
        const custom: EstimatorQuestion[] = [];

        savedQuestions.forEach((q: any) => {
          if (q.isCustom) {
            custom.push({
              id: q.id,
              name: q.name,
              type: q.type || 'short_text',
              isRequired: q.isRequired || false,
              options: q.options || [],
              isCustom: true
            });
          } else {
            predefined.push(q.name || q);
          }
        });

        if (predefined.length > 0) {
          setSelectedQuestions(predefined);
        }
        setCustomQuestions(custom);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setToast({ message: 'Failed to load questions', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const saveQuestions = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const predefinedData = selectedQuestions.map((name, index) => ({
        id: `predefined_${index + 1}`,
        name,
        selected: true,
        isCustom: false
      }));

      const customData = customQuestions.map(q => ({
        id: q.id,
        name: q.name,
        type: q.type,
        isRequired: q.isRequired,
        options: q.options,
        isCustom: true,
        selected: true
      }));

      const allQuestions = [...predefinedData, ...customData];
      await apiService.updateInstantEstimatorQuestions(parseInt(id), allQuestions);
      setToast({ message: 'Questions saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save questions:', error);
      setToast({ message: 'Failed to save questions', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetCustomQuestionForm = () => {
    setCustomQuestionForm({
      name: '',
      type: 'short_text',
      isRequired: false,
      options: ['']
    });
    setFormErrors({});
    setEditingQuestion(null);
  };

  const openAddCustomQuestionModal = () => {
    resetCustomQuestionForm();
    setShowCustomQuestionModal(true);
  };

  const openEditCustomQuestionModal = (question: EstimatorQuestion) => {
    setEditingQuestion(question);
    setCustomQuestionForm({
      name: question.name,
      type: question.type,
      isRequired: question.isRequired,
      options: question.options && question.options.length > 0 ? question.options : ['']
    });
    setFormErrors({});
    setShowCustomQuestionModal(true);
  };

  const closeCustomQuestionModal = () => {
    setShowCustomQuestionModal(false);
    resetCustomQuestionForm();
  };

  const validateCustomQuestionForm = (): boolean => {
    const errors: { name?: string } = {};
    if (!customQuestionForm.name.trim()) {
      errors.name = 'Question text is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomQuestion = () => {
    if (!validateCustomQuestionForm()) return;

    if (editingQuestion) {
      setCustomQuestions(prev =>
        prev.map(q =>
          q.id === editingQuestion.id
            ? {
                ...q,
                name: customQuestionForm.name.trim(),
                type: customQuestionForm.type,
                isRequired: customQuestionForm.isRequired,
                options: customQuestionForm.type === 'multiple_choice'
                  ? customQuestionForm.options.filter(o => o.trim() !== '')
                  : undefined
              }
            : q
        )
      );
      setToast({ message: 'Question updated', type: 'success' });
    } else {
      const newQuestion: EstimatorQuestion = {
        id: generateId(),
        name: customQuestionForm.name.trim(),
        type: customQuestionForm.type,
        isRequired: customQuestionForm.isRequired,
        options: customQuestionForm.type === 'multiple_choice'
          ? customQuestionForm.options.filter(o => o.trim() !== '')
          : undefined,
        isCustom: true
      };
      setCustomQuestions(prev => [...prev, newQuestion]);
      setToast({ message: 'Question added', type: 'success' });
    }

    closeCustomQuestionModal();
  };

  const handleDeleteCustomQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
    setShowDeleteConfirm(null);
    setToast({ message: 'Question deleted', type: 'success' });
  };

  const addOption = () => {
    setCustomQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    setCustomQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setCustomQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt))
    }));
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case 'short_text':
        return 'Short Text';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'yes_no':
        return 'Yes/No';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <StagingBanner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <StagingBanner />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/instant-estimator/${id}/manage`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage questions</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Choose which questions you'd like to be displayed in your instant estimator</p>
          </div>
        </div>
        <button
          onClick={saveQuestions}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Selected Questions */}
        <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Predefined Questions</h3>
          <div className="space-y-3 mb-8">
            {selectedQuestions.map((question) => (
              <div key={question} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-gray-900 dark:text-white">{question}</span>
                {question === 'Address & slope' && (
                  <div className="text-xs text-gray-500">
                    <div>Address</div>
                    <div>Slope selection</div>
                  </div>
                )}
                {isLocked(question) ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <button
                    onClick={() => removeQuestion(question)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Predefined Question Button */}
            <div className="relative">
              {showDropdown && availableQuestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {availableQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => addQuestion(question)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={availableQuestions.length === 0}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Add predefined question</span>
              </button>
            </div>
          </div>

          {/* Custom Questions Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Custom Questions</h3>

            {customQuestions.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No custom questions yet</p>
                <button
                  onClick={openAddCustomQuestionModal}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add your first custom question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customQuestions.map((question) => (
                  <div key={question.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-white">{question.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        {question.isRequired && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openEditCustomQuestionModal(question)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(question.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {customQuestions.length > 0 && (
              <button
                onClick={openAddCustomQuestionModal}
                className="mt-4 w-full border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg p-4 text-center text-primary-600 hover:text-primary-700 hover:border-primary-400"
              >
                <Plus className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Add custom question</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6 bg-gray-100 dark:bg-gray-800 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-xs text-gray-500">Logo</div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Get a <span className="underline">free</span> instant estimate
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use satellite imagery to measure your roof and provide an instant estimate for your roof replacement
              </p>
            </div>

            <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg mb-4">
              Get started
            </button>

            <div className="text-xs text-gray-400 text-center">
              Powered by BuilderLync
            </div>
          </div>
        </div>
      </div>

      {/* Custom Question Modal */}
      {showCustomQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingQuestion ? 'Edit Custom Question' : 'Add Custom Question'}
                </h3>
                <button
                  onClick={closeCustomQuestionModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customQuestionForm.name}
                    onChange={(e) => {
                      setCustomQuestionForm(prev => ({ ...prev, name: e.target.value }));
                      if (formErrors.name) setFormErrors({});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your question"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Type
                  </label>
                  <select
                    value={customQuestionForm.type}
                    onChange={(e) => setCustomQuestionForm(prev => ({ ...prev, type: e.target.value as QuestionType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="yes_no">Yes/No</option>
                  </select>
                </div>

                {/* Multiple Choice Options */}
                {customQuestionForm.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {customQuestionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder={`Option ${index + 1}`}
                          />
                          {customQuestionForm.options.length > 1 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addOption}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  </div>
                )}

                {/* Required Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={customQuestionForm.isRequired}
                    onChange={(e) => setCustomQuestionForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700 dark:text-gray-300">
                    This question is required
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={closeCustomQuestionModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomQuestion}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {editingQuestion ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Question</h3>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this custom question? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCustomQuestion(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ManageQuestions;
