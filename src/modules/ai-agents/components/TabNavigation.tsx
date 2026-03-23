import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { name: 'Getting Started', href: '/ai-agents' },
  { name: 'Voice AI', href: '/ai-agents/voice-ai' },
  { name: 'Conversation AI', href: '/ai-agents/conversation-ai' },
  { name: 'Knowledge Base', href: '/ai-agents/knowledge-base' },
  { name: 'Agent Templates', href: '/ai-agents/agent-templates' },
  { name: 'Content AI', href: '/ai-agents/content-ai' },
];

export function TabNavigation() {
  const location = useLocation();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}