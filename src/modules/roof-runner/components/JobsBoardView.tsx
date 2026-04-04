import React, { useState } from 'react';
import { Job } from '../../../shared/store/services/jobsApi';

interface JobsBoardViewProps {
  jobs: Job[];
  draggedCard: string | null;
  setDraggedCard: (cardId: string | null) => void;
  onUpdateJobStage: (jobId: number, newStage: string) => Promise<void> | void;
  onCardClick: (job: Job) => void;
}

const JobsBoardView: React.FC<JobsBoardViewProps> = ({
  jobs,
  draggedCard,
  setDraggedCard,
  onUpdateJobStage,
  onCardClick
}) => {
  const [movingStage, setMovingStage] = useState<string | null>(null);
  const stages = [
    'Inspection/Estimate Booked', 'Inspection/Estimate Complete', 'Proposal Drafted', 'Proposal Sent', 'Proposal Accepted', 'Job Lost', 'Job Won', 'Under Contract', 'Invoice Sent', '⁠Invoice Paid', 'Job Scheduled','Materials Ordered', 'Job Started', 'Job Complete'
  ];

  const getJobsByStage = (stage: string) => {
    if (stage === 'Inspection/Estimate Booked') {
      const matchedJobs = jobs.filter(job => stages.includes(job.workflow_stages || job.workflowStages));
      const unmatchedJobs = jobs.filter(job => !stages.includes(job.workflow_stages || job.workflowStages));
      const stageJobs = jobs.filter(job => (job.workflow_stages || job.workflowStages) === stage);
      return [...stageJobs, ...unmatchedJobs];
    }
    return jobs.filter(job => (job.workflow_stages || job.workflowStages) === stage);
  };
  const getStageValue = (stage: string) => {
    const stageJobs = getJobsByStage(stage);
    return stageJobs.reduce((sum, job) => sum + parseFloat(job.job_value || job.jobValue?.toString() || '0'), 0);
  };
  const isUpdatingStage = (stage: string) => movingStage === stage;

  return (
    <div className="h-full p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="flex gap-4 min-w-max">
        {stages.map((stage) => {
          const stageJobs = getJobsByStage(stage);
          const stageValue = getStageValue(stage);

          return (
          <div key={stage} className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stage}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">({stageJobs.length})</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${stageValue.toLocaleString()}
                  </span>
                </div>
                {isUpdatingStage(stage) && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    Moving job...
                  </div>
                )}
              </div>

              {/* Cards Container */}
              <div
                className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[200px]"
                onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const cardData = e.dataTransfer.getData('text/plain');
                        if (cardData) {
                          const { jobId, sourceStage } = JSON.parse(cardData);
                          if (sourceStage !== stage) {
                            try {
                              setMovingStage(stage);
                              await onUpdateJobStage(jobId, stage);
                            } finally {
                              setMovingStage(null);
                            }
                          }
                          setDraggedCard(null);
                        }
                      }}
              >
                {/* Job Cards */}
                {stageJobs.map((job) => {
                  let dragStartTime = 0;
                  let isDragging = false;

                  return (
                    <div
                      key={job.id}
                      draggable
                      className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 ${
                        draggedCard === job.id.toString() ? 'opacity-50 scale-95' : ''
                      }`}
                      onMouseDown={() => {
                        dragStartTime = Date.now();
                        isDragging = false;
                      }}
                      onClick={(e) => {
                        const clickDuration = Date.now() - dragStartTime;
                        if (!isDragging && clickDuration < 200) {
                          e.stopPropagation();
                          onCardClick(job);
                        }
                      }}
                      onDragStart={(e) => {
                        isDragging = true;
                        const dragData = JSON.stringify({ 
                          jobId: job.id, 
                          sourceStage: job.workflow_stages || job.workflowStages 
                        });
                        e.dataTransfer.setData('text/plain', dragData);
                        setDraggedCard(job.id.toString());
                      }}
                      onDragEnd={() => {
                        setDraggedCard(null);
                        isDragging = false;
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">#{job.id}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(job.created_at || job.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{job.location}</p>
                      
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {job.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 2 && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">+{job.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${parseFloat(job.job_value || job.jobValue?.toString() || '0').toLocaleString()}
                        </span>
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                          {job.assigneeUsers?.[0]?.first_name?.charAt(0) || (Array.isArray(job.assignees) && job.assignees[0]?.toString().charAt(0)) || 'U'}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {stageJobs.length === 0 && (
                  <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default JobsBoardView;
