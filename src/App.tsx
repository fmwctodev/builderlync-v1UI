import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import { WidgetProvider } from './shared/context/WidgetContext';
import IncomingCallNotification from './shared/components/IncomingCallNotification';
import { StagingBanner } from './shared/components/StagingBanner';
import { useAppSelector } from './shared/store/hooks';
import { oneSignalService } from './shared/services/oneSignalService';

// Module imports
// import { ABCSupplyModule } from './modules/abc-supply/ABCSupplyModule';
import { CRMModule } from './modules/crm/CRMModule';
import { ProjectManagementModule } from './modules/project-management/ProjectManagementModule';
import { RoofRunnerModule } from './modules/roof-runner/RoofRunnerModule';
// import { AIAgentsModule } from './modules/ai-agents/AIAgentsModule';

import { SuperAdminModule } from './modules/super-admin/SuperAdminModule';
import PublicEstimator from './modules/roof-runner/pages/PublicEstimator';
import PublicGallery from './modules/roof-runner/pages/PublicGallery';
import { PublicFormPage } from './modules/marketing/pages/PublicFormPage';
import OAuthCallback from './shared/components/OAuthCallback';
import ABCSupplyCallback from './shared/components/ABCSupplyCallback';
import OAuthOutlookCallback from './shared/components/OAuthOutlookCallback';
import EmailSyncCallback from './shared/components/EmailSyncCallback';
import ProposalSigningPage from './modules/roof-runner/pages/ProposalSigningPage';
import PitchTool from './modules/roof-runner/pages/PitchTool';

import PublicBilling from './modules/roof-runner/pages/PublicBilling';
import PaymentSuccess from './modules/roof-runner/pages/PaymentSuccess';
import PaymentCancel from './modules/roof-runner/pages/PaymentCancel';

import { analytics } from './shared/utils/analytics';
import { captureRefFromUrl } from './shared/utils/affiliateTracking';

function AppContent() {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const LightThemePages = ['/estimator/', '/forms/public/', '/share/', '/shared/'];
  const forceLightTheme = LightThemePages.some((page) => location.pathname.startsWith(page));

  useEffect(() => {
    if (user && token) {
      oneSignalService.syncAuthenticatedUser(user);
      analytics.identify(user.id, {
        email: user.email,
        name: user.full_name || user.fullName,
        role: user.role,
      });
      return;
    }
    oneSignalService.clearAuthenticatedUser();
    analytics.reset();
  }, [user, token]);

  useEffect(() => {
    captureRefFromUrl();
  }, [location.pathname, location.search]);

  return (
    <ThemeProvider forcedTheme={forceLightTheme ? 'light' : undefined}>
      <WidgetProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <StagingBanner />
          <IncomingCallNotification />
          <Routes>
            <Route path="/billing" element={<PublicBilling />} />
            <Route path="/billing/success" element={<PaymentSuccess />} />
            <Route path="/billing/cancel" element={<PaymentCancel />} />
            <Route path="/proposal/sign" element={<ProposalSigningPage />} />
            <Route path="/proposal/view" element={<ProposalSigningPage />} />
            <Route path="/estimator/:publicUrl" element={<PublicEstimator />} />
            <Route path="/share/:token" element={<PublicGallery />} />
            <Route path="/shared/:token" element={<PublicGallery />} />
            <Route path="/pitch" element={<PitchTool />} />
            <Route path="/forms/public/:publicId" element={<PublicFormPage />} />
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/auth/gmail/callback" element={<OAuthOutlookCallback />} />
            <Route path="/auth/outlook/callback" element={<OAuthOutlookCallback />} />
            <Route path="/auth/email/callback" element={<EmailSyncCallback />} />
            <Route path="/outlook-callback" element={<OAuthOutlookCallback />} />
            <Route path="/integrations/abc-supply/callback" element={<ABCSupplyCallback />} />
            <Route path="/super-admin/*" element={<SuperAdminModule />} />
            <Route path="/*" element={<RoofRunnerModule />} />
            {/* <Route path="/abc-supply/*" element={<ABCSupplyModule />} /> */}
            <Route path="/crm/*" element={<CRMModule />} />
            <Route path="/project-management/*" element={<ProjectManagementModule />} />
          </Routes>
        </div>
      </WidgetProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;
