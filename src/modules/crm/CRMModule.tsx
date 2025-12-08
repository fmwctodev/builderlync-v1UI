import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Calendar } from './pages/Calendar';
import { Conversations } from './pages/Conversations';
import { Jobs } from './pages/Opportunities';
import { Automations } from './pages/Automations';
import { Settings } from './pages/Settings';
import { Snippets } from './pages/Snippets';

export function CRMModule() {
  return (
    <Routes>
      <Route path="/*" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="automations" element={<Automations />} />
        <Route path="snippets" element={<Snippets />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}