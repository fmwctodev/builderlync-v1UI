import { Routes, Route } from 'react-router-dom';
import Layout from '../roof-runner/components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';

export function ReportingModule() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}