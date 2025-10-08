import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Marketing } from './pages/Marketing';
import { Opportunities } from './pages/Opportunities';
import { Reputation } from './pages/Reputation';
import { Sites } from './pages/Sites';
import { Reports } from './pages/Reports';

export function MarketingModule() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Marketing />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  );
}