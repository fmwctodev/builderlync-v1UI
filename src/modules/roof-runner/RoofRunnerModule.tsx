import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import BlankPage from './pages/BlankPage';
import JobCam from './pages/JobCam';
import Measurements from './pages/Measurements';
import Proposals from './pages/Proposals';
import TemplateBuilderPage from './pages/TemplateBuilderPage';
import ProposalEditorPage from './pages/ProposalEditorPage';
import ProposalPreview from './pages/ProposalPreview';
import PublicProposalView from './pages/PublicProposalView';
import MaterialOrders from './pages/MaterialOrders';
import Calendars from './pages/CalendarsNew';
import Jobs from './pages/Jobs';
import Payments from './pages/Payments';
import InstantEstimator from './pages/InstantEstimator';
import InstantEstimatorManage from './pages/InstantEstimatorManage';
import ManageQuestions from './pages/ManageQuestions';
import NewMaterial from './pages/NewMaterial';
import MaterialSetup from './pages/MaterialSetup';
import MaterialsList from './pages/MaterialsList';
import EditMaterial from './pages/EditMaterial';
import ConversationsNew from './pages/ConversationsNew';
import { AIAgentsModule } from '../ai-agents/AIAgentsModule';
import Contacts from './pages/Contacts';
import ContactProfile from './pages/ContactProfile';
import WorkOrders from './pages/WorkOrders';
import Automations from './pages/Automations';
import Opportunities from './pages/Opportunities';
import FileManager from './pages/FileManager';
import Reputation from './pages/Reputation';
import Marketing from './pages/Marketing';
import PlatformAnalyticsDetail from './pages/PlatformAnalyticsDetail';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';
import Support from './pages/Support';
import QuickBooksCallback from './pages/QuickBooksCallback';
import OAuthCallback from './components/file-manager/OAuthCallback';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';
import { AuthRoute } from '../../shared/components/AuthRoute';
import { OrgProvider } from '../../shared/context/OrgContext';
import { FormBuilder } from '../marketing/pages/FormBuilder';
import { FormSubmissions } from '../marketing/pages/FormSubmissions';

const RootRedirect = () => {
  const { user } = useAppSelector((state) => state.auth);
  const orgSlug = user?.companySlug || localStorage.getItem('currentOrganizationSlug');
  return <Navigate to={orgSlug ? `/org/${orgSlug}` : '/auth/login'} replace />;
};

export function RoofRunnerModule() {
  return (
    <Provider store={store}>
      <OrgProvider>
      <Routes>
      <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
      <Route path="auth/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="auth/verify-otp" element={<AuthRoute><VerifyOtp /></AuthRoute>} />
      <Route path="auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="oauth/google-drive/callback" element={<OAuthCallback />} />
      <Route path="oauth/onedrive/callback" element={<OAuthCallback />} />
      <Route path="proposals/preview/:id" element={<ProtectedRoute><ProposalPreview /></ProtectedRoute>} />
      <Route path="proposal/view" element={<PublicProposalView />} />
      <Route path="org/:orgSlug" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="conversations" element={<ConversationsNew />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactProfile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="ai-agents/*" element={<AIAgentsModule />} />
        <Route path="job-cam" element={<JobCam />} />
        <Route path="instant-estimator" element={<InstantEstimator />} />
        <Route path="instant-estimator/:id/manage" element={<InstantEstimatorManage />} />
        <Route path="instant-estimator/:id/manage/questions" element={<ManageQuestions />} />
        <Route path="instant-estimator/:id/manage/materials/new" element={<NewMaterial />} />
        <Route path="instant-estimator/:id/manage/materials/setup" element={<MaterialSetup />} />
        <Route path="instant-estimator/:id/manage/materials/:materialId/edit" element={<EditMaterial />} />
        <Route path="instant-estimator/:id/manage/materials" element={<MaterialsList />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="proposals/template/:templateId" element={<TemplateBuilderPage />} />
        <Route path="proposals/editor/:proposalId" element={<ProposalEditorPage />} />
        <Route path="material-orders" element={<MaterialOrders />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="automation" element={<Automations />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="marketing/analytics/:platform" element={<PlatformAnalyticsDetail />} />
        <Route path="marketing/forms/builder/:id" element={<FormBuilder />} />
        <Route path="marketing/forms/submissions/:formId" element={<FormSubmissions />} />
        <Route path="file-manager" element={<FileManager />} />
        <Route path="reputation" element={<Reputation />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="reporting" element={<BlankPage title="Reporting" />} />
        <Route path="support" element={<Support />} />
        <Route path="settings/*" element={<Settings />} />
        <Route path="quickbooks/callback" element={<QuickBooksCallback />} />
        <Route path="auth/google/callback" element={<OAuthCallback />} />
        <Route path="auth/microsoft/callback" element={<OAuthCallback />} />
      </Route>
      </Routes>
      </OrgProvider>
    </Provider>
  );
}