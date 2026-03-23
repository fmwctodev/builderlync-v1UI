import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import BlankPage from './pages/BlankPage';
import JobCamOverview from './pages/job-cam/JobCamOverview';
import JobCamTimeline from './pages/job-cam/JobCamTimeline';
import JobCamChecklist from './pages/job-cam/JobCamChecklist';
import JobCamReportBuilder from './pages/job-cam/JobCamReportBuilder';
import JobCamReportsIndex from './pages/job-cam/JobCamReportsIndex';
import JobCamTemplates from './pages/job-cam/JobCamTemplates';
import JobCamSharing from './pages/job-cam/JobCamSharing';
import Measurements from './pages/Measurements';
import ProposalsHome from './pages/proposals/ProposalsHome';
import ProposalsListScreen from './pages/proposals/ProposalsListScreen';
import MobileProposalBuilder from './pages/proposals/MobileProposalBuilder';
import MobileAiProposalGenerator from './pages/proposals/MobileAiProposalGenerator';
import ProposalDetailScreen from './pages/proposals/ProposalDetailScreen';
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
  return (
    <Provider store={store}>
      <Routes>
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="conversations" element={<ConversationsNew />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactProfile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="ai-agents/*" element={<SierraAiModule />} />
        <Route path="job-cam" element={<JobCamOverview />} />
        <Route path="job-cam/jobs/:jobId" element={<JobCamTimeline />} />
        <Route path="job-cam/jobs/:jobId/checklist" element={<JobCamChecklist />} />
        <Route path="job-cam/reports" element={<JobCamReportsIndex />} />
        <Route path="job-cam/reports/:reportId" element={<JobCamReportBuilder />} />
        <Route path="job-cam/templates" element={<JobCamTemplates />} />
        <Route path="job-cam/sharing" element={<JobCamSharing />} />
        <Route path="instant-estimator" element={<InstantEstimator />} />
        <Route path="instant-estimator/:id/manage" element={<InstantEstimatorManage />} />
        <Route path="instant-estimator/:id/manage/questions" element={<ManageQuestions />} />
        <Route path="instant-estimator/:id/manage/materials/new" element={<NewMaterial />} />
        <Route path="instant-estimator/:id/manage/materials/setup" element={<MaterialSetup />} />
        <Route path="instant-estimator/:id/manage/materials/:materialId/edit" element={<EditMaterial />} />
        <Route path="instant-estimator/:id/manage/materials" element={<MaterialsList />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="proposals" element={<ProposalsHome />} />
        <Route path="proposals/all" element={<ProposalsListScreen />} />
        <Route path="proposals/ai-generate" element={<MobileAiProposalGenerator />} />
        <Route path="proposals/new" element={<MobileProposalBuilder />} />
        <Route path="proposals/:proposalId/edit" element={<MobileProposalBuilder />} />
        <Route path="proposals/:proposalId/preview" element={<ProposalDetailScreen />} />
        <Route path="material-orders" element={<MaterialOrders />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="automation" element={<Automations />} />
        <Route path="opportunities" element={<Opportunities />} />
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
      </Route>
      </Routes>
    </Provider>
  );
}