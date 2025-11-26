import { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, FileText, Users, Briefcase, DollarSign } from 'lucide-react';
import {
  opportunityAssociatedObjectsApi,
  OpportunityAssociatedObject,
  CreateAssociatedObjectRequest,
} from '../../services/opportunityAssociatedObjectsApi';

interface OpportunityAssociatedObjectsTabProps {
  opportunityId: string;
}

export default function OpportunityAssociatedObjectsTab({ opportunityId }: OpportunityAssociatedObjectsTabProps) {
  const [objects, setObjects] = useState<OpportunityAssociatedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateAssociatedObjectRequest>({
    opportunity_id: opportunityId,
    object_type: 'job',
    object_id: '',
    object_name: '',
  });

  useEffect(() => {
    loadObjects();
  }, [opportunityId]);

  const loadObjects = async () => {
    try {
      setLoading(true);
      const data = await opportunityAssociatedObjectsApi.getAssociatedObjects(opportunityId);
      setObjects(data);
    } catch (error) {
      console.error('Error loading associated objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await opportunityAssociatedObjectsApi.createAssociatedObject(formData);
      await loadObjects();
      resetForm();
    } catch (error) {
      console.error('Error saving associated object:', error);
      alert('Failed to link object. Please try again.');
    }
  };

  const handleDelete = async (objectId: string) => {
    if (!confirm('Are you sure you want to unlink this object?')) return;
    try {
      await opportunityAssociatedObjectsApi.deleteAssociatedObject(objectId);
      await loadObjects();
    } catch (error) {
      console.error('Error deleting associated object:', error);
      alert('Failed to unlink object. Please try again.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      opportunity_id: opportunityId,
      object_type: 'job',
      object_id: '',
      object_name: '',
    });
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'contact':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'proposal':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'estimate':
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      default:
        return <Link2 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getObjectTypeBadge = (type: string) => {
    const colors = {
      job: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contact: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      document: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      proposal: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      estimate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading associated objects...</div>
      </div>
    );
  };

  const objectsByType = {
    job: objects.filter((o) => o.object_type === 'job'),
    contact: objects.filter((o) => o.object_type === 'contact'),
    document: objects.filter((o) => o.object_type === 'document'),
    proposal: objects.filter((o) => o.object_type === 'proposal'),
    estimate: objects.filter((o) => o.object_type === 'estimate'),
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Associated Objects</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {objects.length} linked object{objects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Link Object'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Object Type <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.object_type}
              onChange={(e) => setFormData({ ...formData, object_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="job">Job</option>
              <option value="contact">Contact</option>
              <option value="document">Document</option>
              <option value="proposal">Proposal</option>
              <option value="estimate">Estimate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Object ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.object_id}
              onChange={(e) => setFormData({ ...formData, object_id: e.target.value })}
              placeholder="Enter object ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Object Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.object_name}
              onChange={(e) => setFormData({ ...formData, object_name: e.target.value })}
              placeholder="Enter object name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

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
              Link Object
            </button>
          </div>
        </form>
      )}

      {objects.length === 0 ? (
        <div className="text-center py-12">
          <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No objects linked yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Link your first object
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(objectsByType).map(([type, typeObjects]) => {
            if (typeObjects.length === 0) return null;
            return (
              <div key={type}>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">
                  {type}s ({typeObjects.length})
                </h4>
                <div className="space-y-2">
                  {typeObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {getObjectIcon(obj.object_type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{obj.object_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {obj.object_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getObjectTypeBadge(obj.object_type)}`}>
                          {obj.object_type}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(obj.id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Unlink object"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
