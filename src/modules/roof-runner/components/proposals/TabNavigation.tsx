import { Tabs } from '../../../../shared/components/ui';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="bg-surface-1 dark:bg-surface-d-1 px-studio-page">
      <Tabs<string>
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'Proposals', label: 'Proposals' },
          { id: 'Templates', label: 'Templates' },
          { id: 'Settings',  label: 'Settings' },
        ]}
      />
    </div>
  );
}
