import { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { pipelinesApi } from '../../services/pipelinesApi';
import type { PipelineWithStages } from '../../types/opportunities';

interface ViewPipelineModalProps {
  isOpen: boolean;
  pipelineId: string | null;
  onClose: () => void;
  onEdit?: (pipelineId: string) => void;
}

export default function ViewPipelineModal({ isOpen, pipelineId, onClose, onEdit }: ViewPipelineModalProps) {
  const [pipeline, setPipeline] = useState<PipelineWithStages | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && pipelineId) {
      loadPipeline();
    }
  }, [isOpen, pipelineId]);

  const loadPipeline = async () => {
    if (!pipelineId) return;

    try {
      setLoading(true);
      const data = await pipelinesApi.getPipelineById(pipelineId);
      setPipeline(data);
    } catch (error) {
      console.error('Error loading pipeline:', error);
      alert('Failed to load pipeline details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (pipeline && onEdit) {
      onEdit(pipeline.id);
      onClose();
    }
  };

  const handleClose = () => {
    setPipeline(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">View Pipeline</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">Loading pipeline...</div>
            </div>
          ) : pipeline ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Pipeline Name
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{pipeline.name}</p>
              </div>

              {pipeline.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white">{pipeline.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Default Pipeline
                </label>
                <p className="text-gray-900 dark:text-white">
                  {pipeline.is_default ? 'Yes' : 'No'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Pipeline Stages ({pipeline.stages?.length || 0})
                </label>
                <div className="space-y-2">
                  {pipeline.stages && pipeline.stages.length > 0 ? (
                    pipeline.stages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md border-l-4"
                        style={{ borderLeftColor: stage.color }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {index + 1}.
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {stage.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          {stage.include_in_funnel && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              Funnel
                            </span>
                          )}
                          {stage.include_in_distribution && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                              Distribution
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No stages defined</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(pipeline.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Pipeline not found</div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            {onEdit && pipeline && (
              <button
                onClick={handleEdit}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Pipeline
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
