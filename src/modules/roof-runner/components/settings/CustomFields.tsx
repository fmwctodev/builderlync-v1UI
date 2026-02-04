import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash, Edit2, X } from 'lucide-react';
import { customFieldService, CustomFieldDefinition } from '../../../../shared/services/customFieldService';
import Modal from '../../../../shared/components/Modal';

const CustomFields: React.FC = () => {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CustomFieldDefinition>>({
    name: '',
    type: 'text',
    required: false,
    entity_type: 'contact',
    options: []
  });

  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const data = await customFieldService.getFields();
      setFields(data);
    } catch (error) {
      console.error('Failed to fetch custom fields', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'text',
      required: false,
      entity_type: 'contact',
      options: []
    });
    setOptionInput('');
    setEditingField(null);
  };

  const handleOpenModal = (field?: CustomFieldDefinition) => {
    if (field) {
      setEditingField(field);
      setFormData(field);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), optionInput.trim()]
      }));
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingField) {
        await customFieldService.updateField(editingField.id, formData);
      } else {
        await customFieldService.createField(formData as Omit<CustomFieldDefinition, 'id'>);
      }
      fetchFields();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save field', error);
      alert('Failed to save field');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await customFieldService.deleteField(id);
        fetchFields();
      } catch (error) {
        console.error('Failed to delete field', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Custom Fields & Values</h2>
          <p className="text-gray-600 dark:text-gray-400">Create custom fields for contacts and jobs</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus size={16} />
          <span>Add Field</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Job Fields</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No custom fields found.</td>
                </tr>
              ) : (
                fields.map((field) => (
                  <tr key={field.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{field.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{field.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{field.entity_type}</td>
                    <td className="px-6 py-4">
                      {field.required && <Check className="w-4 h-4 text-green-500" />}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button onClick={() => handleOpenModal(field)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(field.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingField ? 'Edit Custom Field' : 'Add Custom Field'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entity Type</label>
            <select
              value={formData.entity_type}
              onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as any })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="contact">Contact</option>
              <option value="job">Job</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Dropdown (Select)</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          {formData.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
              <div className="flex space-x-2 mt-1 mb-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Add option..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options?.map((option, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {option}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="required"
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Required Field
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {editingField ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Scoring</h3>
        <LeadScoringSection />
      </div>
    </div>
  );
};

const LeadScoringSection: React.FC = () => {
  const [scores, setScores] = useState({
    hot_lead_score: 80,
    warm_lead_score: 50,
    cold_lead_score: 20
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const data = await customFieldService.getLeadScoring();
      setScores(data);
    } catch (error) {
      console.error('Failed to fetch lead scoring rules', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await customFieldService.updateLeadScoring(scores);
      alert('Lead scoring rules saved successfully!');
    } catch (error) {
      console.error('Failed to save lead scoring rules', error);
      alert('Failed to save rules');
    }
  };

  if (loading) return <div>Loading scores...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hot Lead Score</label>
          <input
            type="number"
            value={scores.hot_lead_score}
            onChange={(e) => setScores({ ...scores, hot_lead_score: Number(e.target.value) })}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warm Lead Score</label>
          <input
            type="number"
            value={scores.warm_lead_score}
            onChange={(e) => setScores({ ...scores, warm_lead_score: Number(e.target.value) })}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cold Lead Score</label>
          <input
            type="number"
            value={scores.cold_lead_score}
            onChange={(e) => setScores({ ...scores, cold_lead_score: Number(e.target.value) })}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Save Scoring Rules
      </button>
    </div>
  );
};

export default CustomFields;