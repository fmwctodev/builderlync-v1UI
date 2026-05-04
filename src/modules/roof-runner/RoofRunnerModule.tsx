import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import { AppShell } from '../../shared/components/studio/AppShell';
import { isNewShellEnabled } from '../../shared/tokens';
import UiKit from '../../internal/UiKit';
import Pipeline from '../projects/pages/Pipeline';
import ProjectFullPage from '../projects/pages/ProjectFullPage';
import Dashboard from './pages/Dashboard';
import BlankPage from './pages/BlankPage';
import JobCamHome from './pages/job-cam/JobCamHome';
import JobDetailWorkspace from './pages/job-cam/JobDetailWorkspace';
import JobCamReportBuilder from './pages/job-cam/JobCamReportBuilder';
import JobCamReportsIndex from './pages/job-cam/JobCamReportsIndex';
import JobCamTemplates from './pages/job-cam/JobCamTemplates';
import JobCamSharing from './pages/job-cam/JobCamSharing';
import Measurements from './pages/Measurements';
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
import { SierraAiModule } from '../sierra-ai/SierraAiModule';
import Contacts from './pages/Contacts';
import ContactProfile from './pages/ContactProfile';
import WorkOrders from './pages/WorkOrders';
import Automations from './pages/Automations';
import Opportunities from './pages/Opportunities';
import Proposals from './pages/Proposals';
import AiProposalGenerator from './pages/AiProposalGenerator';
import ProposalBuilder from './pages/ProposalBuilder';
import FileManager from './pages/FileManager';
import { ReputationModule } from '../reputation/ReputationModule';
import Marketing from './pages/Marketing';
import PlatformAnalyticsDetail from './pages/PlatformAnalyticsDetail';
import Settings from './pages/Settings';
import Support from './pages/Support';
import QuickBooksCallback from './pages/QuickBooksCallback';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';
import { FormBuilder } from '../marketing/pages/FormBuilder';
import { FormSubmissions } from '../marketing/pages/FormSubmissions';
import { ReportingModule } from '../reporting/ReportingModule';
import { StormCanvassingModule } from '../storm-canvassing';

export function RoofRunnerModule() {
  // Studio shell is opt-in via VITE_NEW_SHELL=1. When off, the legacy Layout
  // renders unchanged so existing pages and integrations behave identically.
  const Shell = isNewShellEnabled() ? AppShell : Layout;

  return (
    <Provider store={store}>
      <Routes>
      <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Studio Pipeline — additive, never the default route */}
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="projects/:cardKey" element={<ProjectFullPage />} />

        <Route path="conversations" element={<ConversationsNew />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactProfile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="ai-agents/*" element={<SierraAiModule />} />
        <Route path="job-cam" element={<JobCamHome />} />
        <Route path="job-cam/jobs/:jobId" element={<JobDetailWorkspace />} />
        <Route path="job-cam/jobs/:jobId/reports/:reportId" element={<JobCamReportBuilder />} />
        <Route path="job-cam/reports" element={<JobCamReportsIndex />} />
        <Route path="job-cam/reports/:reportId" element={<JobCamReportBuilder />} />
        <Route path="job-cam/templates" element={<JobCamTemplates />} />
        <Route path="job-cam/shared" element={<JobCamSharing />} />
        <Route path="instant-estimator" element={<InstantEstimator />} />
        <Route path="instant-estimator/:id/manage" element={<InstantEstimatorManage />} />
        <Route path="instant-estimator/:id/manage/questions" element={<ManageQuestions />} />
        <Route path="instant-estimator/:id/manage/materials/new" element={<NewMaterial />} />
        <Route path="instant-estimator/:id/manage/materials/setup" element={<MaterialSetup />} />
        <Route path="instant-estimator/:id/manage/materials/:materialId/edit" element={<EditMaterial />} />
        <Route path="instant-estimator/:id/manage/materials" element={<MaterialsList />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="material-orders" element={<MaterialOrders />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="automation" element={<Automations />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="proposals/ai-generate" element={<AiProposalGenerator />} />
        <Route path="proposals/:id" element={<ProposalBuilder />} />
        <Route path="marketing/*" element={<Marketing />} />
        <Route path="marketing/analytics/:platform" element={<PlatformAnalyticsDetail />} />
        <Route path="marketing/forms/builder/:id" element={<FormBuilder />} />
        <Route path="marketing/forms/submissions/:formId" element={<FormSubmissions />} />
        <Route path="file-manager" element={<FileManager />} />
        <Route path="storm-canvassing/*" element={<StormCanvassingModule />} />
        <Route path="reputation" element={<ReputationModule />} />
        <Route path="reporting/*" element={<ReportingModule />} />
        <Route path="support" element={<Support />} />
        <Route path="settings/*" element={<Settings />} />
        <Route path="quickbooks/callback" element={<QuickBooksCallback />} />
        {/* Internal — Studio design system reference. Safe in prod (no data writes). */}
        <Route path="internal/uikit" element={<UiKit />} />
      </Route>
      </Routes>
    </Provider>
  );
}