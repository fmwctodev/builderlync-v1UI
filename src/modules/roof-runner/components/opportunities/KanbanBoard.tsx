import { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import ViewEditOpportunityModal from './ViewEditOpportunityModal';
import { embeddedPipelinesService } from '../../services/embeddedPipelinesService';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import { getEmbeddedPipelineId } from '../../constants/embeddedPipelines';
import type { PipelineStage, OpportunityWithDetails, JobType } from '../../types/opportunities';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface KanbanBoardProps {
  selectedPipelineId?: string | null;
}

export default function KanbanBoard({ selectedPipelineId }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<OpportunityWithDetails | null>(null);
  const [opportunitiesList, setOpportunitiesList] = useState<OpportunityWithDetails[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [showViewEditModal, setShowViewEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPipelineId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch opportunities
      const filters: any = {};
      if (selectedPipelineId) {
        filters.pipeline_id = selectedPipelineId;
      }

      const opportunities = await opportunitiesApi.getOpportunities(filters);
      console.log('KanbanBoard - Loaded opportunities:', opportunities);

      if (selectedPipelineId) {
        // When a specific pipeline is selected, fetch its stages
        const pipeline = await embeddedPipelinesService.getEmbeddedPipelines();
        const selectedPipeline = pipeline.find(p => p.id === selectedPipelineId);
        if (selectedPipeline && selectedPipeline.stages) {
          setStages(selectedPipeline.stages);
        }
      } else {
        // When no pipeline is selected, show default embedded pipeline stages
        const defaultPipeline = await embeddedPipelinesService.getEmbeddedPipelineByJobType('Commercial');
        if (defaultPipeline && defaultPipeline.stages) {
          setStages(defaultPipeline.stages);
        }
      }

      setOpportunitiesList(opportunities);
    } catch (error) {
      console.error('Error loading kanban data:', error);
      setError('Failed to load opportunities. Please try again.');
      setOpportunitiesList([]);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, opportunity: any) => {
    // Find the full opportunity object from the list
    const fullOpportunity = opportunitiesList.find(opp => opp.id === opportunity.id);
    if (fullOpportunity) {
      setDraggedItem(fullOpportunity);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.stage_id !== targetStageId) {
      const previousStageId = draggedItem.stage_id;
      
      // Optimistic update
      setOpportunitiesList(prev =>
        prev.map(opp =>
          opp.id === draggedItem.id
            ? { ...opp, stage_id: targetStageId }
            : opp
        )
      );

      try {
        await opportunitiesApi.moveOpportunityToStage(draggedItem.id, targetStageId);
      } catch (error) {
        console.error('Error moving opportunity:', error);
        // Revert on error
        setOpportunitiesList(prev =>
          prev.map(opp =>
            opp.id === draggedItem.id
              ? { ...opp, stage_id: previousStageId }
              : opp
          )
        );
        setError('Failed to move opportunity. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    }
    setDraggedItem(null);
  };

  const getStageOpportunities = (stageId: string) => {
    const filtered = opportunitiesList.filter(opp => opp.stage_id === stageId);
    console.log(`Stage ${stageId} opportunities:`, filtered);
    return filtered;
  };

  const getStageValue = (stageId: string) => {
    return getStageOpportunities(stageId).reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  const handleCardClick = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowViewEditModal(true);
  };

  const handleModalClose = () => {
    setShowViewEditModal(false);
    setSelectedOpportunityId(null);
  };

  const handleUpdate = () => {
    loadData();
  };

  const handleDelete = () => {
    loadData();
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="flex gap-4 min-w-max">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="p-3 space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageOpportunities = getStageOpportunities(stage.id);
            const stageValue = getStageValue(stage.id);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="transition-all duration-200"
              >
                <KanbanColumn
                  stage={{
                    id: stage.id,
                    title: stage.name,
                    opportunitiesCount: stageOpportunities.length,
                    value: stageValue,
                    color: stage.color,
                  }}
                  opportunities={stageOpportunities.map(opp => ({
                    id: opp.id,
                    stage: opp.stage_id,
                    name: opp.opportunity_name || 'Unnamed Opportunity',
                    source: opp.source,
                    business: opp.business_name,
                    value: opp.value || 0,
                    initials: (opp.opportunity_name || 'UO').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                  }))}
                  onDragStart={handleDragStart}
                  onCardClick={handleCardClick}
                />
              </div>
            );
          })}
        </div>
      </div>

      <ViewEditOpportunityModal
        isOpen={showViewEditModal}
        opportunityId={selectedOpportunityId}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}