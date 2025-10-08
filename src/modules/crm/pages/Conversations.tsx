import React from 'react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

export function Conversations() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>

      <Card>
        <EmptyState
          title="No Conversations"
          description="Start engaging with your contacts through messages, calls, and emails"
          icon={<MessageSquare className="w-12 h-12 mb-4 text-gray-400" />}
          action={{
            label: "Start Conversation",
            onClick: () => console.log("Start conversation")
          }}
        />
      </Card>
    </div>
  );
}