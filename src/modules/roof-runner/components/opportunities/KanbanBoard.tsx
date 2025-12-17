import { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import ViewEditOpportunityModal from './ViewEditOpportunityModal';
import { embeddedPipelinesService } from '../../services/embeddedPipelinesService';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import type { PipelineStage, OpportunityWithDetails, JobType } from '../../types/opportunities';
import { EMBEDDED_PIPELINE_COLORS } from '../../constants/embeddedPipelines';

interface KanbanBoardProps {
  selectedJobType: JobType | 'all';
}

export default function KanbanBoard({ selectedJobType }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<OpportunityWithDetails | null>(null);
  const [opportunitiesList, setOpportunitiesList] = useState<OpportunityWithDetails[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [showViewEditModal, setShowViewEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedJobType]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (selectedJobType === 'all') {
        const pipelines = await embeddedPipelinesService.getEmbeddedPipelines();
        const allStages = pipelines.flatMap(p => p.stages);
        setStages(allStages);
        const opportunities = await opportunitiesApi.getOpportunities();
        setOpportunitiesList(opportunities);
      } else {
        const pipeline = await embeddedPipelinesService.getEmbeddedPipelineByJobType(selectedJobType);

        if (pipeline) {
          setStages(pipeline.stages);
          const opportunities = await opportunitiesApi.getOpportunitiesByJobType(selectedJobType);
          setOpportunitiesList(opportunities);
        } else {
          setStages([]);
          setOpportunitiesList([]);
        }
      }
    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, opportunity: OpportunityWithDetails) => {
    setDraggedItem(opportunity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.stage_id !== targetStageId) {
      try {
        await opportunitiesApi.moveOpportunityToStage(draggedItem.id, targetStageId);

        setOpportunitiesList(prev =>
          prev.map(opp =>
            opp.id === draggedItem.id
              ? { ...opp, stage_id: targetStageId }
              : opp
          )
        );
      } catch (error) {
        console.error('Error moving opportunity:', error);
        alert('Failed to move opportunity. Please try again.');
      }
      setDraggedItem(null);
    }
  };

  const getStageOpportunities = (stageId: string) => {
    return opportunitiesList.filter(opp => opp.stage_id === stageId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading opportunities...</div>
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
              >
                <KanbanColumn
                  stage={{
                    id: stage.id,
                    title: stage.name,
                    opportunitiesCount: stageOpportunities.length,
                    value: stageValue,
                    color: `border-[${stage.color}]`,
                  }}
                  opportunities={stageOpportunities.map(opp => ({
                    id: opp.id,
                    stage: opp.stage_id,
                    name: opp.opportunity_name,
                    source: opp.source,
                    business: opp.business_name,
                    value: opp.value,
                    initials: opp.opportunity_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
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