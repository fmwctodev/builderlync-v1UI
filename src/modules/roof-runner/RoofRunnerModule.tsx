import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import JobCam from './pages/JobCam';
import Automations from './pages/Automations';
import JobDetailWorkspace from './pages/JobDetailWorkspace';
import JobCamTemplates from './pages/JobCamTemplates';
import JobCamReportsIndex from './pages/JobCamReportsIndex';
import JobCamReportBuilder from './pages/JobCamReportBuilder';
import JobCamChecklist from './pages/JobCamChecklist';
import JobCamSharing from './pages/JobCamSharing';
import Measurements from './pages/Measurements';
import { PaymentSuccess } from './components/measurements/PaymentSuccess';
import { PaymentCancel } from './components/measurements/PaymentCancel';
import Proposals from './pages/Proposals';
import AiProposalGenerator from './pages/AiProposalGenerator';
import TemplateBuilderPage from './pages/TemplateBuilderPage';
import ProposalEditorPage from './pages/ProposalEditorPage';
import ProposalPreview from './pages/ProposalPreview';
import PublicProposalView from './pages/PublicProposalView';
import MaterialOrders from './pages/MaterialOrders';
import Calendars from './pages/CalendarsNew';
import Jobs from './pages/Jobs';
import Payments from './pages/Payments';
import InstantEstimator from './pages/InstantEstimator';
import DIYPage from './pages/DIYPage';
import InstantEstimatorManage from './pages/InstantEstimatorManage';
import ManageQuestions from './pages/ManageQuestions';
import NewMaterial from './pages/NewMaterial';
import MaterialSetup from './pages/MaterialSetup';
import MaterialsList from './pages/MaterialsList';
import EditMaterial from './pages/EditMaterial';
import ConversationsNew from './pages/ConversationsNew';
import Contacts from './pages/Contacts';
import ContactProfile from './pages/ContactProfile';
import WorkOrders from './pages/WorkOrders';
import Opportunities from './pages/Opportunities';
import FileManager from './pages/FileManager';
import Marketing from './pages/Marketing';
import PlatformAnalyticsDetail from './pages/PlatformAnalyticsDetail';
import { GoogleAnalyticsPage } from './pages/GoogleAnalyticsPage';
import { GoogleAnalyticsCallback } from './pages/GoogleAnalyticsCallback';
import GoogleBusinessPage from './pages/GoogleBusinessPage';
import GoogleAdsPage from './pages/GoogleAdsPage';
import FacebookAdsPage from './pages/FacebookAdsPage';
import TikTokAdsPage from './pages/TikTokAdsPage';
import SocialAdsCallback from './components/settings/SocialAdsCallback';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';
import Support from './pages/Support';
import KnowledgeBaseHome from './pages/knowledge-base/KnowledgeBaseHome';
import KnowledgeBaseCategory from './pages/knowledge-base/KnowledgeBaseCategory';
import KnowledgeBaseArticle from './pages/knowledge-base/KnowledgeBaseArticle';
import QuickBooksCallback from './pages/QuickBooksCallback';
import OAuthCallback from './components/file-manager/OAuthCallback';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import SetPassword from './pages/auth/SetPassword';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';
import { AuthRoute } from '../../shared/components/AuthRoute';
import { FeatureFlag } from '../../shared/components/FeatureFlag';
import { OrgProvider } from '../../shared/context/OrgContext';
import { FormBuilder } from '../marketing/pages/FormBuilder';
import { FormSubmissions } from '../marketing/pages/FormSubmissions';
import { SierraAiModule } from '../sierra-ai/SierraAiModule';
import { CreateAgentWizard } from '../sierra-ai/pages/CreateAgentWizard';
import { useEffect } from 'react';
import OutlookCallback from './pages/OutlookCallback';
import EagleViewCallback from './pages/EagleViewCallback';
import WorkflowStages from './pages/WorkflowStages';
import Reporting from './pages/Reporting';
import { AIReporting } from '../reporting/pages/AIReporting';
import { ReportView } from '../reporting/pages/ReportView';
import WorkflowBuilder from './pages/WorkflowBuilder';

const RootRedirect = () => {
  const { user } = useAppSelector((state) => state.auth);
  const orgSlug =
    user?.companySlug || localStorage.getItem("currentOrganizationSlug");
  return <Navigate to={orgSlug ? `/org/${orgSlug}` : "/auth/login"} replace />;
};

const OrgSettingsRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const orgId = user?.organizationId || localStorage.getItem('organizationId');

  useEffect(() => {
    if (orgId) {
      const path = window.location.pathname.replace(
        "/org/settings",
        `/org/company-${orgId}/settings`,
      );
      navigate(path + window.location.search, { replace: true });
    }
  }, [orgId, navigate]);

  return null;
};

export function RoofRunnerModule() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><OrgProvider><RootRedirect /></OrgProvider></ProtectedRoute>} />
        <Route path="outlook-callback" element={<OutlookCallback />} />
        <Route path="org/settings/*" element={<ProtectedRoute><OrgProvider><OrgSettingsRedirect /></OrgProvider></ProtectedRoute>} />
        <Route path="auth/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path="auth/verify-otp" element={<AuthRoute><VerifyOtp /></AuthRoute>} />
        <Route path="auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="auth/set-password" element={<SetPassword />} />
        <Route path="auth/google-analytics/callback" element={<GoogleAnalyticsCallback />} />
        <Route path="auth/facebook-ads/callback" element={<SocialAdsCallback platform="facebook" />} />
        <Route path="auth/tiktok-ads/callback" element={<SocialAdsCallback platform="tiktok" />} />
        <Route path="oauth/google-drive/callback" element={<OAuthCallback />} />
        <Route path="auth/microsoft/callback" element={<OAuthCallback />} />
        <Route path="oauth/onedrive/callback" element={<OAuthCallback />} />
        <Route path="proposals/preview/:id" element={<ProtectedRoute><ProposalPreview /></ProtectedRoute>} />
        <Route path="proposal/view" element={<PublicProposalView />} />
        <Route path="quickbooks/callback" element={<QuickBooksCallback />} />
        <Route path="org/:orgSlug/automation/builder" element={<ProtectedRoute><OrgProvider><FeatureFlag flag="automation-tab" fallback={<Navigate to={`/org/${localStorage.getItem('currentOrganizationSlug') || ''}/dashboard`} replace />}><WorkflowBuilder /></FeatureFlag></OrgProvider></ProtectedRoute>} />
        <Route path="org/:orgSlug/automation/builder/:id" element={<ProtectedRoute><OrgProvider><FeatureFlag flag="automation-tab" fallback={<Navigate to={`/org/${localStorage.getItem('currentOrganizationSlug') || ''}/dashboard`} replace />}><WorkflowBuilder /></FeatureFlag></OrgProvider></ProtectedRoute>} />
        <Route path="org/:orgSlug" element={<ProtectedRoute><OrgProvider><Layout /></OrgProvider></ProtectedRoute>}>
          <Route path="diy" element={<DIYPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="conversations" element={<ConversationsNew />} />
          <Route path="calendars" element={<Calendars />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactProfile />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai-agents/*" element={<SierraAiModule />} />
          <Route path="create-agent" element={<CreateAgentWizard />} />
          <Route path="job-cam" element={<JobCam />} />
          <Route path="job-cam/jobs/:jobId" element={<JobDetailWorkspace />} />
          <Route path="job-cam/templates" element={<JobCamTemplates />} />
          <Route path="job-cam/reports" element={<JobCamReportsIndex />} />
          <Route path="job-cam/reports/new" element={<JobCamReportBuilder />} />
          <Route path="job-cam/reports/:reportId" element={<JobCamReportBuilder />} />
          <Route path="job-cam/shared" element={<JobCamSharing />} />
          <Route path="instant-estimator" element={<InstantEstimator />} />
          <Route path="instant-estimator/:id/manage" element={<InstantEstimatorManage />} />
          <Route path="instant-estimator/:id/manage/questions" element={<ManageQuestions />} />
          <Route path="instant-estimator/:id/manage/materials/new" element={<NewMaterial />} />
          <Route path="instant-estimator/:id/manage/materials/setup" element={<MaterialSetup />} />
          <Route path="instant-estimator/:id/manage/materials/:materialId/edit" element={<EditMaterial />} />
          <Route path="instant-estimator/:id/manage/materials" element={<MaterialsList />} />
          <Route path="jobs/settings/stages" element={<WorkflowStages />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="measurements/payment-success" element={<PaymentSuccess />} />
          <Route path="measurements/payment-cancel" element={<PaymentCancel />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="proposals/ai-generate" element={<AiProposalGenerator />} />
          <Route path="proposals/template/:templateId" element={<TemplateBuilderPage />} />
          <Route path="proposals/editor/:proposalId" element={<ProposalEditorPage />} />
          <Route path="material-orders" element={<MaterialOrders />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="automation" element={<FeatureFlag flag="automation-tab" fallback={<Navigate to="../dashboard" replace />}><Automations /></FeatureFlag>} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="marketing/analytics/google-analytics" element={<GoogleAnalyticsPage />} />
          <Route path="marketing/analytics/google-business" element={<GoogleBusinessPage />} />
          <Route path="marketing/analytics/google-ads" element={<GoogleAdsPage />} />
          <Route path="marketing/analytics/facebook-ads" element={<FacebookAdsPage />} />
          <Route path="marketing/analytics/tiktok-ads" element={<TikTokAdsPage />} />
          <Route path="marketing/analytics/:platform" element={<PlatformAnalyticsDetail />} />
          <Route path="marketing/forms/builder/:id" element={<FormBuilder />} />
          <Route path="marketing/forms/submissions/:formId" element={<FormSubmissions />} />
          <Route path="file-manager" element={<FileManager />} />
          {/* <Route path="reputation" element={<Reputation />} /> */}
          <Route path="catalog" element={<Catalog />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="reporting/ai" element={<AIReporting />} />
          <Route path="reporting/:id" element={<ReportView />} />
          <Route path="support" element={<Support />} />
          <Route path="support/knowledge-base" element={<KnowledgeBaseHome />} />
          <Route path="support/knowledge-base/:categorySlug" element={<KnowledgeBaseCategory />} />
          <Route path="support/knowledge-base/:categorySlug/:articleSlug" element={<KnowledgeBaseArticle />} />
          <Route path="settings/*" element={<Settings />} />

          <Route path="integrations/eagleview/success" element={<EagleViewCallback />} />
          <Route path="integrations/eagleview/error" element={<EagleViewCallback />} />
        </Route>
        <Route path="marketing/analytics/google-analytics" element={<ProtectedRoute><OrgProvider><GoogleAnalyticsPage /></OrgProvider></ProtectedRoute>} />
      </Routes>
    </Provider>
  );
}
