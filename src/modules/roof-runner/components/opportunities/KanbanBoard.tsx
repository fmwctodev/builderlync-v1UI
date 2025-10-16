import { useState } from 'react';
import KanbanColumn from './KanbanColumn';

const opportunityStages = [
  { id: 'inspection-scheduled', title: 'Inspection/Estimate Scheduled', opportunitiesCount: 7, value: 0.00, color: 'border-[#dc2626]' },
  { id: 'inspection-completed', title: 'Inspection Completed', opportunitiesCount: 0, value: 0.00, color: 'border-blue-500' },
  { id: 'proposal-sent', title: 'Proposal Sent', opportunitiesCount: 0, value: 0.00, color: 'border-yellow-500' },
  { id: 'proposal-signed', title: 'Proposal Signed', opportunitiesCount: 0, value: 0.00, color: 'border-green-500' },
  { id: 'job-scheduled', title: 'Job Scheduled', opportunitiesCount: 0, value: 0.00, color: 'border-purple-500' },
  { id: 'job-completed', title: 'Job Completed', opportunitiesCount: 0, value: 0.00, color: 'border-emerald-500' },
  { id: 'closed-won', title: 'Closed Won', opportunitiesCount: 0, value: 0.00, color: 'border-green-600' },
  { id: 'closed-lost', title: 'Closed Lost', opportunitiesCount: 0, value: 0.00, color: 'border-red-500' },
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
            opportunities={opportunitiesList.filter(opp => opp.stage === stage.id)}
            onDragStart={handleDragStart}
          />
        </div>
      ))}
    </div>
  );
}