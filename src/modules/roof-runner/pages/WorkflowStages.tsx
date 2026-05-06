import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  ChevronLeft, 
  GripVertical, 
  CheckCircle2, 
  Edit2, 
  Home, 
  Hammer, 
  Shield,
  Trash2,
  X
} from 'lucide-react';
import { useGetJobPipelinesQuery, useUpdateJobPipelineMutation } from '../../../shared/store/services/jobPipelinesApi';
import { Pipeline, PipelineStage } from '../../../shared/store/services/pipelinesApi';
import { hasPermission } from '../../../shared/utils/permissions';
import { Lock } from 'lucide-react';

const WorkflowStages: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const { data: allPipelines, isLoading } = useGetJobPipelinesQuery();
  const [updatePipeline] = useUpdateJobPipelineMutation();

  const getWorkflowIcon = (jobType: string) => {
    switch (jobType) {
      case 'Residential': return Home;
      case 'Commercial': return Hammer;
      case 'Insurance': return Shield;
      default: return Home;
    }
  };

  // Take all available pipelines from the database
  const pipelines = allPipelines || [];
  const pipelineCount = pipelines.length || 1; // Fallback to 1 for layout if empty

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [tempStageName, setTempStageName] = useState('');
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newStageInput, setNewStageInput] = useState('');
  
  // Local state to keep track of stages that should be in the grid but might have 0 ticks
  // or were newly added by the user.
  const [sessionStages, setSessionStages] = useState<{name: string, category: string, id: string}[]>([]);

  // Initialize session stages from the database data
  React.useEffect(() => {
    if (allPipelines && sessionStages.length === 0) {
      const initial = new Set<string>();
      const combined: {name: string, category: string, id: string}[] = [];
      
      allPipelines.forEach(p => {
        p.stages.forEach(s => {
          if (!initial.has(s.name.trim().toLowerCase())) {
            initial.add(s.name.trim().toLowerCase());
            combined.push({ 
              name: s.name, 
              category: s.category || 'qualified', 
              id: s.id 
            });
          }
        });
      });
      setSessionStages(combined);
    }
  }, [allPipelines]);

  // Define categories to match the grid structure
  const categoryConfig = [
    { id: 'incoming', name: 'New incoming leads', icon: '⚡', description: 'Brand new unfiltered leads created as jobs' },
    { id: 'qualified', name: 'Qualified leads', icon: '🎯', description: 'Leads that are determined to be good quality or actionable' },
    { id: 'won', name: 'Won Jobs', icon: '👍', description: 'Jobs moved to any of these stages are considered won' },
    { id: 'completed', name: 'Completed jobs', icon: '✅', description: 'Jobs that are completely finished' },
    { id: 'lost', name: 'Lost jobs', icon: '👎', description: 'Qualified leads or won jobs that are later lost' },
    { id: 'unqualified', name: 'Unqualified leads', icon: '✖️', description: 'Leads moved here are not worth following up on' },
  ];

  const getGroupedStages = () => {
    const groups: Record<string, any[]> = {};
    
    // First, seed groups from sessionStages (the master list for this session)
    sessionStages.forEach(s => {
      const catId = s.category || 'qualified';
      if (!groups[catId]) groups[catId] = [];
      groups[catId].push({
        id: s.id,
        name: s.name,
        enabled: Array(pipelines.length).fill(false),
        required: false
      });
    });

    // Then, mark which ones are enabled based on actual pipeline data
    pipelines.forEach((p, pIdx) => {
      p.stages.forEach(s => {
        const catId = s.category || 'qualified';
        const normalizedName = s.name.trim().toLowerCase();
        
        let existing = groups[catId]?.find(g => g.name.trim().toLowerCase() === normalizedName);
        
        // If it exists in the database but not in our master session list (newly added to DB?), add it
        if (!existing) {
          if (!groups[catId]) groups[catId] = [];
          existing = { 
            id: s.id,
            name: s.name, 
            enabled: Array(pipelines.length).fill(false),
            required: false
          };
          groups[catId].push(existing);
        }
        existing.enabled[pIdx] = true;
      });
    });

    return groups;
  };

  const groupedStages = getGroupedStages();

  const addNewStage = (catId: string) => {
    if (!newStageInput.trim()) return;
    
    const normalizedNewName = newStageInput.trim().toLowerCase();
    const alreadyExists = sessionStages.some(s => s.name.trim().toLowerCase() === normalizedNewName);
    
    if (!alreadyExists) {
      setSessionStages(prev => [...prev, {
        name: newStageInput.trim(),
        category: catId,
        id: `temp-${Date.now()}`
      }]);
    }
    
    setNewStageInput('');
    setAddingToCategory(null);
  };

  const removeStageRow = (stageName: string) => {
    setSessionStages(prev => prev.filter(s => s.name.trim().toLowerCase() !== stageName.trim().toLowerCase()));
  };

  const toggleStage = async (catId: string, stageName: string, wfIdx: number) => {
    const pipeline = pipelines[wfIdx];
    if (!pipeline) return;

    // Normalize name for matching
    const normalizedTarget = stageName.trim().toLowerCase();
    const isCurrentlyEnabled = pipeline.stages.some(s => s.name.trim().toLowerCase() === normalizedTarget);
    
    let newStages = [...pipeline.stages];

    if (isCurrentlyEnabled) {
      // REMOVE STAGE (UN-TICK)
      newStages = newStages.filter(s => s.name.trim().toLowerCase() !== normalizedTarget);
    } else {
      // ADD STAGE (TICK)
      const newStage: Partial<PipelineStage> = {
        name: stageName,
        category: catId,
        color: '#dc2626',
        order_position: newStages.length,
        include_in_funnel: true,
        include_in_distribution: true
      };
      newStages.push(newStage as PipelineStage);
    }

    try {
      await updatePipeline({ 
        id: pipeline.id, 
        data: { stages: newStages } 
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle stage:', err);
    }
  };

  const startEditing = (stageId: string, currentName: string) => {
    setEditingStageId(stageId);
    setTempStageName(currentName.replace(/\*\*/g, ''));
  };

  const cancelEditing = () => {
    setEditingStageId(null);
    setTempStageName('');
  };

  const saveEditing = async (catId: string, oldName: string) => {
    if (!tempStageName.trim() || tempStageName === oldName) {
      setEditingStageId(null);
      return;
    }

    // Renaming a stage should update it across all pipelines in the grid
    try {
      const promises = pipelines.map(p => {
        const stage = p.stages.find(s => s.name === oldName);
        if (stage) {
          const newStages = p.stages.map(s => 
            s.name === oldName ? { ...s, name: tempStageName } : s
          );
          return updatePipeline({ id: p.id, data: { stages: newStages } }).unwrap();
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setEditingStageId(null);
    } catch (err) {
      console.error('Failed to rename stage:', err);
    }
  };

  const handleBack = () => {
    navigate(`/org/${orgSlug}/jobs?view=settings`);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-gray-50 dark:bg-gray-900 p-8 pt-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center space-x-2 text-primary-600 font-medium text-sm mb-1 cursor-pointer hover:underline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Settings</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage workflow stages</h2>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              {hasPermission('jobs', 'manage') ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  <span>Changes auto-saved</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2 text-amber-500" />
                  <span>Read Only Mode</span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-4xl">
            Stages are assigned to categories based on the stage meaning. Stages can be toggled on and off, renamed, and rearranged. There must be at least one stage per category and all new leads will be put in the top "New incoming leads" stage.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* Sticky Header */}
            <div 
              className="grid border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md px-6"
              style={{ gridTemplateColumns: `1fr repeat(${pipelineCount}, 120px)` }}
            >
              <div className="p-4"></div>
              {pipelines.map((wf) => {
                const Icon = getWorkflowIcon(wf.job_type);
                return (
                  <div key={wf.id} className="p-4 flex flex-col items-center justify-center space-y-1">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-[10px] text-center font-bold uppercase text-gray-500 leading-tight">
                      {(wf.name || '').split(' ').map(arg => arg[0]).join('')}
                    </span>
                    <span className="text-[10px] text-center font-medium text-gray-400 leading-tight truncate w-full">
                      {wf.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Content Categories */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="text-gray-500 animate-pulse">Loading workflows and stages...</p>
                </div>
              ) : (
                categoryConfig.map((cat) => {
                  const stages = groupedStages[cat.id] || [];
                  return (
                    <div key={cat.id} className="p-6 space-y-6">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl bg-gray-100 dark:bg-gray-700 p-2.5 rounded-xl shadow-sm">{cat.icon}</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{cat.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {stages.map((stage) => {
                          const isEditing = editingStageId === stage.id;
                          return (
                            <div key={stage.id} 
                                 className="grid items-center group rounded-xl transition-all py-1.5 border border-transparent hover:border-gray-100 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                 style={{ gridTemplateColumns: `1fr repeat(${pipelineCount}, 120px)` }}
                            >
                              <div className="flex items-center space-x-3 p-2 pl-4">
                                <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center space-x-2 flex-1">
                                  {isEditing ? (
                                    <div className="flex items-center space-x-2 w-full pr-4">
                                      <input
                                        type="text"
                                        value={tempStageName}
                                        onChange={(e) => setTempStageName(e.target.value)}
                                        autoFocus
                                        className="flex-1 px-3 py-1.5 border border-primary-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none ring-2 ring-primary-500/20 shadow-sm transition-all"
                                      />
                                      <button 
                                        onClick={() => saveEditing(cat.id, stage.name)}
                                        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={cancelEditing}
                                        className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-md shadow-sm"
                                      >
                                        <Plus className="w-4 h-4 rotate-45" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className={`text-gray-700 dark:text-gray-200 font-semibold ${stage.name.includes('**') ? 'text-primary-700 dark:text-primary-400' : ''}`}>
                                        {stage.name.replace(/\*\*/g, '')}
                                      </span>
                                      {stage.name.includes('**') && (
                                        <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full uppercase font-bold border border-primary-200 dark:border-primary-800">Hot</span>
                                      )}
                                      {hasPermission('jobs', 'manage') && (
                                        <>
                                          <Edit2 
                                            onClick={() => startEditing(stage.id, stage.name)}
                                            className="w-3.5 h-3.5 text-gray-300 hover:text-primary-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                                          />
                                          <Trash2 
                                            onClick={() => removeStageRow(stage.name)}
                                            className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                                          />
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              {stage.enabled.map((isEnabled, wfIdx) => (
                                <div key={wfIdx} className="flex justify-center p-2">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() => hasPermission('jobs', 'manage') && toggleStage(cat.id, stage.name, wfIdx)}
                                    className={`w-6 h-6 rounded-md border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 cursor-pointer shadow-sm transition-all ${stage.required || !hasPermission('jobs', 'manage') ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    disabled={stage.required || !hasPermission('jobs', 'manage')}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {!pipelines.length || !hasPermission('jobs', 'manage') ? null : (
                          addingToCategory === cat.id ? (
                            <div className="flex items-center space-x-2 px-12 py-3">
                              <input
                                type="text"
                                value={newStageInput}
                                onChange={(e) => setNewStageInput(e.target.value)}
                                placeholder="Stage name..."
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && addNewStage(cat.id)}
                                className="flex-1 px-3 py-1.5 border border-primary-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none ring-2 ring-primary-500/20 shadow-sm"
                              />
                              <button 
                                onClick={() => addNewStage(cat.id)}
                                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                              >
                                Add
                              </button>
                              <button 
                                onClick={() => {setAddingToCategory(null); setNewStageInput('');}}
                                className="p-1.5 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setAddingToCategory(cat.id)}
                              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-primary-600 px-12 py-3 transition-colors group"
                            >
                              <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                                <Plus className="w-3 h-3" />
                              </div>
                              <span className="font-medium">Add custom stage</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="mt-12 flex justify-center pb-12">
            <button 
              onClick={handleBack}
              className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
            >
              Done Managing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStages;
