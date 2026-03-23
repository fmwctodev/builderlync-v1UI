import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { EventForm } from '../components/calendar/EventForm';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

export function Calendar() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedJobId] = useState(1); // This should come from job selection

  const handleEventCreated = () => {
    // Refresh events or show success message
    console.log('Event created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <Button 
          icon={<Plus size={16} />}
          onClick={() => setShowEventForm(true)}
        >
          New Event
        </Button>
      </div>

      <Card>
        <EmptyState
          title="Calendar Events"
          description="Create and manage job events using the calendar"
          icon={<CalendarIcon className="w-12 h-12 mb-4 text-gray-400" />}
          action={{
            label: "Schedule Event",
            onClick: () => setShowEventForm(true)
          }}
        />
      </Card>

      {showEventForm && (
        <EventForm
          jobId={selectedJobId}
          onClose={() => setShowEventForm(false)}
          onSuccess={handleEventCreated}
        />
      )}
    </div>
  );
}