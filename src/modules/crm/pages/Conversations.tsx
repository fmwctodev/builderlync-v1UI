import React, { useState } from 'react';
import { ConversationsList } from '../components/conversations/ConversationsList';
import { ChatArea } from '../components/conversations/ChatArea';

export function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');

  return (
    <div className="-m-4 md:-m-6 h-[calc(100vh-120px)] flex bg-white dark:bg-gray-900">
      <ConversationsList
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatArea conversationId={selectedConversation} />
    </div>
  );
}