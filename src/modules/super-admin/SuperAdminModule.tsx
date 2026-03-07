import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
import { Overview } from './pages/Overview';
import { Accounts } from './pages/Accounts';
import { AccountDetail } from './pages/AccountDetail';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { UserImport } from './pages/UserImport';
import { Roles } from './pages/Roles';
import { Billing } from './pages/Billing';
import { Usage } from './pages/Usage';
import { Features } from './pages/Features';
import { Integrations } from './pages/Integrations';
import { Security } from './pages/Security';
import { Support } from './pages/Support';
import { System } from './pages/System';
import { Maintenance } from './pages/Maintenance';
import { Settings } from './pages/Settings';
import { Templates } from './pages/Templates';
import { TemplateEditor } from './pages/TemplateEditor';

export const SuperAdminModule: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="logout" element={<Logout />} />
      <Route element={<SuperAdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="accounts/:accountId" element={<AccountDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="users/:userId/import" element={<UserImport />} />
        <Route path="roles" element={<Roles />} />
        <Route path="billing" element={<Billing />} />
        <Route path="usage" element={<Usage />} />
        <Route path="features" element={<Features />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="security" element={<Security />} />
        <Route path="support" element={<Support />} />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/:templateId" element={<TemplateEditor />} />
        <Route path="system" element={<System />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="settings/*" element={<Settings />} />
      </Route>
    </Routes>
  );
};
