import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { pipelinesApi } from '../../services/pipelinesApi';
import type { PipelineWithStages, PipelineStage, JobType } from '../../types/opportunities';
import { JOB_TYPES, JOB_TYPE_COLORS } from '../../types/opportunities';

interface EditPipelineModalProps {
  isOpen: boolean;
  pipelineId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface StageFormData {
  id?: string;
  name: string;
  include_in_funnel: boolean;
  include_in_distribution: boolean;
  order: number;
  is_new?: boolean;
}

export default function EditPipelineModal({ isOpen, pipelineId, onClose, onSuccess }: EditPipelineModalProps) {
  const [pipelineName, setPipelineName] = useState('');
  const [jobType, setJobType] = useState<JobType>('Commercial');
  const [stages, setStages] = useState<StageFormData[]>([]);
  const [originalData, setOriginalData] = useState<{ name: string; jobType: JobType; stages: StageFormData[] } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
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
      const pipeline = await pipelinesApi.getPipelineById(pipelineId);

      if (pipeline) {
        setPipelineName(pipeline.name);
        setJobType(pipeline.job_type);
        const stageData: StageFormData[] = (pipeline.stages || [])
          .sort((a, b) => a.order_position - b.order_position)
          .map(stage => ({
            id: stage.id,
            name: stage.name,
            include_in_funnel: stage.include_in_funnel ?? true,
            include_in_distribution: stage.include_in_distribution ?? true,
            order: stage.order_position,
          }));
        setStages(stageData);
        setOriginalData({ name: pipeline.name, jobType: pipeline.job_type, stages: stageData });
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
      alert('Failed to load pipeline details.');
    } finally {
      setLoading(false);
    }
  };

  const addStage = () => {
    const newStage: StageFormData = {
      name: '',
      include_in_funnel: true,
      include_in_distribution: true,
      order: stages.length,
      is_new: true,
    };
    setStages([...stages, newStage]);
  };

  const removeStage = async (stage: StageFormData, index: number) => {
    if (stages.length <= 1) {
      alert('A pipeline must have at least one stage.');
      return;
    }

    if (stage.id && !stage.is_new) {
      alert('Deleting stages is not yet supported. You can rename stages or create a new pipeline.');
      return;
    }

    setStages(stages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: keyof StageFormData, value: string | boolean) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!pipelineName.trim()) {
      newErrors.pipelineName = 'Pipeline name is required';
    }

    const emptyStages = stages.filter(stage => !stage.name.trim());
    if (emptyStages.length > 0) {
      newErrors.stages = 'All stages must have a name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !pipelineId) return;

    setSaving(true);
    try {
      await pipelinesApi.updatePipeline(pipelineId, {
        name: pipelineName,
        job_type: jobType,
      });

      alert('Pipeline updated successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating pipeline:', error);
      alert('Failed to update pipeline. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = (): boolean => {
    if (!originalData) return false;
    return pipelineName !== originalData.name || jobType !== originalData.jobType;
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }

    setPipelineName('');
    setJobType('Commercial');
    setStages([]);
    setOriginalData(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Pipeline</h2>
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
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pipeline Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="Pipeline name"
                  className={`w-full px-3 py-2 border ${
                    errors.pipelineName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use a unique, descriptive name so you can find this pipeline later
                </p>
                {errors.pipelineName && (
                  <p className="mt-1 text-sm text-red-600">{errors.pipelineName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Type <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4">
                  {JOB_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        jobType === type
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="jobType"
                        value={type}
                        checked={jobType === type}
                        onChange={(e) => setJobType(e.target.value as JobType)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: JOB_TYPE_COLORS[type] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Pipeline Stages ({stages.length})
                  </h3>
                  <button
                    onClick={addStage}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stage
                  </button>
                </div>

                {errors.stages && (
                  <p className="mb-3 text-sm text-red-600">{errors.stages}</p>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
                    <div className="col-span-6">Stage Name</div>
                    <div className="col-span-5 text-center">Include In Reports</div>
                    <div className="col-span-1"></div>
                  </div>

                  {stages.map((stage, index) => (
                    <div
                      key={stage.id || `new-${index}`}
                      className="grid grid-cols-12 gap-3 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>

                      <div className="col-span-5">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(index, 'name', e.target.value)}
                          placeholder="Stage name"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-5 flex items-center justify-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={stage.include_in_funnel}
                            onChange={(e) => updateStage(index, 'include_in_funnel', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Funnel Chart</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={stage.include_in_distribution}
                            onChange={(e) => updateStage(index, 'include_in_distribution', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Stage Distribution</span>
                        </label>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={() => removeStage(stage, index)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete stage"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !hasUnsavedChanges()}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
