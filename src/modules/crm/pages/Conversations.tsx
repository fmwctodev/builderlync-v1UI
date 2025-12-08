import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { ConversationsList } from '../components/conversations/ConversationsList';
import { ChatArea } from '../components/conversations/ChatArea';
import { SnippetsPanel } from '../components/conversations/SnippetsPanel';

export function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showSnippets, setShowSnippets] = useState(false);

  return (
    <>
      <div className="-m-4 md:-m-6 h-[calc(100vh-120px)] flex bg-white dark:bg-gray-900">
        {/* Snippets Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowSnippets(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Snippets</span>
          </button>
        </div>

        <ConversationsList
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
        <ChatArea conversationId={selectedConversation} />
      </div>

      <SnippetsPanel
        isOpen={showSnippets}
        onClose={() => setShowSnippets(false)}
        onSelectSnippet={(snippet) => {
          // Handle snippet selection - you can pass this to ChatArea
          console.log('Selected snippet:', snippet);
        }}
      />
    </>
  );
}