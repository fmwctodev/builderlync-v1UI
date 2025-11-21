import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from '../components/settings/SettingsLayout';
import BusinessInfo from '../components/settings/BusinessInfo';
import Profile from '../components/settings/Profile';
import Integrations from '../components/settings/Integrations';
import Staff from '../components/settings/Staff';
import Billing from '../components/settings/Billing';
import Communications from '../components/settings/Communications';
import CustomFields from '../components/settings/CustomFields';
import Permissions from '../components/settings/Permissions';
import AuditLogs from '../components/settings/AuditLogs';
import BrandBoard from '../components/settings/BrandBoard';
import EmailService from '../components/settings/EmailService';

const SettingsRouter: React.FC = () => {
  return (
    <SettingsLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/settings/business-info" replace />} />
        <Route path="/business-info" element={<BusinessInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/custom-fields" element={<CustomFields />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/brand-board" element={<BrandBoard />} />
        <Route path="/email-service" element={<EmailService />} />
      </Routes>
    </SettingsLayout>
  );
};

export default SettingsRouter;