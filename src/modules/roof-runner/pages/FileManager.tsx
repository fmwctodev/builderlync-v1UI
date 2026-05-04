import { useState } from 'react';
import { Cloud, HardDrive } from 'lucide-react';
import MyCloudTab from '../components/file-manager/MyCloudTab';
import LocalFilesTab from '../components/file-manager/LocalFilesTab';
import { PageHeader, Tabs, Section } from '../../../shared/components/ui';

export default function FileManager() {
  const [activeTab, setActiveTab] = useState<'my-cloud' | 'local-files'>('local-files');

  return (
    <div className="h-full flex flex-col">
      <div className="px-studio-page pt-8">
        <PageHeader eyebrow="Workspace" title="File manager" />
      </div>
      <div className="px-studio-page mt-4">
        <Tabs<'my-cloud' | 'local-files'>
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { id: 'my-cloud',    label: 'My cloud',    icon: <Cloud /> },
            { id: 'local-files', label: 'Local files', icon: <HardDrive /> },
          ]}
        />
      </div>

      <Section className="flex-1 overflow-auto px-studio-page">
        {activeTab === 'my-cloud' && <MyCloudTab />}
        {activeTab === 'local-files' && <LocalFilesTab />}
      </Section>
    </div>
  );
}
