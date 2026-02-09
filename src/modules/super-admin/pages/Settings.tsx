import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminSettingsLayout } from '../components/settings/SuperAdminSettingsLayout';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SuperAdminStaffManagement } from '../components/settings/SuperAdminStaffManagement';
import { IntegrationsSettings } from '../components/settings/IntegrationsSettings';
import { EmailServiceSettings } from '../components/settings/EmailServiceSettings';

export const Settings: React.FC = () => {
  return (
    <SuperAdminSettingsLayout>
      <Routes>
        <Route index element={<Navigate to="/super-admin/settings/profile" replace />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="staff" element={<SuperAdminStaffManagement initialTab="staff" />} />
        <Route path="roles" element={<SuperAdminStaffManagement initialTab="roles" />} />
        <Route path="integrations" element={<IntegrationsSettings />} />
        <Route path="email" element={<EmailServiceSettings />} />
      </Routes>
    </SuperAdminSettingsLayout>
  );
};
