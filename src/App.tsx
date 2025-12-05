import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './shared/components/Navigation';
import { Dashboard } from './shared/components/Dashboard';
import { ThemeProvider } from './shared/context/ThemeContext';

// Module imports
import { ABCSupplyModule } from './modules/abc-supply/ABCSupplyModule';
import { CRMModule } from './modules/crm/CRMModule';
import { CRMModuleSimple } from './modules/crm/CRMModuleSimple';
import { MarketingModule } from './modules/marketing/MarketingModule';
import { ProjectManagementModule } from './modules/project-management/ProjectManagementModule';
import { RoofRunnerModule } from './modules/roof-runner/RoofRunnerModule';
import { AIAgentsModule } from './modules/ai-agents/AIAgentsModule';
import { ReportingModule } from './modules/reporting/ReportingModule';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/*" element={<RoofRunnerModule />} />
            <Route path="/abc-supply/*" element={<ABCSupplyModule />} />
            <Route path="/crm/*" element={<CRMModule />} />
            <Route path="/project-management/*" element={<ProjectManagementModule />} />
            <Route path="/ai-agents/*" element={<AIAgentsModule />} />
            <Route path="/reporting/*" element={<ReportingModule />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;