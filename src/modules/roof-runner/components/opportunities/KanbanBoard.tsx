import KanbanColumn from './KanbanColumn';

const opportunityStages = [
  { id: 'new-lead', title: 'New Lead', opportunitiesCount: 7, value: 0.00, color: 'border-[#dc2626]' },
  { id: 'follow-up-1', title: 'Follow-up 1', opportunitiesCount: 0, value: 0.00, color: 'border-yellow-500' },
  { id: 'follow-up-2', title: 'Follow-up 2', opportunitiesCount: 0, value: 0.00, color: 'border-orange-500' },
  { id: 'follow-up-3', title: 'Follow-up 3', opportunitiesCount: 0, value: 0.00, color: 'border-red-500' },
  { id: 'long-term', title: 'Long Term', opportunitiesCount: 0, value: 0.00, color: 'border-purple-500' },
];

const opportunities = [
  {
    id: 'opp1',
    stage: 'new-lead',
    name: 'Youssef Fadil',
    source: 'Website Lead',
    value: 0.00,
    initials: 'YF',
  },
  {
    id: 'opp2',
    stage: 'new-lead',
    name: 'Mohammad Choudhry',
    business: 'Holiday inn',
    value: 0.00,
    initials: 'MC',
  },
  {
    id: 'opp3',
    stage: 'new-lead',
    name: 'Jose Jordan',
    source: 'Website Lead',
    value: 0.00,
    initials: 'JJ',
  },
];

export default function KanbanBoard() {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {opportunityStages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          opportunities={opportunities.filter(opp => opp.stage === stage.id)}
        />
      ))}
    </div>
  );
}