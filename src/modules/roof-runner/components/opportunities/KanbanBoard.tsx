import { useState } from 'react';
import KanbanColumn from './KanbanColumn';

const opportunityStages = [
  { id: 'new-lead', title: 'New Lead', opportunitiesCount: 0, value: 0.00, color: 'border-[#dc2626]' },
  { id: 'follow-up-1', title: 'Follow-Up 1', opportunitiesCount: 0, value: 0.00, color: 'border-blue-500' },
  { id: 'follow-up-2', title: 'Follow-Up 2', opportunitiesCount: 0, value: 0.00, color: 'border-yellow-500' },
  { id: 'follow-up-3', title: 'Follow-Up 3', opportunitiesCount: 0, value: 0.00, color: 'border-green-500' },
  { id: 'long-term-follow-up', title: 'Long Term Follow Up', opportunitiesCount: 0, value: 0.00, color: 'border-purple-500' },
  { id: 'in-convo', title: 'In Convo', opportunitiesCount: 0, value: 0.00, color: 'border-emerald-500' },
  { id: 'inspection-booked', title: 'Inspection/Estimate Booked (Creates Job)', opportunitiesCount: 0, value: 0.00, color: 'border-green-600' },
  { id: 'job-qualified', title: 'Job Qualified', opportunitiesCount: 0, value: 0.00, color: 'border-indigo-500' },
  { id: 'job-unqualified', title: 'Job Unqualified', opportunitiesCount: 0, value: 0.00, color: 'border-red-500' },
];

const opportunities = [
  {
    id: 'opp1',
    stage: 'inspection-scheduled',
    name: 'Youssef Fadil',
    source: 'Website Lead',
    value: 8500.00,
    initials: 'YF',
    contact: { name: 'Youssef Fadil', email: 'youssef@email.com', phone: '555-0123' }
  },
  {
    id: 'opp2',
    stage: 'inspection-scheduled',
    name: 'Mohammad Choudhry',
    business: 'Holiday inn',
    value: 12000.00,
    initials: 'MC',
    contact: { name: 'Mohammad Choudhry', email: 'mohammad@holidayinn.com', phone: '555-0124' }
  },
  {
    id: 'opp3',
    stage: 'inspection-scheduled',
    name: 'Jose Jordan',
    source: 'Website Lead',
    value: 6750.00,
    initials: 'JJ',
    contact: { name: 'Jose Jordan', email: 'jose@email.com', phone: '555-0125' }
  },
];

export default function KanbanBoard() {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [opportunitiesList, setOpportunitiesList] = useState(opportunities);

  const handleDragStart = (e: React.DragEvent, opportunity: any) => {
    setDraggedItem(opportunity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedItem) {
      setOpportunitiesList(prev => 
        prev.map(opp => 
          opp.id === draggedItem.id 
            ? { ...opp, stage: targetStage }
            : opp
        )
      );
      setDraggedItem(null);
      
      // Auto-create contact when job is created
      if (targetStage === 'job-scheduled' && draggedItem.contact) {
        console.log('Auto-creating contact:', draggedItem.contact);
        // This would integrate with your contact creation system
      }
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {opportunityStages.map((stage) => (
        <div
          key={stage.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <KanbanColumn
            stage={stage}
            opportunities={stage.id === 'new-lead' 
              ? [...opportunitiesList.filter(opp => opp.stage === stage.id), 
                 ...opportunitiesList.filter(opp => !opportunityStages.some(s => s.id === opp.stage))]
              : opportunitiesList.filter(opp => opp.stage === stage.id)
            }
            onDragStart={handleDragStart}
          />
        </div>
      ))}
    </div>
  );
}