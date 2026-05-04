import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './shared/components/Navigation';
import { Dashboard } from './shared/components/Dashboard';
import { ThemeProvider } from './shared/context/ThemeContext';
import { OrgProvider } from './shared/context/OrgContext';
import { ProtectedOrgRoute } from './shared/components/ProtectedOrgRoute';
import { OrganizationSelector } from './shared/components/OrganizationSelector';
import { AuthRoute } from './shared/components/AuthRoute';
import IncomingCallNotification from './shared/components/IncomingCallNotification';
import './shared/utils/debugOrganizations';

// Module imports
import { ABCSupplyModule } from './modules/abc-supply/ABCSupplyModule';
import { CRMModule } from './modules/crm/CRMModule';
import { CRMModuleSimple } from './modules/crm/CRMModuleSimple';
import { ProjectManagementModule } from './modules/project-management/ProjectManagementModule';
import { EdgeViewModule } from './modules/edge-view/EdgeViewModule';
import { RoofRunnerModule } from './modules/roof-runner/RoofRunnerModule';
import { ReportingModule } from './modules/reporting/ReportingModule';
import { SuperAdminModule } from './modules/super-admin/SuperAdminModule';
import PublicEstimator from './modules/roof-runner/pages/PublicEstimator';
import { PublicForm } from './modules/marketing/pages/PublicForm';

// Auth pages
import Login from './modules/roof-runner/pages/auth/Login';
import Signup from './modules/roof-runner/pages/auth/Signup';
import ForgotPassword from './modules/roof-runner/pages/auth/ForgotPassword';
import ChoosePlan from './modules/roof-runner/pages/auth/ChoosePlan';
import Logout from './modules/roof-runner/pages/auth/Logout';
import OnboardingWelcome from './modules/roof-runner/pages/onboarding/Welcome';
import { Integrations } from './modules/roof-runner/pages/onboarding/Integrations';
import { Team } from './modules/roof-runner/pages/onboarding/Team';
import { PhoneSetup } from './modules/roof-runner/pages/onboarding/PhoneSetup';
import { LeadSources } from './modules/roof-runner/pages/onboarding/LeadSources';
import { Pipeline } from './modules/roof-runner/pages/onboarding/Pipeline';
import { Branding } from './modules/roof-runner/pages/onboarding/Branding';
import { BillingSetup } from './modules/roof-runner/pages/onboarding/BillingSetup';
import { AIAgent } from './modules/roof-runner/pages/onboarding/AIAgent';
import { Review } from './modules/roof-runner/pages/onboarding/Review';
import OAuthCallback from './modules/roof-runner/pages/OAuthCallback';
import { useState, useEffect } from 'react';

/**
 * RootRedirect - DEV MODE: Bypasses auth and goes straight to dashboard
 */
function RootRedirect() {
  // DEV MODE: Skip all auth checks and go directly to dashboard
  const devOrgSlug = 'dev-org';

  useEffect(() => {
    // Set mock org context in localStorage
    localStorage.setItem('currentOrganizationSlug', devOrgSlug);
    localStorage.setItem('currentOrganizationId', 'dev-org-id');
  }, []);

  return <Navigate to={`/org/${devOrgSlug}/dashboard`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-paper dark:bg-canvas text-ink-1 dark:text-ink-d-1 transition-colors duration-200">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <IncomingCallNotification />
          <Routes>
            {/* Public routes - no auth required */}
            <Route path="/estimator/:publicUrl" element={<PublicEstimator />} />
            <Route path="/f/:publicId" element={<PublicForm />} />

            {/* Auth routes - accessible without org context */}
            <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
            <Route path="/auth/logout" element={<Logout />} />
            {/* Temporarily disabled during development - plan selection moved to later */}
            {/* <Route path="/auth/choose-plan" element={<ChoosePlan />} /> */}

            {/* Onboarding routes */}
            <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
            <Route path="/onboarding/integrations" element={<Integrations />} />
            <Route path="/onboarding/team" element={<Team />} />
            <Route path="/onboarding/phone-setup" element={<PhoneSetup />} />
            <Route path="/onboarding/lead-sources" element={<LeadSources />} />
            <Route path="/onboarding/pipeline" element={<Pipeline />} />
            <Route path="/onboarding/branding" element={<Branding />} />
            <Route path="/onboarding/billing" element={<BillingSetup />} />
            <Route path="/onboarding/ai-agent" element={<AIAgent />} />
            <Route path="/onboarding/review" element={<Review />} />

            {/* OAuth callback routes */}
            <Route path="/oauth/google-drive/callback" element={<OAuthCallback />} />
            <Route path="/oauth/onedrive/callback" element={<OAuthCallback />} />

            {/* Super Admin routes (platform level) */}
            <Route path="/super-admin/*" element={<SuperAdminModule />} />

            {/* Organization selector - requires auth */}
            <Route path="/organizations" element={<OrganizationSelector />} />

            {/* Organization-scoped routes - requires auth and org context */}
            <Route path="/org/:orgSlug/*" element={
              <OrgProvider>
                <ProtectedOrgRoute>
                  <RoofRunnerModule />
                </ProtectedOrgRoute>
              </OrgProvider>
            } />

            {/* Legacy module routes - redirect to organization context */}
            <Route path="/abc-supply/*" element={<Navigate to="/organizations" replace />} />
            <Route path="/crm/*" element={<Navigate to="/organizations" replace />} />
            <Route path="/project-management/*" element={<Navigate to="/organizations" replace />} />
            <Route path="/edge-view/*" element={<Navigate to="/organizations" replace />} />
            <Route path="/reporting/*" element={<Navigate to="/organizations" replace />} />

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Fallback - catch all other routes */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;