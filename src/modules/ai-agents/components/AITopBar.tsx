import { NavLink, useLocation } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { name: 'Getting Started', href: '/ai-agents' },
  { name: 'Voice AI', href: '/ai-agents/voice-ai' },
  { name: 'Conversation AI', href: '/ai-agents/conversation-ai' },
  { name: 'Knowledge Base', href: '/ai-agents/knowledge-base' },
  { name: 'Agent Templates', href: '/ai-agents/agent-templates' },
  // { name: 'Content AI', href: '/ai-agents/content-ai' },
];


export function AITopBar() {
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 mt-4">
      <div className="flex items-center gap-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={`px-6 py-3 font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
              }`}
            >
              {tab.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}