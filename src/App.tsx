import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './shared/components/Navigation';
import { Dashboard } from './shared/components/Dashboard';
import { ThemeProvider } from './shared/context/ThemeContext';
import { WidgetProvider } from './shared/context/WidgetContext';
import IncomingCallNotification from './shared/components/IncomingCallNotification';
import { useAppSelector } from './shared/store/hooks';
import { oneSignalService } from './shared/services/oneSignalService';

// Module imports
// import { ABCSupplyModule } from './modules/abc-supply/ABCSupplyModule';
import { CRMModule } from './modules/crm/CRMModule';
import { CRMModuleSimple } from './modules/crm/CRMModuleSimple';
import { MarketingModule } from './modules/marketing/MarketingModule';
import { ProjectManagementModule } from './modules/project-management/ProjectManagementModule';
import { RoofRunnerModule } from './modules/roof-runner/RoofRunnerModule';
// import { AIAgentsModule } from './modules/ai-agents/AIAgentsModule';

import { ReportingModule } from './modules/reporting/ReportingModule';
import { SuperAdminModule } from './modules/super-admin/SuperAdminModule';
import PublicEstimator from './modules/roof-runner/pages/PublicEstimator';
import { PublicFormPage } from './modules/marketing/pages/PublicFormPage';
import { SierraAiModule } from './modules/sierra-ai/SierraAiModule';
import OAuthCallback from './shared/components/OAuthCallback';
import ABCSupplyCallback from './shared/components/ABCSupplyCallback';
import OAuthOutlookCallback from './shared/components/OAuthOutlookCallback';
import EmailSyncCallback from './shared/components/EmailSyncCallback';

function App() {
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      oneSignalService.syncAuthenticatedUser(user);
      return;
    }
    oneSignalService.clearAuthenticatedUser();
  }, [user, token]);

  return (
    <ThemeProvider>
      <WidgetProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <IncomingCallNotification />
            <Routes>
              <Route path="/estimator/:publicUrl" element={<PublicEstimator />} />
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

              <Route path="/reporting/*" element={<ReportingModule />} />
            </Routes>
          </Router>
        </div>
      </WidgetProvider>
    </ThemeProvider>
  );
}

export default App;
