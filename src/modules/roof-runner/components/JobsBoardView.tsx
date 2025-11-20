import React from 'react';
import { Job } from '../../../shared/store/services/jobsApi';

interface JobsBoardViewProps {
  jobs: Job[];
  draggedCard: string | null;
  setDraggedCard: (cardId: string | null) => void;
  onUpdateJobStage: (jobId: number, newStage: string) => void;
}

const JobsBoardView: React.FC<JobsBoardViewProps> = ({
  jobs,
  draggedCard,
  setDraggedCard,
  onUpdateJobStage
}) => {
  const stages = [
    'Inspection/Estimate Booked', 'Inspection/Estimate Complete', 'Proposal Drafted', 'Proposal Sent', 'Proposal Accepted', 'Job Lost', 'Job Won', 'Under Contract', 'Invoice Sent', '⁠Invoice Paid', 'Job Scheduled','Materials Ordered', 'Job Started', 'Job Complete'
  ];

  const getJobsByStage = (stage: string) => {
    if (stage === 'Inspection/Estimate Booked') {
      // Include jobs that don't match any stage in the first stage
      const matchedJobs = jobs.filter(job => stages.includes(job.workflowStages));
      const unmatchedJobs = jobs.filter(job => !stages.includes(job.workflowStages));
      const stageJobs = jobs.filter(job => job.workflowStages === stage);
      return [...stageJobs, ...unmatchedJobs];
    }
    return jobs.filter(job => job.workflowStages === stage);
  };
  const getStageValue = (stage: string) => {
    const stageJobs = getJobsByStage(stage);
    return stageJobs.reduce((sum, job) => sum + job.jobValue, 0);
  };

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
              </div>

              {/* Cards Container */}
              <div
                className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[200px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const cardData = e.dataTransfer.getData('text/plain');
                  if (cardData) {
                    const { jobId, sourceStage } = JSON.parse(cardData);
                    if (sourceStage !== stage) {
                      onUpdateJobStage(jobId, stage);
                    }
                    setDraggedCard(null);
                  }
                }}
              >
                {/* Job Cards */}
                {getJobsByStage(stage).map((job) => (
                  <div
                    key={job.id}
                    draggable
                    className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 ${
                      draggedCard === job.id.toString() ? 'opacity-50 scale-95' : ''
                    }`}
                    onDragStart={(e) => {
                      const dragData = JSON.stringify({ jobId: job.id, sourceStage: job.workflowStages });
                      e.dataTransfer.setData('text/plain', dragData);
                      setDraggedCard(job.id.toString());
                    }}
                    onDragEnd={() => setDraggedCard(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">#{job.id}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{job.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ${job.jobValue.toLocaleString()}
                      </span>
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {job.assignees[0]?.charAt(0) || 'U'}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {getJobsByStage(stage)?.length === 0 && (
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