import { Plus, X, MoreHorizontal, Edit2, Star, Trash2, Home, Hammer, Shield, Lock } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetJobPipelinesQuery, useUpdateJobPipelineMutation, useCreateJobPipelineMutation } from '../../../shared/store/services/jobPipelinesApi';
import { Pipeline } from '../../../shared/store/services/pipelinesApi';
import { hasPermission } from '../../../shared/utils/permissions';

const JobsSettings: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const { data: pipelines, isLoading } = useGetJobPipelinesQuery();
  const [updatePipeline] = useUpdateJobPipelineMutation();
  const [createPipeline] = useCreateJobPipelineMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowType, setNewWorkflowType] = useState<'Commercial' | 'Residential' | 'Insurance'>('Residential');
  const [isSaving, setIsSaving] = useState(false);

  const getWorkflowIcon = (jobType: string) => {
    switch (jobType) {
      case 'Residential': return Home;
      case 'Commercial': return Hammer;
      case 'Insurance': return Shield;
      default: return Home;
    }
  };

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Pipeline | null>(null);
  const [newName, setNewName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (workflow: Pipeline) => {
    setEditingWorkflow(workflow);
    setNewName(workflow.name);
    setActiveMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (editingWorkflow && newName.trim()) {
      try {
        await updatePipeline({ 
          id: editingWorkflow.id, 
          data: { name: newName } 
        }).unwrap();
        setEditingWorkflow(null);
      } catch (error) {
        console.error('Failed to update pipeline:', error);
      }
    }
  };

  const handleMakeDefault = async (workflow: Pipeline) => {
    try {
      await updatePipeline({ 
        id: workflow.id, 
        data: { is_default: true } 
      }).unwrap();
      setActiveMenuId(null);
    } catch (error) {
      console.error('Failed to set default pipeline:', error);
    }
  };

  const handleCreate = async () => {
    if (!newWorkflowName.trim()) return;
    
    setIsSaving(true);
    try {
      const defaultStages = [
        { name: 'New Lead', color: '#3b82f6', order_position: 0 },
        { name: 'Inspection/Estimate Booked', color: '#8b5cf6', order_position: 1 },
        { name: 'Job Qualified', color: '#10b981', order_position: 2 },
        { name: 'Estimate Completed', color: '#f59e0b', order_position: 3 },
        { name: 'Job Won', color: '#059669', order_position: 4 },
        { name: 'Job Complete', color: '#111827', order_position: 5 },
        { name: 'Job Lost', color: '#ef4444', order_position: 6 }
      ];

      await createPipeline({
        name: newWorkflowName,
        job_type: newWorkflowType,
        is_default: (pipelines?.length || 0) === 0,
        stages: defaultStages
      }).unwrap();

      setIsCreating(false);
      setNewWorkflowName('');
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job settings</h2>
        <p className="text-gray-600 dark:text-gray-400">All your job specific settings are listed below</p>
      </div>

      {/* Workflows & Stages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workflows & stages</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">A job moves through various stages before it is completed. Stages are grouped together inside workflows, which are listed below and can be customized.</p>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            pipelines?.map((workflow) => {
              const Icon = getWorkflowIcon(workflow.job_type);
              return (
                <div key={workflow.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                        {workflow.is_default && (
                          <span className="text-[10px] uppercase px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded font-bold">Default</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm mt-1">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                          {workflow.job_count || 0} jobs
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{workflow.stages?.length || 0} stages</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigate(`/org/${orgSlug}/jobs/settings/stages`)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 border border-gray-200 dark:border-gray-600 flex items-center gap-2"
                    >
                      {!hasPermission('jobs', 'manage') && <Lock className="w-3 h-3 text-gray-400" />}
                      {hasPermission('jobs', 'manage') ? 'Manage' : 'View Stages'}
                    </button>
                    <div className="relative">
                      {(hasPermission('jobs', 'manage') || !workflow.is_default) && (
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === workflow.id ? null : workflow.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      )}

                      {activeMenuId === workflow.id && (
                        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                          {hasPermission('jobs', 'manage') && (
                            <button
                              onClick={() => handleEdit(workflow)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          )}
                          {!workflow.is_default && (
                            <button
                              onClick={() => handleMakeDefault(workflow)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-primary-600 dark:text-primary-400"
                            >
                              <Star className="w-4 h-4" />
                              <span>Make default</span>
                            </button>
                          )}
                          {hasPermission('jobs', 'manage') && <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
            <p className="flex items-center space-x-1 italic">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              You can create multiple workflows for different job types
            </p>
          </div>
        </div>

        {hasPermission('jobs', 'manage') && (
          <button 
            onClick={() => setIsCreating(true)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create a workflow</span>
          </button>
        )}
      </div>

      {/* Lead Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead sources</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Jobs are attributed to various lead sources which can be customized</p>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage sources</button>
      </div>

      {/* Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cards</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Customize the look and layout of your team's job cards</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1 Western Road, Houston, Texas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rebecca Smith</p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
          </div>

          {/* Customer Name Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rebecca Smith</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 Western Road, Houston, Texas</p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Customer name</p>
          </div>
        </div>
      </div>

      {/* Default Folders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default folders</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Default folders will automatically appear in every new job to keep your attachments organized. You can add up to 20.</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Claims Documents</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Labor Invoice</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Material Invoices</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New folder</span>
        </button>
      </div>

      {/* Job Costing Access */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job costing access</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">By default job costing is only accessible to managers (and higher roles), to make it available to everyone in your team, please uncheck the box</p>

        <label className={`flex items-center ${!hasPermission('jobs', 'manage') ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input 
            type="checkbox" 
            defaultChecked 
            className="mr-3" 
            disabled={!hasPermission('jobs', 'manage')}
          />
          <span className="text-gray-900 dark:text-white">Only managers</span>
        </label>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create new workflow</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Commercial Projects"
                  maxLength={50}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Type</label>
                <select
                  value={newWorkflowType}
                  onChange={(e) => setNewWorkflowType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  disabled={isSaving}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                * This workflow will be created with default stages (New Lead, Job Won, etc.)
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-800 dark:hover:text-white transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newWorkflowName.trim() || isSaving}
                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isSaving ? 'Creating...' : 'Create Workflow'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit workflow</h3>
              <button
                onClick={() => setEditingWorkflow(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Consider creating separate workflows for insurance jobs, commercial jobs, repairs, etc.</p>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Workflow name"
                  maxLength={50}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-gray-400">{newName.length} / 50</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => setEditingWorkflow(null)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsSettings;