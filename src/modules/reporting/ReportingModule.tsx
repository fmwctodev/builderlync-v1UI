import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ReportView } from './pages/ReportView';
import { AIReporting } from './pages/AIReporting';

export function ReportingModule() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="ai" element={<AIReporting />} />
      <Route path=":id" element={<ReportView />} />
    </Routes>
  );
}
