import React, { useState } from 'react';
import { X, MessageSquare, Users } from 'lucide-react';
import { DirectMessageModal } from './DirectMessageModal';

interface ConversationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'direct' | 'group') => void;
  onCreateConversation: (contactId: string) => void;
}

export function ConversationEditModal({ isOpen, onClose, onSelectType, onCreateConversation }: ConversationEditModalProps) {
  const [showDirectModal, setShowDirectModal] = useState(false);

  const handleDirectMessage = () => {
    setShowDirectModal(true);
  };

  const handleDirectModalClose = () => {
    setShowDirectModal(false);
  };

  const handleConversationCreated = (contactId: string) => {
    setShowDirectModal(false);
    onClose();
    onCreateConversation(contactId);
  };

  if (!isOpen && !showDirectModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose the type of conversation you want to create:
          </p>

          <div className="space-y-3">
            <button
              onClick={handleDirectMessage}
              className="w-full flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Direct Message</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a one-on-one conversation
                </p>
              </div>
            </button>

            <button
              onClick={() => onSelectType('group')}
              className="w-full flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Group Message</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a group conversation
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <DirectMessageModal
        isOpen={showDirectModal}
        onClose={handleDirectModalClose}
        onCreateConversation={handleConversationCreated}
      />
    </div>
  );
}