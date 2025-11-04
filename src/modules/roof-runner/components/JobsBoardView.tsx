import React from 'react';

interface JobCard {
  id: string;
  jobNumber: string;
  address: string;
  value: string;
  assignee: string;
}

interface JobsBoardViewProps {
  jobCards: {[key: string]: JobCard[]};
  setJobCards: React.Dispatch<React.SetStateAction<{[key: string]: JobCard[]}>>;
  draggedCard: string | null;
  setDraggedCard: (cardId: string | null) => void;
}

const JobsBoardView: React.FC<JobsBoardViewProps> = ({
  jobCards,
  setJobCards,
  draggedCard,
  setDraggedCard
}) => {
  const columns = [
    { name: 'New lead', count: 527, value: '$1.00' },
    { name: 'Appointment scheduled', count: 3, value: '$227,296.61' },
    { name: 'Appointment run', count: 122, value: '$40,200.00' },
    { name: 'Adjuster Meeting Scheduled', count: 12, value: '$0.00' },
    { name: 'Adjuster Meeting Complete', count: 19, value: '$96,800.00' },
    { name: 'Under Service Agreement/Contin', count: 1, value: '$0.00' },
    { name: 'Estimate Received', count: 1, value: '$0.00' },
    { name: 'Proposal sent/presented', count: 217, value: '$12,063,204.78' },
    { name: 'Proposal follow-up', count: 5, value: '$0.00' },
    { name: 'Reinspection', count: 14, value: '$0.00' },
    { name: 'Public Adjuster', count: 15, value: '$70,455.70' },
    { name: 'Proposal signed/Pre-Production', count: 30, value: '$547,944.40' },
    { name: 'Supplementing', count: 3, value: '$23,050.70' },
    { name: 'Pre-production', count: 2, value: '$63,110.40' },
    { name: 'Materials Ordered', count: 0, value: '$0.00' },
    { name: 'Production', count: 7, value: '$636,082.27' },
    { name: 'Post-production', count: 5, value: '$73,562.72' },
    { name: 'Payments/Invoicing', count: 23, value: '$395,942.78' },
    { name: 'Post-job completion follow-up', count: 0, value: '$0.00' },
    { name: 'Job completed', count: 220, value: '$3,278,832.60' },
    { name: 'Lost', count: 102, value: '$283,592.26' },
    { name: 'Unqualified', count: 121, value: '$137,250.00' }
  ];

  return (
    <div className="h-full p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="flex gap-4 min-w-max">
        {columns.map((column) => (
          <div key={column.name} className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{column.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">({column.count})</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{column.value}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">🏠 Default</span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">🧰 Awaiting Adjuster Inspection</span>
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
                    const { cardId, sourceColumn } = JSON.parse(cardData);
                    if (sourceColumn !== column.name) {
                      setJobCards(prev => {
                        const newCards = { ...prev };
                        const cardToMove = newCards[sourceColumn].find(card => card.id === cardId);
                        if (cardToMove) {
                          newCards[sourceColumn] = newCards[sourceColumn].filter(card => card.id !== cardId);
                          newCards[column.name] = [...newCards[column.name], cardToMove];
                        }
                        return newCards;
                      });
                    }
                    setDraggedCard(null);
                  }
                }}
              >
                {/* Job Cards */}
                {(jobCards[column.name] || []).map((card) => (
                  <div
                    key={card.id}
                    draggable
                    className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 ${
                      draggedCard === card.id ? 'opacity-50 scale-95' : ''
                    }`}
                    onDragStart={(e) => {
                      const dragData = JSON.stringify({ cardId: card.id, sourceColumn: column.name });
                      e.dataTransfer.setData('text/plain', dragData);
                      setDraggedCard(card.id);
                    }}
                    onDragEnd={() => setDraggedCard(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{card.jobNumber}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">2d ago</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{card.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{card.value}</span>
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {card.assignee}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State */}
                {(jobCards[column.name]?.length || 0) === 0 && (
                  <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsBoardView;