import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import { Opportunities } from './pages/Opportunities';
import { Reputation } from './pages/Reputation';
import { Reports } from './pages/Reports';
import { GBPOptimization } from './pages/GBPOptimization';
import { Integrations } from './pages/Integrations';

export function MarketingModule() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<MarketingDashboard />} />
          <Route path="/campaigns" element={<MarketingDashboard />} />
          <Route path="/ads-manager" element={<MarketingDashboard />} />
          <Route path="/social-planner" element={<MarketingDashboard />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/gbp-optimization" element={<GBPOptimization />} />
          <Route path="/integrations" element={<Integrations />} />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  );
}