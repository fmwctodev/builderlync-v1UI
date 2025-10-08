import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

export function Calendar() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <Button icon={<Plus size={16} />}>
          New Event
        </Button>
      </div>

      <Card>
        <EmptyState
          title="Calendar Coming Soon"
          description="Calendar functionality will be available in the next update"
          icon={<CalendarIcon className="w-12 h-12 mb-4 text-gray-400" />}
          action={{
            label: "Schedule Event",
            onClick: () => console.log("Schedule event")
          }}
        />
      </Card>
    </div>
  );
}