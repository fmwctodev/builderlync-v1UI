import { useState } from 'react';
import { Cloud, HardDrive } from 'lucide-react';
import MyCloudTab from '../components/file-manager/MyCloudTab';
import LocalFilesTab from '../components/file-manager/LocalFilesTab';

export default function FileManager() {
  const [activeTab, setActiveTab] = useState<'my-cloud' | 'local-files'>('local-files');

  const tabs = [
    { id: 'my-cloud' as const, label: 'My Cloud', icon: Cloud },
    { id: 'local-files' as const, label: 'Local Files', icon: HardDrive },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">File Manager</h1>
        </div>

        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
                    : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'my-cloud' && <MyCloudTab />}
        {activeTab === 'local-files' && <LocalFilesTab />}
      </div>
    </div>
  );
}