
import { Routes, Route, Navigate } from 'react-router-dom';
import { CreateAgentWizard } from './pages/CreateAgentWizard';
import { AgentBuilder } from './pages/AgentBuilder';
import { SierraModuleLayout, LayoutState } from './components/SierraModuleLayout';
import { TabId } from './components/SierraNavigation';
import { OverviewPage } from './pages/OverviewPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { NumbersRoutingPage } from './pages/NumbersRoutingPage';
import { AgentScriptPage } from './pages/AgentScriptPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { BookingCalendarsPage } from './pages/BookingCalendarsPage';
import { LogsTestingPage } from './pages/LogsTestingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SierraAiTabLayout } from './components/SierraAiTabLayout';
import { AIAgentsTab } from './pages/tabs/AIAgentsTab';
import { AgentTemplatesTab } from './pages/tabs/AgentTemplatesTab';

export function SierraAiModule() {
  const renderTabContent = (activeTab: TabId, layoutState: LayoutState) => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            agent={layoutState.agent}
            agentStatus={layoutState.agentStatus}
            onToggleStatus={layoutState.onToggleStatus}
            onNavigate={(tab) => console.log('Navigate to:', tab)}
          />
        );
      case 'knowledge-base':
        return <KnowledgeBasePage />;
      case 'numbers-routing':
        return <NumbersRoutingPage />;
      case 'agent-script':
        return <AgentScriptPage />;
      case 'channels':
        return <ChannelsPage />;
      case 'booking-calendars':
        return <BookingCalendarsPage />;
      case 'logs-testing':
        return <LogsTestingPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            agent={layoutState.agent}
            agentStatus={layoutState.agentStatus}
            onToggleStatus={layoutState.onToggleStatus}
            onNavigate={() => { }}
          />
        );
    }
  };

  const renderNewTabContent = (activeTab: 'agents' | 'voice-and-sms' | 'templates') => {
    switch (activeTab) {
      case 'agents':
        return <AIAgentsTab />;
      case 'voice-and-sms':
        return <NumbersRoutingPage />;
      case 'templates':
        return <AgentTemplatesTab />;
      default:
        return <AIAgentsTab />;
    }
  };

  return (
    <Routes>
      <Route index element={<SierraAiTabLayout>{renderNewTabContent}</SierraAiTabLayout>} />
      <Route path="create" element={<CreateAgentWizard />} />
      <Route path="agent/:agentId" element={<AgentBuilder />} />
      <Route path="legacy" element={<SierraModuleLayout>{renderTabContent}</SierraModuleLayout>} />
      <Route path="*" element={<Navigate to=".." relative="path" replace />} />
    </Routes>
  );
}
