import React from 'react';
import { X } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'scratch',
      name: 'Start from scratch',
      description: 'Configure your own prompt to start generating replies',
      avatar: null
    },
    {
      id: 'claire',
      name: 'Claire Flair',
      avatar: 'CF',
      tone: '👨💼 Professional',
      description: 'You will be provided with good reviews of a business. Your job is to craft a professional and authoritative response that reflects a deep sense of expertise and reliability. Begin by expressing sincere gratitude for the review, acknowledging the customer\'s feedback or highlighting their positive comments. For any concerns or suggestions mentioned, address them concisely and provide clear, well-thought-out explanations or assurances that demonstrate your commitment to high standards. Keep the tone respectful, solution-oriented, and reflective of a seasoned professional. End with an invitation for further engagement to show your dedication to customer satisfaction and ongoing improvement. Keep the response in 2 lines or under.'
    },
    {
      id: 'grace',
      name: 'Grace Space',
      avatar: 'GS',
      tone: '🥹 Empathetic',
      tone2: '🛠️ Solution Oriented',
      description: 'You will be provided with negative reviews of a business. Write a heartfelt and empathetic response that acknowledges the customer\'s concerns and frustrations in a genuine manner. Begin by sincerely apologizing for their negative experience, using empathetic language to show you understand their feelings and value their feedback. Address their specific concerns directly, taking responsibility where appropriate, and provide a clear explanation or reassurance of any corrective actions being taken. Offer actionable steps to resolve the issue, such as inviting them to connect privately to discuss further or explaining how you will improve moving forward. Conclude with a warm and considerate tone, expressing your commitment to making things right and ensuring a better experience in the future. Keep the response in 2 lines or under.'
    },
    {
      id: 'taylor',
      name: 'Taylor Sailor',
      avatar: 'TS',
      tone: '🌟 Optimistic',
      description: 'You will be provided with reviews of a business. Reply to the reviews with a focus on customer success. Highlight how the business values feedback and is committed to continuous improvement. Keep the response in 2 lines or under.'
    },
    {
      id: 'axel',
      name: 'Axel Dazzle',
      avatar: 'AD',
      tone: '🛝 Playful',
      description: 'You will be provided with reviews of a business. Write a response in a casual and upbeat tone that makes the customer feel like part of the in-crowd. Use emojis and friendly language. Keep the response in 2 lines or under.'
    },
    {
      id: 'sally',
      name: 'Solutions Sally',
      avatar: 'SS',
      tone: '🛠️ Solution Oriented',
      description: 'You will be provided with reviews of a business. Craft a thoughtful response that directly addresses any concerns or problems mentioned in the review. Start by acknowledging the customer\'s experience with empathy and understanding, ensuring they feel heard and valued. Take a proactive approach to solving the issue by clearly identifying the core concern and providing practical, actionable steps to resolve it. If necessary, explain how the problem arose while maintaining a focus on how you are working to fix it. Share details about what changes or improvements you are implementing to prevent similar issues in the future. Conclude by inviting the customer to continue the conversation privately if needed, and reaffirm your commitment to ensuring their satisfaction and a positive future experience. Keep the response in 2 lines or under.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  {template.avatar ? (
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                      {template.avatar}
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xs">+</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                    {template.tone && (
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{template.tone}</span>
                        {template.tone2 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{template.tone2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-4">
                  {template.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentModal;