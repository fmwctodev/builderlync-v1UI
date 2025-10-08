import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { HardHat, Plus } from 'lucide-react';

export function Jobs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs & Opportunities</h1>
        <Button icon={<Plus size={16} />}>
          Add Job
        </Button>
      </div>

      <Card>
        <EmptyState
          title="No Jobs Yet"
          description="Track your construction projects and opportunities here"
          icon={<HardHat className="w-12 h-12 mb-4 text-gray-400" />}
          action={{
            label: "Create Job",
            onClick: () => console.log("Create job")
          }}
        />
      </Card>
    </div>
  );
}