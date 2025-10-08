import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './shared/components/Navigation';
import { Dashboard } from './shared/components/Dashboard';

// Module imports
import { ABCSupplyModule } from './modules/abc-supply/ABCSupplyModule';
import { CRMModule } from './modules/crm/CRMModule';
import { CRMModuleSimple } from './modules/crm/CRMModuleSimple';
import { MarketingModule } from './modules/marketing/MarketingModule';
import { ProjectManagementModule } from './modules/project-management/ProjectManagementModule';
import { EdgeViewModule } from './modules/edge-view/EdgeViewModule';
import { RoofRunnerModule } from './modules/roof-runner/RoofRunnerModule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="pt-16">
              <Dashboard />
            </main>
          </div>
        } />
        <Route path="/abc-supply/*" element={<ABCSupplyModule />} />
        <Route path="/crm/*" element={<CRMModule />} />
        <Route path="/marketing/*" element={<MarketingModule />} />
        <Route path="/project-management/*" element={<ProjectManagementModule />} />
        <Route path="/edge-view/*" element={<EdgeViewModule />} />
        <Route path="/roof-runner/*" element={<RoofRunnerModule />} />
      </Routes>
    </Router>
  );
}

export default App;